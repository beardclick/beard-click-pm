'use client'

import { useState, useEffect, useRef } from 'react'
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
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs, { Dayjs } from 'dayjs'
import { Wrench } from 'lucide-react'
import { createProjectMaintenanceAction } from '@/app/actions/projects'
import { notifyAppCountsChanged } from '@/lib/client-events'
import { formatDateOnly, formatDateTime } from '@/lib/date-utils'

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
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
  const [notes, setNotes] = useState('')
  const [state, setState] = useState<ActionState>(null)
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    if (!state?.success) return

    setSelectedDate(null)
    setNotes('')
    notifyAppCountsChanged()
    router.refresh()
  }, [router, state])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedDate || !selectedDate.isValid()) {
      setState({ error: 'Selecciona una fecha válida.' })
      return
    }

    setIsPending(true)
    setState(null)

    const formData = new FormData()
    formData.set('maintenance_date', selectedDate.format('YYYY-MM-DD'))
    formData.set('notes', notes)

    const result = await createProjectMaintenanceAction(projectId, formData)

    if (result?.error) {
      setState({ error: result.error })
    } else {
      setState({ success: 'Mantenimiento registrado correctamente.' })
    }

    setIsPending(false)
  }

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

        <Box component="form" ref={formRef} onSubmit={handleSubmit}>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <DatePicker
              label="Fecha de Vencimiento del Plan"
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  required: true,
                },
              }}
            />
            <TextField
              name="notes"
              label="Nota del Mantenimiento (Opcional)"
              placeholder="Detalle del trabajo o alcance cubierto"
              size="small"
              multiline
              rows={2}
              fullWidth
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
                          label={formatDateOnly(log.maintenance_date)}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Registrado por {log.profiles?.full_name || 'Usuario'} el{' '}
                          {formatDateTime(log.created_at)}
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
