'use client'

import React, { useState } from 'react'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import { useRouter } from 'next/navigation'
import { createMeetingAction, updateMeetingAction } from '@/app/actions/meetings'
import { notifyAppCountsChanged } from '@/lib/client-events'
import { Video, Save, X } from 'lucide-react'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import dayjs, { Dayjs } from 'dayjs'
import { MeetingDeleteButton } from './MeetingDeleteButton'

interface Project {
  id: string
  name: string
}

interface MeetingFormProps {
  projects: Project[]
  initialData?: {
    id: string
    title: string
    project_id: string
    starts_at: string
    ends_at?: string | null
    location?: string | null
  }
}



export function MeetingForm({ projects, initialData }: MeetingFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [startsAt, setStartsAt] = useState<Dayjs | null>(initialData?.starts_at ? dayjs(initialData.starts_at) : null)
  const [endsAt, setEndsAt] = useState<Dayjs | null>(initialData?.ends_at ? dayjs(initialData.ends_at) : null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const result = initialData
      ? await updateMeetingAction(initialData.id, formData)
      : await createMeetingAction(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      notifyAppCountsChanged()
      router.push('/admin/meetings')
    }
  }

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              name="title"
              label="Título de la Reunión"
              placeholder="Ej: Revisión de Diseño"
              fullWidth
              required
              variant="outlined"
              defaultValue={initialData?.title || ''}
            />

            <TextField
              select
              name="project_id"
              label="Proyecto Relacionado"
              fullWidth
              required
              defaultValue={initialData?.project_id || (projects.length > 0 ? projects[0].id : "")}
              error={projects.length === 0}
              helperText={projects.length === 0 ? "Primero debes crear un proyecto" : ""}
            >
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
              {projects.length === 0 && (
                <MenuItem value="" disabled>No hay proyectos disponibles</MenuItem>
              )}
            </TextField>

            <input type="hidden" name="starts_at" value={startsAt ? startsAt.toISOString() : ''} />
            <input type="hidden" name="ends_at" value={endsAt ? endsAt.toISOString() : ''} />

            <DateTimePicker
              label="Fecha y Hora"
              value={startsAt}
              onChange={(newValue) => setStartsAt(newValue)}
              minutesStep={15}
              format="DD/MM/YYYY HH:mm"
              slotProps={{ 
                textField: { 
                  fullWidth: true, 
                  required: true, 
                  helperText: "Duración estimada: 1 hora" 
                } 
              }}
            />

            <DateTimePicker
              label="Fecha y Hora de Fin"
              value={endsAt}
              onChange={(newValue) => setEndsAt(newValue)}
              minutesStep={15}
              format="DD/MM/YYYY HH:mm"
              slotProps={{ 
                textField: { 
                  fullWidth: true 
                } 
              }}
            />

            <TextField
              name="location"
              label="Enlace o Ubicación"
              placeholder="Ej: https://meet.google.com/xxx"
              fullWidth
              defaultValue={initialData?.location || ''}
              slotProps={{
                input: {
                  startAdornment: (
                    <Box sx={{ mr: 1, color: 'text.secondary', display: 'flex' }}>
                      <Video size={20} />
                    </Box>
                  ),
                }
              }}
            />

            {error && (
              <Typography color="error" variant="body2" sx={{fontWeight: 400}}>
                {error}
              </Typography>
            )}

            <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
              {initialData && (
                <MeetingDeleteButton
                  meetingId={initialData.id}
                  redirectTo="/admin/meetings"
                  fullWidth
                />
              )}
              <Button
                variant="outlined"
                fullWidth
                onClick={() => router.back()}
                startIcon={<X size={18} />}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                startIcon={<Save size={18} />}
              >
                {loading ? (initialData ? 'Guardando...' : 'Agendando...') : (initialData ? 'Guardar Cambios' : 'Agendar')}
              </Button>
            </Box>
          </Stack>
        </form>
      </CardContent>
    </Card>
  )
}
