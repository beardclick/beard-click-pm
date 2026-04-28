'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const AVATAR_BUCKET = 'avatars'

export async function getCurrentProfile() {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return null
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return null
  }

  return {
    ...profile,
    auth_email: user.email ?? profile.email,
  }
}

export async function updateCurrentProfileAction(formData: FormData) {
  const supabase = await createClient()
  const adminSupabase = createAdminClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'No se pudo identificar la sesión actual.' }
  }

  const { data: currentProfile, error: profileError } = await supabase
    .from('profiles')
    .select('role, avatar_url')
    .eq('id', user.id)
    .single()

  if (profileError || !currentProfile?.role) {
    return { error: 'No se pudo cargar el perfil actual.' }
  }

  const fullName = (formData.get('full_name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const phoneValue = (formData.get('phone') as string)?.trim()
  const password = (formData.get('password') as string) ?? ''
  const confirmPassword = (formData.get('confirm_password') as string) ?? ''
  const avatarFile = formData.get('avatar')

  let avatarUrl = currentProfile?.avatar_url || null

  if (!fullName || !email) {
    return { error: 'El nombre y el correo son obligatorios.' }
  }

  if (password && password.length < 6) {
    return { error: 'La nueva contraseña debe tener al menos 6 caracteres.' }
  }

  if (password !== confirmPassword) {
    return { error: 'La confirmación de contraseña no coincide.' }
  }

  if (avatarFile instanceof File && avatarFile.size > 0) {
    if (!avatarFile.type.startsWith('image/')) {
      return { error: 'El avatar debe ser una imagen válida.' }
    }

    if (avatarFile.size > 5 * 1024 * 1024) {
      return { error: 'El avatar no puede pesar más de 5 MB.' }
    }

    const bucketResult = await adminSupabase.storage.createBucket(AVATAR_BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    })

    if (bucketResult.error && !bucketResult.error.message.toLowerCase().includes('already exists')) {
      console.error('Error ensuring avatar bucket:', bucketResult.error)
      return { error: 'No se pudo preparar el almacenamiento del avatar.' }
    }

    const fileExt = avatarFile.name.includes('.') ? avatarFile.name.split('.').pop() : 'jpg'
    const filePath = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${fileExt}`
    const fileBuffer = Buffer.from(await avatarFile.arrayBuffer())

    const { error: uploadError } = await adminSupabase.storage
      .from(AVATAR_BUCKET)
      .upload(filePath, fileBuffer, {
        contentType: avatarFile.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError)
      return { error: 'No se pudo subir la imagen del avatar.' }
    }

    const { data: publicUrlData } = adminSupabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath)
    avatarUrl = publicUrlData.publicUrl
  }

  const authPayload: {
    email?: string
    password?: string
    user_metadata?: { full_name: string }
    email_confirm?: boolean
  } = {
    user_metadata: { full_name: fullName },
  }

  if (email !== user.email) {
    authPayload.email = email
    authPayload.email_confirm = true
  }

  if (password) {
    authPayload.password = password
  }

  if (authPayload.email || authPayload.password || authPayload.user_metadata) {
    const { error: authUpdateError } = await adminSupabase.auth.admin.updateUserById(user.id, authPayload)

    if (authUpdateError) {
      console.error('Error updating auth user:', authUpdateError)
      return { error: authUpdateError.message || 'No se pudo actualizar el usuario de acceso.' }
    }
  }

  const { error: updateProfileError } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      email,
      phone: phoneValue || null,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (updateProfileError) {
    console.error('Error updating profile:', updateProfileError)
    return { error: 'No se pudo actualizar el perfil del administrador.' }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/profile')
  revalidatePath('/client')
  revalidatePath('/client/profile')

  return {
    success: true,
    message: email !== user.email ? 'Perfil y correo actualizados correctamente.' : 'Perfil actualizado correctamente.',
  }
}
