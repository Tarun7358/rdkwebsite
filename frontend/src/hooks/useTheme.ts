import { useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import { cmsApi } from '../api/cms';

export function useTheme() {
  const theme = useAppStore((s) => s.theme) ?? 'light';
  const setTheme = useAppStore((s) => s.setTheme);

  const toggle = useCallback(async () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    await cmsApi.toggleTheme(next);
  }, [theme, setTheme]);

  return { theme, toggle, isDark: theme === 'dark' };
}
