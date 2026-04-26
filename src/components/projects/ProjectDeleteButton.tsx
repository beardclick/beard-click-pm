'use client'

import { useState } from 'react'
import { deleteProjectAction } from '@/app/actions/projects'
import { Trash2 } from 'lucide-react'
import Button from '@mui/material/Button'

export function ProjectDeleteButton({ projectId }: { projectId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este proyecto? Esta acción eliminará también sus reuniones y comentarios asociados.')) return
    setIsDeleting(true)
    await deleteProjectAction(projectId)
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
