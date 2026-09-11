// Supabase Edge Function: action
// Replaces the entire /api/action endpoint from server.js
// Deployed at: https://xrstcgfhukzeqnjaecfx.supabase.co/functions/v1/action

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_KEY')!;

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ─────────────────────────────────────────────
// AI Requirement Scoping Bot
// ─────────────────────────────────────────────
async function generateAiRequirementReply(
  supabase: ReturnType<typeof createClient>,
  userText: string,
  userName: string,
): Promise<string> {
  const lower = (userText || '').toLowerCase();

  let extractedBudget: string | null = null;
  const budgetMatch = userText.match(/\$?\s?(\d+[\d,]*\s*k|\d+[\d,]*)/i);
  if (budgetMatch) {
    let numStr = budgetMatch[1].toLowerCase().replace(',', '');
    if (numStr.endsWith('k')) numStr = (parseFloat(numStr) * 1000).toString();
    const val = parseInt(numStr);
    if (!isNaN(val) && val > 50) extractedBudget = `$${val.toLocaleString()}`;
  }

  let category: string | null = null;
  if (/mobile|app|ios|android|flutter|react native/i.test(lower)) category = 'Mobile Application (iOS / Android)';
  else if (/e-?commerce|store|shop|stripe|cart|checkout/i.test(lower)) category = 'E-Commerce Platform';
  else if (/ai|bot|automation|chatgpt|openai|llm|discord|security/i.test(lower)) category = 'AI & Automation System';
  else if (/website|web|landing|frontend|react|next/i.test(lower)) category = 'Web Platform / Web Application';
  else if (/saas|crm|dashboard|enterprise|system|portal/i.test(lower)) category = 'Enterprise SaaS Workspace';

  const isRequirementQuery =
    category ||
    lower.length > 20 ||
    /build|create|need|want|develop|requirement|spec|feature|budget|cost|estimate|quote|project/i.test(lower);

  if (!isRequirementQuery) {
    return `Hello ${userName || 'there'}! 👋 I am the **RDK AI Project Architect**.\n\nI can instantly analyze your project requirements, estimate cost & timeline, and register your project with our engineering team.\n\nTo get started, tell me:\n1️⃣ **What kind of project do you want to build?**\n2️⃣ **What are the main features required?**\n3️⃣ **What is your budget or target deadline?**`;
  }

  const projCategory = category || 'Custom Software Solution';
  const finalBudget = extractedBudget || '$3,500 - $6,000';
  const estimatedTimeline =
    lower.includes('urgent') || lower.includes('fast') ? '2 Weeks (Sprint Mode)' : '3 - 4 Weeks';

  const features: string[] = [];
  if (/auth|login|signup|user|role/i.test(lower)) features.push('Role-Based Auth & User Management');
  if (/payment|stripe|pay|invoice|billing/i.test(lower)) features.push('Stripe Payment & Automated Invoicing');
  if (/chat|realtime|live|stream|message/i.test(lower)) features.push('Real-time Messaging & Database Sync');
  if (/dashboard|admin|analytics|panel|stats/i.test(lower)) features.push('Executive Control Dashboard & Analytics');
  if (/mobile|responsive|design|ui/i.test(lower)) features.push('Modern Glassmorphic Responsive UI/UX');
  if (features.length === 0) {
    features.push(
      'User Authentication & Security',
      'Interactive Control Dashboard',
      'Real-time Supabase Database Integration',
      'REST & Event Stream API Services',
    );
  }

  const botReply = `🤖 **RDK Requirement Analysis & Project Scope**\n━━━━━━━━━━━━━━━━━━━━━━━\n📌 **Project Type**: ${projCategory}\n🛠️ **Tech Architecture**: React.js + Supabase Real-Time DB\n⚡ **Core Requirements & Features**:\n${features.map((f) => `  • ${f}`).join('\n')}\n\n⏱️ **Recommended Timeline**: ${estimatedTimeline}\n💰 **Estimated Investment**: ${finalBudget}\n\n✅ **Requirement Registered!**\nI have automatically submitted this project scope under your profile (${userName || 'Client'}). You can track real-time sprint milestones and deliverables directly in the **Projects** tab.`;

  // Auto-register project in DB
  const projId = 'PROJ-' + Math.floor(1000 + Math.random() * 9000);
  const clientIdentifier =
    userName && userName !== 'Visitor Client' && userName !== 'Client Partner' ? userName : 'client@rdk.com';
  try {
    await supabase.from('projects').insert({
      id: projId,
      name: `${projCategory} (${userName || 'Client'})`,
      client: clientIdentifier,
      assigned_to: 'engineering@rdk.com',
      status: 'Proposed',
      progress: 10,
      description: `[AI Requirement Scoping Intake]\nRaw Input: ${userText}\nFeatures: ${features.join(', ')}`,
      milestones: [
        { name: 'AI Scope Analysis & Intake', completed: true },
        { name: 'Architecture Review & Budget Approval', completed: false },
        { name: 'Sprint 1 Core Build', completed: false },
        { name: 'QA Testing & Production Launch', completed: false },
      ],
      tasks: [{ id: 1, title: 'Scope Verification with Engineering', status: 'To Do' }],
      deliverables: [],
      budget: finalBudget,
      deadline: estimatedTimeline,
    });
  } catch (e: unknown) {
    console.warn('Auto-create project warning:', (e as Error).message);
  }

  return botReply;
}

// ─────────────────────────────────────────────
// Main handler
// ─────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, message: 'Method not allowed' }), {
      status: 405,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  let action: string;
  let data: Record<string, unknown>;

  try {
    const body = await req.json();
    action = body.action;
    data = body.data || {};
  } catch {
    return new Response(JSON.stringify({ success: false, message: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  console.log(`▶ Action: ${action}`);

  let success = true;
  let message = 'OK';
  let responsePayload: unknown = null;

  try {
    switch (action) {
      // ── Auth ──
      case 'get_or_create_profile': {
        const { userId, email, name } = data as { userId: string; email: string; name: string };
        let { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
        if (!profile) {
          const { data: created } = await supabase
            .from('profiles')
            .insert({ id: userId, email, name, role: 'client', details: 'Client Partner' })
            .select()
            .single();
          profile = created;
        }
        responsePayload = { email: profile.email, name: profile.name, role: profile.role, details: profile.details };
        message = 'Profile ready';
        break;
      }

      // ── Projects ──
      case 'request_project': {
        const { name, client, desc, budget, deadline } = data as Record<string, string>;
        const newId = 'PROJ-' + (100 + (Date.now() % 1000));
        await supabase.from('projects').insert({
          id: newId, name, client,
          assigned_to: '', status: 'Proposed', progress: 0,
          description: desc,
          milestones: [
            { name: 'Initial Consultation', completed: true },
            { name: 'Requirements Gathering', completed: false },
            { name: 'Development Setup', completed: false },
          ],
          tasks: [], deliverables: [],
          budget, deadline,
        });
        message = 'Project request submitted';
        break;
      }

      case 'update_kanban': {
        const { taskId, projectId, newStatus } = data as { taskId: string; projectId: string; newStatus: string };
        const { data: proj } = await supabase.from('projects').select('tasks, progress').eq('id', projectId).single();
        if (!proj) { success = false; message = 'Project not found'; break; }
        const tasks = proj.tasks.map((t: Record<string, unknown>) =>
          t.id === taskId ? { ...t, status: newStatus } : t,
        );
        const done = tasks.filter((t: Record<string, unknown>) => t.status === 'Done').length;
        const progress = tasks.length ? Math.round((done / tasks.length) * 100) : proj.progress;
        await supabase.from('projects').update({ tasks, progress }).eq('id', projectId);
        message = 'Kanban updated';
        break;
      }

      case 'add_project_task': {
        const { projectId, taskTitle } = data as { projectId: string; taskTitle: string };
        const { data: proj } = await supabase.from('projects').select('tasks').eq('id', projectId).single();
        if (!proj) { success = false; message = 'Project not found'; break; }
        const tasks = [...proj.tasks, { id: proj.tasks.length + 1, title: taskTitle, status: 'To Do' }];
        const progress = Math.round((tasks.filter((t: Record<string, unknown>) => t.status === 'Done').length / tasks.length) * 100);
        await supabase.from('projects').update({ tasks, progress }).eq('id', projectId);
        message = 'Task added';
        break;
      }

      case 'assign_project': {
        const updates: Record<string, unknown> = {};
        if (data.assignedTo !== undefined) updates.assigned_to = data.assignedTo;
        if (data.progress !== undefined) updates.progress = parseInt(data.progress as string);
        if (data.status !== undefined) updates.status = data.status;
        await supabase.from('projects').update(updates).eq('id', data.projectId);
        message = 'Project updated';
        break;
      }

      // ── Tickets ──
      case 'add_ticket': {
        const { client, clientName, category, priority, title, description } = data as Record<string, string>;
        const ticketId = 'WEB-2026-' + Math.floor(1000 + Math.random() * 9000);
        const firstMsg = {
          sender: 'client',
          senderName: clientName || 'Client',
          text: description,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        await supabase.from('tickets').insert({
          id: ticketId, client, category, priority,
          status: 'Active', assigned_to: 'employee@rdk.com',
          title, description, messages: [firstMsg],
        });
        message = 'Ticket created';
        // Auto-reply after 1.5s via background task (EdgeRuntime.waitUntil)
        const autoReply = async () => {
          await new Promise((r) => setTimeout(r, 1500));
          const { data: t } = await supabase.from('tickets').select('messages,status').eq('id', ticketId).single();
          if (t && t.status === 'Active') {
            const msgs = [
              ...t.messages,
              {
                sender: 'employee',
                senderName: 'Sarah K.',
                text: `Hello! I've received your ticket regarding "${title}". Investigating now — will update you shortly.`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ];
            await supabase.from('tickets').update({ messages: msgs }).eq('id', ticketId);
          }
        };
        // Fire-and-forget (Edge Functions support this via waitUntil if available, else best-effort)
        autoReply().catch(console.warn);
        break;
      }

      case 'send_ticket_message': {
        const { ticketId, sender, senderName, text } = data as Record<string, string>;
        const { data: t } = await supabase.from('tickets').select('messages,status').eq('id', ticketId).single();
        if (!t) { success = false; message = 'Ticket not found'; break; }
        const msgs = [
          ...t.messages,
          { sender, senderName, text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        ];
        await supabase.from('tickets').update({ messages: msgs }).eq('id', ticketId);
        message = 'Message sent';
        break;
      }

      case 'assign_ticket': {
        await supabase.from('tickets')
          .update({ assigned_to: data.assignedTo, status: data.status || 'Active' })
          .eq('id', data.ticketId);
        message = 'Ticket assigned';
        break;
      }

      case 'close_ticket': {
        await supabase.from('tickets').update({ status: 'Resolved' }).eq('id', data.ticketId);
        message = 'Ticket closed';
        break;
      }

      // ── Chat ──
      case 'send_chat_message': {
        const { sender, senderName, text } = data as Record<string, string>;
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        await supabase.from('chat_messages').insert({ sender, sender_name: senderName, text, time });
        // AI bot reply (fire-and-forget)
        const botReplyTask = async () => {
          await new Promise((r) => setTimeout(r, 1000));
          const botReplyText = await generateAiRequirementReply(supabase, text, senderName);
          const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const botSender = sender === 'in' ? 'out' : 'in';
          await supabase.from('chat_messages').insert({
            sender: botSender,
            sender_name: 'RDK AI Assistant',
            text: botReplyText,
            time: replyTime,
          });
        };
        botReplyTask().catch(console.warn);
        message = 'Message sent';
        break;
      }

      // ── Invoices ──
      case 'pay_invoice': {
        await supabase.from('invoices').update({ status: 'Paid' }).eq('id', data.invoiceId);
        message = 'Invoice paid';
        break;
      }

      case 'create_invoice': {
        const invId = 'INV-2026-' + Math.floor(100 + Math.random() * 900);
        await supabase.from('invoices').insert({
          id: invId,
          client: data.client,
          project: data.project,
          amount: parseFloat(data.amount as string),
          status: 'Unpaid',
          items: (data.items as string).split(',').map((s: string) => s.trim()),
          date: new Date().toISOString().split('T')[0],
        });
        message = 'Invoice created';
        break;
      }

      // ── Meetings ──
      case 'schedule_meeting': {
        await supabase.from('meetings').insert({
          client: data.client,
          type: data.type || 'Google Meet',
          date: data.date,
          time: data.time,
          duration: '30 min',
          status: 'Scheduled',
        });
        message = 'Meeting scheduled';
        break;
      }

      // ── Applications ──
      case 'apply_job': {
        await supabase.from('applications').insert({
          name: data.name,
          email: data.email,
          position: data.position,
          status: 'Applied',
          resume: data.resume || 'resume.pdf',
        });
        message = 'Application submitted';
        break;
      }

      case 'update_application_status': {
        await supabase.from('applications').update({ status: data.newStatus }).eq('id', data.applicationId);
        message = 'Application updated';
        break;
      }

      // ── CMS ──
      case 'update_cms_services':
        await supabase.from('cms_config').upsert({ key: 'services', value: data.services });
        message = 'Services updated';
        break;

      case 'update_cms_portfolio':
        await supabase.from('cms_config').upsert({ key: 'portfolio', value: data.portfolio });
        message = 'Portfolio updated';
        break;

      case 'update_cms_careers':
        await supabase.from('cms_config').upsert({ key: 'careers', value: data.careers });
        message = 'Careers updated';
        break;

      // ── Freelancer ──
      case 'update_freelancer_profile': {
        const { email, skills, availability, rate } = data as Record<string, unknown>;
        const { data: existing } = await supabase.from('freelancer_profiles').select('contracts').eq('email', email).maybeSingle();
        await supabase.from('freelancer_profiles').upsert({ email, skills, availability, rate, contracts: existing?.contracts || [] });
        message = 'Profile updated';
        break;
      }

      case 'add_freelancer_contract': {
        const { email, title, rate } = data as Record<string, unknown>;
        const { data: fp } = await supabase.from('freelancer_profiles').select('contracts').eq('email', email).maybeSingle();
        const contracts = [
          ...(fp?.contracts || []),
          { id: 'CON-' + (Date.now() % 10000), title, rate, status: 'Active' },
        ];
        await supabase.from('freelancer_profiles').update({ contracts }).eq('email', email);
        message = 'Contract added';
        break;
      }

      case 'submit_deliverable': {
        const { projectId, fileName, fileSize } = data as Record<string, string>;
        const { data: proj } = await supabase.from('projects').select('deliverables').eq('id', projectId).single();
        if (!proj) { success = false; message = 'Project not found'; break; }
        const deliverables = [
          ...(proj.deliverables || []),
          { name: fileName, size: fileSize || '1 MB', date: new Date().toISOString().split('T')[0] },
        ];
        await supabase.from('projects').update({ deliverables }).eq('id', projectId);
        message = 'Deliverable submitted';
        break;
      }

      // ── Theme ──
      case 'toggle_theme':
        await supabase.from('app_config').upsert({ key: 'theme', value: data.theme });
        message = 'Theme saved';
        break;

      // ── Role Management ──
      case 'set_user_role':
        await supabase.from('profiles').update({ role: data.role, details: data.details || '' }).eq('email', data.email);
        message = 'Role updated';
        break;

      default:
        success = false;
        message = `Unknown action: ${action}`;
    }
  } catch (err: unknown) {
    console.error('Action error:', (err as Error).message);
    return new Response(JSON.stringify({ success: false, message: (err as Error).message }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success, message, data: responsePayload }), {
    status: success ? 200 : 400,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
});
