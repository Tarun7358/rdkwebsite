// ─────────────────────────────────────────────
// USER & AUTH
// ─────────────────────────────────────────────
export type UserRole = 'client' | 'employee' | 'freelancer' | 'admin';

export interface UserProfile {
  email: string;
  name: string;
  role: UserRole;
  details: string;
}

// ─────────────────────────────────────────────
// PROJECTS
// ─────────────────────────────────────────────
export interface Milestone {
  name: string;
  completed: boolean;
}

export interface Task {
  id: number;
  title: string;
  status: 'To Do' | 'In Progress' | 'In Review' | 'Done';
  projId?: string;
  projName?: string;
}

export interface Deliverable {
  name: string;
  size: string;
  date: string;
}

export type ProjectStatus = 'Proposed' | 'In progress' | 'Review' | 'Done';

export interface Project {
  id: string;
  name: string;
  client: string;
  assignedTo: string;
  status: ProjectStatus;
  progress: number;
  desc: string;
  milestones: Milestone[];
  tasks: Task[];
  deliverables: Deliverable[];
  budget?: number | string;
  deadline?: string;
}

// ─────────────────────────────────────────────
// TICKETS
// ─────────────────────────────────────────────
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TicketStatus = 'Active' | 'Resolved';

export interface TicketMessage {
  sender: 'client' | 'employee';
  senderName: string;
  text: string;
  time: string;
}

export interface Ticket {
  id: string;
  client: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo: string;
  title: string;
  description: string;
  messages: TicketMessage[];
}

// ─────────────────────────────────────────────
// INVOICES
// ─────────────────────────────────────────────
export type InvoiceStatus = 'Paid' | 'Unpaid';

export interface Invoice {
  id: string;
  client: string;
  project: string;
  amount: number;
  status: InvoiceStatus;
  items: string[];
  date: string;
}

// ─────────────────────────────────────────────
// MEETINGS
// ─────────────────────────────────────────────
export interface Meeting {
  id: number;
  client: string;
  type: string;
  date: string;
  time: string;
  duration: string;
  status: string;
}

// ─────────────────────────────────────────────
// CHAT
// ─────────────────────────────────────────────
export interface ChatMessage {
  sender: 'in' | 'out';
  senderName: string;
  text: string;
  time: string;
}

// ─────────────────────────────────────────────
// APPLICATIONS
// ─────────────────────────────────────────────
export type ApplicationStatus = 'Applied' | 'Interviewing' | 'Hired' | 'Rejected';

export interface Application {
  id: number;
  name: string;
  email: string;
  position: string;
  status: ApplicationStatus;
  resume: string;
}

// ─────────────────────────────────────────────
// CMS
// ─────────────────────────────────────────────
export type PortfolioCategory = 'web' | 'mobile' | 'discord' | 'ai';

export interface ServiceItem {
  id: number;
  name: string;
  icon: string;
  desc: string;
  tags: string[];
  delivery: string;
  themeClass?: string;
}

export interface PortfolioItem {
  id: number;
  cat: PortfolioCategory;
  title: string;
  desc: string;
  tags: string[];
  date: string;
  icon: string;
  bg?: string;
}

export interface CareerItem {
  id: number;
  title: string;
  type: string;
  dept: string;
  tags: string[];
  salary: string;
}

// ─────────────────────────────────────────────
// FREELANCER
// ─────────────────────────────────────────────
export interface FreelancerContract {
  id: string;
  title: string;
  rate: string;
  status: string;
}

export interface FreelancerProfile {
  email: string;
  skills: string;
  availability: string;
  rate: string;
  contracts: FreelancerContract[];
}

// ─────────────────────────────────────────────
// FULL APP STATE (from /api/state)
// ─────────────────────────────────────────────
export interface AppState {
  theme: 'light' | 'dark';
  projects: Project[];
  tickets: Ticket[];
  invoices: Invoice[];
  meetings: Meeting[];
  chatMessages: ChatMessage[];
  applications: Application[];
  freelancerProfiles: Record<string, FreelancerProfile>;
  services: ServiceItem[];
  portfolio: PortfolioItem[];
  careers: CareerItem[];
}

// ─────────────────────────────────────────────
// UI
// ─────────────────────────────────────────────
export type ToastType = 'info' | 'success' | 'error' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export interface Notification {
  id: string;
  message: string;
  type: ToastType;
  timestamp: number;
  read: boolean;
}

// ─────────────────────────────────────────────
// API
// ─────────────────────────────────────────────
export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data?: T;
}

export type DashboardTab =
  | 'overview'
  | 'projects'
  | 'tickets'
  | 'chat'
  | 'invoices'
  | 'meetings'
  | 'kanban'
  | 'tracker'
  | 'contracts'
  | 'skills'
  | 'careers'
  | 'cms';
