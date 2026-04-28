'use server'

import { createClient } from '@/lib/supabase/server'
import { notifyClientForProjectEvent } from '@/lib/notifications'
import { revalidatePath } from 'next/cache'

export async function getMeetings() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('meetings')
    .select(`
      *,
      projects (
        name,
        clients (name)
      )
    `)
    .order('starts_at', { ascending: true })

  if (error) return []
  return data || []
}

export async function getMeeting(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
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
  return data || []
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
      location: location || null,
      created_by: user.id,
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating meeting:', error)
    return { error: `No se pudo agendar la reunión: ${error.message}` }
  }

  await notifyClientForProjectEvent({
    projectId: project_id,
    actorId: user.id,
    type: 'meeting_created',
    title: 'Nueva reunión agendada',
    message: title,
    relatedMeetingId: data.id,
  })

  // Log de actividad
  await supabase.from('activity_logs').insert([{
    actor_id: user.id,
    project_id,
    title: 'Nueva reunión agendada',
    description: `agendó "${title}"`,
    type: 'meeting_created'
  }])

  revalidatePath('/admin/meetings')
  revalidatePath('/client/meetings')
  revalidatePath('/admin/calendar')
  revalidatePath('/admin')
  revalidatePath('/client')
  return { success: true, data }
}

export async function updateMeetingAction(id: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const title = formData.get('title') as string
  const project_id = formData.get('project_id') as string
  const starts_at = formData.get('starts_at') as string
  const ends_at = formData.get('ends_at') as string
  const location = formData.get('location') as string

  if (!title || !project_id || !starts_at) {
    return { error: 'Título, proyecto y fecha de inicio son obligatorios' }
  }

  let final_ends_at = ends_at
  if (!final_ends_at) {
    const startDate = new Date(starts_at)
    startDate.setHours(startDate.getHours() + 1)
    final_ends_at = startDate.toISOString()
  }

  const { data, error } = await supabase
    .from('meetings')
    .update({
      title,
      project_id,
      starts_at,
      ends_at: final_ends_at,
      location: location || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating meeting:', error)
    return { error: `No se pudo actualizar la reunión: ${error.message}` }
  }

  await notifyClientForProjectEvent({
    projectId: project_id,
    actorId: user?.id,
    type: 'meeting_updated',
    title: 'Reunión actualizada',
    message: title,
    relatedMeetingId: data.id,
  })

  // Log de actividad
  await supabase.from('activity_logs').insert([{
    actor_id: user?.id,
    project_id,
    title: 'Reunión actualizada',
    description: `actualizó la reunión "${title}"`,
    type: 'meeting_updated'
  }])

  revalidatePath('/admin/meetings')
  revalidatePath('/client/meetings')
  revalidatePath('/admin/calendar')
  revalidatePath(`/admin/meetings/${id}/edit`)
  revalidatePath('/admin')
  revalidatePath('/client')
  return { success: true, data }
}

export async function deleteMeetingAction(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('meetings')
    .delete()
    .eq('id', id)

  if (error) return { error: 'Error al eliminar reunión' }

  // Log de actividad
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.from('activity_logs').insert([{
      actor_id: user.id,
      title: 'Reunión eliminada',
      description: `eliminó una reunión`,
      type: 'meeting_updated'
    }])
  }

  revalidatePath('/admin/meetings')
  revalidatePath('/client/meetings')
  revalidatePath('/admin/calendar')
  revalidatePath('/admin')
  revalidatePath('/client')
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
  return data || []
}
