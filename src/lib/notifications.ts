import { createAdminClient } from '@/lib/supabase/admin'
import { isMissingTableError } from '@/lib/supabase-errors'
import { 
  sendNewCommentEmail, 
  sendNewMeetingEmail, 
  sendProjectAssignedEmail 
} from '@/lib/emails'

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

const PORTAL_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://portal.beardclick.com'

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

async function getProjectWithClient(projectId: string) {
  const supabase = createAdminClient()
  const { data: project, error } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      client_id,
      clients (
        name,
        email,
        profile_id
      )
    `)
    .eq('id', projectId)
    .maybeSingle()

  if (error || !project) return null
  return project
}

async function getProfile(profileId: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .eq('id', profileId)
    .maybeSingle()
  
  if (error) return null
  return data
}

async function getAdminProfiles() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('role', 'admin')

  if (error) return []
  return data || []
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
  const project = await getProjectWithClient(projectId)
  if (!project) return

  const client = Array.isArray(project.clients) ? project.clients[0] : project.clients
  const recipientId = client?.profile_id
  const recipientEmail = client?.email
  const recipientName = client?.name || 'Cliente'

  // Create in-app notification
  await createNotifications({
    recipientIds: [recipientId],
    actorId,
    type,
    title,
    message,
    relatedProjectId: projectId,
    relatedCommentId,
    relatedMeetingId,
  })

  // Send Email if applicable
  if (recipientEmail && recipientId !== actorId) {
    const projectUrl = `${PORTAL_URL}/client/projects/${projectId}`
    const actorProfile = actorId ? await getProfile(actorId) : null
    const actorName = actorProfile?.full_name || 'Administrador'

    if (type === 'comment_added') {
      await sendNewCommentEmail({
        recipientEmail,
        recipientName,
        projectName: project.name,
        commentAuthorName: actorName,
        commentContent: message || '',
        projectUrl,
      })
    } else if (type === 'meeting_created') {
      await sendNewMeetingEmail({
        recipientEmail,
        recipientName,
        projectName: project.name,
        meetingTitle: title,
        meetingDate: message || 'Consultar en el portal',
      })
    } else if (type === 'project_created') {
      await sendProjectAssignedEmail({
        recipientEmail,
        recipientName,
        projectName: project.name,
        projectUrl,
      })
    }
  }
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
  const admins = await getAdminProfiles()
  const adminIds = admins.map(a => a.id)

  // Create in-app notifications
  await createNotifications({
    recipientIds: adminIds,
    actorId,
    type,
    title,
    message,
    relatedProjectId: projectId,
    relatedCommentId,
    relatedMeetingId,
  })

  // Send Emails to admins (only for comments from clients)
  if (type === 'comment_added') {
    const project = await getProjectWithClient(projectId)
    const actorProfile = actorId ? await getProfile(actorId) : null
    const actorName = actorProfile?.full_name || 'Cliente'
    const projectUrl = `${PORTAL_URL}/admin/projects/${projectId}`

    for (const admin of admins) {
      if (admin.id !== actorId && admin.email) {
        await sendNewCommentEmail({
          recipientEmail: admin.email,
          recipientName: admin.full_name,
          projectName: project?.name || 'Proyecto',
          commentAuthorName: actorName,
          commentContent: message || '',
          projectUrl,
        })
      }
    }
  }
}
