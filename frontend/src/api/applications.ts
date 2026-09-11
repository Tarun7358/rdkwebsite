import { supabase } from '../lib/supabase';
import type { ApiResponse } from '../types';

export const applicationsApi = {
  apply: async (data: {
    name: string;
    email: string;
    position: string;
    resume?: string;
  }): Promise<ApiResponse> => {
    const { error } = await supabase.from('applications').insert({
      name: data.name,
      email: data.email,
      position: data.position,
      status: 'Applied',
      resume: data.resume || 'resume.pdf',
    });
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Application submitted' };
  },

  updateStatus: async (applicationId: number, newStatus: string): Promise<ApiResponse> => {
    const { error } = await supabase
      .from('applications').update({ status: newStatus }).eq('id', applicationId);
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Application updated' };
  },
};

export const freelancerApi = {
  updateProfile: async (data: {
    email: string;
    skills: string;
    availability: string;
    rate: string;
  }): Promise<ApiResponse> => {
    const { data: existing } = await supabase
      .from('freelancer_profiles').select('contracts').eq('email', data.email).maybeSingle();
    const { error } = await supabase.from('freelancer_profiles').upsert({
      email: data.email,
      skills: data.skills,
      availability: data.availability,
      rate: data.rate,
      contracts: existing?.contracts || [],
    });
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Profile updated' };
  },

  addContract: async (data: {
    email: string;
    title: string;
    rate: string;
  }): Promise<ApiResponse> => {
    const { data: fp } = await supabase
      .from('freelancer_profiles').select('contracts').eq('email', data.email).maybeSingle();
    const contracts = [
      ...(fp?.contracts || []),
      { id: 'CON-' + (Date.now() % 10000), title: data.title, rate: data.rate, status: 'Active' },
    ];
    const { error } = await supabase.from('freelancer_profiles').update({ contracts }).eq('email', data.email);
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Contract added' };
  },
};
