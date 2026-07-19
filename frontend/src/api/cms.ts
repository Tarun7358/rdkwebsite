import { apiAction } from './client';
import type { ApiResponse, ServiceItem, PortfolioItem, CareerItem } from '../types';

export const cmsApi = {
  updateServices: (services: ServiceItem[]): Promise<ApiResponse> =>
    apiAction('update_cms_services', { services }),

  updatePortfolio: (portfolio: PortfolioItem[]): Promise<ApiResponse> =>
    apiAction('update_cms_portfolio', { portfolio }),

  updateCareers: (careers: CareerItem[]): Promise<ApiResponse> =>
    apiAction('update_cms_careers', { careers }),

  toggleTheme: (theme: 'light' | 'dark'): Promise<ApiResponse> =>
    apiAction('toggle_theme', { theme }),
};
