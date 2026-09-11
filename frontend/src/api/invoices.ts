import { supabase } from '../lib/supabase';
import type { ApiResponse } from '../types';

export const invoicesApi = {
  pay: async (invoiceId: string): Promise<ApiResponse> => {
    const { error } = await supabase.from('invoices').update({ status: 'Paid' }).eq('id', invoiceId);
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Invoice paid' };
  },

  create: async (data: {
    client: string;
    project: string;
    amount: number | string;
    items: string;
  }): Promise<ApiResponse> => {
    const invId = 'INV-2026-' + Math.floor(100 + Math.random() * 900);
    const { error } = await supabase.from('invoices').insert({
      id: invId,
      client: data.client,
      project: data.project,
      amount: parseFloat(String(data.amount)),
      status: 'Unpaid',
      items: data.items.split(',').map((s) => s.trim()),
      date: new Date().toISOString().split('T')[0],
    });
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Invoice created' };
  },
};
