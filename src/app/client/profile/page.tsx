import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import { getCurrentProfile } from '@/app/actions/profile'
import { AdminProfileForm } from '@/components/profile/AdminProfileForm'

export default async function ClientProfilePage() {
  const profile = await getCurrentProfile()

  if (!profile) {
    return (
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          Mi Perfil
        </Typography>
        <Alert severity="error">
          No se pudo cargar tu perfil actual.
        </Alert>
      </Box>
    )
  }

  return <AdminProfileForm profile={profile} />
}
