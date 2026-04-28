'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteClientAction } from '@/app/actions/clients'
import { notifyAppCountsChanged } from '@/lib/client-events'
import { Trash2 } from 'lucide-react'
import Button from '@mui/material/Button'

export function ClientDeleteButton({ clientId }: { clientId: string }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer.')) return
    setIsDeleting(true)
    const result = await deleteClientAction(clientId)
    if (result.success) {
      notifyAppCountsChanged()
      router.refresh()
    }
    setIsDeleting(false)
  }

  return (
    <Button
      size="small"
      variant="text"
      color="error"
      onClick={handleDelete}
      disabled={isDeleting}
      startIcon={<Trash2 size={16} />}
    >
      {isDeleting ? '...' : 'Eliminar'}
    </Button>
  )
}

