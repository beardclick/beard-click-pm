'use client'

import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import { Send } from 'lucide-react'
import { createCommentAction } from '@/app/actions/comments'

interface Comment {
  id: string
  content: string
  created_at: string
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newComment.trim() || loading) return

    setLoading(true)
    const result = await createCommentAction(projectId, newComment)
    
    if (result.success) {
      setNewComment('')
      // En una app real, revalidaríamos desde el servidor, 
      // aquí actualizamos localmente para feedback inmediato.
      window.location.reload() 
    }
    setLoading(false)
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{fontWeight: 600}} gutterBottom>
        Comentarios y Feedback
      </Typography>

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
                      {new Date(comment.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.primary">
                    {comment.content}
                  </Typography>
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

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Escribe un comentario o actualización..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          variant="outlined"
          sx={{ mb: 2 }}
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
    </Box>
  )
}

