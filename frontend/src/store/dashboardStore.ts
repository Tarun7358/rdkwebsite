import { create } from 'zustand';
import type { DashboardTab } from '../types';

interface DashboardStore {
  activeTab: DashboardTab;
  activeTicketId: string | null;
  sidebarOpen: boolean;
  authModalOpen: boolean;
  paymentModalOpen: boolean;
  paymentInvoiceId: string | null;

  setActiveTab: (tab: DashboardTab) => void;
  setActiveTicketId: (id: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
  setAuthModalOpen: (open: boolean) => void;
  openPaymentModal: (invoiceId: string) => void;
  closePaymentModal: () => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  activeTab: 'overview',
  activeTicketId: null,
  sidebarOpen: true,
  authModalOpen: false,
  paymentModalOpen: false,
  paymentInvoiceId: null,

  setActiveTab: (activeTab) => set({ activeTab }),
  setActiveTicketId: (activeTicketId) => set({ activeTicketId }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setAuthModalOpen: (authModalOpen) => set({ authModalOpen }),
  openPaymentModal: (paymentInvoiceId) =>
    set({ paymentModalOpen: true, paymentInvoiceId }),
  closePaymentModal: () =>
    set({ paymentModalOpen: false, paymentInvoiceId: null }),
}));
