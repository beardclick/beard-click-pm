'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

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
