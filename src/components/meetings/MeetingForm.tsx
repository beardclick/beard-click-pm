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
import { createMeetingAction } from '@/app/actions/meetings'
import { Video, Save, X } from 'lucide-react'

interface Project {
  id: string
  name: string
}

interface MeetingFormProps {
  projects: Project[]
}

export function MeetingForm({ projects }: MeetingFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const result = await createMeetingAction(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
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
            />

            <TextField
              select
              name="project_id"
              label="Proyecto Relacionado"
              fullWidth
              required
              defaultValue={projects.length > 0 ? projects[0].id : ""}
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

            <TextField
              name="starts_at"
              label="Fecha y Hora"
              type="datetime-local"
              fullWidth
              required
              slotProps={{ inputLabel: { shrink: true } }}
              helperText="Duración estimada: 1 hora"
            />

            <TextField
              name="location"
              label="Enlace o Ubicación"
              placeholder="Ej: https://meet.google.com/xxx"
              fullWidth
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
                {loading ? 'Agendando...' : 'Agendar'}
              </Button>
            </Box>
          </Stack>
        </form>
      </CardContent>
    </Card>
  )
}
