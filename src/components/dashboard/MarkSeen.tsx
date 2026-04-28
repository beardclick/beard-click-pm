'use client'

import { useEffect } from 'react'
import { markActivityAsSeenAction } from '@/app/actions/dashboard'

export function MarkSeen() {
  useEffect(() => {
    markActivityAsSeenAction()
  }, [])

  return null
}
