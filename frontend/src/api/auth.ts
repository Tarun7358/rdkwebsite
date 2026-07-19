import { apiAction } from './client';
import { supabase } from '../lib/supabase';
import type { ApiResponse, UserProfile } from '../types';

export async function getOrCreateProfile(
  userId: string,
  email: string,
  name: string
): Promise<ApiResponse<UserProfile>> {
  return apiAction<UserProfile>('get_or_create_profile', { userId, email, name });
}

export async function setUserRole(
  email: string,
  role: string,
  details?: string
): Promise<ApiResponse> {
  return apiAction('set_user_role', { email, role, details: details ?? '' });
}

export const authApi = {
  signInWithGoogle: () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/' },
    }),

  signInWithPassword: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),

  signUp: (email: string, password: string, fullName?: string) =>
    supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    }),

  signOut: () => supabase.auth.signOut(),

  getSession: () => supabase.auth.getSession(),

  onAuthStateChange: (
    callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]
  ) => supabase.auth.onAuthStateChange(callback),
};
