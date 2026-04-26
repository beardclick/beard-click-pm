'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function markTypeAsReadAction(type: 'projects' | 'meetings' | 'comments') {
  const supabase = await createClient()
  
  if (type === 'projects') {
    await supabase.from('projects').update({ is_read: true }).eq('is_read', false)
  } else if (type === 'meetings') {
    await supabase.from('meetings').update({ is_read: true }).eq('is_read', false)
  } else if (type === 'comments') {
    await supabase.from('comments').update({ is_read: true }).eq('is_read', false)
  }

  revalidatePath('/', 'layout')
  return { success: true }
}
