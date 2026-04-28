'use client'

import { useEffect } from 'react'
import { markTypeAsReadAction } from '@/app/actions/notifications'
import { notifyAppCountsChanged } from '@/lib/client-events'

export function AutoRead({ type }: { type: 'projects' | 'meetings' | 'comments' }) {
  useEffect(() => {
    async function markRead() {
      await markTypeAsReadAction(type);
      notifyAppCountsChanged();
    }

    markRead();
  }, [type]);

  return null;
}

