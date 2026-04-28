'use server'

import { createClient } from '@/lib/supabase/server'
import { isMissingTableError } from '@/lib/supabase-errors'
import { revalidatePath } from 'next/cache'

const TYPE_GROUPS = {
  projects: ['project_created', 'file_uploaded', 'file_deleted'],
  meetings: ['meeting_created', 'meeting_updated'],
  comments: ['comment_added'],
} as const

export async function getNotificationsAction(limit = 20) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { notifications: [], unreadCount: 0 }
  }

  const [notificationsResult, unreadResult] = await Promise.all([
    supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit),
    supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', user.id)
      .eq('is_read', false),
  ])

  if (notificationsResult.error && !isMissingTableError(notificationsResult.error, 'notifications')) {
    console.error('Error fetching notifications:', notificationsResult.error)
  }

  if (unreadResult.error && !isMissingTableError(unreadResult.error, 'notifications')) {
    console.error('Error counting unread notifications:', unreadResult.error)
  }

  return {
    notifications: notificationsResult.data || [],
    unreadCount: unreadResult.count || 0,
  }
}

export async function markNotificationAsReadAction(notificationId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autorizado' }
  }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('recipient_id', user.id)

  if (error) {
    if (isMissingTableError(error, 'notifications')) {
      return { success: true }
    }

    console.error('Error marking notification as read:', error)
    return { error: 'No se pudo marcar la notificación como leída' }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function markAllNotificationsAsReadAction() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autorizado' }
  }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('recipient_id', user.id)
    .eq('is_read', false)

  if (error) {
    if (isMissingTableError(error, 'notifications')) {
      return { success: true }
    }

    console.error('Error marking all notifications as read:', error)
    return { error: 'No se pudieron marcar las notificaciones como leídas' }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function markTypeAsReadAction(type: 'projects' | 'meetings' | 'comments') {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autorizado' }
  }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('recipient_id', user.id)
    .in('type', [...TYPE_GROUPS[type]])
    .eq('is_read', false)

  if (error && !isMissingTableError(error, 'notifications')) {
    console.error('Error marking notification type as read:', error)
  }

  revalidatePath('/', 'layout')
  return { success: true }
}
