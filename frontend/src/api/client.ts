import { supabase } from '../lib/supabase';
import type {
  ApiResponse,
  AppState,
  FreelancerProfile,
  ServiceItem,
  PortfolioItem,
  CareerItem,
} from '../types';

// ─────────────────────────────────────────────
// Generic helper — wraps any supabase mutation and returns ApiResponse
// ─────────────────────────────────────────────
export async function apiAction<T = null>(
  _action: string,
  fn: () => Promise<{ data: T | null; error: { message: string } | null }>,
): Promise<ApiResponse<T>> {
  try {
    const { data, error } = await fn();
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'OK', data: data ?? undefined };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, message: msg };
  }
}

// ─────────────────────────────────────────────
// fetchAppState — replaces GET /api/state
// Reads all tables in parallel directly from Supabase
// ─────────────────────────────────────────────
export async function fetchAppState(): Promise<AppState> {
  const [
    { data: projects },
    { data: tickets },
    { data: invoices },
    { data: meetings },
    { data: chatMsgs },
    { data: applications },
    { data: fpRows },
    { data: svcCfg },
    { data: portCfg },
    { data: carCfg },
    { data: themeCfg },
  ] = await Promise.all([
    supabase.from('projects').select('*').order('created_at'),
    supabase.from('tickets').select('*').order('created_at'),
    supabase.from('invoices').select('*').order('id'),
    supabase.from('meetings').select('*').order('id'),
    supabase.from('chat_messages').select('*').order('created_at'),
    supabase.from('applications').select('*').order('id'),
    supabase.from('freelancer_profiles').select('*'),
    supabase.from('cms_config').select('value').eq('key', 'services').maybeSingle(),
    supabase.from('cms_config').select('value').eq('key', 'portfolio').maybeSingle(),
    supabase.from('cms_config').select('value').eq('key', 'careers').maybeSingle(),
    supabase.from('app_config').select('value').eq('key', 'theme').maybeSingle(),
  ]);

  const mappedProjects = (projects || []).map((p) => ({
    id: p.id, name: p.name, client: p.client,
    assignedTo: p.assigned_to, status: p.status, progress: p.progress,
    desc: p.description, milestones: p.milestones || [],
    tasks: p.tasks || [], deliverables: p.deliverables || [],
    budget: p.budget, deadline: p.deadline,
  }));

  const mappedTickets = (tickets || []).map((t) => ({
    id: t.id, client: t.client, category: t.category,
    priority: t.priority, status: t.status,
    assignedTo: t.assigned_to, title: t.title,
    description: t.description, messages: t.messages || [],
  }));

  const mappedInvoices = (invoices || []).map((i) => ({
    id: i.id, client: i.client, project: i.project,
    amount: i.amount, status: i.status,
    items: i.items || [], date: i.date,
  }));

  const mappedMeetings = (meetings || []).map((m) => ({
    id: m.id, client: m.client, type: m.type,
    date: m.date, time: m.time,
    duration: m.duration, status: m.status,
  }));

  const mappedChat = (chatMsgs || []).map((m) => ({
    sender: m.sender, senderName: m.sender_name, text: m.text, time: m.time,
  }));

  const freelancerProfiles: Record<string, FreelancerProfile> = {};
  (fpRows || []).forEach((p) => { freelancerProfiles[p.email] = p as FreelancerProfile; });

  return {
    theme: (themeCfg?.value as 'light' | 'dark') || 'light',
    projects: mappedProjects,
    tickets: mappedTickets,
    invoices: mappedInvoices,
    meetings: mappedMeetings,
    chatMessages: mappedChat,
    applications: applications || [],
    freelancerProfiles,
    services: (svcCfg?.value as ServiceItem[]) || [],
    portfolio: (portCfg?.value as PortfolioItem[]) || [],
    careers: (carCfg?.value as CareerItem[]) || [],
  };
}

// Legacy re-export kept so any component using apiGet still compiles
export async function apiGet<T>(table: string): Promise<T> {
  const { data, error } = await supabase.from(table).select('*');
  if (error) throw new Error(error.message);
  return data as T;
}
