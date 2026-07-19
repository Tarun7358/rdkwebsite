import { apiAction } from './client';
import type { ApiResponse } from '../types';

export const ticketsApi = {
  create: (data: {
    client: string;
    clientName: string;
    title: string;
    priority: string;
    category: string;
    description: string;
  }): Promise<ApiResponse> => apiAction('add_ticket', data),

  sendMessage: (data: {
    ticketId: string;
    sender: 'client' | 'employee';
    senderName: string;
    text: string;
  }): Promise<ApiResponse> => apiAction('send_ticket_message', data),

  assign: (ticketId: string, assignedTo: string, status?: string): Promise<ApiResponse> =>
    apiAction('assign_ticket', { ticketId, assignedTo, status }),

  close: (ticketId: string): Promise<ApiResponse> =>
    apiAction('close_ticket', { ticketId }),
};
