import express from 'express';
import cors from 'cors';
import sqlite3Pkg from 'sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import path from 'node:path';
import dotenv from 'dotenv';
import QRCode from 'qrcode';
import nodemailer from 'nodemailer';

dotenv.config();

const sqlite3 = sqlite3Pkg.verbose();
const PORT = Number(process.env.PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET || 'rdk-tech-self-hosted-jwt-secret-2026';
const DB_PATH = process.env.DB_PATH || path.resolve(process.cwd(), 'rdkwebsite.sqlite');

const db = new sqlite3.Database(DB_PATH);
const run = (sql, params = []) => new Promise((res, rej) => db.run(sql, params, function (e) { e ? rej(e) : res({ lastID: this.lastID, changes: this.changes }); }));
const get = (sql, params = []) => new Promise((res, rej) => db.get(sql, params, (e, r) => e ? rej(e) : res(r || null)));
const all = (sql, params = []) => new Promise((res, rej) => db.all(sql, params, (e, r) => e ? rej(e) : res(r || [])));

const JSON_COLS = {
  projects: ['milestones', 'tasks', 'deliverables'],
  tickets: ['messages'],
  invoices: ['items'],
  freelancer_profiles: ['contracts'],
  cms_config: ['value']
};

const ALLOWED_TABLES = new Set([
  'profiles', 'projects', 'tickets', 'invoices', 'meetings',
  'chat_messages', 'applications', 'freelancer_profiles', 'cms_config', 'app_config'
]);

function deserializeRow(table, row) {
  if (!row) return row;
  const cols = JSON_COLS[table] || [];
  const out = { ...row };
  for (const col of cols) {
    if (typeof out[col] === 'string') {
      try { out[col] = JSON.parse(out[col]); } catch {}
    }
  }
  return out;
}

function serializeValue(table, col, val) {
  if ((JSON_COLS[table] || []).includes(col) && typeof val === 'object' && val !== null) {
    return JSON.stringify(val);
  }
  return val;
}

async function initDb() {
  await run('PRAGMA journal_mode = WAL;');
  const schemas = [
    `CREATE TABLE IF NOT EXISTS auth_users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT,
      role TEXT DEFAULT 'client',
      created_at TEXT DEFAULT (datetime('now'))
    );`,
    `CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      name TEXT,
      role TEXT DEFAULT 'client',
      details TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );`,
    `CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT,
      client TEXT,
      assigned_to TEXT DEFAULT '',
      status TEXT DEFAULT 'Proposed',
      progress INTEGER DEFAULT 0,
      description TEXT,
      milestones TEXT DEFAULT '[]',
      tasks TEXT DEFAULT '[]',
      deliverables TEXT DEFAULT '[]',
      budget REAL,
      deadline TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );`,
    `CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      client TEXT,
      category TEXT,
      priority TEXT,
      status TEXT DEFAULT 'Active',
      assigned_to TEXT DEFAULT 'employee@rdk.com',
      title TEXT,
      description TEXT,
      messages TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now'))
    );`,
    `CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      client TEXT,
      project TEXT,
      amount REAL,
      status TEXT DEFAULT 'Unpaid',
      items TEXT DEFAULT '[]',
      date TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS meetings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client TEXT,
      type TEXT DEFAULT 'Google Meet',
      date TEXT,
      time TEXT,
      duration TEXT DEFAULT '30 min',
      status TEXT DEFAULT 'Scheduled'
    );`,
    `CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender TEXT,
      sender_name TEXT,
      text TEXT,
      time TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );`,
    `CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      position TEXT,
      status TEXT DEFAULT 'Applied',
      resume TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS freelancer_profiles (
      email TEXT PRIMARY KEY,
      skills TEXT,
      availability TEXT,
      rate TEXT,
      contracts TEXT DEFAULT '[]'
    );`,
    `CREATE TABLE IF NOT EXISTS cms_config (
      key TEXT PRIMARY KEY,
      value TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS app_config (
      key TEXT PRIMARY KEY,
      value TEXT
    );`
  ];

  for (const s of schemas) await run(s);

  // Seed initial data if empty
  const projCount = await get('SELECT COUNT(*) as c FROM projects');
  if ((projCount?.c || 0) === 0) {
    await run(
      `INSERT OR IGNORE INTO projects (id, name, client, assigned_to, status, progress, description, milestones, tasks, deliverables) VALUES
       ('PROJ-101', 'Luxora Marketplace v2', 'demo', 'employee@rdk.com', 'In progress', 72,
        'Scale core Stripe transactions and optimize page index latency.',
        '[{"name":"Database Index Tuning","completed":true},{"name":"Webhook Payload Security","completed":true},{"name":"Analytics Dashboard UI","completed":false}]',
        '[{"id":1,"title":"Configure postgres queries","status":"Done"},{"id":2,"title":"Integrate stripe webhooks","status":"Done"},{"id":3,"title":"Create charts UI component","status":"In Progress"},{"id":4,"title":"Write backend unit tests","status":"To Do"}]',
        '[{"name":"luxora-stripe-handler-v1.zip","size":"2.4 MB","date":"2026-06-20"}]'),
       ('PROJ-102', 'Mobile App Redesign', 'demo', 'freelancer@rdk.com', 'Review', 90,
        'React Native upgrade and unified Dark Mode style guides.',
        '[{"name":"Figma Mockup Sign-off","completed":true},{"name":"Styles Refactoring","completed":true},{"name":"V1 Build to TestFlight","completed":false}]',
        '[{"id":5,"title":"Export SVG icons","status":"Done"},{"id":6,"title":"Migrate styling sheets","status":"Done"},{"id":7,"title":"Test build on iOS emulator","status":"In Review"}]',
        '[{"name":"fit-track-figma-handsoff.pdf","size":"12.8 MB","date":"2026-06-22"}]')`
    );
  }

  await run(
    `INSERT OR IGNORE INTO tickets (id, client, category, priority, status, assigned_to, title, description, messages) VALUES
     ('WEB-2026-0041', 'demo', 'Website Dev', 'Critical', 'Active', 'employee@rdk.com',
      'E-commerce Bug Report', 'Stripe webhooks are timing out after 5s on the production server.',
      '[{"sender":"client","senderName":"Client","text":"Stripe webhooks are timing out during peak traffic hours.","time":"10:32 AM"},{"sender":"employee","senderName":"Sarah K.","text":"Investigating the database locking during webhook updates. Will push a fix today.","time":"10:45 AM"}]')`
  );

  await run(
    `INSERT OR IGNORE INTO invoices (id, client, project, amount, status, items, date) VALUES
     ('INV-2026-001', 'demo', 'Luxora Marketplace v2', 1500, 'Paid', '["Stripe webhook configuration","Milestone 1 release payment"]', '2026-06-15'),
     ('INV-2026-002', 'demo', 'Mobile App Redesign', 2800, 'Unpaid', '["React Native layout development","Milestone 2 release payment"]', '2026-06-28')`
  );

  const meetCount = await get('SELECT COUNT(*) as c FROM meetings');
  if ((meetCount?.c || 0) === 0) {
    await run(`INSERT INTO meetings (client, type, date, time, duration, status) VALUES ('demo', 'Google Meet', '2026-07-02', '14:00', '30 min', 'Scheduled')`);
  }

  const chatCount = await get('SELECT COUNT(*) as c FROM chat_messages');
  if ((chatCount?.c || 0) === 0) {
    await run(`INSERT INTO chat_messages (sender, sender_name, text, time) VALUES
      ('in', 'RDK Support', 'Hey! Quick update — the payment integration is complete ✅', '10:32 AM'),
      ('out', 'You', 'That''s great news! Can I review the staging environment?', '10:34 AM')`);
  }

  await run(
    `INSERT OR IGNORE INTO freelancer_profiles (email, skills, availability, rate, contracts) VALUES
     ('demo-freelancer', 'Flutter, React Native, iOS, Android, Figma', 'available', '45',
      '[{"id":"CON-101","title":"Mobile App Redesign Layouts","rate":"45","status":"Active"}]')`
  );

  await run(
    `INSERT OR IGNORE INTO cms_config (key, value) VALUES
     ('services', '[{"id":1,"name":"Website development","icon":"🌐","desc":"Custom websites, landing pages, CMS platforms and e-commerce solutions.","tags":["Next.js","WordPress","Shopify","Webflow"],"delivery":"2-8 weeks"},{"id":2,"name":"Mobile development","icon":"📱","desc":"Native and cross-platform apps for iOS and Android.","tags":["Flutter","React Native","iOS","Android"],"delivery":"4-12 weeks"},{"id":3,"name":"Discord development","icon":"🤖","desc":"Custom bots, dashboards, verification and moderation systems.","tags":["Discord.js","Python","AI bots","Dashboard"],"delivery":"1-4 weeks"},{"id":4,"name":"Full-stack development","icon":"⚡","desc":"Production-ready apps with Next.js, NestJS, PostgreSQL and REST APIs.","tags":["Next.js","NestJS","PostgreSQL","GraphQL"],"delivery":"6-16 weeks"},{"id":5,"name":"AI solutions","icon":"🧠","desc":"Custom AI assistants, LLM integrations and automation pipelines.","tags":["OpenAI","LangChain","RAG","Voice AI"],"delivery":"3-10 weeks"},{"id":6,"name":"Cloud & DevOps","icon":"☁️","desc":"Docker, AWS, CI/CD pipelines and Linux server management.","tags":["Docker","AWS","CI/CD","Linux"],"delivery":"1-6 weeks"}]'),
     ('portfolio', '[{"id":1,"cat":"web","title":"Luxora Marketplace","desc":"Multi-vendor e-commerce platform with real-time inventory.","tags":["Next.js","Stripe","PostgreSQL"],"date":"Jan 2026","icon":"🛒"},{"id":2,"cat":"mobile","title":"FitTrack Pro","desc":"Cross-platform fitness tracking app with AI coaching.","tags":["Flutter","Firebase","HealthKit"],"date":"Nov 2025","icon":"📱"},{"id":3,"cat":"discord","title":"GuardianBot","desc":"Enterprise Discord moderation for 500K+ member server.","tags":["Discord.js","OpenAI","Redis"],"date":"Oct 2025","icon":"🤖"},{"id":4,"cat":"ai","title":"LegalMind AI","desc":"Document intelligence for contract analysis and risk scoring.","tags":["LangChain","FastAPI","Pinecone"],"date":"Sep 2025","icon":"🧠"}]'),
     ('careers', '[{"id":1,"title":"Senior Frontend Developer","type":"Full-time","dept":"Engineering · Remote","tags":["React","Next.js","TypeScript","3+ years"],"salary":"$60k - $90k/yr"},{"id":2,"title":"Backend Developer (NestJS)","type":"Full-time","dept":"Engineering · Remote","tags":["NestJS","PostgreSQL","Node.js","2+ years"],"salary":"$55k - $85k/yr"},{"id":3,"title":"Flutter Developer","type":"Full-time","dept":"Mobile · Remote","tags":["Flutter","Dart","Firebase","2+ years"],"salary":"$50k - $80k/yr"},{"id":4,"title":"AI/ML Engineer","type":"Full-time","dept":"AI · Remote","tags":["Python","LangChain","OpenAI","3+ years"],"salary":"$70k - $110k/yr"},{"id":5,"title":"Discord Bot Developer","type":"Freelance","dept":"Bots · Remote","tags":["Discord.js","Python","1+ years"],"salary":"$25 - $50/hr"},{"id":6,"title":"UI/UX Designer","type":"Full-time","dept":"Design · Remote","tags":["Figma","Framer","Design systems","3+ years"],"salary":"$55k - $80k/yr"}]')`
  );

  await run(`INSERT OR IGNORE INTO app_config (key, value) VALUES ('theme', 'light')`);

  const appCount = await get('SELECT COUNT(*) as c FROM applications');
  if ((appCount?.c || 0) === 0) {
    await run(`INSERT INTO applications (name, email, position, status, resume) VALUES ('Marcus Miller', 'marcus.miller@gmail.com', 'Senior Frontend Developer', 'Interviewing', 'marcus_resume.pdf')`);
  }
}

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '4mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'online', service: 'rdkwebsite-sqlite-api', database: 'sqlite' });
});

// ── Discord OAuth2 (Server Owner Verification for Rage Pro) ───────────────────
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1519626369594818560';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || 'WdbpuKs8EhgkSG6MzF_drSjGSua5SQZY';
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'https://rdkweb.netlify.app/api/discord/callback';

app.get('/api/discord/login', (_req, res) => {
  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: DISCORD_REDIRECT_URI,
    response_type: 'code',
    scope: 'identify guilds'
  });
  res.redirect(`https://discord.com/api/oauth2/authorize?${params.toString()}`);
});

app.get('/api/discord/callback', async (req, res) => {
  const code = String(req.query.code || '');
  if (!code) return res.status(400).send('Missing Discord OAuth code.');

  try {
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: DISCORD_REDIRECT_URI
      })
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return res.status(400).send(`Discord OAuth failed: ${JSON.stringify(tokenData)}`);
    }

    const authHeader = { Authorization: `Bearer ${tokenData.access_token}` };
    const [userRes, guildsRes] = await Promise.all([
      fetch('https://discord.com/api/users/@me', { headers: authHeader }),
      fetch('https://discord.com/api/users/@me/guilds', { headers: authHeader })
    ]);
    const user = await userRes.json();
    const guilds = await guildsRes.json();

    const ownedGuilds = Array.isArray(guilds)
      ? guilds.filter((g) => g.owner === true).map((g) => ({ id: g.id, name: g.name, icon: g.icon }))
      : [];

    const payload = JSON.stringify({ type: 'RDK_DISCORD_AUTH', user: { id: user.id, username: user.username, global_name: user.global_name }, ownedGuilds });
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html><html><body style="background:#0b0d12;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;">
      <p>Discord verified! Returning to RDK Tech...</p>
      <script>
        if (window.opener) { window.opener.postMessage(${payload}, '*'); }
        window.close();
      </script>
    </body></html>`);
  } catch (err) {
    res.status(500).send('Discord OAuth error: ' + err.message);
  }
});

// ── Rage Pro (Rs.99) Inline UPI QR Checkout & UTR Submission ──────────────────
const RAGE_UPI_VPA = process.env.UPI_VPA || 'rbzclasher@okaxis';
const RAGE_UPI_NAME = process.env.UPI_PAYEE_NAME || 'Rage Optimiser';

// ── SMTP Email Service (rdksupport@ragefps.in) ────────────────────────────────
const SMTP_HOST = process.env.SMTP_HOST || 'smtpout.secureserver.net';
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_USER = process.env.SMTP_USER || 'rdksupport@ragefps.in';
const SMTP_PASS = process.env.SMTP_PASS || 'clasher@2026';

const mailTransporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASS }
});

async function sendRdkEmail(to, subject, html) {
  if (!to || !to.includes('@')) return;
  try {
    await mailTransporter.sendMail({
      from: `"RDK Tech Support" <${SMTP_USER}>`,
      to,
      subject,
      html
    });
  } catch (err) {
    console.warn('[SMTP] Failed to send email to', to, err.message);
  }
}

app.post('/api/rage-pro/checkout', async (req, res) => {
  try {
    const guildId = String(req.body?.guildId || '').trim();
    const guildName = String(req.body?.guildName || guildId).trim();
    const ownerId = String(req.body?.ownerId || '').trim();
    const ownerUsername = String(req.body?.ownerUsername || '').trim();
    const email = String(req.body?.email || '').trim();

    if (!/^\d{15,22}$/.test(guildId)) {
      return res.status(400).json({ error: 'Valid Discord Server ID is required.' });
    }

    const invId = 'INV-RAGE-' + crypto.randomBytes(3).toString('hex').toUpperCase();
    const upiParams = new URLSearchParams({
      pa: RAGE_UPI_VPA,
      pn: RAGE_UPI_NAME,
      am: '99',
      cu: 'INR',
      tn: `RagePro ${invId}`
    });
    const upiUri = `upi://pay?${upiParams.toString()}`;
    const qrDataUrl = await QRCode.toDataURL(upiUri, { width: 320, margin: 2 });

    await run(
      `INSERT OR REPLACE INTO invoices (id, client, project, amount, status, items, date) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        invId,
        email || `${ownerUsername} (${ownerId})`,
        `Rage Pro (30d) — ${guildName}`,
        99,
        'Unpaid',
        JSON.stringify([
          'Rage Pro 30-Day Subscription',
          `Owner: ${ownerUsername} (${ownerId})`,
          `Server: ${guildName} (${guildId})`
        ]),
        new Date().toISOString().slice(0, 10)
      ]
    );

    res.json({ invoiceId: invId, upiVpa: RAGE_UPI_VPA, upiName: RAGE_UPI_NAME, upiUri, qrDataUrl, amountInr: 99 });
    if (email && email.includes('@')) {
      sendRdkEmail(
        email,
        `Rage Pro (₹99) Invoice Created — ${invId}`,
        `<h2>Rage Pro Upgrade Invoice</h2><p><b>Invoice ID:</b> ${invId}<br/><b>Server:</b> ${guildName} (${guildId})<br/><b>Amount:</b> ₹99 INR (30 Days)<br/><b>UPI ID:</b> ${RAGE_UPI_VPA}</p><p>Once you submit your 12-digit UTR in the checkout modal, our team will activate Rage Pro on your server.</p>`
      );
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/rage-pro/submit-utr', async (req, res) => {
  try {
    const invoiceId = String(req.body?.invoiceId || '').trim();
    const utr = String(req.body?.utr || '').trim().replace(/\s+/g, '');
    const guildId = String(req.body?.guildId || '').trim();
    const guildName = String(req.body?.guildName || guildId).trim();
    const ownerId = String(req.body?.ownerId || '').trim();
    const ownerUsername = String(req.body?.ownerUsername || '').trim();

    if (!/^[A-Za-z0-9]{8,28}$/.test(utr)) {
      return res.status(400).json({ error: 'Enter a valid 12-digit UPI UTR / Reference Number.' });
    }

    await run(`UPDATE invoices SET status = ? WHERE id = ?`, [`Pending Verification (UTR: ${utr})`, invoiceId]);

    const webhookUrl = process.env.DISCORD_TICKET_WEBHOOK_URL || 'https://discord.com/api/webhooks/1555981268678742088/JJfYUiRAv1G3AP_u0teQ-iI4Nlnk7n3CbnkgBM0uXtvqP7kXV3PzF9Dkt4BBowt8E6G7';
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'RDK Tech Billing',
        content: `<@1140892126402596905>`,
        embeds: [{
          title: `New Rage Pro (₹99) UPI Payment Submitted`,
          color: 0x10b981,
          fields: [
            { name: 'Invoice ID', value: invoiceId, inline: true },
            { name: 'UTR / Ref', value: `\`${utr}\``, inline: true },
            { name: 'Amount', value: '₹99 INR (30 Days)', inline: true },
            { name: 'Server', value: `${guildName} (\`${guildId}\`)`, inline: false },
            { name: 'Verified Owner', value: `<@${ownerId}> (${ownerUsername})`, inline: false }
          ],
          footer: { text: 'Run r!premium grant <guildId> 30 after verifying UTR' },
          timestamp: new Date().toISOString()
        }]
      })
    }).catch(() => {});

    res.json({ success: true, invoiceId, utr, status: 'submitted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Auth Routes ───────────────────────────────────────────────────────────────
app.post('/api/auth/signup', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    const fullName = String(req.body?.fullName || email.split('@')[0] || 'User').trim();
    if (!email || !password) return res.status(400).json({ error: { message: 'Email and password are required.' } });

    const existing = await get('SELECT * FROM auth_users WHERE lower(email) = ?', [email]);
    if (existing) return res.status(400).json({ error: { message: 'User already registered.' } });

    const id = crypto.randomUUID();
    const hash = await bcrypt.hash(password, 10);
    await run('INSERT INTO auth_users (id, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)', [id, email, hash, fullName, 'client']);
    await run('INSERT OR IGNORE INTO profiles (id, email, name, role, details) VALUES (?, ?, ?, ?, ?)', [id, email, fullName, 'client', 'Enterprise Partner']);

    const user = { id, email, user_metadata: { full_name: fullName, role: 'client' } };
    const access_token = jwt.sign({ id, email, full_name: fullName, role: 'client' }, JWT_SECRET, { expiresIn: '7d' });
    sendRdkEmail(
      email,
      'Welcome to RDK Tech — Reliable Digital Kreations',
      `<div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;background:#0b0f19;color:#f3f4f6;padding:32px;border-radius:16px;border:1px solid #1f2937;">
        <div style="font-size:12px;font-weight:800;letter-spacing:0.1em;color:#a855f7;text-transform:uppercase;">RDK TECH • RELIABLE DIGITAL KREATIONS</div>
        <h1 style="margin:10px 0 8px;font-size:24px;color:#ffffff;">Welcome, ${fullName}!</h1>
        <p style="color:#9ca3af;font-size:14px;line-height:1.6;">
          Thank you for creating your RDK Tech Client Portal account. You now have direct access to our engineering team, live project tracking, support tickets, and software licensing.
        </p>
        <div style="background:#111827;border:1px solid #1f2937;border-radius:12px;padding:18px;margin:20px 0;">
          <div style="font-size:13px;font-weight:700;color:#ffffff;margin-bottom:10px;">What We Provide at RDK Tech:</div>
          <ul style="margin:0;padding-left:18px;color:#d1d5db;font-size:13px;line-height:1.8;">
            <li><b>Web &amp; Full-Stack Platforms:</b> Custom SaaS, e-commerce, Next.js, Node.js, and SQL databases</li>
            <li><b>Rage Optimiser Enterprise:</b> Flagship Discord Anti-Nuke, UPM Snapshots, Gmail 2FA &amp; Rage Pro (₹99 / 30 days)</li>
            <li><b>Mobile &amp; Enterprise IoT:</b> Flutter, React Native, fleet telemetry, and biometric integrations</li>
            <li><b>AI &amp; Cloud DevOps:</b> Custom LLM assistants, automation pipelines, Docker, and Linux VPS hosting</li>
          </ul>
        </div>
        <div style="margin-top:20px;">
          <a href="https://rdkweb.netlify.app/dashboard" style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;padding:11px 20px;border-radius:8px;font-weight:700;font-size:13px;margin-right:8px;">Open Client Portal</a>
          <a href="https://rdkweb.netlify.app/#tickets" style="display:inline-block;background:#1f2937;color:#f3f4f6;text-decoration:none;padding:11px 20px;border-radius:8px;font-weight:700;font-size:13px;">Create Support Ticket</a>
        </div>
        <p style="margin-top:24px;font-size:12px;color:#6b7280;">Need help? Reply directly to <a href="mailto:rdksupport@ragefps.in" style="color:#a855f7;">rdksupport@ragefps.in</a>.</p>
      </div>`
    );
    res.json({ data: { user, session: { access_token, user } }, error: null });
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    const row = await get('SELECT * FROM auth_users WHERE lower(email) = ?', [email]);
    if (!row) return res.status(401).json({ error: { message: 'Invalid login credentials.' } });

    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) return res.status(401).json({ error: { message: 'Invalid login credentials.' } });

    const user = { id: row.id, email: row.email, user_metadata: { full_name: row.full_name, role: row.role } };
    const access_token = jwt.sign({ id: row.id, email: row.email, full_name: row.full_name, role: row.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ data: { user, session: { access_token, user } }, error: null });
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

app.get('/api/auth/session', (req, res) => {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.json({ data: { session: null }, error: null });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = { id: decoded.id, email: decoded.email, user_metadata: { full_name: decoded.full_name, role: decoded.role } };
    res.json({ data: { session: { access_token: token, user } }, error: null });
  } catch {
    res.json({ data: { session: null }, error: null });
  }
});

// ── Generic SQLite REST Bridge ────────────────────────────────────────────────
app.post('/api/rest/:table', async (req, res) => {
  const table = req.params.table;
  if (!ALLOWED_TABLES.has(table)) {
    return res.status(400).json({ data: null, error: { message: `Unknown table: ${table}` } });
  }

  try {
    const { action = 'select', filters = [], orderBy, payload, single, maybeSingle } = req.body || {};

    let whereSql = '';
    const whereParams = [];
    if (Array.isArray(filters) && filters.length > 0) {
      const clauses = [];
      for (const f of filters) {
        if (!/^[a-zA-Z0-9_]+$/.test(f.col)) continue;
        clauses.push(`"${f.col}" = ?`);
        whereParams.push(f.val);
      }
      if (clauses.length > 0) whereSql = ' WHERE ' + clauses.join(' AND ');
    }

    if (action === 'select') {
      let orderSql = '';
      if (orderBy && /^[a-zA-Z0-9_]+$/.test(orderBy.col)) {
        orderSql = ` ORDER BY "${orderBy.col}" ${orderBy.ascending === false ? 'DESC' : 'ASC'}`;
      }
      const rows = (await all(`SELECT * FROM "${table}"${whereSql}${orderSql}`, whereParams)).map(r => deserializeRow(table, r));
      if (single) {
        if (!rows[0]) return res.json({ data: null, error: { message: 'Row not found' } });
        return res.json({ data: rows[0], error: null });
      }
      if (maybeSingle) {
        return res.json({ data: rows[0] || null, error: null });
      }
      return res.json({ data: rows, error: null });
    }

    if (action === 'insert' || action === 'upsert') {
      const items = Array.isArray(payload) ? payload : [payload];
      const inserted = [];
      for (const item of items) {
        const keys = Object.keys(item).filter(k => /^[a-zA-Z0-9_]+$/.test(k));
        const vals = keys.map(k => serializeValue(table, k, item[k]));
        const placeholders = keys.map(() => '?').join(', ');
        const verb = action === 'upsert' ? 'INSERT OR REPLACE' : 'INSERT';
        const r = await run(`${verb} INTO "${table}" (${keys.map(k => `"${k}"`).join(', ')}) VALUES (${placeholders})`, vals);
        inserted.push({ ...item, ...(r.lastID && !item.id ? { id: r.lastID } : {}) });

        // Notify Discord webhook & client email when a ticket is created on rdkweb.netlify.app
        if (table === 'tickets' && action === 'insert') {
          if (item.client && String(item.client).includes('@')) {
            sendRdkEmail(
              String(item.client),
              `Ticket Received: ${item.id} — ${item.title || 'Support'}`,
              `<h2>Support Ticket Created</h2><p><b>Ticket ID:</b> ${item.id}<br/><b>Category:</b> ${item.category || 'General'}<br/><b>Title:</b> ${item.title || ''}</p><p>Our engineering team has received your ticket and will respond shortly.</p>`
            );
          }
          const webhookUrl = process.env.DISCORD_TICKET_WEBHOOK_URL || 'https://discord.com/api/webhooks/1555981268678742088/JJfYUiRAv1G3AP_u0teQ-iI4Nlnk7n3CbnkgBM0uXtvqP7kXV3PzF9Dkt4BBowt8E6G7';
          fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: 'RDK Tech Portal',
              embeds: [{
                title: `New Web Ticket: ${item.id || 'N/A'}`,
                color: 0x7c3aed,
                fields: [
                  { name: 'Category', value: String(item.category || 'General'), inline: true },
                  { name: 'Client', value: String(item.client || 'Guest'), inline: true },
                  { name: 'Title', value: String(item.title || 'No Title'), inline: false },
                  { name: 'Description', value: String(item.description || '').slice(0, 1000), inline: false }
                ],
                footer: { text: 'RDK Tech • rdkweb.netlify.app/#tickets' },
                timestamp: new Date().toISOString()
              }]
            })
          }).catch(() => {});
        }
      }
      const out = single || maybeSingle ? (inserted[0] || null) : inserted;
      return res.json({ data: out, error: null });
    }

    if (action === 'update') {
      const keys = Object.keys(payload || {}).filter(k => /^[a-zA-Z0-9_]+$/.test(k));
      if (keys.length === 0) return res.json({ data: null, error: null });
      const setSql = keys.map(k => `"${k}" = ?`).join(', ');
      const vals = [...keys.map(k => serializeValue(table, k, payload[k])), ...whereParams];
      await run(`UPDATE "${table}" SET ${setSql}${whereSql}`, vals);
      const rows = (await all(`SELECT * FROM "${table}"${whereSql}`, whereParams)).map(r => deserializeRow(table, r));
      return res.json({ data: single || maybeSingle ? (rows[0] || null) : rows, error: null });
    }

    if (action === 'delete') {
      await run(`DELETE FROM "${table}"${whereSql}`, whereParams);
      return res.json({ data: null, error: null });
    }

    res.status(400).json({ data: null, error: { message: `Unsupported action: ${action}` } });
  } catch (err) {
    res.status(500).json({ data: null, error: { message: err.message } });
  }
});

initDb().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[rdkwebsite-api] Running on http://0.0.0.0:${PORT} with SQLite at ${DB_PATH}`);
  });
}).catch((err) => {
  console.error('Failed to init SQLite DB:', err);
  process.exit(1);
});

