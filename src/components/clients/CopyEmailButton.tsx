'use client'

import { useState } from 'react'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { Check, Copy } from 'lucide-react'

interface CopyEmailButtonProps {
  email: string
}

export function CopyEmailButton({ email }: CopyEmailButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    if (!email) return

    await navigator.clipboard.writeText(email)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <Tooltip title={copied ? 'Copiado' : 'Copiar email'}>
      <span>
        <IconButton size="small" onClick={handleCopy} disabled={!email}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </IconButton>
      </span>
    </Tooltip>
  )
}
