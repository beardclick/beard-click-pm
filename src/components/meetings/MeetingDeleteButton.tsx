'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@mui/material/Button'
import { Trash2 } from 'lucide-react'
import { deleteMeetingAction } from '@/app/actions/meetings'
import { notifyAppCountsChanged } from '@/lib/client-events'

interface MeetingDeleteButtonProps {
  meetingId: string
  redirectTo?: string
  fullWidth?: boolean
}

export function MeetingDeleteButton({
  meetingId,
  redirectTo = '/admin/meetings',
  fullWidth = false,
}: MeetingDeleteButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta reunión?')) return

    setIsDeleting(true)
    const result = await deleteMeetingAction(meetingId)

    if (result.success) {
      notifyAppCountsChanged()
      router.push(redirectTo)
      router.refresh()
      return
    }

    setIsDeleting(false)
    if (result.error) {
      alert(result.error)
    }
  }

  return (
    <Button
      type="button"
      variant="outlined"
      color="error"
      onClick={handleDelete}
      disabled={isDeleting}
      startIcon={<Trash2 size={18} />}
      fullWidth={fullWidth}
    >
      {isDeleting ? 'Eliminando...' : 'Eliminar reunión'}
    </Button>
  )
}
