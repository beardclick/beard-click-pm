'use client'

import { useActionState, useState } from 'react'
import { Eye, EyeOff, Moon, Sun } from 'lucide-react'
import { login, requestPasswordReset } from './actions'
import Link from 'next/link'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Collapse from '@mui/material/Collapse'
import { useThemeMode } from '@/components/ThemeRegistry'

interface LoginState {
  error?: string
}

interface RecoveryState {
  error?: string
  success?: boolean
  message?: string
}

export default function LoginPage() {
  const { mode, toggleMode } = useThemeMode()
  const [showPassword, setShowPassword] = useState(false)
  const [showRecovery, setShowRecovery] = useState(false)
  const [loginState, formAction, isPending] = useActionState<LoginState | null, FormData>(
    async (_prevState, formData) => {
      const res = await login(formData);
      if (res?.error) return { error: res.error };
      return null;
    },
    null
  )
  const [recoveryState, recoveryAction, isRecoveryPending] = useActionState<RecoveryState | null, FormData>(
    async (_prevState, formData) => {
      return await requestPasswordReset(formData)
    },
    null
  )

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "background.default", p: 2, position: 'relative' }}>
      <IconButton
        onClick={toggleMode}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          color: 'text.secondary',
          border: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </IconButton>

      <Paper variant="outlined" sx={{ width: "100%", maxWidth: 420, p: 5 }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h5" sx={{fontWeight: 700}} color="primary">
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
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              required
              fullWidth
              size="small"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton edge="end" onClick={() => setShowPassword((value) => !value)}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            {loginState?.error && (
              <Alert severity="error">{loginState.error}</Alert>
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

        <Box sx={{ mt: 3, pt: 2 }}>
          <Button
            variant="text"
            fullWidth
            onClick={() => setShowRecovery((value) => !value)}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {showRecovery ? 'Ocultar recuperación de contraseña' : 'Recuperar contraseña'}
          </Button>

          <Collapse in={showRecovery}>
            <Box sx={{ mt: 2, pt: 3, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
                Te enviaremos un enlace de recuperación a tu correo
              </Typography>
              <form action={recoveryAction}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <TextField
                    id="recovery-email"
                    name="email"
                    label="Correo para recuperación"
                    type="email"
                    placeholder="tu@email.com"
                    required
                    fullWidth
                    size="small"
                  />

                  {recoveryState?.error && <Alert severity="error">{recoveryState.error}</Alert>}
                  {recoveryState?.success && <Alert severity="success">{recoveryState.message}</Alert>}

                  <Button type="submit" variant="outlined" fullWidth disabled={isRecoveryPending}>
                    {isRecoveryPending ? 'Enviando...' : 'Enviar enlace de recuperación'}
                  </Button>
                </Box>
              </form>
            </Box>
          </Collapse>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3, textAlign: 'center' }}>
          Si ya abriste el enlace del correo, continúa en{' '}
          <Link href="/reset-password" style={{ color: 'inherit', fontWeight: 600 }}>
            restablecer contraseña
          </Link>
          .
        </Typography>
      </Paper>
    </Box>
  )
}

