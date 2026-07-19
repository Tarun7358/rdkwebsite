import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { getOrCreateProfile } from '../api/auth';
import type { UserProfile } from '../types';

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
  initialize: () => () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) =>
    set({ user, isAuthenticated: !!user, isLoading: false }),

  setLoading: (isLoading) => set({ isLoading }),

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  initialize: () => {
    // Subscribe to Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const u = session.user;
          const name = u.user_metadata?.full_name ?? u.email?.split('@')[0] ?? 'User';
          const res = await getOrCreateProfile(u.id, u.email!, name);
          if (res.success && res.data) {
            set({ user: res.data, isAuthenticated: true, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        } else {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      }
    );
    // Return cleanup fn
    return () => subscription.unsubscribe();
  },
}));
