'use client'

import { useActionState } from 'react'
import { login } from './actions'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'

export default function LoginPage() {
  const [error, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      const res = await login(formData);
      if (res?.error) return res.error;
      return null;
    },
    null
  )

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "background.default", p: 2 }}>
      <Paper variant="outlined" sx={{ width: "100%", maxWidth: 420, p: 5 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h5" fontWeight={700} color="primary">
            Beard Click
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Ingresa tus credenciales para acceder
          </Typography>
        </Box>

        <form action={formAction}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <TextField
              id="email"
              name="email"
              label="Correo Electrónico"
              type="email"
              placeholder="tu@email.com"
              required
              fullWidth
              size="small"
            />

            <TextField
              id="password"
              name="password"
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              required
              fullWidth
              size="small"
            />

            {error && (
              <Alert severity="error">{error}</Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isPending}
              sx={{ mt: 1, py: 1.2 }}
            >
              {isPending ? 'Ingresando...' : 'Iniciar Sesión'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  )
}
