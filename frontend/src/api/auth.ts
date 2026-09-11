import { supabase } from '../lib/supabase';
import type { ApiResponse, UserProfile } from '../types';

export async function getOrCreateProfile(
  userId: string,
  email: string,
  name: string,
): Promise<ApiResponse<UserProfile>> {
  try {
    // Try to fetch existing profile
    let { data: profile } = await supabase
      .from('profiles').select('*').eq('id', userId).maybeSingle();

    if (!profile) {
      // Create new profile
      const { data: created, error } = await supabase
        .from('profiles')
        .insert({ id: userId, email, name, role: 'client', details: 'Client Partner' })
        .select()
        .single();
      if (error) return { success: false, message: error.message };
      profile = created;
    }

    return {
      success: true,
      message: 'Profile ready',
      data: {
        email: profile.email,
        name: profile.name,
        role: profile.role,
        details: profile.details,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, message: msg };
  }
}

export async function setUserRole(
  email: string,
  role: string,
  details?: string,
): Promise<ApiResponse> {
  const { error } = await supabase
    .from('profiles')
    .update({ role, details: details ?? '' })
    .eq('email', email);
  if (error) return { success: false, message: error.message };
  return { success: true, message: 'Role updated' };
}

export const authApi = {
  signInWithGoogle: () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
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
    callback: Parameters<typeof supabase.auth.onAuthStateChange>[0],
  ) => supabase.auth.onAuthStateChange(callback),
};
