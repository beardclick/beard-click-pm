'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteProjectAction } from '@/app/actions/projects'
import { notifyAppCountsChanged } from '@/lib/client-events'
import { Trash2 } from 'lucide-react'
import Button from '@mui/material/Button'

export function ProjectDeleteButton({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este proyecto? Esta acción eliminará también sus reuniones y comentarios asociados.')) return
    setIsDeleting(true)
    const result = await deleteProjectAction(projectId)
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

