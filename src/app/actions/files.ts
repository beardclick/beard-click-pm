'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getProjectFiles(projectId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('files')
    .select(`
      *,
      profiles (full_name)
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

  const projectId = formData.get('projectId') as string
  const category = formData.get('category') as string || 'documentos'
  const name = formData.get('name') as string
  const url = formData.get('url') as string
  const type = formData.get('type') as string
  const sizeStr = formData.get('size') as string
  const size = sizeStr ? parseInt(sizeStr) : 0

  const { data, error } = await supabase
    .from('files')
    .insert([{
      project_id: projectId,
      profile_id: user.id,
      name,
      url,
      category,
      type,
      size
    }])
    .select()

  if (error) {
    console.error('Error recording file in DB:', error)
    return { error: `Error DB: ${error.message}` }
  }

  // Registrar en log de actividad
  try {
    await supabase.from('activity_logs').insert([{
      profile_id: user.id,
      project_id: projectId,
      title: 'Archivo subido',
      description: `subió un archivo: ${name}`,
      type: 'file'
    }])
  } catch (e) {
    console.error('Non-critical: Error creating activity log for file')
  }

  revalidatePath(`/admin/projects/${projectId}`)
  revalidatePath(`/client/projects/${projectId}`)
  
  return { success: true, file: data[0] }
}

export async function deleteFileAction(fileId: string, projectId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('files')
    .delete()
    .eq('id', fileId)

  if (error) return { error: 'Error al eliminar' }

  revalidatePath(`/admin/projects/${projectId}`)
  return { success: true }
}
