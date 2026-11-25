import React, { useState } from 'react';
import { useAppStore } from '../../../store/appStore';
import { useDashboardStore } from '../../../store/dashboardStore';
import { projectsApi } from '../../../api/projects';
import { ticketsApi } from '../../../api/tickets';
import { invoicesApi } from '../../../api/invoices';
import { meetingsApi } from '../../../api/meetings';
import { cmsApi } from '../../../api/cms';
import { applicationsApi } from '../../../api/applications';
import { Badge, TicketWorkspace } from '../../ui';
import { 
  Ticket, 
  Mail, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  User, 
  AlertCircle,
  FolderKanban,
  Receipt,
  Users,
  Briefcase,
  Calendar
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const activeTab = useDashboardStore((s) => s.activeTab);
  const addToast = useAppStore((s) => s.addToast);

  const projects = useAppStore((s) => s.projects) ?? [];
  const tickets = useAppStore((s) => s.tickets) ?? [];
  const invoices = useAppStore((s) => s.invoices) ?? [];
  const meetings = useAppStore((s) => s.meetings) ?? [];
  const applications = useAppStore((s) => s.applications) ?? [];
  const services = useAppStore((s) => s.services) ?? [];
  const portfolio = useAppStore((s) => s.portfolio) ?? [];
  const careers = useAppStore((s) => s.careers) ?? [];

  // Form states
  const [invForm, setInvForm] = useState({ client: '', project: '', amount: '', items: '' });
  const [devAssignment, setDevAssignment] = useState<Record<string, string>>({});
  const [projectStatus, setProjectStatus] = useState<Record<string, string>>({});
  const [projectProgress, setProjectProgress] = useState<Record<string, number>>({});

  // Ticket console states
  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets[0]?.id || '');
  const [ticketFilter, setTicketFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [ticketSearch, setTicketSearch] = useState('');

  const handleUpdateProject = async (projectId: string) => {
    const assignedTo = devAssignment[projectId];
    const status = projectStatus[projectId];
    const progress = projectProgress[projectId];

    try {
      const res = await projectsApi.assign({
        projectId,
        assignedTo,
        status,
        progress,
      });
      if (res.success) {
        addToast('Project updated successfully!', 'success');
      } else {
        addToast(res.message, 'error');
      }
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleAssignTicket = async (ticketId: string, assignedTo: string) => {
    try {
      const res = await ticketsApi.assign(ticketId, assignedTo);
      if (res.success) {
        addToast('Ticket delegated successfully!', 'success');
      } else {
        addToast(res.message, 'error');
      }
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await invoicesApi.create({
        client: invForm.client,
        project: invForm.project,
        amount: invForm.amount,
        items: invForm.items,
      });
      if (res.success) {
        addToast('Invoice dispatched successfully!', 'success');
        setInvForm({ client: '', project: '', amount: '', items: '' });
      } else {
        addToast(res.message, 'error');
      }
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleUpdateAppStatus = async (appId: number, status: string) => {
    try {
      const res = await applicationsApi.updateStatus(appId, status);
      if (res.success) {
        addToast('Candidate status updated.', 'success');
      } else {
        addToast(res.message, 'error');
      }
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleSaveCMS = async (type: 'services' | 'portfolio' | 'careers', data: any) => {
    try {
      let res;
      if (type === 'services') res = await cmsApi.updateServices(data);
      else if (type === 'portfolio') res = await cmsApi.updatePortfolio(data);
      else res = await cmsApi.updateCareers(data);

      if (res.success) {
        addToast(`CMS ${type} configuration saved!`, 'success');
      } else {
        addToast(res.message, 'error');
      }
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const setActiveTab = useDashboardStore((s) => s.setActiveTab);

  // Overview Tab
  if (activeTab === 'overview') {
    const activeTickets = tickets.filter((t) => t.status === 'Active').length;
    const pendingMeetings = meetings.filter((m) => m.status === 'Pending').length;
    const totalRevenue = invoices.filter((i) => i.status === 'Paid').reduce((sum, item) => sum + Number(item.amount || 0), 0);

    return (
      <div className="dash-overview" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="dash-card-grid">
          <div className="dash-card" style={{ borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="dc-num">{projects.length}</div>
              <FolderKanban size={22} color="var(--primary)" />
            </div>
            <div className="dc-label">Total Projects</div>
          </div>
          <div className="dash-card" style={{ borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="dc-num">{activeTickets}</div>
              <Ticket size={22} color="var(--primary)" />
            </div>
            <div className="dc-label">Open Tickets</div>
          </div>
          <div className="dash-card" style={{ borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="dc-num">₹{totalRevenue}</div>
              <Receipt size={22} color="var(--primary)" />
            </div>
            <div className="dc-label">Collected Revenue</div>
          </div>
          <div className="dash-card" style={{ borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="dc-num">{pendingMeetings}</div>
              <Calendar size={22} color="var(--primary)" />
            </div>
            <div className="dc-label">Pending Meetings</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
            <h4 style={{ fontWeight: 800, marginBottom: '1rem', fontSize: '1.05rem', color: 'var(--text)' }}>Pending Action Queue</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.86rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', background: 'var(--bg2)', borderRadius: '10px' }}>
                <span>Active Support Tickets ({activeTickets})</span>
                <button onClick={() => setActiveTab('tickets')} className="btn btn-outline" style={{ padding: '0.28rem 0.7rem', fontSize: '0.75rem', borderColor: 'rgba(124,58,237,0.35)', color: 'var(--primary)' }}>Open Queue</button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', background: 'var(--bg2)', borderRadius: '10px' }}>
                <span>Pending Call Requests ({pendingMeetings})</span>
                <button onClick={() => setActiveTab('meetings')} className="btn btn-outline" style={{ padding: '0.28rem 0.7rem', fontSize: '0.75rem', borderColor: 'rgba(124,58,237,0.35)', color: 'var(--primary)' }}>Review</button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', background: 'var(--bg2)', borderRadius: '10px' }}>
                <span>Job Applications ({applications.length})</span>
                <button onClick={() => setActiveTab('careers')} className="btn btn-outline" style={{ padding: '0.28rem 0.7rem', fontSize: '0.75rem', borderColor: 'rgba(124,58,237,0.35)', color: 'var(--primary)' }}>View</button>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
            <h4 style={{ fontWeight: 800, marginBottom: '1rem', fontSize: '1.05rem', color: 'var(--text)' }}>Infrastructure Status</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.86rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'var(--bg2)', borderRadius: '10px' }}>
                <span>SQLite + Express API</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>Online</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'var(--bg2)', borderRadius: '10px' }}>
                <span>Real-Time SSE Sync</span>
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Connected</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: 'var(--bg2)', borderRadius: '10px' }}>
                <span>Razorpay &amp; SMTP Mailer</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>Live Mode</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const [projFilter, setProjFilter] = useState<string>('all');

  // Projects Tab
  if (activeTab === 'projects') {
    const filteredProjects = projFilter === 'all'
      ? projects
      : projects.filter((p) => (projectStatus[p.id] ?? p.status) === projFilter);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header & Filter Pills */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.15rem 1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(124, 58, 237, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FolderKanban size={18} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Projects Workspace</h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text2)' }}>{projects.length} total project{projects.length === 1 ? '' : 's'}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['all', 'Proposed', 'In progress', 'Review', 'Done'].map((f) => {
              const active = projFilter === f;
              return (
                <button
                  key={f}
                  onClick={() => setProjFilter(f)}
                  style={{
                    padding: '0.38rem 0.85rem',
                    borderRadius: '999px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: active ? '1px solid var(--primary)' : '1px solid var(--border)',
                    background: active ? 'var(--primary)' : 'var(--bg2)',
                    color: active ? '#ffffff' : 'var(--text2)',
                  }}
                >
                  {f === 'all' ? 'All' : f}
                </button>
              );
            })}
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text2)', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px' }}>
            No projects match the selected filter.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
            {filteredProjects.map((p) => {
              const currentDev = devAssignment[p.id] ?? p.assignedTo;
              const currentStatus = projectStatus[p.id] ?? p.status;
              const currentProgress = projectProgress[p.id] ?? p.progress;

              return (
                <div key={p.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '18px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Card Top */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ padding: '0.25rem 0.65rem', borderRadius: '8px', background: 'rgba(124, 58, 237, 0.1)', color: 'var(--primary)', fontFamily: 'var(--font-mono)', fontSize: '0.76rem', fontWeight: 700 }}>
                      {p.id}
                    </span>
                    <Badge status={currentStatus} />
                  </div>

                  {/* Title & Client */}
                  <div>
                    <h4 style={{ fontSize: '1.08rem', fontWeight: 800, margin: '0 0 0.25rem', color: 'var(--text)' }}>{p.name}</h4>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text2)' }}>
                      Client: <strong style={{ color: 'var(--text)' }}>{p.client}</strong>
                    </div>
                    {p.desc && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text2)', margin: '0.5rem 0 0', lineHeight: 1.45 }}>
                        {p.desc}
                      </p>
                    )}
                  </div>

                  {/* Progress Slider */}
                  <div style={{ background: 'var(--bg2)', borderRadius: '12px', padding: '0.85rem 1rem', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.45rem' }}>
                      <span style={{ color: 'var(--text2)' }}>Completion Progress</span>
                      <span style={{ color: 'var(--primary)' }}>{currentProgress}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={currentProgress}
                      onChange={(e) => setProjectProgress({ ...projectProgress, [p.id]: parseInt(e.target.value) })}
                      style={{ width: '100%', accentColor: '#7c3aed', cursor: 'pointer' }}
                    />
                  </div>

                  {/* Developer & Status Controls */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text2)', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                        Developer
                      </label>
                      <input
                        type="text"
                        value={currentDev}
                        onChange={(e) => setDevAssignment({ ...devAssignment, [p.id]: e.target.value })}
                        placeholder="dev@rdk.com"
                        style={{ width: '100%', padding: '0.5rem 0.7rem', background: 'var(--bg2)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '0.82rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text2)', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                        Status
                      </label>
                      <select
                        value={currentStatus}
                        onChange={(e) => setProjectStatus({ ...projectStatus, [p.id]: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem 0.7rem', background: 'var(--bg2)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '0.82rem' }}
                      >
                        <option>Proposed</option>
                        <option>In progress</option>
                        <option>Review</option>
                        <option>Done</option>
                      </select>
                    </div>
                  </div>

                  <button onClick={() => handleUpdateProject(p.id)} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.65rem', fontSize: '0.84rem', fontWeight: 700 }}>
                    Save Changes
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Tickets Tab - Full Support & Communication Console
  if (activeTab === 'tickets') {
    const activeTicketsCount = tickets.filter((t) => t.status === 'Active').length;
    const resolvedTicketsCount = tickets.filter((t) => t.status === 'Resolved').length;

    // Filtered list
    const filteredTickets = tickets.filter((t) => {
      const matchFilter =
        ticketFilter === 'all' ||
        (ticketFilter === 'active' && t.status === 'Active') ||
        (ticketFilter === 'resolved' && t.status === 'Resolved');

      const searchLower = ticketSearch.toLowerCase();
      const matchSearch =
        !ticketSearch ||
        t.id.toLowerCase().includes(searchLower) ||
        t.title.toLowerCase().includes(searchLower) ||
        t.client.toLowerCase().includes(searchLower) ||
        (t.category && t.category.toLowerCase().includes(searchLower));

      return matchFilter && matchSearch;
    });

    const currentTicket = tickets.find((t) => t.id === selectedTicketId) || filteredTickets[0] || tickets[0];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text2)', fontWeight: 600 }}>Total All Tickets</span>
              <Ticket size={20} color="var(--primary)" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.35rem', color: 'var(--text)' }}>
              {tickets.length}
            </div>
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text2)', fontWeight: 600 }}>Active / Open Queue</span>
              <Clock size={20} color="#f59e0b" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.35rem', color: '#f59e0b' }}>
              {activeTicketsCount}
            </div>
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text2)', fontWeight: 600 }}>Past / Resolved Archive</span>
              <CheckCircle2 size={20} color="#10b981" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.35rem', color: '#10b981' }}>
              {resolvedTicketsCount}
            </div>
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text2)', fontWeight: 600 }}>Notification Channel</span>
              <Mail size={20} color="var(--primary)" />
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '0.5rem', color: 'var(--text)' }}>
              rdksupport@ragefps.in
            </div>
            <span style={{ fontSize: '0.725rem', color: '#10b981' }}>● Dispatches Active</span>
          </div>
        </div>

        {/* Email Notification & Dispatch Banner */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.25)', borderRadius: '12px', padding: '0.85rem 1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Mail size={18} color="var(--primary)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>
              <strong>Configured Email Alerts:</strong> Inbound client tickets and responses are synced and mirrored to <code style={{ color: 'var(--primary)', fontWeight: 700 }}>rdksupport@ragefps.in</code>.
            </span>
          </div>
          <span style={{ fontSize: '0.775rem', color: 'var(--text3)', fontWeight: 600 }}>
            Transcripts available for all past & current tickets
          </span>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.4rem 0.8rem', flex: '1', maxWidth: '380px' }}>
            <Search size={16} color="var(--text3)" />
            <input
              type="text"
              placeholder="Search by ID, client email, or title..."
              value={ticketSearch}
              onChange={(e) => setTicketSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text)', outline: 'none', fontSize: '0.85rem', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['all', 'active', 'resolved'] as const).map((filterKey) => (
              <button
                key={filterKey}
                onClick={() => setTicketFilter(filterKey)}
                className={`btn ${ticketFilter === filterKey ? 'btn-primary' : 'btn-outline'}`}
                style={{
                  fontSize: '0.8rem',
                  padding: '0.45rem 0.95rem',
                  borderRadius: '8px',
                  textTransform: 'capitalize',
                  fontWeight: 600,
                }}
              >
                {filterKey === 'all' ? `All (${tickets.length})` : filterKey === 'active' ? `Active (${activeTicketsCount})` : `Past / Resolved (${resolvedTicketsCount})`}
              </button>
            ))}
          </div>
        </div>

        {/* Master-Detail Split Workspace */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(420px, 1.7fr)', gap: '1.5rem', minHeight: '560px' }}>
          {/* Left Column: Ticket List Queue */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '680px', overflowY: 'auto' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>Ticket Queue ({filteredTickets.length})</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>Click to open communication thread</span>
            </div>

            {filteredTickets.length === 0 ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text3)', background: 'var(--bg2)', borderRadius: '12px' }}>
                <Ticket size={28} style={{ opacity: 0.4, margin: '0 auto 0.5rem' }} />
                <div>No tickets match current search/filter.</div>
              </div>
            ) : (
              filteredTickets.map((t) => {
                const isSelected = (currentTicket?.id === t.id);
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    style={{
                      background: isSelected ? 'var(--bg2)' : 'transparent',
                      border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                      boxShadow: isSelected ? '0 0 14px rgba(124, 58, 237, 0.18)' : 'none',
                      borderRadius: '12px',
                      padding: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>
                        {t.id}
                      </span>
                      <Badge status={t.status} />
                    </div>

                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', marginBottom: '0.35rem' }}>
                      {t.title}
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text2)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span>Client: <strong style={{ color: 'var(--text)' }}>{t.client}</strong></span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', color: 'var(--text3)', marginTop: '0.2rem' }}>
                        <span>Priority: <strong>{t.priority}</strong></span>
                        <span>Assignee: <strong>{t.assignedTo || 'Unassigned'}</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Ticket Workspace & Communication Console */}
          <div>
            {currentTicket ? (
              <TicketWorkspace
                ticket={currentTicket}
                onStatusChange={() => {
                  // State auto updates via SSE and AppStore
                }}
              />
            ) : (
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '4rem 2rem', textAlign: 'center', color: 'var(--text3)' }}>
                Select a ticket from the queue to view messages and download transcripts.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Invoices Tab
  if (activeTab === 'invoices') {
    const paidTotal = invoices.filter((i) => i.status === 'Paid').reduce((s, i) => s + Number(i.amount || 0), 0);
    const unpaidTotal = invoices.filter((i) => i.status !== 'Paid').reduce((s, i) => s + Number(i.amount || 0), 0);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.15rem 1.25rem', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text2)', fontWeight: 600 }}>Total Invoices</div>
            <div style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--text)', marginTop: '0.25rem' }}>{invoices.length}</div>
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.15rem 1.25rem', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text2)', fontWeight: 600 }}>Paid Revenue</div>
            <div style={{ fontSize: '1.55rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>₹{paidTotal}</div>
          </div>
          <div style={{ background: 'var(--card)', border: '1px solid rgba(124, 58, 237, 0.25)', borderRadius: '14px', padding: '1.15rem 1.25rem', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700 }}>Pending Balance</div>
            <div style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>₹{unpaidTotal}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', overflowX: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <Receipt size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Invoices Ledger</h3>
            </div>
            {invoices.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text2)', background: 'var(--bg2)', borderRadius: '12px' }}>No invoices yet.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text2)' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Invoice ID</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Client</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Amount</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.9rem 0.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>{inv.id}</td>
                      <td style={{ padding: '0.9rem 0.5rem' }}>{inv.client}</td>
                      <td style={{ padding: '0.9rem 0.5rem', fontWeight: 700 }}>₹{inv.amount}</td>
                      <td style={{ padding: '0.9rem 0.5rem' }}>
                        <Badge status={inv.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem' }}>Dispatch Invoice</h3>
            <form onSubmit={handleCreateInvoice} className="contact-form">
              <div className="form-group">
                <label>Client Email</label>
                <input type="email" placeholder="client@company.com" value={invForm.client} onChange={(e) => setInvForm({ ...invForm, client: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Project Name</label>
                <input type="text" placeholder="e.g. Custom Web Portal" value={invForm.project} onChange={(e) => setInvForm({ ...invForm, project: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Amount (₹ INR)</label>
                <input type="number" placeholder="99" value={invForm.amount} onChange={(e) => setInvForm({ ...invForm, amount: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Line Items (comma separated)</label>
                <textarea placeholder="e.g. UI Design, API Integration" value={invForm.items} onChange={(e) => setInvForm({ ...invForm, items: e.target.value })} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}>Dispatch Invoice</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Careers (Applications) Tab
  if (activeTab === 'careers') {
    return (
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.15rem' }}>
          <Users size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Review Job Applicants</h3>
        </div>
        {applications.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text2)', background: 'var(--bg2)', borderRadius: '12px' }}>No applicants yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text2)' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>Candidate</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Email</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Role Applied</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Portfolio / Resume</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 700 }}>{app.name}</td>
                  <td style={{ padding: '1rem 0.5rem', color: 'var(--text2)' }}>{app.email}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>{app.position}</td>
                  <td style={{ padding: '1rem 0.5rem', color: 'var(--primary)', fontWeight: 600 }}>{app.resume}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <Badge status={app.status} />
                  </td>
                  <td style={{ padding: '1rem 0.5rem', textAlign: 'right', display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                    <button onClick={() => handleUpdateAppStatus(app.id, 'Interviewing')} className="btn btn-outline" style={{ padding: '0.3rem 0.65rem', fontSize: '0.73rem', borderColor: 'rgba(124,58,237,0.35)', color: 'var(--primary)' }}>Interview</button>
                    <button onClick={() => handleUpdateAppStatus(app.id, 'Hired')} className="btn btn-primary" style={{ padding: '0.3rem 0.65rem', fontSize: '0.73rem', background: '#10B981', border: 'none' }}>Hire</button>
                    <button onClick={() => handleUpdateAppStatus(app.id, 'Rejected')} className="btn btn-ghost" style={{ padding: '0.3rem 0.65rem', fontSize: '0.73rem', color: '#EF4444' }}>Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  const handleUpdateMeetingStatus = async (id: string | number, status: 'Confirmed' | 'Declined') => {
    try {
      const res = await meetingsApi.updateStatus(id, status);
      if (res.success) {
        addToast(`Meeting ${status.toLowerCase()}! Client email dispatched.`, 'success');
      } else {
        addToast(res.message, 'error');
      }
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  // Meetings Approval Tab
  if (activeTab === 'meetings') {
    return (
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <Calendar size={20} color="var(--primary)" />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>Consultation Requests &amp; Meetings</h3>
        </div>
        {meetings.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text3)' }}>No consultation requests yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text3)' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>ID</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Client</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Platform</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Date &amp; Time</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {meetings.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>MEET-{m.id}</td>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>{m.client}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>{m.type}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>{m.date} • {m.time}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <Badge status={m.status} />
                  </td>
                  <td style={{ padding: '1rem 0.5rem', textAlign: 'right', display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                    {m.status !== 'Confirmed' && (
                      <button
                        onClick={() => handleUpdateMeetingStatus(m.id, 'Confirmed')}
                        className="btn btn-primary"
                        style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem', background: '#10B981', border: 'none' }}
                      >
                        Approve &amp; Confirm
                      </button>
                    )}
                    {m.status !== 'Declined' && (
                      <button
                        onClick={() => handleUpdateMeetingStatus(m.id, 'Declined')}
                        className="btn btn-ghost"
                        style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem', color: '#EF4444' }}
                      >
                        Decline
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }

  // CMS Tab
  if (activeTab === 'cms') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {/* Services CMS */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <h4 style={{ fontWeight: 800, marginBottom: '0.35rem', color: 'var(--text)' }}>Services Configuration</h4>
          <p style={{ fontSize: '0.78rem', color: 'var(--text2)', marginBottom: '1.25rem' }}>Manage core service cards displayed on the landing page.</p>
          <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {services.map((s) => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg2)', padding: '0.6rem 0.75rem', borderRadius: '10px', fontSize: '0.82rem' }}>
                <span style={{ fontWeight: 600 }}>{s.icon} {s.name}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 700 }}>{s.delivery}</span>
              </div>
            ))}
          </div>
          <button onClick={() => handleSaveCMS('services', services)} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Publish Services</button>
        </div>

        {/* Portfolio CMS */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <h4 style={{ fontWeight: 800, marginBottom: '0.35rem', color: 'var(--text)' }}>Portfolio Case Studies</h4>
          <p style={{ fontSize: '0.78rem', color: 'var(--text2)', marginBottom: '1.25rem' }}>Manage projects displayed in the public showcase.</p>
          <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {portfolio.map((p) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg2)', padding: '0.6rem 0.75rem', borderRadius: '10px', fontSize: '0.82rem' }}>
                <span style={{ fontWeight: 600 }}>{p.icon} {p.title}</span>
                <Badge status={p.cat} />
              </div>
            ))}
          </div>
          <button onClick={() => handleSaveCMS('portfolio', portfolio)} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Publish Portfolio</button>
        </div>

        {/* Careers CMS */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <h4 style={{ fontWeight: 800, marginBottom: '0.35rem', color: 'var(--text)' }}>Jobs Configuration</h4>
          <p style={{ fontSize: '0.78rem', color: 'var(--text2)', marginBottom: '1.25rem' }}>Manage active open positions on the Careers section.</p>
          <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {careers.map((c) => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg2)', padding: '0.6rem 0.75rem', borderRadius: '10px', fontSize: '0.82rem' }}>
                <span style={{ fontWeight: 600 }}>{c.title}</span>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--primary)' }}>{c.salary}</span>
              </div>
            ))}
          </div>
          <button onClick={() => handleSaveCMS('careers', careers)} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Publish Careers</button>
        </div>
      </div>
    );
  }

  return null;
};
export default AdminDashboard;
