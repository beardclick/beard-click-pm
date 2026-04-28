'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentClientRecord } from '@/lib/client-access'
import { isMissingTableError } from '@/lib/supabase-errors'

const EMPTY_UNREAD_COUNTS = { projects: 0, meetings: 0, comments: 0 }

function countUnreadBySection(notifications: Array<{ type: string }>) {
  return notifications.reduce(
    (counts, notification) => {
      if (notification.type === 'meeting_created' || notification.type === 'meeting_updated') {
        counts.meetings += 1
      } else if (notification.type === 'comment_added') {
        counts.comments += 1
      } else if (
        notification.type === 'project_created' ||
        notification.type === 'file_uploaded' ||
        notification.type === 'file_deleted'
      ) {
        counts.projects += 1
      }

      return counts
    },
    { ...EMPTY_UNREAD_COUNTS }
  )
}

async function getUnreadNotificationCounts(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ...EMPTY_UNREAD_COUNTS }
  }

  const { data, error } = await supabase
    .from('notifications')
    .select('type')
    .eq('recipient_id', user.id)
    .eq('is_read', false)

  if (error) {
    if (isMissingTableError(error, 'notifications')) {
      return { ...EMPTY_UNREAD_COUNTS }
    }

    console.error('Error fetching unread notification counts:', error)
    return { ...EMPTY_UNREAD_COUNTS }
  }

  return countUnreadBySection(data || [])
}

export async function getSidebarCounts() {
  const supabase = await createClient()
  
  const [projects, clients, meetings, comments, unreadCounts] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('clients').select('*', { count: 'exact', head: true }),
    supabase.from('meetings').select('*', { count: 'exact', head: true }),
    supabase.from('comments').select('*', { count: 'exact', head: true }),
    getUnreadNotificationCounts(supabase),
  ])

  return {
    projects: { total: projects.count || 0, unread: unreadCounts.projects },
    clients: { total: clients.count || 0, unread: 0 },
    meetings: { total: meetings.count || 0, unread: unreadCounts.meetings },
    comments: { total: comments.count || 0, unread: unreadCounts.comments },
  }
}

export async function getClientSidebarCounts(clientId: string) {
  const authSupabase = await createClient()
  const supabase = createAdminClient()
  
  let targetId = clientId
  if (clientId === 'current') {
    const client = await getCurrentClientRecord()
    if (!client) return null
    targetId = client.id
  }
  
  const [projects, meetings, comments, unreadCounts] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('client_id', targetId),
    supabase.from('meetings').select('*, projects!inner(client_id)').eq('projects.client_id', targetId),
    supabase.from('comments').select('*, projects!inner(client_id)').eq('projects.client_id', targetId),
    getUnreadNotificationCounts(authSupabase),
  ])

  return {
    projects: { total: projects.count || 0, unread: unreadCounts.projects },
    meetings: { total: meetings.data?.length || 0, unread: unreadCounts.meetings },
    comments: { total: comments.data?.length || 0, unread: unreadCounts.comments },
  }
}
