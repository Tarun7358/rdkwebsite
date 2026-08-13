import React, { useState } from 'react';
import { useAppStore } from '../../../store/appStore';
import { useAuthStore } from '../../../store/authStore';
import { useDashboardStore } from '../../../store/dashboardStore';
import { projectsApi } from '../../../api/projects';
import { ticketsApi } from '../../../api/tickets';
import { meetingsApi } from '../../../api/meetings';
import { chatApi } from '../../../api/chat';
import { Badge, ProgressBar, TicketWorkspace } from '../../ui';
import { analyzeProjectRequirement } from '../../../lib/aiRequirementEngine';
import { 
  Send, 
  Folder, 
  CheckCircle2, 
  Circle, 
  FileText, 
  Plus, 
  Ticket, 
  CreditCard, 
  MessageSquare, 
  Bot, 
  Check 
} from 'lucide-react';


export const ClientDashboard: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const activeTab = useDashboardStore((s) => s.activeTab);
  const activeTicketId = useDashboardStore((s) => s.activeTicketId);
  const setActiveTicketId = useDashboardStore((s) => s.setActiveTicketId);
  const openPaymentModal = useDashboardStore((s) => s.openPaymentModal);
  const addToast = useAppStore((s) => s.addToast);

  const projects = useAppStore((s) => s.projects) ?? [];
  const tickets = useAppStore((s) => s.tickets) ?? [];
  const invoices = useAppStore((s) => s.invoices) ?? [];
  const meetings = useAppStore((s) => s.meetings) ?? [];
  const chatMessages = useAppStore((s) => s.chatMessages) ?? [];

  // Filter client data
  const myProjects = user ? projects.filter((p) => p.client === user.email) : [];
  const myTickets = user ? tickets.filter((t) => t.client === user.email) : [];
  const myInvoices = user ? invoices.filter((i) => i.client === user.email) : [];
  const myMeetings = user ? meetings.filter((m) => m.client === user.email) : [];

  // Form states
  const [projForm, setProjForm] = useState({ name: '', budget: '', deadline: '', desc: '' });
  const [ticketForm, setTicketForm] = useState({ title: '', priority: 'Low', category: 'Website Dev', description: '' });
  const [meetForm, setMeetForm] = useState({ type: 'Google Meet', date: '', time: '' });
  const [chatText, setChatText] = useState('');
  const [isSubmittingChat, setIsSubmittingChat] = useState(false);
  const [uploadProjId, setUploadProjId] = useState('');
  const [fileName, setFileName] = useState('');

  const handleRequestProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const res = await projectsApi.request({
        name: projForm.name,
        client: user.name,
        budget: projForm.budget,
        deadline: projForm.deadline,
        desc: `[Email: ${user.email}] ${projForm.desc}`,
      });
      if (res.success) {
        addToast('Project request submitted cleanly!', 'success');
        setProjForm({ name: '', budget: '', deadline: '', desc: '' });
      } else {
        addToast(res.message || 'Failed to request project', 'error');
      }
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const res = await ticketsApi.create({
        client: user.email,
        clientName: user.name,
        title: ticketForm.title,
        priority: ticketForm.priority,
        category: ticketForm.category,
        description: ticketForm.description,
      });
      if (res.success) {
        addToast('Ticket created and synced cleanly!', 'success');
        setTicketForm({ title: '', priority: 'Low', category: 'Website Dev', description: '' });
      } else {
        addToast(res.message || 'Failed to create ticket', 'error');
      }
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const res = await meetingsApi.schedule({
        client: user.email,
        type: meetForm.type,
        date: meetForm.date,
        time: meetForm.time,
      });
      if (res.success) {
        addToast('Meeting scheduled!', 'success');
        setMeetForm({ type: 'Google Meet', date: '', time: '' });
      } else {
        addToast(res.message || 'Failed to schedule meeting', 'error');
      }
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatText.trim() || !user) return;
    const txt = chatText.trim();
    setChatText('');
    setIsSubmittingChat(true);

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const localMsg = { sender: 'in' as const, senderName: user.name, text: txt, time: timeStr };
    const currentMsgs = useAppStore.getState().chatMessages ?? [];
    useAppStore.getState().setState({ chatMessages: [...currentMsgs, localMsg] });

    try {
      await chatApi.send({
        sender: 'in',
        senderName: user.name,
        text: txt,
      });
    } catch (err: any) {
      console.warn('Backend chat send warning:', err);
    } finally {
      setIsSubmittingChat(false);
    }

    // Trigger AI requirement analysis response
    setTimeout(() => {
      const aiResult = analyzeProjectRequirement(txt, user.name);
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const aiMsg = { sender: 'out' as const, senderName: 'RDK AI Assistant', text: aiResult.replyText, time: replyTime };

      const updatedMsgs = useAppStore.getState().chatMessages ?? [];
      useAppStore.getState().setState({ chatMessages: [...updatedMsgs, aiMsg] });

      if (aiResult.projectCreated) {
        const { id, name, budget, deadline } = aiResult.projectCreated;
        const currentProjects = useAppStore.getState().projects ?? [];
        if (!currentProjects.some((p) => p.name === name)) {
          const newProj = {
            id,
            name,
            client: user.email,
            assignedTo: 'engineering@rdk.com',
            status: 'Proposed' as const,
            progress: 10,
            desc: `Automated AI Requirement Intake for ${user.name}`,
            milestones: [
              { name: 'AI Scope Analysis & Intake', completed: true },
              { name: 'Architecture Review & Budget Approval', completed: false },
              { name: 'Sprint 1 Core Build', completed: false },
            ],
            tasks: [{ id: 1, title: 'Scope Verification with Engineering', status: 'To Do' as const }],
            deliverables: [],
            budget,
            deadline,
          };
          useAppStore.getState().setState({ projects: [newProj, ...currentProjects] });
        }
      }
    }, 600);
  };

  const handleUploadDeliverable = async (projectId: string) => {
    if (!fileName.trim()) return;
    try {
      const res = await projectsApi.submitDeliverable(projectId, fileName.trim(), '1.2 MB');
      if (res.success) {
        addToast('File deliverable registered!', 'success');
        setFileName('');
        setUploadProjId('');
      } else {
        addToast(res.message, 'error');
      }
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const selectedTicket = tickets.find((t) => t.id === activeTicketId);

  // Overview Tab
  if (activeTab === 'overview') {
    const activeProjectsCount = myProjects.filter((p) => p.status !== 'Done').length;
    const openTicketsCount = myTickets.filter((t) => t.status === 'Active').length;
    const pendingInvoiceVal = myInvoices
      .filter((i) => i.status === 'Unpaid')
      .reduce((sum, current) => sum + current.amount, 0);

    return (
      <div className="dash-overview">
        <div className="dash-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
          <div className="dash-card" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div className="dc-num" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)' }}>{activeProjectsCount}</div>
              <Folder size={24} color="#ea580c" />
            </div>
            <div className="dc-label" style={{ fontSize: '0.85rem', color: 'var(--text2)', fontWeight: 600 }}>Active Projects</div>
          </div>

          <div className="dash-card" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div className="dc-num" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)' }}>{openTicketsCount}</div>
              <Ticket size={24} color="#ea580c" />
            </div>
            <div className="dc-label" style={{ fontSize: '0.85rem', color: 'var(--text2)', fontWeight: 600 }}>Open Support Tickets</div>
          </div>

          <div className="dash-card" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div className="dc-num" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)' }}>${pendingInvoiceVal}</div>
              <CreditCard size={24} color="#ea580c" />
            </div>
            <div className="dc-label" style={{ fontSize: '0.85rem', color: 'var(--text2)', fontWeight: 600 }}>Pending Invoices</div>
          </div>

          <div className="dash-card" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div className="dc-num" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)' }}>{chatMessages.length}</div>
              <MessageSquare size={24} color="#ea580c" />
            </div>
            <div className="dc-label" style={{ fontSize: '0.85rem', color: 'var(--text2)', fontWeight: 600 }}>Message Threads</div>
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text)' }}>Your Active Projects</h3>
          {myProjects.length === 0 ? (
            <div style={{ padding: '2.5rem', background: 'var(--bg2)', borderRadius: '16px', textAlign: 'center', border: '1px solid var(--border)', color: 'var(--text2)' }}>
              No active projects found. Submit a request using the Projects tab to initiate sprint development.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {myProjects.map((p) => (
                <div key={p.id} className="proj-item" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.25rem' }}>
                  <div className="proj-top" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
                    <span className="proj-name" style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text)' }}>{p.name}</span>
                    <Badge status={p.status} />
                  </div>
                  <ProgressBar progress={p.progress} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text2)', marginTop: '0.5rem', fontWeight: 600 }}>
                    <span>{p.progress}% Complete</span>
                    <span>Deadline: {p.deadline || 'Flexible'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Projects Tab
  if (activeTab === 'projects') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text)' }}>Projects Workspace</h3>
          {myProjects.length === 0 ? (
            <div style={{ padding: '2.5rem', background: 'var(--bg2)', borderRadius: '16px', textAlign: 'center', border: '1px solid var(--border)', color: 'var(--text2)' }}>
              No projects registered for this account. Request a new scope on the right.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {myProjects.map((p) => (
                <div key={p.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text)' }}>{p.name}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text3)', fontWeight: 600 }}>ID: {p.id}</span>
                    </div>
                    <Badge status={p.status} />
                  </div>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text2)', marginBottom: '1rem', lineHeight: '1.5' }}>{p.desc}</p>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text)' }}>Sprint Progress</div>
                    <ProgressBar progress={p.progress} />
                  </div>

                  {/* Milestones & Deliverables */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text)' }}>Milestones</div>
                      <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.825rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {p.milestones?.map((m, idx) => (
                          <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: m.completed ? 'var(--text)' : 'var(--text3)', fontWeight: m.completed ? 600 : 400 }}>
                            {m.completed ? <CheckCircle2 size={16} color="#16a34a" /> : <Circle size={16} color="var(--border)" />}
                            {m.name}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text)' }}>Deliverables</div>
                      {p.deliverables?.length === 0 ? (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>No files uploaded yet.</div>
                      ) : (
                        <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.825rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {p.deliverables?.map((d, idx) => (
                            <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                                <FileText size={14} color="#ea580c" /> {d.name} ({d.size})
                              </span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>{d.date}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {uploadProjId === p.id ? (
                        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                          <input
                            type="text"
                            placeholder="Enter deliverable file name..."
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            style={{ flex: 1, fontSize: '0.8rem', padding: '0.4rem 0.6rem', background: 'var(--bg2)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '8px' }}
                          />
                          <button onClick={() => handleUploadDeliverable(p.id)} className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', background: '#ea580c', borderColor: '#ea580c' }}>Add</button>
                        </div>
                      ) : (
                        <button onClick={() => setUploadProjId(p.id)} className="btn btn-ghost" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#ea580c' }}>
                          <Plus size={14} /> Upload simulated file
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Request Project Form */}
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text)' }}>Request New Scope</h3>
          <form onSubmit={handleRequestProject} className="contact-form" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
            <div className="form-group">
              <label>Project Title *</label>
              <input type="text" placeholder="E-commerce Native App..." value={projForm.name} onChange={(e) => setProjForm({ ...projForm, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Budget Estimate</label>
              <input type="text" placeholder="e.g. $5,000" value={projForm.budget} onChange={(e) => setProjForm({ ...projForm, budget: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Target Milestone Date</label>
              <input type="date" value={projForm.deadline} onChange={(e) => setProjForm({ ...projForm, deadline: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Technical Specifications</label>
              <textarea placeholder="Describe required features, framework preferences..." value={projForm.desc} onChange={(e) => setProjForm({ ...projForm, desc: e.target.value })} required style={{ minHeight: '100px' }} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', background: '#ea580c', borderColor: '#ea580c', fontWeight: 700, padding: '0.7rem' }}>
              Submit Scope Request
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Tickets Tab
  if (activeTab === 'tickets') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', minHeight: 'calc(100vh - 200px)' }}>
        {/* Ticket List and Add */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>Support Tickets</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {myTickets.length === 0 ? (
              <div style={{ padding: '1.5rem', background: 'var(--bg2)', borderRadius: '12px', textAlign: 'center', fontSize: '0.825rem', color: 'var(--text2)', border: '1px solid var(--border)' }}>
                No active tickets registered. Use the form below to initiate a support ticket.
              </div>
            ) : (
              myTickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setActiveTicketId(t.id)}
                  style={{
                    background: activeTicketId === t.id ? 'var(--bg2)' : 'var(--card)',
                    border: `1px solid ${activeTicketId === t.id ? '#ea580c' : 'var(--border)'}`,
                    borderRadius: '12px',
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 800, color: '#ea580c' }}>{t.id}</span>
                    <Badge status={t.status} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text)' }}>{t.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '0.35rem', fontWeight: 600 }}>
                    Priority: {t.priority} · Category: {t.category}
                  </div>
                </div>
              ))
            )}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.5rem 0' }} />

          {/* Create Ticket Form */}
          <form onSubmit={handleCreateTicket} className="contact-form" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.25rem' }}>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.85rem', color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Create New Support Ticket
            </div>
            <div className="form-group" style={{ marginBottom: '0.6rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Ticket Title *</label>
              <input type="text" placeholder="Issue title..." value={ticketForm.title} onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })} required />
            </div>
            <div className="form-row" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Priority</label>
                <select value={ticketForm.priority} onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Category</label>
                <select value={ticketForm.category} onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}>
                  <option>Website Dev</option>
                  <option>Mobile App</option>
                  <option>Discord Bot</option>
                  <option>AI Solution</option>
                  <option>General Support</option>
                </select>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '0.85rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Diagnostic Details *</label>
              <textarea placeholder="Detailed breakdown of the issue or feature request..." value={ticketForm.description} onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })} required style={{ height: '70px' }} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.55rem', fontSize: '0.85rem', background: '#ea580c', borderColor: '#ea580c', fontWeight: 700 }}>
              Create Ticket
            </button>
          </form>
        </div>

        {/* Selected Ticket Chat Workspace */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          {selectedTicket ? (
            <TicketWorkspace ticket={selectedTicket} />
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                <Ticket size={24} color="#ea580c" />
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Select a support ticket from the left panel to open the real-time discussion workspace.</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Chat Tab (Messages)
  if (activeTab === 'chat') {
    const displayedMessages = chatMessages.length > 0 ? chatMessages : [
      { sender: 'out', senderName: 'RDK Customer Success', text: 'Hello! Welcome to the RDK Support Workspace. How can our engineering team assist you today?', time: 'Just now' }
    ];

    return (
      <div style={{ maxWidth: '650px', margin: '0 auto', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ padding: '1.15rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#ea580c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
              <Bot size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text)' }}>RDK Customer Success Desk</div>
              <div style={{ fontSize: '0.75rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}>
                <div className="online-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }}></div>
                Real-Time Database Stream
              </div>
            </div>
          </div>
        </div>

        {/* Chat History */}
        <div className="chat-body" style={{ padding: '1.5rem', height: '360px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem', background: 'var(--card)' }}>
          {displayedMessages.map((m, idx) => {
            const isMe = m.sender === 'in'; // Client is "in"
            return (
              <div
                key={idx}
                className={`msg ${isMe ? 'msg-out' : 'msg-in'}`}
                style={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  background: isMe ? '#ea580c' : 'var(--bg2)',
                  color: isMe ? '#ffffff' : 'var(--text)',
                  padding: '0.7rem 1rem',
                  borderRadius: '14px',
                  borderBottomRightRadius: isMe ? '2px' : '14px',
                  borderBottomLeftRadius: isMe ? '14px' : '2px',
                  fontSize: '0.875rem',
                  maxWidth: '82%',
                  border: isMe ? 'none' : '1px solid var(--border)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{ fontSize: '0.725rem', fontWeight: 800, marginBottom: '0.2rem', color: isMe ? 'rgba(255,255,255,0.9)' : '#ea580c' }}>
                  {m.senderName}
                </div>
                <div>{m.text}</div>
                <div style={{ fontSize: '0.675rem', marginTop: '0.3rem', opacity: 0.7, textAlign: isMe ? 'right' : 'left' }}>
                  {m.time}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Requirement Scoping Prompts */}
        <div className="no-scrollbar" style={{ padding: '0.65rem 1rem', borderTop: '1px solid var(--border)', background: 'var(--bg2)', display: 'flex', gap: '0.5rem', overflowX: 'auto', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
          {[
            '📋 Get Project Requirement Estimate',
            '🛒 Need E-Commerce Website with Auth & Payments',
            '📱 Need Mobile App with Real-time DB',
            '🤖 Need AI & Automation System'
          ].map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setChatText(prompt);
              }}
              style={{
                whiteSpace: 'nowrap',
                background: 'var(--card)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                padding: '0.4rem 0.85rem',
                borderRadius: '16px',
                fontSize: '0.775rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                flexShrink: 0
              }}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Send Form */}
        <form onSubmit={handleSendChat} style={{ padding: '0.85rem 1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem', background: 'var(--bg2)' }}>
          <input
            className="chat-input"
            type="text"
            placeholder="Type message to support desk..."
            value={chatText}
            onChange={(e) => setChatText(e.target.value)}
            style={{
              flex: 1,
              padding: '0.65rem 1rem',
              border: '1px solid var(--border)',
              borderRadius: '24px',
              background: 'var(--card)',
              color: 'var(--text)',
              outline: 'none',
              fontSize: '0.875rem',
            }}
          />
          <button type="submit" disabled={isSubmittingChat} className="send-btn" style={{ padding: '0.65rem 1.25rem', background: '#ea580c', color: '#fff', border: 'none', borderRadius: '24px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {isSubmittingChat ? 'Sending...' : 'Send'} <Send size={14} />
          </button>
        </form>
      </div>
    );
  }

  // Invoices Tab
  if (activeTab === 'invoices') {
    return (
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text)' }}>Invoices & Payments</h3>
        {myInvoices.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text2)', background: 'var(--bg2)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            No pending or active invoices for this account.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text2)' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>Invoice ID</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Project</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Scope Items</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Amount</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Due Date</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {myInvoices.map((inv) => (
                <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 800, color: '#ea580c' }}>{inv.id}</td>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 700 }}>{inv.project}</td>
                  <td style={{ padding: '1rem 0.5rem', color: 'var(--text2)' }}>{inv.items?.join(', ') || 'N/A'}</td>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 700, color: 'var(--text)' }}>${inv.amount}</td>
                  <td style={{ padding: '1rem 0.5rem', color: 'var(--text3)' }}>{inv.date}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <Badge status={inv.status} />
                  </td>
                  <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                    {inv.status === 'Unpaid' ? (
                      <button onClick={() => openPaymentModal(inv.id)} className="btn btn-primary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', background: '#ea580c', borderColor: '#ea580c', fontWeight: 700 }}>
                        Pay Invoice
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Check size={16} /> Paid & Verified
                      </span>
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

  // Meetings Tab
  if (activeTab === 'meetings') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text)' }}>Scheduled Consultations</h3>
          {myMeetings.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text2)', background: 'var(--bg2)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              No meetings scheduled yet. Use the booking panel on the right to set up a video consultation.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text2)' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>ID</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Platform</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Date</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Time</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Duration</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {myMeetings.map((m) => (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 700, color: '#ea580c' }}>MEET-{m.id}</td>
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>{m.type}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>{m.date}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>{m.time}</td>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--text2)' }}>{m.duration}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <Badge status={m.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text)' }}>Book Architecture Session</h3>
          <form onSubmit={handleScheduleMeeting} className="contact-form" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
            <div className="form-group">
              <label>Meeting Platform</label>
              <select value={meetForm.type} onChange={(e) => setMeetForm({ ...meetForm, type: e.target.value })}>
                <option>Google Meet</option>
                <option>Zoom Call</option>
                <option>Discord Voice</option>
                <option>Phone Call</option>
              </select>
            </div>
            <div className="form-group">
              <label>Target Date</label>
              <input type="date" value={meetForm.date} onChange={(e) => setMeetForm({ ...meetForm, date: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Preferred Time Slot</label>
              <input type="time" value={meetForm.time} onChange={(e) => setMeetForm({ ...meetForm, time: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', background: '#ea580c', borderColor: '#ea580c', padding: '0.7rem', fontWeight: 700 }}>
              Schedule Session
            </button>
          </form>
        </div>
      </div>
    );
  }

  return null;
};
export default ClientDashboard;
