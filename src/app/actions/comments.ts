'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentClientRecord } from '@/lib/client-access'
import { createClient } from '@/lib/supabase/server'
import { notifyAdminsForProjectEvent, notifyClientForProjectEvent } from '@/lib/notifications'
import { revalidatePath } from 'next/cache'

function normalizeComments<T extends { profiles?: { full_name?: string | null; avatar_url?: string | null } | null }>(comments: T[]) {
  return comments.map((comment) => ({
    ...comment,
    profiles: {
      full_name: comment.profiles?.full_name || 'Usuario',
      avatar_url: comment.profiles?.avatar_url || undefined,
    },
  }))
}

async function getCommentViewerContext() {
  const supabase = await createClient()
  const adminSupabase = createAdminClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile, error } = await adminSupabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    console.error('Error fetching comment viewer role:', error)
    return null
  }

  if (profile?.role === 'admin') {
    return { role: 'admin' as const }
  }

  const client = await getCurrentClientRecord()
  if (!client) {
    return null
  }

  return {
    role: 'client' as const,
    clientId: client.id,
  }
}

export async function getComments(projectId: string) {
  const viewer = await getCommentViewerContext()
  if (!viewer) {
    return []
  }

  const supabase = createAdminClient()

  if (viewer.role === 'client') {
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('client_id')
      .eq('id', projectId)
      .maybeSingle()

    if (projectError) {
      console.error('Error validating client access to project comments:', projectError)
      return []
    }

    if (!project || project.client_id !== viewer.clientId) {
      return []
    }
  }

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
  return normalizeComments(data || [])
}

export async function createCommentAction(projectId: string, content: string) {
  const supabase = await createClient()
  const adminSupabase = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  const normalizedContent = content.trim()

  if (!user || !normalizedContent) return { error: 'No autorizado o contenido vacío' }

  const { data: profile, error: profileError } = await adminSupabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError || !profile) {
    console.error('Error fetching profile for comment creation:', profileError)
    return { error: 'No se pudo validar tu acceso para comentar' }
  }

  if (profile.role === 'client') {
    const client = await getCurrentClientRecord()
    if (!client) {
      return { error: 'No se pudo vincular tu cuenta con el cliente del proyecto' }
    }

    const { data: project, error: projectError } = await adminSupabase
      .from('projects')
      .select('client_id')
      .eq('id', projectId)
      .maybeSingle()

    if (projectError) {
      console.error('Error validating client project access for comment creation:', projectError)
      return { error: 'No se pudo validar el proyecto del comentario' }
    }

    if (!project || project.client_id !== client.id) {
      return { error: 'No tienes acceso para comentar en este proyecto' }
    }
  }

  // 1. Insertar el comentario
  const { data: comment, error: commentError } = await adminSupabase
    .from('comments')
    .insert([{
      project_id: projectId,
      author_id: user.id,
      content: normalizedContent
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
    message: normalizedContent,
    relatedCommentId: comment.id,
  }

  if (profile?.role === 'admin') {
    await notifyClientForProjectEvent(notificationPayload)
  } else {
    await notifyAdminsForProjectEvent(notificationPayload)
  }

  // 2. Registrar en log de actividad
  const { error: activityError } = await adminSupabase.from('activity_logs').insert([{
    actor_id: user.id,
    project_id: projectId,
    title: 'Nuevo comentario',
    description: `comentó en el proyecto`,
    type: 'comment_added'
  }])

  if (activityError) {
    console.error('Error creating comment activity log:', activityError)
  }

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
  const viewer = await getCommentViewerContext()
  if (!viewer || viewer.role !== 'admin') {
    return []
  }

  const supabase = createAdminClient()
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
  return normalizeComments(data || [])
}

export async function getClientGlobalComments(clientId: string) {
  const viewer = await getCommentViewerContext()
  if (!viewer) {
    return []
  }

  const supabase = createAdminClient()
  const targetClientId = viewer.role === 'admin' ? clientId : viewer.clientId
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      profiles (full_name, avatar_url),
      projects!inner(name, client_id)
    `)
    .eq('projects.client_id', targetClientId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching client global comments:', error)
    return []
  }
  return normalizeComments(data || [])
}
