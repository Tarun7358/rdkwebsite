import { apiAction } from './client';
import type { ApiResponse } from '../types';

export const meetingsApi = {
  schedule: (data: {
    client: string;
    type: string;
    date: string;
    time: string;
  }): Promise<ApiResponse> => apiAction('schedule_meeting', data),
};
