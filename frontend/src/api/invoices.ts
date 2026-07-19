import { apiAction } from './client';
import type { ApiResponse } from '../types';

export const invoicesApi = {
  pay: (invoiceId: string): Promise<ApiResponse> =>
    apiAction('pay_invoice', { invoiceId }),

  create: (data: {
    client: string;
    project: string;
    amount: number | string;
    items: string;
  }): Promise<ApiResponse> => apiAction('create_invoice', data),
};
