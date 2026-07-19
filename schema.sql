-- ================================================
-- RDK Industries — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ================================================

-- Profiles (linked to Supabase Auth users)
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique,
  name text,
  role text default 'client',
  details text,
  created_at timestamptz default now()
);

-- Projects
create table if not exists projects (
  id text primary key,
  name text,
  client text,
  assigned_to text default '',
  status text default 'Proposed',
  progress int default 0,
  description text,
  milestones jsonb default '[]'::jsonb,
  tasks jsonb default '[]'::jsonb,
  deliverables jsonb default '[]'::jsonb,
  budget numeric,
  deadline date,
  created_at timestamptz default now()
);

-- Tickets
create table if not exists tickets (
  id text primary key,
  client text,
  category text,
  priority text,
  status text default 'Active',
  assigned_to text default 'employee@rdk.com',
  title text,
  description text,
  messages jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- Invoices
create table if not exists invoices (
  id text primary key,
  client text,
  project text,
  amount numeric,
  status text default 'Unpaid',
  items jsonb default '[]'::jsonb,
  date text
);

-- Meetings
create table if not exists meetings (
  id serial primary key,
  client text,
  type text default 'Google Meet',
  date text,
  time text,
  duration text default '30 min',
  status text default 'Scheduled'
);

-- Chat messages
create table if not exists chat_messages (
  id serial primary key,
  sender text,
  sender_name text,
  text text,
  time text,
  created_at timestamptz default now()
);

-- Job applications
create table if not exists applications (
  id serial primary key,
  name text,
  email text,
  position text,
  status text default 'Applied',
  resume text
);

-- Freelancer profiles
create table if not exists freelancer_profiles (
  email text primary key,
  skills text,
  availability text,
  rate text,
  contracts jsonb default '[]'::jsonb
);

-- CMS config (services, portfolio, careers as JSON blobs)
create table if not exists cms_config (
  key text primary key,
  value jsonb
);

-- App config (theme etc.)
create table if not exists app_config (
  key text primary key,
  value text
);

-- ================================================
-- SEED INITIAL DATA
-- ================================================
insert into projects (id, name, client, assigned_to, status, progress, description, milestones, tasks, deliverables) values
('PROJ-101', 'Luxora Marketplace v2', 'demo', 'employee@rdk.com', 'In progress', 72,
 'Scale core Stripe transactions and optimize page index latency.',
 '[{"name":"Database Index Tuning","completed":true},{"name":"Webhook Payload Security","completed":true},{"name":"Analytics Dashboard UI","completed":false}]',
 '[{"id":1,"title":"Configure postgres queries","status":"Done"},{"id":2,"title":"Integrate stripe webhooks","status":"Done"},{"id":3,"title":"Create charts UI component","status":"In Progress"},{"id":4,"title":"Write backend unit tests","status":"To Do"}]',
 '[{"name":"luxora-stripe-handler-v1.zip","size":"2.4 MB","date":"2026-06-20"}]'),
('PROJ-102', 'Mobile App Redesign', 'demo', 'freelancer@rdk.com', 'Review', 90,
 'React Native upgrade and unified Dark Mode style guides.',
 '[{"name":"Figma Mockup Sign-off","completed":true},{"name":"Styles Refactoring","completed":true},{"name":"V1 Build to TestFlight","completed":false}]',
 '[{"id":5,"title":"Export SVG icons","status":"Done"},{"id":6,"title":"Migrate styling sheets","status":"Done"},{"id":7,"title":"Test build on iOS emulator","status":"In Review"}]',
 '[{"name":"fit-track-figma-handsoff.pdf","size":"12.8 MB","date":"2026-06-22"}]')
on conflict (id) do nothing;

insert into tickets (id, client, category, priority, status, assigned_to, title, description, messages) values
('WEB-2026-0041', 'demo', 'Website Dev', 'Critical', 'Active', 'employee@rdk.com',
 'E-commerce Bug Report', 'Stripe webhooks are timing out after 5s on the production server.',
 '[{"sender":"client","senderName":"Client","text":"Stripe webhooks are timing out during peak traffic hours.","time":"10:32 AM"},{"sender":"employee","senderName":"Sarah K.","text":"Investigating the database locking during webhook updates. Will push a fix today.","time":"10:45 AM"}]')
on conflict (id) do nothing;

insert into invoices (id, client, project, amount, status, items, date) values
('INV-2026-001', 'demo', 'Luxora Marketplace v2', 1500, 'Paid', '["Stripe webhook configuration","Milestone 1 release payment"]', '2026-06-15'),
('INV-2026-002', 'demo', 'Mobile App Redesign', 2800, 'Unpaid', '["React Native layout development","Milestone 2 release payment"]', '2026-06-28')
on conflict (id) do nothing;

insert into meetings (client, type, date, time, duration, status) values
('demo', 'Google Meet', '2026-07-02', '14:00', '30 min', 'Scheduled')
on conflict do nothing;

insert into chat_messages (sender, sender_name, text, time) values
('in', 'RDK Support', 'Hey! Quick update — the payment integration is complete ✅', '10:32 AM'),
('out', 'You', 'That''s great news! Can I review the staging environment?', '10:34 AM')
on conflict do nothing;

insert into freelancer_profiles (email, skills, availability, rate, contracts) values
('demo-freelancer', 'Flutter, React Native, iOS, Android, Figma', 'available', '45',
 '[{"id":"CON-101","title":"Mobile App Redesign Layouts","rate":"45","status":"Active"}]')
on conflict (email) do nothing;

insert into cms_config (key, value) values
('services', '[{"id":1,"name":"Website development","icon":"🌐","desc":"Custom websites, landing pages, CMS platforms and e-commerce solutions.","tags":["Next.js","WordPress","Shopify","Webflow"],"delivery":"2-8 weeks"},{"id":2,"name":"Mobile development","icon":"📱","desc":"Native and cross-platform apps for iOS and Android.","tags":["Flutter","React Native","iOS","Android"],"delivery":"4-12 weeks"},{"id":3,"name":"Discord development","icon":"🤖","desc":"Custom bots, dashboards, verification and moderation systems.","tags":["Discord.js","Python","AI bots","Dashboard"],"delivery":"1-4 weeks"},{"id":4,"name":"Full-stack development","icon":"⚡","desc":"Production-ready apps with Next.js, NestJS, PostgreSQL and REST APIs.","tags":["Next.js","NestJS","PostgreSQL","GraphQL"],"delivery":"6-16 weeks"},{"id":5,"name":"AI solutions","icon":"🧠","desc":"Custom AI assistants, LLM integrations and automation pipelines.","tags":["OpenAI","LangChain","RAG","Voice AI"],"delivery":"3-10 weeks"},{"id":6,"name":"Cloud & DevOps","icon":"☁️","desc":"Docker, AWS, CI/CD pipelines and Linux server management.","tags":["Docker","AWS","CI/CD","Linux"],"delivery":"1-6 weeks"}]'),
('portfolio', '[{"id":1,"cat":"web","title":"Luxora Marketplace","desc":"Multi-vendor e-commerce platform with real-time inventory.","tags":["Next.js","Stripe","PostgreSQL"],"date":"Jan 2026","icon":"🛒"},{"id":2,"cat":"mobile","title":"FitTrack Pro","desc":"Cross-platform fitness tracking app with AI coaching.","tags":["Flutter","Firebase","HealthKit"],"date":"Nov 2025","icon":"📱"},{"id":3,"cat":"discord","title":"GuardianBot","desc":"Enterprise Discord moderation for 500K+ member server.","tags":["Discord.js","OpenAI","Redis"],"date":"Oct 2025","icon":"🤖"},{"id":4,"cat":"ai","title":"LegalMind AI","desc":"Document intelligence for contract analysis and risk scoring.","tags":["LangChain","FastAPI","Pinecone"],"date":"Sep 2025","icon":"🧠"}]'),
('careers', '[{"id":1,"title":"Senior Frontend Developer","type":"Full-time","dept":"Engineering · Remote","tags":["React","Next.js","TypeScript","3+ years"],"salary":"$60k - $90k/yr"},{"id":2,"title":"Backend Developer (NestJS)","type":"Full-time","dept":"Engineering · Remote","tags":["NestJS","PostgreSQL","Node.js","2+ years"],"salary":"$55k - $85k/yr"},{"id":3,"title":"Flutter Developer","type":"Full-time","dept":"Mobile · Remote","tags":["Flutter","Dart","Firebase","2+ years"],"salary":"$50k - $80k/yr"},{"id":4,"title":"AI/ML Engineer","type":"Full-time","dept":"AI · Remote","tags":["Python","LangChain","OpenAI","3+ years"],"salary":"$70k - $110k/yr"},{"id":5,"title":"Discord Bot Developer","type":"Freelance","dept":"Bots · Remote","tags":["Discord.js","Python","1+ years"],"salary":"$25 - $50/hr"},{"id":6,"title":"UI/UX Designer","type":"Full-time","dept":"Design · Remote","tags":["Figma","Framer","Design systems","3+ years"],"salary":"$55k - $80k/yr"}]')
on conflict (key) do nothing;

insert into app_config (key, value) values ('theme', 'light') on conflict (key) do nothing;

insert into applications (name, email, position, status, resume) values
('Marcus Miller', 'marcus.miller@gmail.com', 'Senior Frontend Developer', 'Interviewing', 'marcus_resume.pdf')
on conflict do nothing;
