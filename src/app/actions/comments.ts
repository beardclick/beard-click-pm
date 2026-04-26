'use server'

import { createClient } from '@/lib/supabase/server'
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

  // 1. Insertar el comentario
  const { data: comment, error: commentError } = await supabase
    .from('comments')
    .insert([{
      project_id: projectId,
      profile_id: user.id,
      content
    }])
    .select()
    .single()

  if (commentError) {
    console.error('Error creating comment:', commentError)
    return { error: 'Error al publicar comentario' }
  }

  // 2. Registrar en log de actividad
  await supabase.from('activity_logs').insert([{
    profile_id: user.id,
    project_id: projectId,
    title: 'Nuevo comentario',
    description: `comentó en el proyecto`,
    type: 'comment'
  }])

  revalidatePath(`/admin/projects/${projectId}`)
  revalidatePath(`/client/projects/${projectId}`)
  return { success: true, comment }
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

