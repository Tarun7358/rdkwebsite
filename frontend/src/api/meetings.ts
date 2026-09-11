import { supabase } from '../lib/supabase';
import type { ApiResponse } from '../types';

export const meetingsApi = {
  schedule: async (data: {
    client: string;
    type: string;
    date: string;
    time: string;
  }): Promise<ApiResponse> => {
    const { error } = await supabase.from('meetings').insert({
      client: data.client,
      type: data.type || 'Google Meet',
      date: data.date,
      time: data.time,
      duration: '30 min',
      status: 'Scheduled',
    });
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Meeting scheduled' };
  },
};
