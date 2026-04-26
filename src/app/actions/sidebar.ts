'use server'

import { createClient } from '@/lib/supabase/server'

export async function getSidebarCounts() {
  const supabase = await createClient()
  
  const [projects, clients, meetings, comments] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('clients').select('*', { count: 'exact', head: true }),
    supabase.from('meetings').select('*', { count: 'exact', head: true }),
    supabase.from('comments').select('*', { count: 'exact', head: true }),
  ])

  // Contamos basados en la columna is_read
  const [unreadProjects, unreadMeetings, unreadComments] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('is_read', false),
    supabase.from('meetings').select('*', { count: 'exact', head: true }).eq('is_read', false),
    supabase.from('comments').select('*', { count: 'exact', head: true }).eq('is_read', false),
  ])

  return {
    projects: { total: projects.count || 0, unread: unreadProjects.count || 0 },
    clients: { total: clients.count || 0, unread: 0 },
    meetings: { total: meetings.count || 0, unread: unreadMeetings.count || 0 },
    comments: { total: comments.count || 0, unread: unreadComments.count || 0 },
  }
}

export async function getClientSidebarCounts(clientId: string) {
  const supabase = await createClient()
  
  let targetId = clientId
  if (clientId === 'current') {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    targetId = user.id
  }
  
  const [projects, meetings, comments] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('client_id', targetId),
    supabase.from('meetings').select('*, projects!inner(client_id)').eq('projects.client_id', targetId),
    supabase.from('comments').select('*, projects!inner(client_id)').eq('projects.client_id', targetId),
  ])

  const [unreadProjects, unreadMeetings, unreadComments] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('client_id', targetId).eq('is_read', false),
    supabase.from('meetings').select('*, projects!inner(client_id)').eq('projects.client_id', targetId).eq('is_read', false),
    supabase.from('comments').select('*, projects!inner(client_id)').eq('projects.client_id', targetId).eq('is_read', false),
  ])

  return {
    projects: { total: projects.count || 0, unread: unreadProjects.count || 0 },
    meetings: { total: meetings.data?.length || 0, unread: unreadMeetings.data?.length || 0 },
    comments: { total: comments.data?.length || 0, unread: unreadComments.data?.length || 0 },
  }
}
