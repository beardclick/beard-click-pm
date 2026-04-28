'use client'

import { useActionState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import { Wrench } from 'lucide-react'
import { createProjectMaintenanceAction } from '@/app/actions/projects'
import { notifyAppCountsChanged } from '@/lib/client-events'

type MaintenanceLog = {
  id: string
  maintenance_date: string
  notes?: string | null
  created_at: string
  profiles?: {
    full_name?: string | null
  } | null
}

type ActionState = {
  error?: string
  success?: string
} | null

interface WebMaintenanceSectionProps {
  projectId: string
  initialLogs: MaintenanceLog[]
}

export function WebMaintenanceSection({ projectId, initialLogs }: WebMaintenanceSectionProps) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)

  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    async (_prevState, formData) => {
      const result = await createProjectMaintenanceAction(projectId, formData)
      if (result?.error) {
        return { error: result.error }
      }
      return { success: 'Mantenimiento registrado correctamente.' }
    },
    null
  )

  useEffect(() => {
    if (!state?.success) {
      return
    }

    formRef.current?.reset()
    notifyAppCountsChanged()
    router.refresh()
  }, [router, state])

  const latestMaintenanceDate = initialLogs[0]?.maintenance_date || null
  const today = new Date().toISOString().slice(0, 10)
  const isMaintenanceActive = Boolean(latestMaintenanceDate && latestMaintenanceDate >= today)

  return (
    <Card variant="outlined" sx={{ mt: 4 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Wrench size={18} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Mantenimiento Web
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
              PLAN
            </Typography>
            {isMaintenanceActive ? (
              <Chip size="small" color="primary" label="ACTIVO" />
            ) : (
              <Chip size="small" variant="outlined" label="NO" />
            )}
          </Box>
        </Box>

        <Box component="form" ref={formRef} action={formAction}>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <TextField
              type="date"
              name="maintenance_date"
              label="Fecha de Vencimiento del Plan"
              required
              size="small"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              name="notes"
              label="Nota del Mantenimiento (Opcional)"
              placeholder="Detalle del trabajo o alcance cubierto"
              size="small"
              multiline
              rows={2}
              fullWidth
            />
          </Box>

          {state?.error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {state.error}
            </Alert>
          )}

          {state?.success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {state.success}
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button type="submit" variant="contained" disabled={isPending}>
              {isPending ? 'Guardando...' : 'Registrar Fecha'}
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2.5 }} />

        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
          Histórico de Mantenimientos
        </Typography>

        {initialLogs.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No hay mantenimientos registrados para este proyecto.
          </Typography>
        ) : (
          <List disablePadding>
            {initialLogs.map((log, index) => (
              <Box key={log.id}>
                <ListItem sx={{ px: 0, py: 1.2 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          size="small"
                          color="primary"
                          variant={index === 0 && isMaintenanceActive ? 'filled' : 'outlined'}
                          label={new Date(`${log.maintenance_date}T00:00:00`).toLocaleDateString()}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Registrado por {log.profiles?.full_name || 'Usuario'} el{' '}
                          {new Date(log.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      log.notes ? (
                        <Typography variant="body2" color="text.primary" sx={{ mt: 0.75 }}>
                          {log.notes}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                          Sin notas adicionales.
                        </Typography>
                      )
                    }
                  />
                </ListItem>
                {index < initialLogs.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  )
}
