'use client'

import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import LinearProgress from '@mui/material/LinearProgress'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import { FileUp, File, Download, Trash2, FileText, ImageIcon, CreditCard, Package } from 'lucide-react'
import { uploadFileAction, deleteFileAction } from '@/app/actions/files'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = [
  { id: 'documentos', label: 'Documentos', icon: FileText, color: '#3b82f6' },
  { id: 'diseño', label: 'Diseño', icon: ImageIcon, color: '#ec4899' },
  { id: 'facturacion', label: 'Facturación', icon: CreditCard, color: '#10b981' },
  { id: 'entregables', label: 'Entregables', icon: Package, color: '#f59e0b' },
];

export function FilesSection({ projectId, initialFiles }: { projectId: string, initialFiles: any[] }) {
  const [files, setFiles] = useState(initialFiles)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState('documentos')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Obtener el perfil para saber si es admin
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        setCurrentUser({ id: user.id, role: profile?.role })
      }
    }
    getUser()
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setProgress(10)
    
    try {
      const fileName = `${Date.now()}-${file.name}`
      const { data: storageData, error: storageError } = await supabase.storage
        .from('project-files')
        .upload(`${projectId}/${fileName}`, file)

      if (storageError) throw storageError
      setProgress(60)

      const { data: { publicUrl } } = supabase.storage
        .from('project-files')
        .getPublicUrl(`${projectId}/${fileName}`)

      const formData = new FormData()
      formData.append('projectId', projectId)
      formData.append('category', selectedCategory)
      formData.append('name', file.name)
      formData.append('url', publicUrl)
      formData.append('type', file.type)
      formData.append('size', file.size.toString())

      const result = await uploadFileAction(formData)
      if (result.success) {
        setProgress(100)
        setTimeout(() => window.location.reload(), 500)
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (fileId: string) => {
    if (!confirm('¿Estás seguro de eliminar este archivo?')) return
    const result = await deleteFileAction(fileId, projectId)
    if (result.success) window.location.reload()
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 , fontWeight: 600}} >
        Archivos y Entregables
      </Typography>

      <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2, border: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 700 }}>
          CONFIGURAR SUBIDA
        </Typography>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Categoría</InputLabel>
            <Select
              value={selectedCategory}
              label="Categoría"
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={uploading}
            >
              {CATEGORIES.map(cat => (
                <MenuItem key={cat.id} value={cat.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <cat.icon size={14} color={cat.color} />
                    {cat.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            component="label"
            variant="contained"
            startIcon={<FileUp size={18} />}
            disabled={uploading}
            fullWidth
          >
            {uploading ? 'Subiendo...' : 'Subir Archivo'}
            <input type="file" hidden onChange={handleUpload} />
          </Button>
        </Stack>
        
        {uploading && (
          <Box sx={{ width: '100%', mt: 2 }}>
            <LinearProgress variant="determinate" value={progress} />
          </Box>
        )}
      </Box>

      <Stack spacing={2}>
        {CATEGORIES.map((cat) => {
          const catFiles = files.filter(f => f.category === cat.id);
          if (catFiles.length === 0) return null;

          return (
            <Paper key={cat.id} variant="outlined" sx={{ p: 0, overflow: 'hidden' }}>
              <Box sx={{ bgcolor: `${cat.color}10`, px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1, borderBottom: 1, borderColor: 'divider' }}>
                <cat.icon size={16} color={cat.color} />
                <Typography variant="subtitle2" sx={{ color: cat.color, fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  {cat.label}
                </Typography>
                <Chip label={catFiles.length} size="small" sx={{ height: 20, bgcolor: cat.color, color: 'white', fontWeight: 700, fontSize: '0.7rem' }} />
              </Box>
              <List disablePadding>
                {catFiles.map((file, idx) => {
                  // Lógica de permisos para borrar
                  const canDelete = currentUser?.role === 'admin' || currentUser?.id === file.profile_id;
                  
                  return (
                    <ListItem 
                      key={file.id}
                      divider={idx < catFiles.length - 1}
                      secondaryAction={
                        <Box>
                          <IconButton size="small" component="a" href={file.url} target="_blank">
                            <Download size={16} />
                          </IconButton>
                          {canDelete && (
                            <IconButton size="small" color="error" onClick={() => handleDelete(file.id)}>
                              <Trash2 size={16} />
                            </IconButton>
                          )}
                        </Box>
                      }
                    >
                      <Box sx={{ mr: 2, color: 'text.secondary' }}>
                        <File size={20} />
                      </Box>
                      <ListItemText 
                        primary={file.name}
                        secondary={`${formatSize(file.size)} • Por ${file.profiles?.full_name}`}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </Paper>
          );
        })}

        {files.length === 0 && (
          <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderStyle: 'dashed', bgcolor: 'grey.50' }}>
            <File size={32} style={{ opacity: 0.2, marginBottom: 8 }} />
            <Typography variant="body2" color="text.secondary">
              No hay archivos subidos aún en este proyecto.
            </Typography>
          </Paper>
        )}
      </Stack>
    </Box>
  )
}

