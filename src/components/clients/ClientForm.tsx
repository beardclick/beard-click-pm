'use client'

import { useActionState } from 'react'
import { createClientAction, updateClientAction } from '@/app/actions/clients'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'

interface ClientFormProps {
  initialData?: any;
}

export function ClientForm({ initialData }: ClientFormProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      let res;
      if (initialData) {
        res = await updateClientAction(initialData.id, formData);
      } else {
        res = await createClientAction(formData);
      }

      if (res?.error) return { error: res.error };
      if (res?.success) {
        router.push('/admin/clients');
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
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              id="name"
              name="name"
              label="Nombre de la Empresa / Cliente"
              placeholder="Ej. Acme Corp"
              defaultValue={initialData?.name || ''}
              required
              fullWidth
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              id="email"
              name="email"
              label="Correo Electrónico"
              type="email"
              placeholder="contacto@empresa.com"
              defaultValue={initialData?.email || ''}
              required
              fullWidth
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              id="phone"
              name="phone"
              label="Teléfono"
              placeholder="+1 555-0100"
              defaultValue={initialData?.phone || ''}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              id="company"
              name="company"
              label="Razón Social / Compañía"
              placeholder="Opcional"
              defaultValue={initialData?.company || ''}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              id="notes"
              name="notes"
              label="Notas o Descripción"
              placeholder="Información adicional sobre el cliente..."
              defaultValue={initialData?.notes || ''}
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
          <Button variant="outlined" color="inherit" component={Link} href="/admin/clients">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={isPending || state?.success}>
            {isPending ? 'Guardando...' : (initialData ? 'Actualizar Cliente' : 'Guardar Cliente')}
          </Button>
        </Box>
      </form>
    </Paper>
  )
}
