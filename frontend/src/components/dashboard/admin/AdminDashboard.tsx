import React, { useState } from 'react';
import { useAppStore } from '../../../store/appStore';
import { useDashboardStore } from '../../../store/dashboardStore';
import { projectsApi } from '../../../api/projects';
import { ticketsApi } from '../../../api/tickets';
import { invoicesApi } from '../../../api/invoices';
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
  Briefcase
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const activeTab = useDashboardStore((s) => s.activeTab);
  const addToast = useAppStore((s) => s.addToast);

  const projects = useAppStore((s) => s.projects) ?? [];
  const tickets = useAppStore((s) => s.tickets) ?? [];
  const invoices = useAppStore((s) => s.invoices) ?? [];
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

  // Overview Tab
  if (activeTab === 'overview') {
    return (
      <div className="dash-overview">
        <div className="dash-card-grid">
          <div className="dash-card">
            <div className="dc-num">{projects.length}</div>
            <div className="dc-label">Total projects</div>
          </div>
          <div className="dash-card">
            <div className="dc-num">{tickets.filter((t) => t.status === 'Active').length}</div>
            <div className="dc-label">Open tickets</div>
          </div>
          <div className="dash-card">
            <div className="dc-num">${invoices.reduce((sum, item) => sum + item.amount, 0)}</div>
            <div className="dc-label">Total invoicing</div>
          </div>
          <div className="dash-card">
            <div className="dc-num">{applications.length}</div>
            <div className="dc-label">Job applications</div>
          </div>
        </div>

        <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
            <h4 style={{ fontWeight: 800, marginBottom: '1rem' }}>Active systems</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Uptime</span>
                <span style={{ color: 'green' }}>99.98%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>DB Connections</span>
                <span>Active</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>SSE Sync Engine</span>
                <span style={{ color: 'var(--primary)' }}>Real-Time Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Projects Tab
  if (activeTab === 'projects') {
    return (
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>Manage all projects</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text3)' }}>
              <th style={{ padding: '0.75rem 0.5rem' }}>Project ID</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Name</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Client</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Developer</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Progress</th>
              <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
              <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => {
              const currentDev = devAssignment[p.id] ?? p.assignedTo;
              const currentStatus = projectStatus[p.id] ?? p.status;
              const currentProgress = projectProgress[p.id] ?? p.progress;

              return (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>{p.id}</td>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 700 }}>{p.name}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>{p.client}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <input
                      type="text"
                      value={currentDev}
                      onChange={(e) => setDevAssignment({ ...devAssignment, [p.id]: e.target.value })}
                      style={{ padding: '0.25rem 0.5rem', background: 'var(--bg2)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.8rem', width: '120px' }}
                    />
                  </td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={currentProgress}
                        onChange={(e) => setProjectProgress({ ...projectProgress, [p.id]: parseInt(e.target.value) })}
                        style={{ width: '80px' }}
                      />
                      <span>{currentProgress}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <select
                      value={currentStatus}
                      onChange={(e) => setProjectStatus({ ...projectStatus, [p.id]: e.target.value })}
                      style={{ padding: '0.25rem 0.5rem', background: 'var(--bg2)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '0.8rem' }}
                    >
                      <option>Proposed</option>
                      <option>In progress</option>
                      <option>Review</option>
                      <option>Done</option>
                    </select>
                  </td>
                  <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                    <button onClick={() => handleUpdateProject(p.id)} className="btn btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                      Save changes
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
              admin@rdktech.com
            </div>
            <span style={{ fontSize: '0.725rem', color: '#10b981' }}>● Dispatches Active</span>
          </div>
        </div>

        {/* Email Notification & Dispatch Banner */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.25)', borderRadius: '12px', padding: '0.85rem 1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Mail size={18} color="var(--primary)" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>
              <strong>Configured Email Alerts:</strong> Inbound client tickets and responses are synced and mirrored to <code style={{ color: 'var(--primary)', fontWeight: 700 }}>admin@rdktech.com</code>.
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
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>Invoices Ledger</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text3)' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>Invoice ID</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Client</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Amount</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 700 }}>{inv.id}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>{inv.client}</td>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>${inv.amount}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <Badge status={inv.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>Generate invoice</h3>
          <form onSubmit={handleCreateInvoice} className="contact-form" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.2rem' }}>
            <div className="form-group">
              <label>Client email</label>
              <input type="email" value={invForm.client} onChange={(e) => setInvForm({ ...invForm, client: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Project name</label>
              <input type="text" value={invForm.project} onChange={(e) => setInvForm({ ...invForm, project: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Amount ($)</label>
              <input type="number" value={invForm.amount} onChange={(e) => setInvForm({ ...invForm, amount: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Line Items (comma separated)</label>
              <textarea placeholder="e.g. Design mockups, API Integration" value={invForm.items} onChange={(e) => setInvForm({ ...invForm, items: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>Dispatch Invoice</button>
          </form>
        </div>
      </div>
    );
  }

  // Careers (Applications) Tab
  if (activeTab === 'careers') {
    return (
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>Review Job Applicants</h3>
        {applications.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text3)' }}>No applicants yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text3)' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>Candidate</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Email</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Role applied</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Resume</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 700 }}>{app.name}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>{app.email}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>{app.position}</td>
                  <td style={{ padding: '1rem 0.5rem', color: 'var(--primary)' }}>📄 {app.resume}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <Badge status={app.status} />
                  </td>
                  <td style={{ padding: '1rem 0.5rem', textAlign: 'right', display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                    <button onClick={() => handleUpdateAppStatus(app.id, 'Interviewing')} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}>Interview</button>
                    <button onClick={() => handleUpdateAppStatus(app.id, 'Hired')} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', background: '#10B981', border: 'none' }}>Hire</button>
                    <button onClick={() => handleUpdateAppStatus(app.id, 'Rejected')} className="btn btn-ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', color: '#EF4444' }}>Reject</button>
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
        {/* Services CMS */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
          <h4 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Services Configuration</h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text3)', marginBottom: '1.5rem' }}>Add or delete core services cards on landing page.</p>
          <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {services.map((s) => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg2)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                <span>{s.icon} {s.name}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>{s.delivery}</span>
              </div>
            ))}
          </div>
          <button onClick={() => handleSaveCMS('services', services)} className="btn btn-primary" style={{ width: '100%' }}>Publish Services</button>
        </div>

        {/* Portfolio CMS */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
          <h4 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Portfolio Case Studies</h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text3)', marginBottom: '1.5rem' }}>Manage projects displayed in the public showcase.</p>
          <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {portfolio.map((p) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg2)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                <span>{p.icon} {p.title}</span>
                <Badge status={p.cat} />
              </div>
            ))}
          </div>
          <button onClick={() => handleSaveCMS('portfolio', portfolio)} className="btn btn-primary" style={{ width: '100%' }}>Publish Portfolio</button>
        </div>

        {/* Careers CMS */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
          <h4 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Jobs Configuration</h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text3)', marginBottom: '1.5rem' }}>Edit live remote job descriptions.</p>
          <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {careers.map((c) => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg2)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                <span>{c.title}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{c.salary}</span>
              </div>
            ))}
          </div>
          <button onClick={() => handleSaveCMS('careers', careers)} className="btn btn-primary" style={{ width: '100%' }}>Publish Careers</button>
        </div>
      </div>
    );
  }

  return null;
};
export default AdminDashboard;
