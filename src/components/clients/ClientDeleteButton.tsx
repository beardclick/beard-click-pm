'use client'

import { useState } from 'react'
import { deleteClientAction } from '@/app/actions/clients'
import { Trash2 } from 'lucide-react'
import Button from '@mui/material/Button'

export function ClientDeleteButton({ clientId }: { clientId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer.')) return
    setIsDeleting(true)
    await deleteClientAction(clientId)
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

