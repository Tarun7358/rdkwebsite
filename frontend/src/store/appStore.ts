import { create } from 'zustand';
import type { AppState, Toast, ToastType } from '../types';

interface AppStore extends Partial<AppState> {
  isStateLoading: boolean;
  toasts: Toast[];
  notifDropdownOpen: boolean;

  setState: (state: Partial<AppState>) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setStateLoading: (loading: boolean) => void;

  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;

  setNotifDropdown: (open: boolean) => void;
}

let toastCounter = 0;

export const useAppStore = create<AppStore>((set, get) => ({
  isStateLoading: true,
  toasts: [],
  notifDropdownOpen: false,
  theme: 'light',
  projects: [],
  tickets: [],
  invoices: [],
  meetings: [],
  chatMessages: [],
  applications: [],
  freelancerProfiles: {},
  services: [],
  portfolio: [],
  careers: [],

  setState: (state) => {
    set((prev) => ({ ...prev, ...state, isStateLoading: false }));
    // Apply theme to DOM
    if (state.theme) {
      const isDark = state.theme === 'dark';
      document.body.classList.toggle('dark', isDark);
    }
  },

  setTheme: (theme) => {
    set({ theme });
    document.body.classList.toggle('dark', theme === 'dark');
  },

  setStateLoading: (isStateLoading) => set({ isStateLoading }),

  addToast: (message, type = 'info') => {
    const id = `toast-${++toastCounter}`;
    set((prev) => ({ toasts: [...prev.toasts, { id, message, type }] }));
    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },

  removeToast: (id) =>
    set((prev) => ({ toasts: prev.toasts.filter((t) => t.id !== id) })),

  setNotifDropdown: (notifDropdownOpen) => set({ notifDropdownOpen }),
}));
