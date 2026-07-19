import { apiAction } from './client';
import type { ApiResponse } from '../types';

export const projectsApi = {
  request: (data: {
    name: string;
    client: string;
    budget: string | number;
    deadline: string;
    desc: string;
  }): Promise<ApiResponse> => apiAction('request_project', data),

  assign: (data: {
    projectId: string;
    assignedTo?: string;
    progress?: number;
    status?: string;
  }): Promise<ApiResponse> => apiAction('assign_project', data),

  addTask: (projectId: string, taskTitle: string): Promise<ApiResponse> =>
    apiAction('add_project_task', { projectId, taskTitle }),

  updateKanban: (
    taskId: number,
    projectId: string,
    newStatus: string
  ): Promise<ApiResponse> =>
    apiAction('update_kanban', { taskId, projectId, newStatus }),

  submitDeliverable: (
    projectId: string,
    fileName: string,
    fileSize?: string
  ): Promise<ApiResponse> =>
    apiAction('submit_deliverable', { projectId, fileName, fileSize }),
};
