'use server';

import { auth } from '@/lib/auth/server';
import { redirect } from 'next/navigation';

export async function signInWithEmail(
  _prevState: { error: string } | null,
  formData: FormData
) {
  const { error } = await auth.signIn.email({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  });

  if (error) {
    return { error: error.message || 'Failed to sign in. Try again' };
  }

  redirect('/');
}

export async function signOutAction() {
    const { error } = await auth.signOut();
  
    if (error) {
      return { error: error.message || 'Failed to sign out. Try again' };
    }
  
    redirect('/auth/sign-in');
}


export async function signUpWithEmail(
    _prevState: { error: string } | null,
    formData: FormData
  ) {
    const email = formData.get('email') as string;
  
    if (!email) {
      return { error: "Email address must be provided." }
    }
  
    // Optionally restrict sign ups based on email address
    // if (!email.trim().endsWith("@my-company.com")) {
    //  return { error: 'Email must be from my-company.com' };
    // }
  
    const { error } = await auth.signUp.email({
      email,
      name: formData.get('name') as string,
      password: formData.get('password') as string,
    });
  
    if (error) {
      return { error: error.message || 'Failed to create account' };
    }
  
    redirect('/');
  }