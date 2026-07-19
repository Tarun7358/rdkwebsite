import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const { user, isLoading, isAuthenticated, logout, initialize } = useAuthStore();

  useEffect(() => {
    const cleanup = initialize();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { user, isLoading, isAuthenticated, logout };
}
