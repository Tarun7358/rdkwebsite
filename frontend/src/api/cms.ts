import { supabase } from '../lib/supabase';
import type { ApiResponse, ServiceItem, PortfolioItem, CareerItem } from '../types';

export const cmsApi = {
  updateServices: async (services: ServiceItem[]): Promise<ApiResponse> => {
    const { error } = await supabase.from('cms_config').upsert({ key: 'services', value: services });
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Services updated' };
  },

  updatePortfolio: async (portfolio: PortfolioItem[]): Promise<ApiResponse> => {
    const { error } = await supabase.from('cms_config').upsert({ key: 'portfolio', value: portfolio });
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Portfolio updated' };
  },

  updateCareers: async (careers: CareerItem[]): Promise<ApiResponse> => {
    const { error } = await supabase.from('cms_config').upsert({ key: 'careers', value: careers });
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Careers updated' };
  },

  toggleTheme: async (theme: 'light' | 'dark'): Promise<ApiResponse> => {
    const { error } = await supabase.from('app_config').upsert({ key: 'theme', value: theme });
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Theme saved' };
  },
};
