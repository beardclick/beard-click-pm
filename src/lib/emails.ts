import { createAdminClient } from '@/lib/supabase/admin'

interface EmailPayload {
  to: string
  subject: string
  html: string
  text: string
}

async function sendEmail(payload: EmailPayload) {
  const apiKey = process.env.BREVO_API_KEY
  const from = process.env.PORTAL_EMAIL_FROM || 'Beard Click Design <portal@beardclick.com>'

  if (!apiKey) {
    console.warn('BREVO_API_KEY is not configured. Email skipped:', payload.subject)
    return { skipped: true }
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: parseSender(from),
        to: [{ email: payload.to }],
        subject: payload.subject,
        htmlContent: payload.html,
        textContent: payload.text,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `Brevo error: ${response.status}`)
    }

    return { success: true }
  } catch (error) {
    console.error('Error sending email via Brevo:', error)
    return { success: false, error }
  }
}

function parseSender(sender: string) {
  const match = sender.match(/^(.*)<([^>]+)>$/)
  if (!match) return { email: sender.trim() }
  return {
    name: match[1].trim().replace(/^"|"$/g, ''),
    email: match[2].trim(),
  }
}

// Templates

export async function sendNewCommentEmail({
  recipientEmail,
  recipientName,
  projectName,
  commentAuthorName,
  commentContent,
  projectUrl,
}: {
  recipientEmail: string
  recipientName: string
  projectName: string
  commentAuthorName: string
  commentContent: string
  projectUrl: string
}) {
  const subject = `Nuevo comentario en el proyecto: ${projectName}`
  const text = `Hola ${recipientName},

${commentAuthorName} ha dejado un nuevo comentario en el proyecto "${projectName}":

"${commentContent}"

Puedes verlo aquí: ${projectUrl}`

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #2563eb; margin-top: 0;">Nuevo comentario</h2>
      <p>Hola <strong>${recipientName}</strong>,</p>
      <p><strong>${commentAuthorName}</strong> ha dejado un nuevo comentario en el proyecto <strong>${projectName}</strong>:</p>
      <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
        <p style="margin: 0; font-style: italic;">"${commentContent}"</p>
      </div>
      <div style="margin-top: 30px;">
        <a href="${projectUrl}" style="background: #2563eb; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Ver comentario</a>
      </div>
      <hr style="margin-top: 40px; border: 0; border-top: 1px solid #eee;" />
      <p style="font-size: 12px; color: #6b7280;">Beard Click Design - Sistema de Gestión</p>
    </div>
  `

  return sendEmail({ to: recipientEmail, subject, html, text })
}

export async function sendNewMeetingEmail({
  recipientEmail,
  recipientName,
  projectName,
  meetingTitle,
  meetingDate,
  meetingUrl,
}: {
  recipientEmail: string
  recipientName: string
  projectName: string
  meetingTitle: string
  meetingDate: string
  meetingUrl?: string | null
}) {
  const subject = `Nueva reunión programada: ${meetingTitle}`
  const text = `Hola ${recipientName},

Se ha programado una nueva reunión para el proyecto "${projectName}":

Título: ${meetingTitle}
Fecha: ${meetingDate}
${meetingUrl ? `Enlace: ${meetingUrl}` : ''}

Puedes ver los detalles en el portal.`

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #2563eb; margin-top: 0;">Nueva reunión programada</h2>
      <p>Hola <strong>${recipientName}</strong>,</p>
      <p>Se ha programado una nueva reunión para el proyecto <strong>${projectName}</strong>:</p>
      <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Título:</strong> ${meetingTitle}</p>
        <p style="margin: 5px 0;"><strong>Fecha:</strong> ${meetingDate}</p>
        ${meetingUrl ? `<p style="margin: 5px 0;"><strong>Enlace:</strong> <a href="${meetingUrl}">${meetingUrl}</a></p>` : ''}
      </div>
      <p>Puedes ver todos los detalles accediendo a tu panel de cliente.</p>
      <hr style="margin-top: 40px; border: 0; border-top: 1px solid #eee;" />
      <p style="font-size: 12px; color: #6b7280;">Beard Click Design - Sistema de Gestión</p>
    </div>
  `

  return sendEmail({ to: recipientEmail, subject, html, text })
}

export async function sendProjectAssignedEmail({
  recipientEmail,
  recipientName,
  projectName,
  projectUrl,
}: {
  recipientEmail: string
  recipientName: string
  projectName: string
  projectUrl: string
}) {
  const subject = `Nuevo proyecto asignado: ${projectName}`
  const text = `Hola ${recipientName},

Se te ha asignado un nuevo proyecto en Beard Click Design: "${projectName}".

Puedes ver el estado y los detalles aquí: ${projectUrl}`

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #2563eb; margin-top: 0;">Nuevo proyecto asignado</h2>
      <p>Hola <strong>${recipientName}</strong>,</p>
      <p>Te informamos que se ha creado y asignado un nuevo proyecto para ti: <strong>${projectName}</strong>.</p>
      <p>Ya puedes acceder al portal para ver el seguimiento, subir archivos o dejar comentarios.</p>
      <div style="margin-top: 30px;">
        <a href="${projectUrl}" style="background: #2563eb; color: white; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Ver proyecto</a>
      </div>
      <hr style="margin-top: 40px; border: 0; border-top: 1px solid #eee;" />
      <p style="font-size: 12px; color: #6b7280;">Beard Click Design - Sistema de Gestión</p>
    </div>
  `

  return sendEmail({ to: recipientEmail, subject, html, text })
}
