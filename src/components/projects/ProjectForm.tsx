'use client'

import { useActionState, useRef, useState } from 'react'
import { createProjectAction, updateProjectAction } from '@/app/actions/projects'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Divider from '@mui/material/Divider'
import { Link2, Plus, Trash2 } from 'lucide-react'
import { notifyAppCountsChanged } from '@/lib/client-events'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs, { Dayjs } from 'dayjs'

type ProjectWebAccess = {
  website_url: string
  access_username: string
  access_password: string
}

interface ProjectFormProps {
  initialData?: any;
  clients: { id: string, name: string, company?: string | null }[];
}

export function ProjectForm({ initialData, clients }: ProjectFormProps) {
  const router = useRouter()
  const rowIdCounterRef = useRef(2)
  const initialWebAccesses: ProjectWebAccess[] = initialData?.web_accesses?.length
    ? initialData.web_accesses.map((access: any) => ({
        website_url: access.website_url || '',
        access_username: access.access_username || '',
        access_password: access.access_password || '',
      }))
    : [{ website_url: '', access_username: '', access_password: '' }]

  const [webAccessRows, setWebAccessRows] = useState(
    initialWebAccesses.map((access, index) => ({
      id: index + 1,
      ...access,
    }))
  )
  const [dueDate, setDueDate] = useState<Dayjs | null>(initialData?.due_date ? dayjs(initialData.due_date) : null)

  if (rowIdCounterRef.current <= webAccessRows.length) {
    rowIdCounterRef.current = webAccessRows.length + 1
  }

  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      let res;
      if (initialData) {
        res = await updateProjectAction(initialData.id, formData);
      } else {
        res = await createProjectAction(formData);
      }

      if (res?.error) return { error: res.error };
      if (res?.success) {
        notifyAppCountsChanged();
        router.push('/admin/projects');
        return { success: true };
      }
      return null;
    },
    null
  )

  const addWebAccessRow = () => {
    const newRowId = rowIdCounterRef.current
    rowIdCounterRef.current += 1
    setWebAccessRows((currentRows) => [
      ...currentRows,
      { id: newRowId, website_url: '', access_username: '', access_password: '' },
    ])
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
    <Paper variant="outlined" sx={{ p: 4, maxWidth: 860 }}>
      <form action={formAction}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <TextField
              id="name"
              name="name"
              label="Nombre del Proyecto"
              placeholder="Ej. Rediseño Web Corporativa"
              defaultValue={initialData?.name || ''}
              required
              fullWidth
              size="small"
            />
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              id="client_id"
              name="client_id"
              label="Cliente Asignado"
              select
              defaultValue={initialData?.client_id || (clients.length > 0 ? clients[0].id : '')}
              required
              fullWidth
              size="small"
            >
              {clients.map((client) => (
                <MenuItem key={client.id} value={client.id}>
                  {client.name}{client.company ? ` (${client.company})` : ''}
                </MenuItem>
              ))}
              {clients.length === 0 && (
                <MenuItem value="" disabled>No hay clientes disponibles</MenuItem>
              )}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              id="status"
              name="status"
              label="Estado"
              select
              defaultValue={initialData?.status || 'active'}
              fullWidth
              size="small"
            >
              <MenuItem value="active">Activo</MenuItem>
              <MenuItem value="on_hold">En Pausa</MenuItem>
              <MenuItem value="completed">Completado</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <input type="hidden" name="due_date" value={dueDate ? dueDate.format('YYYY-MM-DD') : ''} />
            <DatePicker
              label="Fecha de Vencimiento"
              value={dueDate}
              onChange={(newValue) => setDueDate(newValue)}
              format="DD/MM/YYYY"
              slotProps={{ textField: { fullWidth: true, size: "small" } }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              id="description"
              name="description"
              label="Descripción"
              placeholder="Detalles sobre el alcance del proyecto..."
              defaultValue={initialData?.description || ''}
              multiline
              rows={4}
              fullWidth
              size="small"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 0.5 }} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Accesos Web del Proyecto
              </Typography>
              <Button
                size="small"
                variant="text"
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
                      defaultValue={row.website_url}
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
                      label="Usuario de Acceso"
                      placeholder="admin"
                      defaultValue={row.access_username}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, lg: 3 }}>
                    <TextField
                      name="web_access_password[]"
                      label="Contraseña de Acceso"
                      placeholder="********"
                      defaultValue={row.access_password}
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
          </Grid>
        </Grid>

        {state?.error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {state.error}
          </Alert>
        )}

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4, pt: 3, borderTop: 1, borderColor: "divider" }}>
          <Button variant="outlined" color="inherit" component={Link} href="/admin/projects">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={isPending || state?.success}>
            {isPending ? 'Guardando...' : (initialData ? 'Actualizar Proyecto' : 'Crear Proyecto')}
          </Button>
        </Box>
      </form>
    </Paper>
  )
}
