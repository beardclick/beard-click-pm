'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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

  // Transformar el array de proyectos en count
  return clients.map(client => ({
    ...client,
    projectsCount: client.projects ? client.projects.length : 0
  }))
}

export async function createClientAction(formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const company = formData.get('company') as string
  const notes = formData.get('notes') as string

  if (!name || !email) {
    return { error: 'El nombre y el correo son obligatorios' }
  }

  const { data, error } = await supabase
    .from('clients')
    .insert([{
      name,
      email,
      phone: phone || null,
      company: company || null,
      notes: notes || null
    }])
    .select()

  if (error) {
    console.error('Error creating client:', error)
    return { error: 'No se pudo crear el cliente' }
  }
  // Log de actividad
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.from('activity_logs').insert([{
      profile_id: user.id,
      title: 'Nuevo cliente registrado',
      description: `registró al cliente "${name}"`,
      type: 'client'
    }])
  }

  revalidatePath('/admin/clients')
  revalidatePath('/admin')
  return { success: true, data }
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
    
  if (error) return null
  return data
}

export async function updateClientAction(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const company = formData.get('company') as string
  const notes = formData.get('notes') as string

  if (!name || !email) {
    return { error: 'El nombre y el correo son obligatorios' }
  }

  const { data, error } = await supabase
    .from('clients')
    .update({
      name,
      email,
      phone: phone || null,
      company: company || null,
      notes: notes || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()

  if (error) {
    console.error('Error updating client:', error)
    return { error: 'No se pudo actualizar el cliente' }
  }
  // Log de actividad
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.from('activity_logs').insert([{
      profile_id: user.id,
      title: 'Cliente actualizado',
      description: `actualizó los datos de "${name}"`,
      type: 'client'
    }])
  }

  revalidatePath('/admin/clients')
  revalidatePath(`/admin/clients/${id}/edit`)
  return { success: true, data }
}
