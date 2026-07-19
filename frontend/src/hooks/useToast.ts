import { useAppStore } from '../store/appStore';
import type { ToastType } from '../types';

export function useToast() {
  const addToast = useAppStore((s) => s.addToast);
  const removeToast = useAppStore((s) => s.removeToast);
  const toasts = useAppStore((s) => s.toasts);

  const toast = (message: string, type: ToastType = 'info') =>
    addToast(message, type);

  return { toasts, toast, removeToast };
}
