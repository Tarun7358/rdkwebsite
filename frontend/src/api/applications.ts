import { apiAction } from './client';
import type { ApiResponse } from '../types';

export const applicationsApi = {
  apply: (data: {
    name: string;
    email: string;
    position: string;
    resume?: string;
  }): Promise<ApiResponse> => apiAction('apply_job', data),

  updateStatus: (applicationId: number, newStatus: string): Promise<ApiResponse> =>
    apiAction('update_application_status', { applicationId, newStatus }),
};

export const freelancerApi = {
  updateProfile: (data: {
    email: string;
    skills: string;
    availability: string;
    rate: string;
  }): Promise<ApiResponse> => apiAction('update_freelancer_profile', data),

  addContract: (data: {
    email: string;
    title: string;
    rate: string;
  }): Promise<ApiResponse> => apiAction('add_freelancer_contract', data),
};
