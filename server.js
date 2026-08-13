require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const PORT = parseInt(process.env.PORT || '8000');
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const HTML_FILE = path.join(__dirname, 'devforge_software_company_website.html');

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─────────────────────────────────────────────
// SSE BROADCAST
// ─────────────────────────────────────────────
let sseClients = [];
function addSseClient(res) {
  sseClients.push(res);
  console.log(`SSE connected. Total: ${sseClients.length}`);
}
function removeSseClient(res) {
  sseClients = sseClients.filter(c => c !== res);
}
async function broadcastUpdate() {
  try {
    const state = await getFullState();
    const payload = JSON.stringify({ type: 'UPDATE_STATE', state });
    sseClients.forEach(res => res.write(`data: ${payload}\n\n`));
  } catch (e) { console.error('broadcast error', e.message); }
}

// ─────────────────────────────────────────────
// STATE BUILDER — reads all tables from Supabase
// ─────────────────────────────────────────────
async function getFullState() {
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

  // Map DB rows → frontend shape
  const mappedProjects = (projects || []).map(p => ({
    id: p.id, name: p.name, client: p.client,
    assignedTo: p.assigned_to, status: p.status, progress: p.progress,
    desc: p.description, milestones: p.milestones || [],
    tasks: p.tasks || [], deliverables: p.deliverables || [],
    budget: p.budget, deadline: p.deadline,
  }));

  const mappedTickets = (tickets || []).map(t => ({
    id: t.id, client: t.client, category: t.category,
    priority: t.priority, status: t.status,
    assignedTo: t.assigned_to, title: t.title,
    description: t.description, messages: t.messages || [],
  }));

  const mappedInvoices = (invoices || []).map(i => ({
    id: i.id, client: i.client, project: i.project,
    amount: i.amount, status: i.status,
    items: i.items || [], date: i.date,
  }));

  const mappedMeetings = (meetings || []).map(m => ({
    id: m.id, client: m.client, type: m.type,
    date: m.date, time: m.time,
    duration: m.duration, status: m.status,
  }));

  const mappedChat = (chatMsgs || []).map(m => ({
    sender: m.sender, senderName: m.sender_name, text: m.text, time: m.time,
  }));

  const freelancerProfiles = {};
  (fpRows || []).forEach(p => { freelancerProfiles[p.email] = p; });

  return {
    theme: themeCfg?.value || 'light',
    projects: mappedProjects,
    tickets: mappedTickets,
    invoices: mappedInvoices,
    meetings: mappedMeetings,
    chatMessages: mappedChat,
    applications: applications || [],
    freelancerProfiles,
    services: svcCfg?.value || [],
    portfolio: portCfg?.value || [],
    careers: carCfg?.value || [],
  };
}

// ─────────────────────────────────────────────
// HTTP SERVER
// ─────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // SSE
  if (req.url === '/api/events') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive', ...cors });
    res.write(`data: ${JSON.stringify({ type: 'CONNECTED' })}\n\n`);
    addSseClient(res);
    req.on('close', () => removeSseClient(res));
    return;
  }

  // Static files (except HTML which is templated)
  if (req.method === 'GET' && !req.url.startsWith('/api/')) {
    let urlPath = req.url.split('?')[0];
    if (urlPath === '/') {
      // Serve HTML as template — inject Supabase public config
      try {
        let html = fs.readFileSync(HTML_FILE, 'utf8');
        html = html.replace('{{SUPABASE_URL}}', SUPABASE_URL);
        html = html.replace('{{SUPABASE_ANON_KEY}}', SUPABASE_ANON_KEY);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
      } catch (e) {
        res.writeHead(500); res.end('Could not read HTML file');
      }
      return;
    }
    const filePath = path.join(__dirname, urlPath);
    if (!filePath.startsWith(__dirname)) { res.writeHead(403); res.end('Forbidden'); return; }
    fs.readFile(filePath, (err, data) => {
      if (err) { res.writeHead(404); res.end('Not Found'); return; }
      const ext = path.extname(filePath);
      const types = { '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
      res.writeHead(200, { 'Content-Type': types[ext] || 'text/html' });
      res.end(data);
    });
    return;
  }

  // GET /api/state
  if (req.method === 'GET' && req.url === '/api/state') {
    try {
      const state = await getFullState();
      res.writeHead(200, { 'Content-Type': 'application/json', ...cors });
      res.end(JSON.stringify(state));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // POST /api/action
  if (req.method === 'POST' && req.url === '/api/action') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const { action, data } = JSON.parse(body);
        console.log(`▶ Action: ${action}`);
        let success = true, message = 'OK', responsePayload = null;

        switch (action) {

          // ── Auth: get or create profile after Google login ──
          case 'get_or_create_profile': {
            const { userId, email, name } = data;
            let { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
            if (!profile) {
              const { data: created } = await supabase.from('profiles').insert({
                id: userId, email, name, role: 'client', details: 'Client Partner'
              }).select().single();
              profile = created;
            }
            responsePayload = { email: profile.email, name: profile.name, role: profile.role, details: profile.details };
            message = 'Profile ready';
            break;
          }

          // ── Projects ──
          case 'request_project': {
            const newId = 'PROJ-' + (100 + Date.now() % 1000);
            await supabase.from('projects').insert({
              id: newId, name: data.name, client: data.client,
              assigned_to: '', status: 'Proposed', progress: 0,
              description: data.desc,
              milestones: [
                { name: 'Initial Consultation', completed: true },
                { name: 'Requirements Gathering', completed: false },
                { name: 'Development Setup', completed: false }
              ],
              tasks: [], deliverables: [],
              budget: data.budget, deadline: data.deadline
            });
            await broadcastUpdate();
            message = 'Project request submitted';
            break;
          }

          case 'update_kanban': {
            const { taskId, projectId, newStatus } = data;
            const { data: proj } = await supabase.from('projects').select('tasks, progress').eq('id', projectId).single();
            if (!proj) { success = false; message = 'Project not found'; break; }
            const tasks = proj.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
            const done = tasks.filter(t => t.status === 'Done').length;
            const progress = tasks.length ? Math.round((done / tasks.length) * 100) : proj.progress;
            await supabase.from('projects').update({ tasks, progress }).eq('id', projectId);
            await broadcastUpdate();
            message = 'Kanban updated';
            break;
          }

          case 'add_project_task': {
            const { projectId, taskTitle } = data;
            const { data: proj } = await supabase.from('projects').select('tasks').eq('id', projectId).single();
            if (!proj) { success = false; message = 'Project not found'; break; }
            const tasks = [...proj.tasks, { id: proj.tasks.length + 1, title: taskTitle, status: 'To Do' }];
            const progress = Math.round(tasks.filter(t => t.status === 'Done').length / tasks.length * 100);
            await supabase.from('projects').update({ tasks, progress }).eq('id', projectId);
            await broadcastUpdate();
            message = 'Task added';
            break;
          }

          case 'assign_project': {
            const updates = {};
            if (data.assignedTo !== undefined) updates.assigned_to = data.assignedTo;
            if (data.progress !== undefined) updates.progress = parseInt(data.progress);
            if (data.status !== undefined) updates.status = data.status;
            await supabase.from('projects').update(updates).eq('id', data.projectId);
            await broadcastUpdate();
            message = 'Project updated';
            break;
          }

          // ── Tickets ──
          case 'add_ticket': {
            const ticketId = 'WEB-2026-' + Math.floor(1000 + Math.random() * 9000);
            const firstMsg = { sender: 'client', senderName: data.clientName || 'Client', text: data.description, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
            await supabase.from('tickets').insert({
              id: ticketId, client: data.client, category: data.category,
              priority: data.priority, status: 'Active',
              assigned_to: 'employee@rdk.com', title: data.title,
              description: data.description, messages: [firstMsg]
            });
            await broadcastUpdate();
            message = 'Ticket created';
            // Auto-reply after 1.5s
            setTimeout(async () => {
              const { data: t } = await supabase.from('tickets').select('messages,status').eq('id', ticketId).single();
              if (t && t.status === 'Active') {
                const msgs = [...t.messages, { sender: 'employee', senderName: 'Sarah K.', text: `Hello! I've received your ticket regarding "${data.title}". Investigating now — will update you shortly.`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }];
                await supabase.from('tickets').update({ messages: msgs }).eq('id', ticketId);
                broadcastUpdate();
              }
            }, 1500);
            break;
          }

          case 'send_ticket_message': {
            const { ticketId, sender, senderName, text } = data;
            const { data: t } = await supabase.from('tickets').select('messages,status').eq('id', ticketId).single();
            if (!t) { success = false; message = 'Ticket not found'; break; }
            const msgs = [...t.messages, { sender, senderName, text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }];
            await supabase.from('tickets').update({ messages: msgs }).eq('id', ticketId);
            await broadcastUpdate();
            if (sender === 'client') {
              setTimeout(async () => {
                const { data: fresh } = await supabase.from('tickets').select('messages,status').eq('id', ticketId).single();
                if (fresh && fresh.status === 'Active') {
                  const updated = [...fresh.messages, { sender: 'employee', senderName: 'Sarah K.', text: 'Thank you for the update. Our team is running tests on the staging server.', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }];
                  await supabase.from('tickets').update({ messages: updated }).eq('id', ticketId);
                  broadcastUpdate();
                }
              }, 1500);
            }
            message = 'Message sent';
            break;
          }

          case 'assign_ticket': {
            await supabase.from('tickets').update({ assigned_to: data.assignedTo, status: data.status || 'Active' }).eq('id', data.ticketId);
            await broadcastUpdate();
            message = 'Ticket assigned';
            break;
          }

          case 'close_ticket': {
            await supabase.from('tickets').update({ status: 'Resolved' }).eq('id', data.ticketId);
            await broadcastUpdate();
            message = 'Ticket closed';
            break;
          }

// ─────────────────────────────────────────────
// AI REQUIREMENT SCOPING BOT ENGINE
// ─────────────────────────────────────────────
async function generateAiRequirementReply(userText, userName) {
  const lower = (userText || '').toLowerCase();

  let extractedBudget = null;
  const budgetMatch = userText.match(/\$?\s?(\d+[\d,]*\s*k|\d+[\d,]*)/i);
  if (budgetMatch) {
    let numStr = budgetMatch[1].toLowerCase().replace(',', '');
    if (numStr.endsWith('k')) {
      numStr = (parseFloat(numStr) * 1000).toString();
    }
    const val = parseInt(numStr);
    if (!isNaN(val) && val > 50) {
      extractedBudget = `$${val.toLocaleString()}`;
    }
  }

  let category = null;
  if (/mobile|app|ios|android|flutter|react native/i.test(lower)) {
    category = 'Mobile Application (iOS / Android)';
  } else if (/e-?commerce|store|shop|stripe|cart|checkout/i.test(lower)) {
    category = 'E-Commerce Platform';
  } else if (/ai|bot|automation|chatgpt|openai|llm|discord|security/i.test(lower)) {
    category = 'AI & Automation System';
  } else if (/website|web|landing|frontend|react|next/i.test(lower)) {
    category = 'Web Platform / Web Application';
  } else if (/saas|crm|dashboard|enterprise|system|portal/i.test(lower)) {
    category = 'Enterprise SaaS Workspace';
  }

  const isRequirementQuery = category || lower.length > 20 || /build|create|need|want|develop|requirement|spec|feature|budget|cost|estimate|quote|project/i.test(lower);

  if (isRequirementQuery) {
    const projCategory = category || 'Custom Software Solution';
    const finalBudget = extractedBudget || '$3,500 - $6,000';
    const estimatedTimeline = lower.includes('urgent') || lower.includes('fast') ? '2 Weeks (Sprint Mode)' : '3 - 4 Weeks';

    const features = [];
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
        'REST & Event Stream API Services'
      );
    }

    const botReply = `🤖 **RDK Requirement Analysis & Project Scope**
━━━━━━━━━━━━━━━━━━━━━━━
📌 **Project Type**: ${projCategory}
🛠️ **Tech Architecture**: React.js + Node.js + Supabase Real-Time DB
⚡ **Core Requirements & Features**:
${features.map(f => `  • ${f}`).join('\n')}

⏱️ **Recommended Timeline**: ${estimatedTimeline}
💰 **Estimated Investment**: ${finalBudget}

✅ **Requirement Registered!**
I have automatically submitted this project scope under your profile (${userName || 'Client'}). You can track real-time sprint milestones and deliverables directly in the **Projects** tab.`;

    // Auto-register project in database
    const projId = 'PROJ-' + Math.floor(1000 + Math.random() * 9000);
    const clientIdentifier = (userName && userName !== 'Visitor Client' && userName !== 'Client Partner') ? userName : 'client@rdk.com';
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
          { name: 'QA Testing & Production Launch', completed: false }
        ],
        tasks: [{ id: 1, title: 'Scope Verification with Engineering', status: 'To Do' }],
        deliverables: [],
        budget: finalBudget,
        deadline: estimatedTimeline
      });
    } catch (e) {
      console.warn('Auto-create project warning:', e.message);
    }

    return botReply;
  } else {
    return `Hello ${userName || 'there'}! 👋 I am the **RDK AI Project Architect**.

I can instantly analyze your project requirements, estimate cost & completion timeline, and register your project with our engineering team.

To get started, tell me:
1️⃣ **What kind of project do you want to build?** (e.g. Website, Mobile App, AI Bot, SaaS Platform)
2️⃣ **What are the main features required?** (e.g. User Accounts, Payment Gateway, Real-time Chat)
3️⃣ **What is your budget or target deadline?**`;
  }
}

          // ── Chat ──
          case 'send_chat_message': {
            const { sender, senderName, text } = data;
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            await supabase.from('chat_messages').insert({ sender, sender_name: senderName, text, time });
            await broadcastUpdate();
            
            // Trigger AI Bot Requirement Engine response
            setTimeout(async () => {
              const botReplyText = await generateAiRequirementReply(text, senderName);
              const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const botSender = sender === 'in' ? 'out' : 'in';
              await supabase.from('chat_messages').insert({
                sender: botSender,
                sender_name: 'RDK AI Assistant',
                text: botReplyText,
                time: replyTime
              });
              broadcastUpdate();
            }, 1000);

            message = 'Message sent';
            break;
          }

          // ── Invoices ──
          case 'pay_invoice': {
            await supabase.from('invoices').update({ status: 'Paid' }).eq('id', data.invoiceId);
            await broadcastUpdate();
            message = 'Invoice paid';
            break;
          }

          case 'create_invoice': {
            const invId = 'INV-2026-' + Math.floor(100 + Math.random() * 900);
            await supabase.from('invoices').insert({
              id: invId, client: data.client, project: data.project,
              amount: parseFloat(data.amount), status: 'Unpaid',
              items: data.items.split(',').map(s => s.trim()),
              date: new Date().toISOString().split('T')[0]
            });
            await broadcastUpdate();
            message = 'Invoice created';
            break;
          }

          // ── Meetings ──
          case 'schedule_meeting': {
            await supabase.from('meetings').insert({ client: data.client, type: data.type || 'Google Meet', date: data.date, time: data.time, duration: '30 min', status: 'Scheduled' });
            await broadcastUpdate();
            message = 'Meeting scheduled';
            break;
          }

          // ── Applications ──
          case 'apply_job': {
            await supabase.from('applications').insert({ name: data.name, email: data.email, position: data.position, status: 'Applied', resume: data.resume || 'resume.pdf' });
            await broadcastUpdate();
            message = 'Application submitted';
            break;
          }

          case 'update_application_status': {
            await supabase.from('applications').update({ status: data.newStatus }).eq('id', data.applicationId);
            await broadcastUpdate();
            message = 'Application updated';
            break;
          }

          // ── CMS ──
          case 'update_cms_services':
            await supabase.from('cms_config').upsert({ key: 'services', value: data.services });
            await broadcastUpdate(); message = 'Services updated'; break;

          case 'update_cms_portfolio':
            await supabase.from('cms_config').upsert({ key: 'portfolio', value: data.portfolio });
            await broadcastUpdate(); message = 'Portfolio updated'; break;

          case 'update_cms_careers':
            await supabase.from('cms_config').upsert({ key: 'careers', value: data.careers });
            await broadcastUpdate(); message = 'Careers updated'; break;

          // ── Freelancer ──
          case 'update_freelancer_profile': {
            const { email, skills, availability, rate } = data;
            const { data: existing } = await supabase.from('freelancer_profiles').select('contracts').eq('email', email).maybeSingle();
            await supabase.from('freelancer_profiles').upsert({ email, skills, availability, rate, contracts: existing?.contracts || [] });
            await broadcastUpdate();
            message = 'Profile updated';
            break;
          }

          case 'add_freelancer_contract': {
            const { email, title, rate } = data;
            const { data: fp } = await supabase.from('freelancer_profiles').select('contracts').eq('email', email).maybeSingle();
            const contracts = [...(fp?.contracts || []), { id: 'CON-' + (Date.now() % 10000), title, rate, status: 'Active' }];
            await supabase.from('freelancer_profiles').update({ contracts }).eq('email', email);
            await broadcastUpdate();
            message = 'Contract added';
            break;
          }

          case 'submit_deliverable': {
            const { projectId, fileName, fileSize } = data;
            const { data: proj } = await supabase.from('projects').select('deliverables').eq('id', projectId).single();
            if (!proj) { success = false; message = 'Project not found'; break; }
            const deliverables = [...(proj.deliverables || []), { name: fileName, size: fileSize || '1 MB', date: new Date().toISOString().split('T')[0] }];
            await supabase.from('projects').update({ deliverables }).eq('id', projectId);
            await broadcastUpdate();
            message = 'Deliverable submitted';
            break;
          }

          // ── Theme ──
          case 'toggle_theme':
            await supabase.from('app_config').upsert({ key: 'theme', value: data.theme });
            await broadcastUpdate();
            message = 'Theme saved';
            break;

          // ── Role Management (admin only) ──
          case 'set_user_role': {
            await supabase.from('profiles').update({ role: data.role, details: data.details || '' }).eq('email', data.email);
            await broadcastUpdate();
            message = 'Role updated';
            break;
          }

          default:
            success = false;
            message = `Unknown action: ${action}`;
        }

        res.writeHead(success ? 200 : 400, { 'Content-Type': 'application/json', ...cors });
        res.end(JSON.stringify({ success, message, data: responsePayload }));
      } catch (err) {
        console.error('Action error:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, message: err.message }));
      }
    });
    return;
  }

  res.writeHead(404); res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`\n✅ RDK Server running on http://localhost:${PORT}`);
  console.log(`✅ Supabase connected: ${SUPABASE_URL}\n`);
});
