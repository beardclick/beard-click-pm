'use server'

import { createClient } from '@/lib/supabase/server'
import { notifyClientForProjectEvent } from '@/lib/notifications'
import { revalidatePath } from 'next/cache'

type ProjectWebAccessInput = {
  website_url: string
  access_username?: string
  access_password?: string
}

function normalizeFormValue(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : ''
}

function parseProjectWebAccesses(formData: FormData): { data?: ProjectWebAccessInput[]; error?: string } {
  const urls = formData.getAll('web_access_url[]').map((value) => normalizeFormValue(value))
  const usernames = formData.getAll('web_access_username[]').map((value) => normalizeFormValue(value))
  const passwords = formData.getAll('web_access_password[]').map((value) => normalizeFormValue(value))

  const maxLength = Math.max(urls.length, usernames.length, passwords.length)
  const rows: ProjectWebAccessInput[] = []

  for (let index = 0; index < maxLength; index += 1) {
    const websiteUrl = urls[index] || ''
    const accessUsername = usernames[index] || ''
    const accessPassword = passwords[index] || ''

    if (!websiteUrl && !accessUsername && !accessPassword) {
      continue
    }

    if (!websiteUrl) {
      return { error: `La URL del sitio es obligatoria en la fila ${index + 1}.` }
    }

    rows.push({
      website_url: websiteUrl,
      access_username: accessUsername || undefined,
      access_password: accessPassword || undefined,
    })
  }

  return { data: rows }
}

async function saveProjectWebAccesses(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
  webAccesses: ProjectWebAccessInput[]
) {
  const { error: deleteError } = await supabase
    .from('project_web_accesses')
    .delete()
    .eq('project_id', projectId)

  if (deleteError && deleteError.code !== '42P01') {
    console.error('Error deleting project web accesses:', deleteError)
    return { error: deleteError.message }
  }

  if (webAccesses.length === 0) {
    return { success: true }
  }

  const rowsToInsert = webAccesses.map((access) => ({
    project_id: projectId,
    website_url: access.website_url,
    access_username: access.access_username || '',
    access_password: access.access_password || '',
  }))

  const { error: insertError } = await supabase.from('project_web_accesses').insert(rowsToInsert)

  if (insertError) {
    if (insertError.message?.includes('schema cache') || insertError.code === '42P01') {
      console.error('Table project_web_accesses not found. Please create it in Supabase.')
      return { error: 'La tabla de accesos web no existe. Contacta al administrador.' }
    }
    console.error('Error saving project web accesses:', insertError)
    return { error: insertError.message }
  }

  return { success: true }
}

async function enrichProjectsData(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projects: any[]
) {
  if (projects.length === 0) {
    return []
  }

  try {
    const projectIds = projects.map((project) => project.id)
    const [webAccessesResult, maintenanceResult] = await Promise.all([
      supabase
        .from('project_web_accesses')
        .select('project_id, website_url')
        .in('project_id', projectIds)
        .order('created_at', { ascending: true }),
      supabase
        .from('project_maintenance_logs')
        .select('project_id, maintenance_date')
        .in('project_id', projectIds),
    ])

    const webAccesses = webAccessesResult.error ? [] : (webAccessesResult.data || [])
    const maintenanceLogs = maintenanceResult.error ? [] : (maintenanceResult.data || [])

    if (webAccessesResult.error) {
      console.error('enrichProjectsData: web accesses error', webAccessesResult.error.code, webAccessesResult.error.message)
    }
    if (maintenanceResult.error) {
      console.error('enrichProjectsData: maintenance logs error', maintenanceResult.error.code, maintenanceResult.error.message)
    }

    const websiteByProject = new Map<string, string>()
    const websiteCountByProject = new Map<string, number>()
    const maintenanceExpirationByProject = new Map<string, string>()
    const today = new Date().toISOString().slice(0, 10)

    for (const webAccess of webAccesses) {
      const projectId = String(webAccess.project_id)
      const currentCount = websiteCountByProject.get(projectId) || 0
      websiteCountByProject.set(projectId, currentCount + 1)
      if (!websiteByProject.has(projectId) && webAccess.website_url) {
        websiteByProject.set(projectId, webAccess.website_url)
      }
    }

    for (const log of maintenanceLogs) {
      const projectId = String(log.project_id)
      const maintenanceDate = typeof log.maintenance_date === 'string' ? log.maintenance_date : null
      if (!maintenanceDate) continue
      const currentLatest = maintenanceExpirationByProject.get(projectId)
      if (!currentLatest || maintenanceDate > currentLatest) {
        maintenanceExpirationByProject.set(projectId, maintenanceDate)
      }
    }

    return projects.map((project) => {
      const maintenanceExpirationDate = maintenanceExpirationByProject.get(project.id) || null
      return {
        ...project,
        files_count: project.project_files?.[0]?.count ?? 0,
        primary_website_url: websiteByProject.get(project.id) || null,
        website_urls_count: websiteCountByProject.get(project.id) || 0,
        maintenance_plan_expires_at: maintenanceExpirationDate,
        maintenance_plan_active: maintenanceExpirationDate ? maintenanceExpirationDate >= today : false,
      }
    })
  } catch (err) {
    console.error('enrichProjectsData: unexpected error, returning raw projects', err)
    return projects.map((project) => ({
      ...project,
      files_count: 0,
      primary_website_url: null,
      website_urls_count: 0,
      maintenance_plan_expires_at: null,
      maintenance_plan_active: false,
    }))
  }
}

export async function getProjects() {
  try {
    const supabase = await createClient()
    
    // Try with project_files count join
    const { data, error } = await supabase
      .from('projects')
      .select(`*, clients (name), project_files (count)`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('getProjects: join error, falling back', error.code, error.message)
      // Fallback: without project_files join
      const { data: dataSimple, error: errorSimple } = await supabase
        .from('projects')
        .select(`*, clients (name)`)
        .order('created_at', { ascending: false })
      if (errorSimple) {
        console.error('getProjects: fallback also failed', errorSimple)
        return []
      }
      return enrichProjectsData(supabase, dataSimple || [])
    }

    return enrichProjectsData(supabase, data || [])
  } catch (err) {
    console.error('getProjects: unexpected exception', err)
    return []
  }
}

export async function getClientProjects(clientId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('projects')
      .select(`*, clients (name), project_files (count)`)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('getClientProjects: join error, falling back', error.code, error.message)
      const { data: dataSimple, error: errorSimple } = await supabase
        .from('projects')
        .select(`*, clients (name)`)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
      if (errorSimple) return []
      return enrichProjectsData(supabase, dataSimple || [])
    }

    return enrichProjectsData(supabase, data || [])
  } catch (err) {
    console.error('getClientProjects: unexpected exception', err)
    return []
  }
}

export async function getProject(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      clients (name)
    `)
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function getProjectWebAccesses(projectId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('project_web_accesses')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  if (error) {
    if (error.code !== '42P01' && !error.message?.includes('schema cache')) {
      console.error('Error fetching project web accesses:', error)
    }
    return []
  }

  return data || []
}

export async function getProjectMaintenanceLogs(projectId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('project_maintenance_logs')
    .select(`
      *,
      profiles (full_name)
    `)
    .eq('project_id', projectId)
    .order('maintenance_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    if (error.code !== '42P01') {
      console.error('Error fetching maintenance logs:', error)
    }
    return []
  }

  return data || []
}

export async function createProjectAction(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const name = normalizeFormValue(formData.get('name'))
  const description = normalizeFormValue(formData.get('description'))
  const status = normalizeFormValue(formData.get('status')) || 'active'
  const client_id = normalizeFormValue(formData.get('client_id'))
  const due_date = normalizeFormValue(formData.get('due_date'))

  if (!name || !client_id) {
    return { error: 'El nombre del proyecto y el cliente son obligatorios.' }
  }

  const parsedWebAccesses = parseProjectWebAccesses(formData)
  if (parsedWebAccesses.error) {
    return { error: parsedWebAccesses.error }
  }

  const { data, error } = await supabase
    .from('projects')
    .insert([{
      name,
      description,
      status,
      client_id,
      due_date: due_date || null
    }])
    .select('id, name')
    .single()

  if (error) return { error: error.message }

  if (data?.id) {
    const saveWebAccessesResult = await saveProjectWebAccesses(
      supabase,
      data.id,
      parsedWebAccesses.data || []
    )

    if (saveWebAccessesResult.error) {
      return { error: saveWebAccessesResult.error }
    }
  }

  if (data?.id) {
    await notifyClientForProjectEvent({
      projectId: data.id,
      actorId: user?.id,
      type: 'project_created',
      title: 'Nuevo proyecto',
      message: name,
    })
  }
  
  revalidatePath('/admin/projects')
  revalidatePath('/client/projects')
  revalidatePath('/admin')
  revalidatePath('/client')
  return { success: true, projectId: data?.id || null }
}

export async function updateProjectAction(id: string, formData: FormData) {
  const supabase = await createClient()

  const name = normalizeFormValue(formData.get('name'))
  const description = normalizeFormValue(formData.get('description'))
  const status = normalizeFormValue(formData.get('status')) || 'active'
  const client_id = normalizeFormValue(formData.get('client_id'))
  const due_date = normalizeFormValue(formData.get('due_date'))

  if (!name || !client_id) {
    return { error: 'El nombre del proyecto y el cliente son obligatorios.' }
  }

  const parsedWebAccesses = parseProjectWebAccesses(formData)
  if (parsedWebAccesses.error) {
    return { error: parsedWebAccesses.error }
  }

  const { error } = await supabase
    .from('projects')
    .update({
      name,
      description,
      status,
      client_id,
      due_date: due_date || null
    })
    .eq('id', id)

  if (error) return { error: error.message }

  const saveWebAccessesResult = await saveProjectWebAccesses(supabase, id, parsedWebAccesses.data || [])
  if (saveWebAccessesResult.error) {
    return { error: saveWebAccessesResult.error }
  }
  
  revalidatePath('/admin/projects')
  revalidatePath(`/admin/projects/${id}`)
  revalidatePath(`/admin/projects/${id}/edit`)
  revalidatePath('/client/projects')
  revalidatePath('/admin')
  revalidatePath('/client')
  return { success: true }
}

export async function deleteProjectAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  
  revalidatePath('/admin/projects')
  revalidatePath('/client/projects')
  revalidatePath('/admin')
  revalidatePath('/client')
  return { success: true }
}

export async function assignProjectToClientAction(projectId: string, clientId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('projects')
    .update({
      client_id: clientId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId)

  if (error) {
    console.error('Error assigning project to client:', error)
    return { error: error.message || 'No se pudo asignar el proyecto al cliente.' }
  }

  revalidatePath('/admin/clients')
  revalidatePath(`/admin/clients/${clientId}`)
  revalidatePath('/admin/projects')
  revalidatePath('/admin')
  revalidatePath('/client')

  return { success: true }
}

export async function getReassignableProjectsForClient(clientId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      client_id,
      clients (name)
    `)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching reassignable projects:', error)
    return []
  }

  return data || []
}

export async function createProjectMaintenanceAction(projectId: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const maintenanceDate = normalizeFormValue(formData.get('maintenance_date'))
  const notes = normalizeFormValue(formData.get('notes'))

  if (!maintenanceDate) {
    return { error: 'Debes seleccionar una fecha de mantenimiento.' }
  }

  const { error } = await supabase
    .from('project_maintenance_logs')
    .insert([
      {
        project_id: projectId,
        maintenance_date: maintenanceDate,
        notes: notes || null,
        created_by: user?.id || null,
      },
    ])

  if (error) {
    console.error('Error creating maintenance log:', error)
    return { error: error.message || 'No se pudo registrar el mantenimiento.' }
  }

  revalidatePath(`/admin/projects/${projectId}`)
  revalidatePath(`/client/projects/${projectId}`)
  revalidatePath('/admin/projects')
  revalidatePath('/client/projects')
  revalidatePath('/admin')
  revalidatePath('/client')
  return { success: true }
}
