'use client'

import React, { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { Send, Trash2, Plus, X } from 'lucide-react'
import { createCommentAction, deleteCommentAction } from '@/app/actions/comments'
import { createClient } from '@/lib/supabase/client'
import { notifyAppCountsChanged } from '@/lib/client-events'
import { formatDateTime } from '@/lib/date-utils'

interface Comment {
  id: string
  content: string
  created_at: string
  author_id: string
  profiles: {
    full_name: string
    avatar_url?: string
  }
}

interface CommentsSectionProps {
  projectId: string
  initialComments: Comment[]
}

export function CommentsSection({ projectId, initialComments }: CommentsSectionProps) {
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentUserProfile, setCurrentUserProfile] = useState<Comment['profiles'] | null>(null)

  useEffect(() => {
    async function getCurrentUser() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      setCurrentUserId(user?.id || null)
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .maybeSingle()

        if (profile) {
          setCurrentUserProfile({
            full_name: profile.full_name,
            avatar_url: profile.avatar_url || undefined,
          })
        }
      }
    }

    getCurrentUser()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newComment.trim() || loading) return

    setLoading(true)
    setSubmitError('')
    const result = await createCommentAction(projectId, newComment)
    
    if (result.success) {
      setNewComment('')
      setComments((current) => [
        ...current,
        {
          ...result.comment,
          profiles: currentUserProfile || { full_name: 'Usuario' },
        },
      ])
      setOpen(false)
      notifyAppCountsChanged()
    } else if (result.error) {
      setSubmitError(result.error)
    }
    setLoading(false)
  }

  async function handleDelete(commentId: string) {
    if (!confirm('¿Seguro que quieres borrar tu comentario?')) return

    const result = await deleteCommentAction(commentId, projectId)
    if (result.success) {
      setComments((current) => current.filter((comment) => comment.id !== commentId))
      notifyAppCountsChanged()
    }
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{fontWeight: 600}}>
          Comentarios y Feedback
        </Typography>
        <Button variant="contained" size="small" startIcon={<Plus size={16} />} onClick={() => setOpen(true)}>
          Añadir Comentario
        </Button>
      </Box>

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Stack spacing={3}>
          {comments.length > 0 ? comments.map((comment) => (
            <Box key={comment.id}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Avatar src={comment.profiles.avatar_url} sx={{ width: 32, height: 32 }}>
                  {comment.profiles.full_name[0]}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="subtitle2" sx={{fontWeight: 600}}>
                      {comment.profiles.full_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDateTime(comment.created_at)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.primary">
                    {comment.content}
                  </Typography>
                  {comment.author_id === currentUserId && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                      <IconButton size="small" color="error" onClick={() => handleDelete(comment.id)}>
                        <Trash2 size={16} />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          )) : (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
              No hay comentarios aún. ¡Sé el primero en escribir!
            </Typography>
          )}
        </Stack>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2 }}>
          <DialogTitle>Escribir un Comentario</DialogTitle>
          <IconButton onClick={() => setOpen(false)} size="small">
            <X size={20} />
          </IconButton>
        </Box>
        <DialogContent dividers>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Escribe un comentario o actualización..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              variant="outlined"
              sx={{ mb: 2 }}
              autoFocus
              error={Boolean(submitError)}
              helperText={submitError || ' '}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={!newComment.trim() || loading}
                startIcon={<Send size={18} />}
              >
                Publicar Comentario
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

