import express from 'express';
import cors from 'cors';
import sqlite3Pkg from 'sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import path from 'node:path';
import dotenv from 'dotenv';

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
        const r = await run(`"${table}"` ? `${verb} INTO "${table}" (${keys.map(k => `"${k}"`).join(', ')}) VALUES (${placeholders})` : '', vals);
        inserted.push({ ...item, ...(r.lastID && !item.id ? { id: r.lastID } : {}) });
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
