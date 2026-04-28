'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { canSendTransactionalEmail, sendPasswordResetEmail } from '@/lib/portal-access-email'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Error de Supabase Auth:', error.message);
      return { error: 'Credenciales incorrectas o error de servidor.' };
    }

    if (!data.user) {
      return { error: 'Error de autenticación: usuario no encontrado.' };
    }

    // Obtenemos el perfil para saber si es admin o cliente
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      console.error('Error al obtener perfil:', profileError.message);
      return { error: 'Tu cuenta no tiene un perfil asignado.' };
    }

    if (profile?.role === 'admin') {
      redirect('/admin')
    } else {
      redirect('/client')
    }
  } catch (error: any) {
    if (error.message === 'NEXT_REDIRECT') {
      throw error;
    }
    console.error('Error inesperado en login:', error);
    return { error: 'Error inesperado. Por favor intenta de nuevo.' };
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function requestPasswordReset(formData: FormData) {
  const email = (formData.get('email') as string)?.trim().toLowerCase()

  if (!email) {
    return { error: 'Ingresa tu correo para enviarte el enlace de recuperación.' }
  }

  const headerStore = await headers()
  const origin =
    headerStore.get('origin') ||
    (headerStore.get('host') ? `https://${headerStore.get('host')}` : 'https://portal.beardclick.com')

  if (!canSendTransactionalEmail()) {
    return {
      error: 'Brevo no esta configurado. Define BREVO_API_KEY y PORTAL_EMAIL_FROM para enviar recuperaciones.',
    }
  }

  const adminSupabase = createAdminClient()
  const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: {
      redirectTo: `${origin}/reset-password`,
    },
  })

  if (linkError || !linkData.properties?.action_link) {
    console.error('Error generating password reset link:', linkError)
    return { error: 'No se pudo generar el enlace de recuperación.' }
  }

  const emailResult = await sendPasswordResetEmail({
    to: email,
    resetLink: linkData.properties.action_link,
    portalUrl: origin,
  })

  if (!emailResult.success) {
    console.error('Error sending password reset email via Brevo:', emailResult.error)
    return { error: 'No se pudo enviar el correo de recuperación.' }
  }

  return {
    success: true,
    message: 'Te enviamos un correo con el enlace para restablecer tu contraseña.',
  }
}
