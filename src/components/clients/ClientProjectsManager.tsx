'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import { Link2, Plus, Trash2 } from 'lucide-react'
import { assignProjectToClientAction, createProjectAction } from '@/app/actions/projects'
import { notifyAppCountsChanged } from '@/lib/client-events'

type ReassignableProject = {
  id: string
  name: string
  client_id: string
  clients?:
    | {
        name?: string | null
      }
    | {
        name?: string | null
      }[]
    | null
}

type ActionState = {
  error?: string
  success?: string
} | null

interface ClientProjectsManagerProps {
  clientId: string
  reassignableProjects: ReassignableProject[]
}

export function ClientProjectsManager({
  clientId,
  reassignableProjects,
}: ClientProjectsManagerProps) {
  const router = useRouter()
  const createFormRef = useRef<HTMLFormElement>(null)
  const webAccessCounterRef = useRef(2)
  const [webAccessRows, setWebAccessRows] = useState([{ id: 1 }])

  const [createState, createFormAction, isCreatingProject] = useActionState<ActionState, FormData>(
    async (_prevState, formData) => {
      const result = await createProjectAction(formData)
      if (result?.error) {
        return { error: result.error }
      }

      return { success: 'Proyecto creado y asignado correctamente.' }
    },
    null
  )

  const [assignState, assignFormAction, isAssigningProject] = useActionState<ActionState, FormData>(
    async (_prevState, formData) => {
      const projectId = String(formData.get('project_id') || '').trim()
      if (!projectId) {
        return { error: 'Debes seleccionar un proyecto para asignar.' }
      }

      const result = await assignProjectToClientAction(projectId, clientId)
      if (result?.error) {
        return { error: result.error }
      }

      return { success: 'Proyecto asignado al cliente correctamente.' }
    },
    null
  )

  useEffect(() => {
    if (!createState?.success) {
      return
    }

    createFormRef.current?.reset()
    webAccessCounterRef.current = 2
    setWebAccessRows([{ id: 1 }])
    notifyAppCountsChanged()
    router.refresh()
  }, [createState, router])

  useEffect(() => {
    if (!assignState?.success) {
      return
    }

    notifyAppCountsChanged()
    router.refresh()
  }, [assignState, router])

  const addWebAccessRow = () => {
    const newRowId = webAccessCounterRef.current
    webAccessCounterRef.current += 1
    setWebAccessRows((currentRows) => [...currentRows, { id: newRowId }])
  }

  const removeWebAccessRow = (rowId: number) => {
    setWebAccessRows((currentRows) => {
      if (currentRows.length === 1) {
        return currentRows
      }
      return currentRows.filter((row) => row.id !== rowId)
    })
  }

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, xl: 8 }}>
        <Card variant="outlined" sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              Crear Proyecto Para Este Cliente
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Crea un proyecto sin salir de esta vista y registra de una vez los accesos web.
            </Typography>

            <Box component="form" ref={createFormRef} action={createFormAction}>
              <input type="hidden" name="client_id" value={clientId} />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    name="name"
                    label="Nombre del Proyecto"
                    placeholder="Ej. Mantenimiento Web Mayo"
                    required
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    name="status"
                    label="Estado"
                    defaultValue="active"
                    select
                    required
                    fullWidth
                    size="small"
                  >
                    <MenuItem value="active">Activo</MenuItem>
                    <MenuItem value="on_hold">En Pausa</MenuItem>
                    <MenuItem value="completed">Completado</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    name="due_date"
                    label="Fecha de Entrega"
                    type="date"
                    fullWidth
                    size="small"
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    name="description"
                    label="Descripción"
                    placeholder="Detalles del alcance del proyecto"
                    multiline
                    rows={3}
                    fullWidth
                    size="small"
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Accesos Web (URLs Múltiples)
                  </Typography>
                  <Button
                    variant="text"
                    size="small"
                    startIcon={<Plus size={16} />}
                    onClick={addWebAccessRow}
                    type="button"
                  >
                    Agregar URL
                  </Button>
                </Box>

                <Box sx={{ display: 'grid', gap: 1.5 }}>
                  {webAccessRows.map((row, index) => (
                    <Grid container spacing={1.5} key={row.id}>
                      <Grid size={{ xs: 12, lg: 5 }}>
                        <TextField
                          name="web_access_url[]"
                          label={`URL Web ${index + 1}`}
                          placeholder="https://midominio.com/wp-admin"
                          type="url"
                          fullWidth
                          size="small"
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Link2 size={14} />
                                </InputAdornment>
                              ),
                            },
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, lg: 3 }}>
                        <TextField
                          name="web_access_username[]"
                          label="Usuario"
                          placeholder="admin"
                          fullWidth
                          size="small"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, lg: 3 }}>
                        <TextField
                          name="web_access_password[]"
                          label="Contraseña"
                          placeholder="********"
                          type="text"
                          fullWidth
                          size="small"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, lg: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-end', lg: 'center' }, pt: { lg: 0.4 } }}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeWebAccessRow(row.id)}
                            disabled={webAccessRows.length === 1}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </Box>
                      </Grid>
                    </Grid>
                  ))}
                </Box>
              </Box>

              {createState?.error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {createState.error}
                </Alert>
              )}

              {createState?.success && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  {createState.success}
                </Alert>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button type="submit" variant="contained" disabled={isCreatingProject}>
                  {isCreatingProject ? 'Creando proyecto...' : 'Crear Proyecto'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, xl: 4 }}>
        <Card variant="outlined" sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              Asignar Proyecto Existente
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Mueve un proyecto existente desde otro cliente hacia este cliente.
            </Typography>

            {reassignableProjects.length === 0 ? (
              <Alert severity="info">
                No hay proyectos disponibles para reasignar.
              </Alert>
            ) : (
              <Box component="form" action={assignFormAction}>
                <TextField
                  label="Proyecto"
                  name="project_id"
                  select
                  required
                  fullWidth
                  size="small"
                  defaultValue={reassignableProjects[0]?.id || ''}
                >
                  {reassignableProjects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                      {(() => {
                        const currentClientName = Array.isArray(project.clients)
                          ? project.clients[0]?.name
                          : project.clients?.name
                        return currentClientName ? ` (actual: ${currentClientName})` : ''
                      })()}
                    </MenuItem>
                  ))}
                </TextField>

                <Divider sx={{ my: 2 }} />

                {assignState?.error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {assignState.error}
                  </Alert>
                )}

                {assignState?.success && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    {assignState.success}
                  </Alert>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button type="submit" variant="outlined" disabled={isAssigningProject}>
                    {isAssigningProject ? 'Asignando...' : 'Asignar Proyecto'}
                  </Button>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
