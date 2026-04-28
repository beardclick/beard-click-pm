'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function getDashboardStats() {
  const supabase = await createClient()
  
  const [clients, projects, meetings, comments] = await Promise.all([
    supabase.from('clients').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('meetings').select('*', { count: 'exact', head: true }),
    supabase.from('comments').select('*', { count: 'exact', head: true }),
  ])

  return {
    clients: clients.count || 0,
    projects: projects.count || 0,
    meetings: meetings.count || 0,
    comments: comments.count || 0,
  }
}

export async function getRecentActivity(page: number = 1, pageSize: number = 10) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  let lastSeenAt = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('last_seen_activity_at')
      .eq('id', user.id)
      .maybeSingle()
    
    lastSeenAt = profile?.last_seen_activity_at || null
  }
  
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('activity_logs')
    .select(`
      *,
      profiles (full_name, avatar_url)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching activity:', error)
    return { activity: [], lastSeenAt, count: 0 }
  }

  return { activity: data, lastSeenAt, count: count || 0 }
}

export async function markActivityAsSeenAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'No autorizado' }
  
  const { error } = await supabase
    .from('profiles')
    .update({ last_seen_activity_at: new Date().toISOString() })
    .eq('id', user.id)
  
  if (error) {
    console.error('Error updating last_seen_activity_at:', error)
    return { error: error.message }
  }
  
  revalidatePath('/admin')
  return { success: true }
}

export async function getUpcomingMeetings() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('meetings')
    .select(`
      *,
      projects (name)
    `)
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })
    .limit(5)

  if (error) {
    console.error('Error fetching meetings:', error)
    return []
  }

  return data
}

export async function getClientDashboardStats(clientId: string) {
  const supabase = createAdminClient()
  
  const [projects, meetings] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('client_id', clientId),
    supabase.from('meetings').select('*, projects!inner(client_id)').eq('projects.client_id', clientId).gte('starts_at', new Date().toISOString())
  ])

  return {
    activeProjects: projects.count || 0,
    upcomingMeetings: meetings.data?.length || 0,
  }
}

export async function getClientActivity(clientId: string, page: number = 1, pageSize: number = 10) {
  const supabase = createAdminClient()
  
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // Obtenemos actividades relacionadas con los proyectos del cliente
  const { data, error, count } = await supabase
    .from('activity_logs')
    .select(`
      *,
      profiles (full_name, avatar_url),
      projects!inner (client_id)
    `, { count: 'exact' })
    .eq('projects.client_id', clientId)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching client activity:', error)
    return { data: [], count: 0 }
  }

  return { data, count: count || 0 }
}

export async function getClientUpcomingMeetings(clientId: string) {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('meetings')
    .select(`
      *,
      projects!inner(name, client_id)
    `)
    .eq('projects.client_id', clientId)
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })
    .limit(5)

  if (error) {
    console.error('Error fetching client meetings:', error)
    return []
  }

  return data
}
