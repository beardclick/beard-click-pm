'use server'

import { createClient } from '@/lib/supabase/server'
import { notifyAdminsForProjectEvent, notifyClientForProjectEvent } from '@/lib/notifications'
import { revalidatePath } from 'next/cache'

export async function getProjectFiles(projectId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('project_files')
    .select(`
      *,
      profiles:uploaded_by (full_name)
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching files:', error)
    return []
  }
  return data
}

export async function uploadFileAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'No autorizado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  const projectId = formData.get('projectId') as string
  const category = formData.get('category') as string || 'documentos'
  const name = formData.get('name') as string
  const url = formData.get('url') as string
  const type = formData.get('type') as string
  const sizeStr = formData.get('size') as string
  const size = sizeStr ? parseInt(sizeStr) : 0

  const { data, error } = await supabase
    .from('project_files')
    .insert([{
      project_id: projectId,
      uploaded_by: user.id,
      file_name: name,
      file_path: url,
      file_type: type,
      file_size: size
    }])
    .select()

  if (error) {
    console.error('Error recording file in DB:', error)
    return { error: `Error DB: ${error.message}` }
  }

  const notificationPayload = {
    projectId,
    actorId: user.id,
    type: 'file_uploaded' as const,
    title: 'Nuevo archivo subido',
    message: name,
  }

  if (profile?.role === 'admin') {
    await notifyClientForProjectEvent(notificationPayload)
  } else {
    await notifyAdminsForProjectEvent(notificationPayload)
  }

  // Registrar en log de actividad
  try {
    await supabase.from('activity_logs').insert([{
      actor_id: user.id,
      project_id: projectId,
      title: 'Archivo subido',
      description: `subió un archivo: ${name}`,
      type: 'file_uploaded'
    }])
  } catch (e) {
    console.error('Non-critical: Error creating activity log for file')
  }

  revalidatePath(`/admin/projects/${projectId}`)
  revalidatePath(`/client/projects/${projectId}`)
  revalidatePath('/admin/projects')
  revalidatePath('/client/projects')
  revalidatePath('/admin')
  revalidatePath('/client')
  
  return { success: true, file: data[0] }
}

export async function deleteFileAction(fileId: string, projectId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('project_files')
    .delete()
    .eq('id', fileId)

  if (error) return { error: 'Error al eliminar' }

  revalidatePath(`/admin/projects/${projectId}`)
  revalidatePath(`/client/projects/${projectId}`)
  revalidatePath('/admin/projects')
  revalidatePath('/client/projects')
  revalidatePath('/admin')
  revalidatePath('/client')
  return { success: true }
}
