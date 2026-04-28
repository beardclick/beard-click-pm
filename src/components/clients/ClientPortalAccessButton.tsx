'use client'

import { useState, useTransition } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { Mail, Send } from 'lucide-react'
import { sendClientPortalAccessAction } from '@/app/actions/clients'

interface ClientPortalAccessButtonProps {
  clientId: string
  hasPortalAccess: boolean
}

export function ClientPortalAccessButton({ clientId, hasPortalAccess }: ClientPortalAccessButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleSendAccess = () => {
    setFeedback(null)

    startTransition(async () => {
      const result = await sendClientPortalAccessAction(clientId)

      if (result?.error) {
        setFeedback({ type: 'error', message: result.error })
        return
      }

      setFeedback({
        type: 'success',
        message: result?.message || 'Acceso enviado correctamente.',
      })
    })
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
      <Button
        size="small"
        variant={hasPortalAccess ? 'outlined' : 'contained'}
        color="primary"
        startIcon={hasPortalAccess ? <Mail size={16} /> : <Send size={16} />}
        disabled={isPending}
        onClick={handleSendAccess}
      >
        {isPending ? 'Enviando...' : hasPortalAccess ? 'Reenviar Acceso' : 'Enviar Acceso'}
      </Button>

      {feedback && (
        <Alert severity={feedback.type} sx={{ maxWidth: 320 }}>
          {feedback.message}
        </Alert>
      )}
    </Box>
  )
}
