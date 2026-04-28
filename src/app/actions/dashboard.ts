'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

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

export async function getRecentActivity() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('activity_logs')
    .select(`
      *,
      profiles (full_name, avatar_url)
    `)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching activity:', error)
    return []
  }

  return data
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

export async function getClientActivity(clientId: string) {
  const supabase = createAdminClient()
  
  // Obtenemos actividades relacionadas con los proyectos del cliente
  const { data, error } = await supabase
    .from('activity_logs')
    .select(`
      *,
      profiles (full_name, avatar_url),
      projects!inner (client_id)
    `)
    .eq('projects.client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching client activity:', error)
    return []
  }

  return data
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
