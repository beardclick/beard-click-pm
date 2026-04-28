'use client'

import { useState } from 'react'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { Check, Copy } from 'lucide-react'

interface CopyProjectUrlButtonProps {
  url: string | null
}

export function CopyProjectUrlButton({ url }: CopyProjectUrlButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    if (!url) {
      return
    }

    await navigator.clipboard.writeText(url)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <Tooltip title={copied ? 'Copiado' : 'Copiar URL'}>
      <span>
        <IconButton size="small" onClick={handleCopy} disabled={!url}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </IconButton>
      </span>
    </Tooltip>
  )
}
