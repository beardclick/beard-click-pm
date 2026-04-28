'use client'

import { ChangeEvent, useActionState, useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { Eye, EyeOff, Upload } from 'lucide-react'
import { updateCurrentProfileAction } from '@/app/actions/profile'

interface AdminProfileFormProps {
  profile: {
    full_name: string
    email: string
    phone?: string | null
    avatar_url?: string | null
    auth_email?: string
  }
}

interface ProfileFormState {
  error?: string
  success?: boolean
  message?: string
}

export function AdminProfileForm({ profile }: AdminProfileFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url || null)
  const [selectedFileName, setSelectedFileName] = useState('')

  const [state, formAction, isPending] = useActionState<ProfileFormState | null, FormData>(
    async (_prevState, formData) => {
      return await updateCurrentProfileAction(formData)
    },
    null
  )

  const avatarInitial = useMemo(() => {
    return profile.full_name?.trim()?.[0]?.toUpperCase() || 'A'
  }, [profile.full_name])

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      setSelectedFileName('')
      setAvatarPreview(profile.avatar_url || null)
      return
    }

    setSelectedFileName(file.name)
    setAvatarPreview(URL.createObjectURL(file))
  }

  return (
    <Paper variant="outlined" sx={{ p: 4, maxWidth: 820 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Mi Perfil
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Actualiza la información de tu usuario administrador y, si quieres, cambia tu contraseña.
        </Typography>
      </Box>

      <form action={formAction}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { xs: 'flex-start', sm: 'center' } }}>
              <Avatar
                src={avatarPreview || undefined}
                sx={{ width: 88, height: 88, bgcolor: 'primary.main', fontSize: '2rem', fontWeight: 700 }}
              >
                {avatarInitial}
              </Avatar>
              <Box>
                <Button component="label" variant="outlined" startIcon={<Upload size={16} />}>
                  Subir Foto
                  <input type="file" name="avatar" hidden accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleAvatarChange} />
                </Button>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {selectedFileName || 'PNG, JPG, WEBP o GIF. Máximo 5 MB.'}
                </Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              id="full_name"
              name="full_name"
              label="Nombre completo"
              defaultValue={profile.full_name}
              required
              fullWidth
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              id="email"
              name="email"
              label="Correo electrónico"
              type="email"
              defaultValue={profile.auth_email || profile.email}
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
              defaultValue={profile.phone || ''}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              id="password"
              name="password"
              label="Nueva contraseña"
              type={showPassword ? 'text' : 'password'}
              helperText="Déjalo vacío si no quieres cambiarla."
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
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              id="confirm_password"
              name="confirm_password"
              label="Confirmar contraseña"
              type={showConfirmPassword ? 'text' : 'password'}
              fullWidth
              size="small"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton edge="end" onClick={() => setShowConfirmPassword((value) => !value)}>
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
        </Grid>

        {state?.error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {state.error}
          </Alert>
        )}

        {state?.success && (
          <Alert severity="success" sx={{ mt: 3 }}>
            {state.message}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </Box>
      </form>
    </Paper>
  )
}
