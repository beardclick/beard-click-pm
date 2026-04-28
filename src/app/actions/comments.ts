'use server'

import { createClient } from '@/lib/supabase/server'
import { notifyAdminsForProjectEvent, notifyClientForProjectEvent } from '@/lib/notifications'
import { revalidatePath } from 'next/cache'

export async function getComments(projectId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      profiles (full_name, avatar_url)
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching comments:', error)
    return []
  }
  return data
}

export async function createCommentAction(projectId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !content) return { error: 'No autorizado o contenido vacío' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .maybeSingle()

  // 1. Insertar el comentario
  const { data: comment, error: commentError } = await supabase
    .from('comments')
    .insert([{
      project_id: projectId,
      author_id: user.id,
      content
    }])
    .select()
    .single()

  if (commentError) {
    console.error('Error creating comment:', commentError)
    return { error: 'Error al publicar comentario' }
  }

  const notificationPayload = {
    projectId,
    actorId: user.id,
    type: 'comment_added' as const,
    title: 'Nuevo comentario',
    message: content,
    relatedCommentId: comment.id,
  }

  if (profile?.role === 'admin') {
    await notifyClientForProjectEvent(notificationPayload)
  } else {
    await notifyAdminsForProjectEvent(notificationPayload)
  }

  // 2. Registrar en log de actividad
  await supabase.from('activity_logs').insert([{
    actor_id: user.id,
    project_id: projectId,
    title: 'Nuevo comentario',
    description: `comentó en el proyecto`,
    type: 'comment_added'
  }])

  revalidatePath(`/admin/projects/${projectId}`)
  revalidatePath(`/client/projects/${projectId}`)
  revalidatePath('/admin/comments')
  revalidatePath('/client/comments')
  revalidatePath('/admin')
  revalidatePath('/client')
  return { success: true, comment }
}

export async function deleteCommentAction(commentId: string, projectId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autorizado' }
  }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)

  if (error) {
    console.error('Error deleting comment:', error)
    return { error: 'No se pudo eliminar el comentario' }
  }

  revalidatePath(`/admin/projects/${projectId}`)
  revalidatePath(`/client/projects/${projectId}`)
  revalidatePath('/admin/comments')
  revalidatePath('/client/comments')
  revalidatePath('/admin')
  revalidatePath('/client')

  return { success: true }
}

export async function getGlobalComments() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      profiles (full_name, avatar_url),
      projects (name)
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching global comments:', error)
    return []
  }
  return data
}

export async function getClientGlobalComments(clientId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      profiles (full_name, avatar_url),
      projects!inner(name, client_id)
    `)
    .eq('projects.client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching client global comments:', error)
    return []
  }
  return data
}
