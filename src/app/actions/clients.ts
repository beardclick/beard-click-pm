'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { getClientAccessMap } from '@/lib/client-access'
import { canSendTransactionalEmail, sendPortalAccessEmail } from '@/lib/portal-access-email'

async function requireAdminAccess() {
  const supabase = await createClient()
  const adminSupabase = createAdminClient()

  const { data: currentUserData } = await supabase.auth.getUser()
  if (!currentUserData.user) {
    return { error: 'No autorizado.' as const }
  }

  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', currentUserData.user.id)
    .single()

  if (currentProfile?.role !== 'admin') {
    return { error: 'Solo un administrador puede gestionar clientes.' as const }
  }

  return {
    supabase,
    adminSupabase,
    currentUser: currentUserData.user,
  }
}

async function getPortalOrigin() {
  const headerStore = await headers()

  return (
    headerStore.get('origin') ||
    (headerStore.get('host') ? `https://${headerStore.get('host')}` : 'https://portal.beardclick.com')
  )
}

async function provisionClientPortalAccess(
  supabase: Awaited<ReturnType<typeof createClient>>,
  adminSupabase: ReturnType<typeof createAdminClient>,
  client: any,
  options?: { sendWelcomeEmail?: boolean; phone?: string | null }
) {
  if (!client.email) {
    return { error: 'El cliente debe tener correo para enviar acceso al portal.' }
  }

  const normalizedEmail = String(client.email).trim().toLowerCase()
  const normalizedName = String(client.name).trim()
  const company = client.company ? String(client.company).trim() : null
  const phone = options?.phone ? String(options.phone).trim() : null
  const origin = await getPortalOrigin()
  const resetRedirectTo = `${origin}/reset-password?portalAccess=1`

  let authUserId: string | null = null
  let alreadyHadAccess = false

  const { data: usersData, error: usersError } = await adminSupabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })

  if (usersError) {
    console.error('Error listing auth users:', usersError)
    return { error: 'No se pudo verificar si el cliente ya tiene acceso.' }
  }

  const existingAuthUser = usersData.users.find(
    (authUser) => authUser.email?.toLowerCase() === normalizedEmail
  )

  if (existingAuthUser) {
    authUserId = existingAuthUser.id
    alreadyHadAccess = true
  } else {
    const tempPassword = `Tmp-${crypto.randomUUID()}-9aA!`
    const { data: createdAuthUser, error: createAuthError } = await adminSupabase.auth.admin.createUser({
      email: normalizedEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: normalizedName,
        role: 'client',
      },
    })

    if (createAuthError || !createdAuthUser.user) {
      console.error('Error creating auth user for client:', createAuthError)
      return { error: createAuthError?.message || 'No se pudo crear el acceso del cliente.' }
    }

    authUserId = createdAuthUser.user.id
  }

  const { error: authUpdateError } = await adminSupabase.auth.admin.updateUserById(authUserId, {
    email: normalizedEmail,
    email_confirm: true,
    user_metadata: {
      full_name: normalizedName,
      role: 'client',
    },
  })

  if (authUpdateError) {
    console.error('Error syncing auth user for client:', authUpdateError)
    return { error: authUpdateError.message || 'No se pudo sincronizar el acceso del cliente.' }
  }

  const { error: profileUpsertError } = await adminSupabase
    .from('profiles')
    .upsert(
      {
        id: authUserId,
        full_name: normalizedName,
        email: normalizedEmail,
        phone,
        role: 'client',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )

  if (profileUpsertError) {
    console.error('Error upserting client profile:', profileUpsertError)
    return { error: 'No se pudo crear o actualizar el perfil del cliente.' }
  }

  const { error: clientLinkError } = await adminSupabase
    .from('clients')
    .update({
      profile_id: authUserId,
      email: normalizedEmail,
      updated_at: new Date().toISOString(),
    })
    .eq('id', client.id)

  if (clientLinkError) {
    console.error('Error linking client to portal profile:', clientLinkError)
    return { error: 'No se pudo vincular el cliente con su acceso al portal.' }
  }

  if (!canSendTransactionalEmail()) {
    return {
      error: 'Brevo no esta configurado. Define BREVO_API_KEY y PORTAL_EMAIL_FROM para enviar accesos.',
    }
  }

  const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
    type: 'recovery',
    email: normalizedEmail,
    options: {
      redirectTo: resetRedirectTo,
    },
  })

  if (linkError || !linkData.properties?.action_link) {
    console.error('Error generating portal access link:', linkError)
    return { error: linkError?.message || 'No se pudo generar el enlace de acceso.' }
  }

  const emailResult = await sendPortalAccessEmail({
    to: normalizedEmail,
    clientName: normalizedName,
    company,
    resetLink: linkData.properties.action_link,
    portalUrl: origin,
  })

  if (!emailResult.success) {
    console.error('Error sending portal access email via Brevo:', emailResult.error)
    return { error: emailResult.error || 'Se creo el acceso, pero no se pudo enviar el correo con Brevo.' }
  }

  return {
    success: true,
    email: normalizedEmail,
    sentWelcomeInvite: Boolean(options?.sendWelcomeEmail),
    alreadyHadAccess,
    sentCustomEmail: true,
  }
}

export async function getClients() {
  const supabase = await createClient()

  // Usamos un query para contar los proyectos de cada cliente
  const { data: clients, error } = await supabase
    .from('clients')
    .select(`
      *,
      projects (id)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching clients:', error)
    return []
  }

  const accessMap = await getClientAccessMap(clients.map((client) => client.email))

  return clients.map(client => ({
    ...client,
    projectsCount: client.projects ? client.projects.length : 0,
    hasPortalAccess: accessMap.get(String(client.email || '').trim().toLowerCase()) ?? false,
  }))
}

export async function createClientAction(formData: FormData) {
  const adminContext = await requireAdminAccess()
  if ('error' in adminContext) {
    return { error: adminContext.error }
  }

  const { supabase, adminSupabase, currentUser } = adminContext
  const name = String(formData.get('name') || '').trim()
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const phone = String(formData.get('phone') || '').trim()
  const company = String(formData.get('company') || '').trim()
  const ruc = String(formData.get('ruc') || '').trim()

  if (!name || !company) {
    return { error: 'El nombre del cliente y el negocio son obligatorios.' }
  }

  const { data, error } = await adminSupabase
    .from('clients')
    .insert([{
      name,
      email,
      phone,
      company: company || null,
      ruc: ruc || null
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating client:', error)
    return { error: error.message || 'No se pudo crear el cliente.' }
  }

  let accessResult:
    | { success: boolean; email: string; sentWelcomeInvite: boolean; alreadyHadAccess: boolean; sentCustomEmail: boolean }
    | { error: string }
    | null = null

  if (email) {
    accessResult = await provisionClientPortalAccess(supabase, adminSupabase, data, {
      sendWelcomeEmail: true,
      phone: phone || null,
    })

    if ('error' in accessResult) {
      console.error('Error provisioning new client access:', accessResult.error)
    }
  }

  await adminSupabase.from('activity_logs').insert([{
    actor_id: currentUser.id,
    client_id: data.id,
    title: 'Nuevo cliente registrado',
    description: `registró al cliente "${name}"`,
    type: 'client_created'
  }])

  if (accessResult && 'error' in accessResult) {
    revalidatePath('/admin/clients')
    revalidatePath('/admin')
    return {
      success: true,
      data,
      message: `Cliente creado. Revisa el botón "Reenviar Acceso" para terminar el envío del correo.`,
    }
  }

  const accessEmail = accessResult && 'email' in accessResult ? accessResult.email : email

  revalidatePath('/admin/clients')
  revalidatePath('/admin')
  return {
    success: true,
    data,
    message: !email
      ? 'Cliente creado correctamente.'
      : `Cliente creado y correo de acceso enviado a ${accessEmail}.`,
  }
}

export async function deleteClientAction(clientId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', clientId)

  if (error) {
    console.error('Error deleting client:', error)
    return { error: 'No se pudo eliminar el cliente' }
  }

  revalidatePath('/admin/clients')
  revalidatePath('/admin')
  return { success: true }
}

export async function getClient(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()
    
  if (error) {
    throw new Error(`Error al obtener cliente: ${error.message}`)
  }
  return data
}

export async function getClientDetail(id: string) {
  try {
    const supabase = await createClient()

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single()

    if (clientError) {
      throw new Error(`Error al obtener detalles del cliente: ${clientError.message}`)
    }

    if (!client) {
      return null
    }

    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('client_id', id)
      .order('created_at', { ascending: false })

    if (projectsError) {
      console.error('getClientDetail: projects fetch error', projectsError)
    }

    const projectIds = (projects || []).map((project) => project.id)

    let comments: any[] = []
    let files: any[] = []

    if (projectIds.length > 0) {
      try {
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select(`*, profiles (full_name, avatar_url), projects (name)`)
          .in('project_id', projectIds)
          .order('created_at', { ascending: false })
          .limit(20)

        if (commentsError) {
          console.error('getClientDetail: comments fetch error', commentsError.code, commentsError.message)
        } else {
          comments = commentsData || []
        }
      } catch (err) {
        console.error('getClientDetail: comments unexpected error', err)
      }

      try {
        const { data: filesData, error: filesError } = await supabase
          .from('project_files')
          .select(`*, projects (name)`)
          .in('project_id', projectIds)
          .order('created_at', { ascending: false })
          .limit(20)

        if (filesError) {
          console.error('getClientDetail: files fetch error', filesError.code, filesError.message)
        } else {
          files = filesData || []
        }
      } catch (err) {
        console.error('getClientDetail: files unexpected error', err)
      }
    }

    let hasPortalAccess = false
    try {
      hasPortalAccess = (await getClientAccessMap([client.email])).get(String(client.email || '').trim().toLowerCase()) ?? false
    } catch (err) {
      console.error('getClientDetail: getClientAccessMap error', err)
    }

    return {
      client,
      hasPortalAccess,
      projects: projects || [],
      comments,
      files,
    }
  } catch (err) {
    console.error('getClientDetail: top-level unexpected exception', err)
    return null
  }
}


export async function updateClientAction(id: string, formData: FormData) {
  const adminContext = await requireAdminAccess()
  if ('error' in adminContext) {
    return { error: adminContext.error }
  }

  const { adminSupabase, currentUser } = adminContext
  
  const name = String(formData.get('name') || '').trim()
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const company = String(formData.get('company') || '').trim()
  const ruc = String(formData.get('ruc') || '').trim()
  const phone = String(formData.get('phone') || '').trim()

  if (!name || !company) {
    return { error: 'El nombre del cliente y el negocio son obligatorios.' }
  }

  // 1. Update client record
  const { data: updatedClient, error } = await adminSupabase
    .from('clients')
    .update({
      name,
      email,
      phone,
      company: company || null,
      ruc: ruc || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating client:', error)
    return { error: 'No se pudo actualizar el cliente: ' + error.message }
  }

  // 2. If client has an associated profile, update it too (especially phone)
  if (updatedClient.profile_id) {
    const { error: profileError } = await adminSupabase
      .from('profiles')
      .update({
        full_name: name,
        email: email,
        phone: phone || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', updatedClient.profile_id)

    if (profileError) {
      console.error('Error updating client profile:', profileError)
    }
  }

  // Log de actividad
  await adminSupabase.from('activity_logs').insert([{
    actor_id: currentUser.id,
    client_id: id,
    title: 'Cliente actualizado',
    description: `actualizó los datos de "${name}"`,
    type: 'client_created'
  }])

  revalidatePath('/admin/clients')
  revalidatePath(`/admin/clients/${id}`)
  revalidatePath(`/admin/clients/${id}/edit`)
  revalidatePath('/admin')
  return { success: true, data: updatedClient }
}

export async function sendClientPortalAccessAction(clientId: string) {
  const adminContext = await requireAdminAccess()
  if ('error' in adminContext) {
    return { error: adminContext.error }
  }

  const { supabase, adminSupabase, currentUser } = adminContext
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single()

  if (clientError || !client) {
    return { error: 'No se encontró el cliente.' }
  }

  if (!client.email || !client.name) {
    return { error: 'El cliente debe tener nombre y correo antes de enviar acceso.' }
  }

  const accessResult = await provisionClientPortalAccess(supabase, adminSupabase, client, {
    sendWelcomeEmail: false,
  })

  if ('error' in accessResult) {
    return { error: accessResult.error }
  }

  await supabase.from('activity_logs').insert([{
    actor_id: currentUser.id,
    client_id: client.id,
    title: 'Acceso al portal enviado',
    description: `envió acceso al portal para "${client.name}"`,
    type: 'client_created',
  }])

  revalidatePath('/admin/clients')
  revalidatePath('/admin')

  return {
    success: true,
    message: accessResult.alreadyHadAccess
      ? `Se reenviaron las instrucciones de acceso a ${accessResult.email}.`
      : `Se creo el acceso del cliente y se enviaron instrucciones a ${accessResult.email}.`,
  }
}
