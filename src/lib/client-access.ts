import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function getCurrentClientRecord() {
  const supabase = await createClient()
  const adminSupabase = createAdminClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) {
    return null
  }

  const { data: profile, error: profileError } = await adminSupabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError || profile?.role !== 'client') {
    return null
  }

  const normalizedEmail = user.email.trim().toLowerCase()

  const { data: client, error } = await adminSupabase
    .from('clients')
    .select('*')
    .ilike('email', normalizedEmail)
    .limit(1)
    .maybeSingle()

  if (error || !client) {
    return null
  }

  if (client.profile_id !== user.id) {
    const { data: syncedClient, error: syncError } = await adminSupabase
      .from('clients')
      .update({
        profile_id: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', client.id)
      .select('*')
      .maybeSingle()

    if (syncError) {
      console.error('Error syncing client profile link:', syncError)
      return client
    }

    if (syncedClient) {
      return syncedClient
    }
  }

  return client
}

export async function getClientAccessMap(emails: string[]) {
  const adminSupabase = createAdminClient()
  const normalizedEmails = Array.from(
    new Set(
      emails
        .map((email) => email?.trim().toLowerCase())
        .filter(Boolean)
    )
  )

  if (normalizedEmails.length === 0) {
    return new Map<string, boolean>()
  }

  const { data: profiles, error } = await adminSupabase
    .from('profiles')
    .select('email, role')
    .in('email', normalizedEmails)

  if (error || !profiles) {
    return new Map<string, boolean>()
  }

  return new Map(
    profiles.map((profile) => [String(profile.email).trim().toLowerCase(), profile.role === 'client'])
  )
}
