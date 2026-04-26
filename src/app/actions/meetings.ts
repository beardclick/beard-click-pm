'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getMeetings() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('meetings')
    .select(`
      *,
      projects (name)
    `)
    .order('starts_at', { ascending: true })

  return data
}

export async function getClientMeetings(clientId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('meetings')
    .select(`
      *,
      projects!inner (name, client_id)
    `)
    .eq('projects.client_id', clientId)
    .order('starts_at', { ascending: true })

  if (error) {
    console.error('Error fetching client meetings:', error)
    return []
  }
  return data
}


export async function createMeetingAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autorizado' }

  const title = formData.get('title') as string
  const project_id = formData.get('project_id') as string
  const starts_at = formData.get('starts_at') as string
  const ends_at = formData.get('ends_at') as string
  const location = formData.get('location') as string

  if (!title || !project_id || !starts_at) {
    return { error: 'Título, proyecto y fecha de inicio son obligatorios' }
  }

  // Si no hay fecha de fin, sumamos 1 hora a la de inicio
  let final_ends_at = ends_at;
  if (!final_ends_at) {
    const startDate = new Date(starts_at);
    startDate.setHours(startDate.getHours() + 1);
    final_ends_at = startDate.toISOString();
  }

  const { data, error } = await supabase
    .from('meetings')
    .insert([{
      title,
      project_id,
      starts_at,
      ends_at: final_ends_at,
      location: location || null
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating meeting:', error)
    return { error: 'No se pudo agendar la reunión' }
  }

  // Log de actividad
  await supabase.from('activity_logs').insert([{
    profile_id: user.id,
    project_id,
    title: 'Nueva reunión agendada',
    description: `agendó "${title}"`,
    type: 'meeting'
  }])

  revalidatePath('/admin/meetings')
  revalidatePath('/admin/calendar')
  revalidatePath('/admin')
  return { success: true, data }
}

export async function deleteMeetingAction(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('meetings')
    .delete()
    .eq('id', id)

  if (error) return { error: 'Error al eliminar reunión' }

  revalidatePath('/admin/meetings')
  revalidatePath('/admin/calendar')
  return { success: true }
}

export async function getProjectMeetings(projectId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('project_id', projectId)
    .order('starts_at', { ascending: true })

  if (error) return []
  return data
}
