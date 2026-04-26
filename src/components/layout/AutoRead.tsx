'use client'

import { useEffect } from 'react'
import { markTypeAsReadAction } from '@/app/actions/notifications'

export function AutoRead({ type }: { type: 'projects' | 'meetings' | 'comments' }) {
  useEffect(() => {
    markTypeAsReadAction(type);
  }, [type]);

  return null;
}
