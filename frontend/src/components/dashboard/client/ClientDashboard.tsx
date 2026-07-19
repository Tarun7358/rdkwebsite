import React, { useState } from 'react';
import { useAppStore } from '../../../store/appStore';
import { useAuthStore } from '../../../store/authStore';
import { useDashboardStore } from '../../../store/dashboardStore';
import { projectsApi } from '../../../api/projects';
import { ticketsApi } from '../../../api/tickets';
import { meetingsApi } from '../../../api/meetings';
import { chatApi } from '../../../api/chat';
import { Badge, ProgressBar, TicketWorkspace } from '../../ui';

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
  const [uploadProjId, setUploadProjId] = useState('');
  const [fileName, setFileName] = useState('');

  const handleRequestProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const res = await projectsApi.request({
        name: projForm.name,
        client: user.email,
        budget: projForm.budget,
        deadline: projForm.deadline,
        desc: projForm.desc,
      });
      if (res.success) {
        addToast('Project request submitted!', 'success');
        setProjForm({ name: '', budget: '', deadline: '', desc: '' });
      } else {
        addToast(res.message, 'error');
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
        addToast('Ticket created successfully!', 'success');
        setTicketForm({ title: '', priority: 'Low', category: 'Website Dev', description: '' });
      } else {
        addToast(res.message, 'error');
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
        addToast(res.message, 'error');
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
    try {
      const res = await chatApi.send({
        sender: 'in',
        senderName: user.name,
        text: txt,
      });
      if (!res.success) addToast(res.message, 'error');
    } catch (err: any) {
      addToast(err.message, 'error');
    }
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
        <div className="dash-card-grid">
          <div className="dash-card">
            <div className="dc-num">{activeProjectsCount}</div>
            <div className="dc-label">Active projects</div>
          </div>
          <div className="dash-card">
            <div className="dc-num">{openTicketsCount}</div>
            <div className="dc-label">Open tickets</div>
          </div>
          <div className="dash-card">
            <div className="dc-num">${pendingInvoiceVal}</div>
            <div className="dc-label">Pending invoices</div>
          </div>
          <div className="dash-card">
            <div className="dc-num">{chatMessages.length}</div>
            <div className="dc-label">Messages</div>
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>Your active projects</h3>
          {myProjects.length === 0 ? (
            <div style={{ padding: '2rem', background: 'var(--bg2)', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border)' }}>
              No active projects. Start by requesting a project.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {myProjects.map((p) => (
                <div key={p.id} className="proj-item" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.2rem' }}>
                  <div className="proj-top" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="proj-name" style={{ fontWeight: 700 }}>{p.name}</span>
                    <Badge status={p.status} />
                  </div>
                  <ProgressBar progress={p.progress} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text3)' }}>
                    <span>{p.progress}% complete</span>
                    <span>Deadline: {p.deadline || 'N/A'}</span>
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
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>Projects Workspace</h3>
          {myProjects.length === 0 ? (
            <div style={{ padding: '2rem', background: 'var(--bg2)', borderRadius: '12px', textAlign: 'center' }}>
              No projects found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {myProjects.map((p) => (
                <div key={p.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ fontWeight: 800, fontSize: '1.05rem' }}>{p.name}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>ID: {p.id}</span>
                    </div>
                    <Badge status={p.status} />
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text2)', marginBottom: '1rem' }}>{p.desc}</p>

                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>Progress</div>
                    <ProgressBar progress={p.progress} />
                  </div>

                  {/* Milestones */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>Milestones</div>
                      <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {p.milestones?.map((m, idx) => (
                          <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: m.completed ? 'var(--text)' : 'var(--text3)' }}>
                            <span style={{ color: m.completed ? '#10B981' : 'var(--border)' }}>{m.completed ? '✓' : '○'}</span>
                            {m.name}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>Deliverables</div>
                      {p.deliverables?.length === 0 ? (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>No files submitted yet.</div>
                      ) : (
                        <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          {p.deliverables?.map((d, idx) => (
                            <li key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>📁 {d.name} ({d.size})</span>
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
                            style={{ flex: 1, fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'var(--bg2)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '4px' }}
                          />
                          <button onClick={() => handleUploadDeliverable(p.id)} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Add</button>
                        </div>
                      ) : (
                        <button onClick={() => setUploadProjId(p.id)} className="btn btn-ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', marginTop: '0.5rem' }}>+ Upload simulated file</button>
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
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>Request new project</h3>
          <form onSubmit={handleRequestProject} className="contact-form" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.2rem' }}>
            <div className="form-group">
              <label>Project name</label>
              <input type="text" value={projForm.name} onChange={(e) => setProjForm({ ...projForm, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Budget</label>
              <input type="text" placeholder="e.g. $5,000" value={projForm.budget} onChange={(e) => setProjForm({ ...projForm, budget: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Target deadline</label>
              <input type="date" value={projForm.deadline} onChange={(e) => setProjForm({ ...projForm, deadline: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={projForm.desc} onChange={(e) => setProjForm({ ...projForm, desc: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Submit Request</button>
          </form>
        </div>
      </div>
    );
  }

  // Tickets Tab
  if (activeTab === 'tickets') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', height: 'calc(100vh - 180px)' }}>
        {/* Ticket List and Add */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Support tickets</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {myTickets.map((t) => (
              <div
                key={t.id}
                onClick={() => setActiveTicketId(t.id)}
                style={{
                  background: activeTicketId === t.id ? 'var(--bg2)' : 'var(--card)',
                  border: `1px solid ${activeTicketId === t.id ? 'var(--blue)' : 'var(--border)'}`,
                  borderRadius: '10px',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text3)' }}>{t.id}</span>
                  <Badge status={t.status} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)' }}>{t.title}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '0.25rem' }}>Priority: {t.priority}</div>
              </div>
            ))}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1rem 0' }} />

          {/* Create Ticket Form */}
          <form onSubmit={handleCreateTicket} className="contact-form" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem' }}>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.75rem' }}>New ticket</div>
            <div className="form-group" style={{ marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.7rem' }}>Title</label>
              <input type="text" placeholder="Bug summary..." value={ticketForm.title} onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })} required />
            </div>
            <div className="form-row" style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label style={{ fontSize: '0.7rem' }}>Priority</label>
                <select value={ticketForm.priority} onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label style={{ fontSize: '0.7rem' }}>Category</label>
                <select value={ticketForm.category} onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}>
                  <option>Website Dev</option>
                  <option>Mobile App</option>
                  <option>Discord Bot</option>
                  <option>AI Solution</option>
                  <option>General Support</option>
                </select>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.7rem' }}>Description</label>
              <textarea placeholder="Tell us what's wrong..." value={ticketForm.description} onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })} required style={{ height: '60px' }} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem' }}>Create Ticket</button>
          </form>
        </div>

        {/* Selected Ticket Chat Workspace */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          {selectedTicket ? (
            <TicketWorkspace ticket={selectedTicket} />
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', flexDirection: 'column', gap: '0.5rem' }}>
              <span>🎫</span>
              <span>Select a support ticket from the left panel to begin discussion.</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Chat Tab
  if (activeTab === 'chat') {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg2)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>RDK</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>RDK Customer Success</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div className="online-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
              Real-time Sync
            </div>
          </div>
        </div>

        {/* Chat History */}
        <div className="chat-body" style={{ padding: '1.5rem', height: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {chatMessages.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: '0.8rem', marginTop: '4rem' }}>
              No messages yet. Send a message to initiate support chat.
            </div>
          ) : (
            chatMessages.map((m, idx) => {
              const isMe = m.sender === 'in'; // Client is "in", employee is "out"
              return (
                <div
                  key={idx}
                  className={`msg ${isMe ? 'msg-out' : 'msg-in'}`}
                  style={{
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                    background: isMe ? 'var(--blue)' : 'var(--bg2)',
                    color: isMe ? '#fff' : 'var(--text)',
                    padding: '0.6rem 0.9rem',
                    borderRadius: '12px',
                    borderBottomRightRadius: isMe ? '4px' : '12px',
                    borderBottomLeftRadius: isMe ? '12px' : '4px',
                    fontSize: '0.82rem',
                    maxWidth: '85%',
                    border: isMe ? 'none' : '1px solid var(--border)',
                  }}
                >
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.15rem', opacity: 0.9 }}>
                    {m.senderName}
                  </div>
                  <div>{m.text}</div>
                  <div style={{ fontSize: '0.65rem', marginTop: '0.25rem', opacity: 0.7, textAlign: isMe ? 'right' : 'left' }}>
                    {m.time}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Chat Send */}
        <form onSubmit={handleSendChat} style={{ padding: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
          <input
            className="chat-input"
            type="text"
            placeholder="Type message to support desk..."
            value={chatText}
            onChange={(e) => setChatText(e.target.value)}
            style={{
              flex: 1,
              padding: '0.5rem 0.9rem',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              background: 'var(--bg2)',
              color: 'var(--text)',
              outline: 'none',
              fontSize: '0.85rem',
            }}
          />
          <button type="submit" className="send-btn" style={{ padding: '0.5rem 1.2rem', background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500 }}>
            Send
          </button>
        </form>
      </div>
    );
  }

  // Invoices Tab
  if (activeTab === 'invoices') {
    return (
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>Invoices and payments</h3>
        {myInvoices.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text3)' }}>
            No invoices generated yet.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text3)' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>Invoice ID</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Project</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Items</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Amount</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Due Date</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {myInvoices.map((inv) => (
                <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 700 }}>{inv.id}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>{inv.project}</td>
                  <td style={{ padding: '1rem 0.5rem', color: 'var(--text2)' }}>{inv.items?.join(', ') || 'N/A'}</td>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>${inv.amount}</td>
                  <td style={{ padding: '1rem 0.5rem', color: 'var(--text3)' }}>{inv.date}</td>
                  <td style={{ padding: '1rem 0.5rem' }}>
                    <Badge status={inv.status} />
                  </td>
                  <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                    {inv.status === 'Unpaid' ? (
                      <button onClick={() => openPaymentModal(inv.id)} className="btn btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                        Pay invoice
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'green' }}>✓ Completed</span>
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
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>Scheduled consultations</h3>
          {myMeetings.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text3)' }}>
              No meetings scheduled. Use the form on the right to book one.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text3)' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Meeting ID</th>
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
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 600 }}>MEET-{m.id}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>{m.type}</td>
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
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>Book consultation</h3>
          <form onSubmit={handleScheduleMeeting} className="contact-form" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.2rem' }}>
            <div className="form-group">
              <label>Meeting type</label>
              <select value={meetForm.type} onChange={(e) => setMeetForm({ ...meetForm, type: e.target.value })}>
                <option>Google Meet</option>
                <option>Zoom call</option>
                <option>Discord voice</option>
                <option>Phone call</option>
              </select>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={meetForm.date} onChange={(e) => setMeetForm({ ...meetForm, date: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Preferred time</label>
              <input type="time" value={meetForm.time} onChange={(e) => setMeetForm({ ...meetForm, time: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>Schedule</button>
          </form>
        </div>
      </div>
    );
  }

  return null;
};
export default ClientDashboard;
