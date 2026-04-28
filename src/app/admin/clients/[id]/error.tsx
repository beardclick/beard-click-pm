'use client'

import { useEffect } from 'react'
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Captured by error.tsx:', error)
  }, [error])

  return (
    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <AlertCircle size={48} color="red" />
      <Typography variant="h4" color="error" gutterBottom>
        ¡Ocurrió un error inesperado!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center" }}>
        Hemos atrapado el error que estaba causando que la página colapsara.
        Por favor, copia el texto a continuación y compártelo con el equipo de soporte.
      </Typography>
      
      <Box sx={{ width: '100%', maxWidth: 800, p: 3, bgcolor: '#fff0f0', borderRadius: 2, border: '1px solid red', overflowX: 'auto' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'darkred' }}>
          MENSAJE DEL ERROR:
        </Typography>
        <Typography component="pre" variant="caption" sx={{ whiteSpace: 'pre-wrap', color: 'darkred', fontFamily: 'monospace' }}>
          {error.message || String(error)}
        </Typography>
        
        {error.digest && (
          <Typography variant="caption" sx={{ display: 'block', mt: 2, color: 'darkred', fontWeight: 700 }}>
            Digest ID: {error.digest}
          </Typography>
        )}

        <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 3, mb: 1, color: 'darkred' }}>
          STACK TRACE (Si está disponible en el cliente):
        </Typography>
        <Typography component="pre" variant="caption" sx={{ whiteSpace: 'pre-wrap', color: 'darkred', fontFamily: 'monospace' }}>
          {error.stack || 'No stack trace available'}
        </Typography>
      </Box>

      <Button variant="contained" onClick={() => reset()} sx={{ mt: 2 }}>
        Intentar recargar la vista
      </Button>
    </Box>
  )
}
