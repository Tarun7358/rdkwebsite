import { supabase } from '../lib/supabase';
import type { ApiResponse } from '../types';

export const projectsApi = {
  request: async (data: {
    name: string;
    client: string;
    budget: string | number;
    deadline: string;
    desc: string;
  }): Promise<ApiResponse> => {
    const newId = 'PROJ-' + (100 + (Date.now() % 1000));
    const { error } = await supabase.from('projects').insert({
      id: newId,
      name: data.name,
      client: data.client,
      assigned_to: '',
      status: 'Proposed',
      progress: 0,
      description: data.desc,
      milestones: [
        { name: 'Initial Consultation', completed: true },
        { name: 'Requirements Gathering', completed: false },
        { name: 'Development Setup', completed: false },
      ],
      tasks: [],
      deliverables: [],
      budget: data.budget,
      deadline: data.deadline,
    });
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Project request submitted' };
  },

  assign: async (data: {
    projectId: string;
    assignedTo?: string;
    progress?: number;
    status?: string;
  }): Promise<ApiResponse> => {
    const updates: Record<string, unknown> = {};
    if (data.assignedTo !== undefined) updates.assigned_to = data.assignedTo;
    if (data.progress !== undefined) updates.progress = parseInt(String(data.progress));
    if (data.status !== undefined) updates.status = data.status;
    const { error } = await supabase.from('projects').update(updates).eq('id', data.projectId);
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Project updated' };
  },

  addTask: async (projectId: string, taskTitle: string): Promise<ApiResponse> => {
    const { data: proj, error: fetchErr } = await supabase
      .from('projects').select('tasks').eq('id', projectId).single();
    if (fetchErr || !proj) return { success: false, message: 'Project not found' };
    const tasks = [...proj.tasks, { id: proj.tasks.length + 1, title: taskTitle, status: 'To Do' }];
    const progress = Math.round(tasks.filter((t: { status: string }) => t.status === 'Done').length / tasks.length * 100);
    const { error } = await supabase.from('projects').update({ tasks, progress }).eq('id', projectId);
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Task added' };
  },

  updateKanban: async (taskId: number, projectId: string, newStatus: string): Promise<ApiResponse> => {
    const { data: proj, error: fetchErr } = await supabase
      .from('projects').select('tasks, progress').eq('id', projectId).single();
    if (fetchErr || !proj) return { success: false, message: 'Project not found' };
    const tasks = proj.tasks.map((t: { id: number; status: string }) =>
      t.id === taskId ? { ...t, status: newStatus } : t,
    );
    const done = tasks.filter((t: { status: string }) => t.status === 'Done').length;
    const progress = tasks.length ? Math.round((done / tasks.length) * 100) : proj.progress;
    const { error } = await supabase.from('projects').update({ tasks, progress }).eq('id', projectId);
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Kanban updated' };
  },

  submitDeliverable: async (projectId: string, fileName: string, fileSize?: string): Promise<ApiResponse> => {
    const { data: proj, error: fetchErr } = await supabase
      .from('projects').select('deliverables').eq('id', projectId).single();
    if (fetchErr || !proj) return { success: false, message: 'Project not found' };
    const deliverables = [
      ...(proj.deliverables || []),
      { name: fileName, size: fileSize || '1 MB', date: new Date().toISOString().split('T')[0] },
    ];
    const { error } = await supabase.from('projects').update({ deliverables }).eq('id', projectId);
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Deliverable submitted' };
  },
};
