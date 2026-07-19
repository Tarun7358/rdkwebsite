import { apiAction } from './client';
import type { ApiResponse } from '../types';

export const chatApi = {
  send: (data: {
    sender: 'in' | 'out';
    senderName: string;
    text: string;
  }): Promise<ApiResponse> => apiAction('send_chat_message', data),
};
