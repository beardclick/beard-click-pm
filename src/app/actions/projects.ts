'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getProjects() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      clients (name),
      files (count)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }

  // Mapeamos para tener un formato limpio del conteo
  return data.map(p => ({
    ...p,
    files_count: p.files?.[0]?.count || 0
  }))
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

export async function createProjectAction(formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const status = formData.get('status') as string
  const client_id = formData.get('client_id') as string
  const due_date = formData.get('due_date') as string

  const { data, error } = await supabase
    .from('projects')
    .insert([{
      name,
      description,
      status,
      client_id,
      due_date: due_date || null
    }])

  if (error) return { error: error.message }
  
  revalidatePath('/admin/projects')
  return { success: true }
}

export async function updateProjectAction(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const status = formData.get('status') as string
  const client_id = formData.get('client_id') as string
  const due_date = formData.get('due_date') as string

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
  
  revalidatePath('/admin/projects')
  revalidatePath(`/admin/projects/${id}`)
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
  return { success: true }
}
