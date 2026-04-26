'use client'

import { useActionState } from 'react'
import { createProjectAction, updateProjectAction } from '@/app/actions/projects'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid2'
import Alert from '@mui/material/Alert'
import MenuItem from '@mui/material/MenuItem'

interface ProjectFormProps {
  initialData?: any;
  clients: { id: string, name: string }[];
}

export function ProjectForm({ initialData, clients }: ProjectFormProps) {
  const router = useRouter()
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
        router.push('/admin/projects');
        return { success: true };
      }
      return null;
    },
    null
  )

  return (
    <Paper variant="outlined" sx={{ p: 4, maxWidth: 700 }}>
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
                  {client.name}
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
            <TextField
              id="due_date"
              name="due_date"
              label="Fecha de Vencimiento"
              type="date"
              defaultValue={initialData?.due_date || ''}
              fullWidth
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
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
