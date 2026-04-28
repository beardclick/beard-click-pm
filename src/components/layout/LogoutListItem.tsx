'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import { createClient } from '@/lib/supabase/client'

interface LogoutListItemProps {
  onAfterLogout?: () => void
}

export function LogoutListItem({ onAfterLogout }: LogoutListItemProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  const handleLogout = async () => {
    setIsPending(true)

    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      onAfterLogout?.()
      router.push('/login')
      router.refresh()
    } finally {
      setIsPending(false)
    }
  }

  return (
    <ListItemButton
      onClick={handleLogout}
      disabled={isPending}
      sx={(theme) => ({
        borderRadius: 1.5,
        '&:hover': { bgcolor: theme.palette.error.main + '14', color: theme.palette.error.main },
        '& .MuiListItemIcon-root': { color: 'text.secondary' },
        '&:hover .MuiListItemIcon-root': { color: theme.palette.error.main },
      })}
    >
      <ListItemIcon sx={{ minWidth: 40 }}>
        {isPending ? <CircularProgress size={18} /> : <LogOut size={20} />}
      </ListItemIcon>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
              {isPending ? 'Saliendo...' : 'Cerrar Sesión'}
            </Typography>
          </Box>
        }
      />
    </ListItemButton>
  )
}
