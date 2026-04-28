import { createAdminClient } from '@/lib/supabase/admin'
import { isMissingTableError } from '@/lib/supabase-errors'

type NotificationType =
  | 'project_created'
  | 'comment_added'
  | 'meeting_created'
  | 'meeting_updated'
  | 'file_uploaded'
  | 'file_deleted'
  | 'general'

interface NotificationPayload {
  recipientIds: Array<string | null | undefined>
  actorId?: string | null
  type: NotificationType
  title: string
  message?: string | null
  relatedProjectId?: string | null
  relatedCommentId?: string | null
  relatedMeetingId?: string | null
}

async function createNotifications({
  recipientIds,
  actorId,
  type,
  title,
  message,
  relatedProjectId,
  relatedCommentId,
  relatedMeetingId,
}: NotificationPayload) {
  const recipients = Array.from(
    new Set(
      recipientIds
        .filter((recipientId): recipientId is string => Boolean(recipientId))
        .filter((recipientId) => recipientId !== actorId)
    )
  )

  if (recipients.length === 0) return

  const supabase = createAdminClient()
  const { error } = await supabase.from('notifications').insert(
    recipients.map((recipientId) => ({
      recipient_id: recipientId,
      actor_id: actorId || null,
      type,
      title,
      message: message || null,
      related_project_id: relatedProjectId || null,
      related_comment_id: relatedCommentId || null,
      related_meeting_id: relatedMeetingId || null,
    }))
  )

  if (error) {
    if (isMissingTableError(error, 'notifications')) {
      return
    }

    console.error('Error creating notifications:', error)
  }
}

async function getClientProfileIdForProject(projectId: string) {
  const supabase = createAdminClient()
  const { data: project, error } = await supabase
    .from('projects')
    .select(
      `
        client_id,
        clients (
          profile_id,
          email
        )
      `
    )
    .eq('id', projectId)
    .maybeSingle()

  if (error || !project) {
    if (error) console.error('Error finding project client for notification:', error)
    return null
  }

  const client = Array.isArray(project.clients) ? project.clients[0] : project.clients
  if (client?.profile_id) return client.profile_id
  if (!client?.email) return null

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .ilike('email', String(client.email).trim().toLowerCase())
    .eq('role', 'client')
    .maybeSingle()

  if (profileError) {
    console.error('Error finding client profile for notification:', profileError)
  }

  return profile?.id || null
}

async function getAdminProfileIds() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('profiles').select('id').eq('role', 'admin')

  if (error) {
    console.error('Error finding admin profiles for notification:', error)
    return []
  }

  return (data || []).map((profile) => profile.id)
}

export async function notifyClientForProjectEvent({
  projectId,
  actorId,
  type,
  title,
  message,
  relatedCommentId,
  relatedMeetingId,
}: {
  projectId: string
  actorId?: string | null
  type: NotificationType
  title: string
  message?: string | null
  relatedCommentId?: string | null
  relatedMeetingId?: string | null
}) {
  const clientProfileId = await getClientProfileIdForProject(projectId)

  await createNotifications({
    recipientIds: [clientProfileId],
    actorId,
    type,
    title,
    message,
    relatedProjectId: projectId,
    relatedCommentId,
    relatedMeetingId,
  })
}

export async function notifyAdminsForProjectEvent({
  projectId,
  actorId,
  type,
  title,
  message,
  relatedCommentId,
  relatedMeetingId,
}: {
  projectId: string
  actorId?: string | null
  type: NotificationType
  title: string
  message?: string | null
  relatedCommentId?: string | null
  relatedMeetingId?: string | null
}) {
  const adminProfileIds = await getAdminProfileIds()

  await createNotifications({
    recipientIds: adminProfileIds,
    actorId,
    type,
    title,
    message,
    relatedProjectId: projectId,
    relatedCommentId,
    relatedMeetingId,
  })
}
