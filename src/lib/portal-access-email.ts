interface PortalAccessEmailInput {
  to: string
  clientName: string
  company?: string | null
  resetLink: string
  portalUrl: string
}

interface PasswordResetEmailInput {
  to: string
  resetLink: string
  portalUrl: string
}

interface EmailSendResult {
  skipped: boolean
  success?: boolean
  error?: string
  id?: string
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function buildPortalAccessEmailText({ clientName, company, resetLink, portalUrl }: PortalAccessEmailInput) {
  const companyLine = company ? `\nEmpresa: ${company}` : ''

  return `Hola ${clientName},

Creamos un acceso para ti en el portal de clientes de Beard Click Design.${companyLine}

Por seguridad, no enviamos una contrasena temporal por correo. Para entrar por primera vez debes crear o restablecer tu contrasena usando este enlace:

${resetLink}

Despues de guardar tu contrasena, podras iniciar sesion en:
${portalUrl}

Si no esperabas este acceso, puedes ignorar este correo.`
}

function buildPortalAccessEmailHtml({ clientName, company, resetLink, portalUrl }: PortalAccessEmailInput) {
  const safeName = escapeHtml(clientName)
  const safeCompany = company ? escapeHtml(company) : null
  const safeResetLink = escapeHtml(resetLink)
  const safePortalUrl = escapeHtml(portalUrl)

  return `
    <div style="margin:0;padding:0;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;color:#171923;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7fb;padding:32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
              <tr>
                <td style="padding:28px 32px;border-bottom:1px solid #edf0f4;">
                  <div style="font-size:14px;color:#64748b;margin-bottom:8px;">Beard Click Design</div>
                  <h1 style="font-size:22px;line-height:1.3;margin:0;color:#111827;">Tu acceso al portal fue creado</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:28px 32px;">
                  <p style="font-size:15px;line-height:1.65;margin:0 0 16px;">Hola ${safeName},</p>
                  <p style="font-size:15px;line-height:1.65;margin:0 0 16px;">
                    Creamos un acceso para ti en el portal de clientes de Beard Click Design${safeCompany ? ` para <strong>${safeCompany}</strong>` : ''}.
                  </p>
                  <p style="font-size:15px;line-height:1.65;margin:0 0 24px;">
                    Por seguridad, no enviamos una contrasena temporal por correo. Para entrar por primera vez, debes crear o restablecer tu contrasena con el enlace de abajo.
                  </p>
                  <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
                    <tr>
                      <td>
                        <a href="${safeResetLink}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:12px 18px;border-radius:8px;">
                          Crear mi contrasena
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="font-size:14px;line-height:1.65;margin:0 0 12px;color:#4b5563;">
                    Despues de guardar tu contrasena, podras iniciar sesion en el portal:
                  </p>
                  <p style="font-size:14px;line-height:1.65;margin:0 0 20px;">
                    <a href="${safePortalUrl}" style="color:#2563eb;text-decoration:none;">${safePortalUrl}</a>
                  </p>
                  <p style="font-size:12px;line-height:1.6;margin:0;color:#6b7280;">
                    Si no esperabas este acceso, puedes ignorar este correo.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `
}

function buildPasswordResetEmailText({ resetLink, portalUrl }: PasswordResetEmailInput) {
  return `Hola,

Recibimos una solicitud para restablecer la contrasena de tu portal de clientes de Beard Click Design.

Para crear una nueva contrasena, abre este enlace:

${resetLink}

Cuando termines, podras iniciar sesion en:
${portalUrl}/login

Si no solicitaste este cambio, puedes ignorar este correo.`
}

function buildPasswordResetEmailHtml({ resetLink, portalUrl }: PasswordResetEmailInput) {
  const safeResetLink = escapeHtml(resetLink)
  const safeLoginUrl = escapeHtml(`${portalUrl}/login`)

  return `
    <div style="margin:0;padding:0;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;color:#171923;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7fb;padding:32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
              <tr>
                <td style="padding:28px 32px;border-bottom:1px solid #edf0f4;">
                  <div style="font-size:14px;color:#64748b;margin-bottom:8px;">Beard Click Design</div>
                  <h1 style="font-size:22px;line-height:1.3;margin:0;color:#111827;">Restablece tu contrasena</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:28px 32px;">
                  <p style="font-size:15px;line-height:1.65;margin:0 0 16px;">Recibimos una solicitud para restablecer la contrasena de tu portal de clientes.</p>
                  <p style="font-size:15px;line-height:1.65;margin:0 0 24px;">
                    Usa el siguiente enlace para crear una nueva contrasena. Si no solicitaste este cambio, puedes ignorar este correo.
                  </p>
                  <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
                    <tr>
                      <td>
                        <a href="${safeResetLink}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:12px 18px;border-radius:8px;">
                          Restablecer mi contrasena
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="font-size:14px;line-height:1.65;margin:0 0 12px;color:#4b5563;">
                    Despues de actualizarla, podras iniciar sesion aqui:
                  </p>
                  <p style="font-size:14px;line-height:1.65;margin:0;">
                    <a href="${safeLoginUrl}" style="color:#2563eb;text-decoration:none;">${safeLoginUrl}</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `
}

function getEmailFromAddress() {
  return process.env.PORTAL_EMAIL_FROM || process.env.BREVO_FROM || process.env.SENDGRID_FROM || process.env.RESEND_FROM || process.env.SMTP_FROM
}

export function canSendTransactionalEmail() {
  return Boolean(process.env.BREVO_API_KEY && getEmailFromAddress())
}

function parseSenderIdentity(sender: string) {
  const match = sender.match(/^(.*)<([^>]+)>$/)

  if (!match) {
    return {
      email: sender.trim(),
      name: undefined as string | undefined,
    }
  }

  return {
    name: match[1].trim().replace(/^"|"$/g, '') || undefined,
    email: match[2].trim(),
  }
}

async function sendEmailWithBrevo(input: {
  to: string
  subject: string
  html: string
  text: string
}): Promise<EmailSendResult> {
  const apiKey = process.env.BREVO_API_KEY
  const from = getEmailFromAddress()

  if (!apiKey || !from) {
    return { skipped: true as const }
  }

  const sender = parseSenderIdentity(from)

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender,
        to: [
          {
            email: input.to,
          },
        ],
        subject: input.subject,
        htmlContent: input.html,
        textContent: input.text,
      }),
    })

    if (!response.ok) {
      let errorMessage = `Brevo respondio con ${response.status}.`

      try {
        const errorData = await response.json()
        if (typeof errorData?.message === 'string' && errorData.message.trim()) {
          errorMessage = errorData.message
        }
      } catch {
        // Si Brevo no devuelve JSON, usamos el mensaje generico.
      }

      return {
        skipped: false as const,
        error: errorMessage,
      }
    }

    const data = await response.json()

    return {
      skipped: false as const,
      success: true as const,
      id: typeof data?.messageId === 'string' ? data.messageId : undefined,
    }
  } catch (error) {
    return {
      skipped: false as const,
      error: error instanceof Error ? error.message : 'No se pudo enviar el correo por Brevo.',
    }
  }
}

export async function sendPortalAccessEmail(input: PortalAccessEmailInput) {
  const result = await sendEmailWithBrevo({
    to: input.to,
    subject: 'Tu acceso al portal de Beard Click Design fue creado',
    html: buildPortalAccessEmailHtml(input),
    text: buildPortalAccessEmailText(input),
  })

  if (result.success) {
    console.info('Brevo portal access email accepted', {
      to: input.to,
      messageId: result.id,
    })
  }

  return result
}

export async function sendPasswordResetEmail(input: PasswordResetEmailInput) {
  const result = await sendEmailWithBrevo({
    to: input.to,
    subject: 'Restablece tu contrasena del portal de Beard Click Design',
    html: buildPasswordResetEmailHtml(input),
    text: buildPasswordResetEmailText(input),
  })

  if (result.success) {
    console.info('Brevo password reset email accepted', {
      to: input.to,
      messageId: result.id,
    })
  }

  return result
}
