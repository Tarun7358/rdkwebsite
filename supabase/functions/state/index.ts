// Supabase Edge Function: state
// Replaces the /api/state endpoint from server.js
// Returns a shaped snapshot of all tables for frontend initial load.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_KEY')!;

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
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

    const mappedProjects = (projects || []).map((p: Record<string, unknown>) => ({
      id: p.id, name: p.name, client: p.client,
      assignedTo: p.assigned_to, status: p.status, progress: p.progress,
      desc: p.description, milestones: p.milestones || [],
      tasks: p.tasks || [], deliverables: p.deliverables || [],
      budget: p.budget, deadline: p.deadline,
    }));

    const mappedTickets = (tickets || []).map((t: Record<string, unknown>) => ({
      id: t.id, client: t.client, category: t.category,
      priority: t.priority, status: t.status,
      assignedTo: t.assigned_to, title: t.title,
      description: t.description, messages: t.messages || [],
    }));

    const mappedInvoices = (invoices || []).map((i: Record<string, unknown>) => ({
      id: i.id, client: i.client, project: i.project,
      amount: i.amount, status: i.status,
      items: i.items || [], date: i.date,
    }));

    const mappedMeetings = (meetings || []).map((m: Record<string, unknown>) => ({
      id: m.id, client: m.client, type: m.type,
      date: m.date, time: m.time,
      duration: m.duration, status: m.status,
    }));

    const mappedChat = (chatMsgs || []).map((m: Record<string, unknown>) => ({
      sender: m.sender, senderName: m.sender_name, text: m.text, time: m.time,
    }));

    const freelancerProfiles: Record<string, unknown> = {};
    (fpRows || []).forEach((p: Record<string, unknown>) => {
      freelancerProfiles[p.email as string] = p;
    });

    const state = {
      theme: (themeCfg as Record<string, unknown> | null)?.value || 'light',
      projects: mappedProjects,
      tickets: mappedTickets,
      invoices: mappedInvoices,
      meetings: mappedMeetings,
      chatMessages: mappedChat,
      applications: applications || [],
      freelancerProfiles,
      services: (svcCfg as Record<string, unknown> | null)?.value || [],
      portfolio: (portCfg as Record<string, unknown> | null)?.value || [],
      careers: (carCfg as Record<string, unknown> | null)?.value || [],
    };

    return new Response(JSON.stringify(state), {
      status: 200,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
