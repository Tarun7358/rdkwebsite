import React, { useState } from 'react';
import { Ticket, Bell, Paperclip, Users, Send, CheckCircle2, LogIn, Download, ArrowRight, X, Clock } from 'lucide-react';
import { ticketsApi } from '../../api/tickets';
import { useAppStore } from '../../store/appStore';
import { useDashboardStore } from '../../store/dashboardStore';
import { downloadTicketTranscript } from '../../lib/transcriptGenerator';
import type { Ticket as TicketType } from '../../types';

export const TicketSection: React.FC = () => {
  const addToast = useAppStore((s) => s.addToast);
  const storeTickets = useAppStore((s) => s.tickets);
  const setAuthModalOpen = useDashboardStore((s) => s.setAuthModalOpen);

  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Web Engineering');
  const [priority, setPriority] = useState('Medium');
  const [serverId, setServerId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<TicketType | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const displayedTickets = (storeTickets || []).map((t) => ({
    id: t.id,
    title: t.title,
    cat: t.category,
    priority: t.priority,
    status: t.status,
    assigned: t.assignedTo || 'Engineering Lead'
  }));

  const isRageCategory = ticketCategory.toLowerCase().includes('rage');

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle.trim() || !clientEmail.trim()) return;
    setIsSubmitting(true);

    try {
      const baseDesc = ticketDesc.trim() || ticketTitle.trim();
      const fullDesc = isRageCategory && serverId.trim()
        ? `[Server ID: ${serverId.trim()}] ${baseDesc}`
        : baseDesc;

      const res = await ticketsApi.create({
        client: clientEmail.trim(),
        clientName: clientEmail.split('@')[0],
        title: ticketTitle.trim(),
        priority,
        category: ticketCategory,
        description: fullDesc
      });

      if (res.success) {
        const newTicketObj: TicketType = {
          id: res.data?.id || `WEB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          title: ticketTitle.trim(),
          client: clientEmail.trim(),
          category: ticketCategory,
          priority,
          status: 'Active',
          assignedTo: 'engineering@rdktech.com',
          description: fullDesc,
          messages: [
            {
              sender: 'client',
              senderName: clientEmail.split('@')[0],
              text: fullDesc,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]
        };

        setCreatedTicket(newTicketObj);
        setShowSuccessModal(true);
        setTicketTitle('');
        setTicketDesc('');
        setServerId('');
        addToast('Support ticket dispatched directly to engineering portal!', 'success');
      } else {
        addToast(res.message || 'Failed to submit ticket', 'error');
      }
    } catch (err: any) {
      addToast(err.message || 'An error occurred submitting ticket', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenAuth = () => {
    setShowSuccessModal(false);
    setAuthModalOpen(true);
  };

  const handleDownloadNewTicket = () => {
    if (!createdTicket) return;
    downloadTicketTranscript(createdTicket);
    addToast('Downloaded ticket transcript & reference document', 'info');
  };

  return (
    <section className="ticket-section" id="tickets" style={{ padding: '5rem 0' }}>
      <div className="section-inner">
        {/* Centered Header + 4 Compact Feature Pills */}
        <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 2.75rem' }}>
          <span style={{
            display: 'inline-block',
            fontSize: '0.72rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--primary)',
            background: 'rgba(124, 58, 237, 0.1)',
            border: '1px solid rgba(124, 58, 237, 0.22)',
            padding: '0.3rem 0.85rem',
            borderRadius: '999px',
            marginBottom: '0.85rem'
          }}>
            24/7 Engineering Support Desk
          </span>
          <h2 className="section-title" style={{ marginBottom: '0.75rem' }}>Track Support &amp; Engineering Tickets</h2>
          <p className="section-sub" style={{ margin: '0 auto 1.75rem' }}>
            Dedicated ticketing with instant email confirmations, SLA tracking, engineer assignment, and downloadable transcripts.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.65rem' }}>
            {[
              { icon: <Ticket size={14} color="var(--primary)" />, text: 'Automated Ticket ID' },
              { icon: <Bell size={14} color="var(--primary)" />, text: 'Email & Discord Alerts' },
              { icon: <Paperclip size={14} color="var(--primary)" />, text: 'Downloadable Transcripts' },
              { icon: <Users size={14} color="var(--primary)" />, text: 'Lead Engineer Assigned' },
            ].map((pill, i) => (
              <div key={i} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.45rem 0.9rem',
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text)'
              }}>
                {pill.icon}
                <span>{pill.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Balanced 2-Column Workspace */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', alignItems: 'stretch' }}>
          {/* Left Card: Create Ticket Form */}
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '1.75rem',
            boxShadow: 'var(--card-shadow)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Create Support Ticket
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text3)', marginTop: '0.15rem' }}>
                    Instant sync with Engineering &amp; Email confirmation
                  </div>
                </div>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '0.25rem 0.6rem', borderRadius: '999px' }}>
                  ● Online
                </span>
              </div>

              <form onSubmit={handleSubmitTicket} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.65rem' }}>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    style={{ width: '100%', padding: '0.78rem 0.9rem', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600 }}
                  >
                    <option value="Web Engineering">Web Engineering</option>
                    <option value="Mobile & IoT">Mobile &amp; IoT</option>
                    <option value="Rage Optimiser">Rage Optimiser (Bot / Panel)</option>
                    <option value="Billing & Invoices">Billing &amp; Invoices</option>
                  </select>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    style={{ width: '100%', padding: '0.78rem 0.75rem', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600 }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                {isRageCategory && (
                  <input
                    type="text"
                    value={serverId}
                    onChange={(e) => setServerId(e.target.value)}
                    placeholder="Discord Server ID (optional)"
                    style={{ padding: '0.78rem 0.9rem', background: 'var(--bg2)', border: '1px solid rgba(124, 58, 237, 0.35)', color: 'var(--text)', borderRadius: '10px', fontSize: '0.85rem' }}
                  />
                )}

                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="Your email address (for ticket updates)..."
                  style={{ padding: '0.78rem 0.9rem', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '10px', fontSize: '0.85rem' }}
                />

                <input
                  type="text"
                  required
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  placeholder="Subject / short title..."
                  style={{ padding: '0.78rem 0.9rem', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '10px', fontSize: '0.85rem' }}
                />

                <textarea
                  value={ticketDesc}
                  onChange={(e) => setTicketDesc(e.target.value)}
                  placeholder="Describe your issue or request in detail..."
                  rows={3}
                  style={{ padding: '0.78rem 0.9rem', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '10px', fontSize: '0.85rem', resize: 'vertical' }}
                />

                <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ justifyContent: 'center', fontSize: '0.9rem', padding: '0.85rem 1.35rem', width: '100%' }}>
                  {isSubmitting ? 'Submitting...' : 'Submit Ticket'} <Send size={15} />
                </button>
              </form>
            </div>
          </div>

          {/* Right Card: Live Ticket Feed */}
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '1.75rem',
            boxShadow: 'var(--card-shadow)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text2)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Real-Time Ticket Queue
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text3)', marginTop: '0.15rem' }}>
                    {displayedTickets.length} {displayedTickets.length === 1 ? 'ticket' : 'tickets'} synced
                  </div>
                </div>
                <button onClick={() => setAuthModalOpen(true)} className="btn btn-outline" style={{ fontSize: '0.76rem', padding: '0.35rem 0.8rem', borderColor: 'rgba(124, 58, 237, 0.3)', color: 'var(--primary)' }}>
                  Client Portal →
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '330px', overflowY: 'auto' }}>
                {displayedTickets.length === 0 ? (
                  <div style={{ padding: '3rem 1.5rem', textAlign: 'center', background: 'var(--bg2)', borderRadius: '14px', border: '1px dashed rgba(124, 58, 237, 0.3)' }}>
                    <div style={{ color: 'var(--text)', fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.35rem' }}>No Active Tickets in Queue</div>
                    <div style={{ color: 'var(--text2)', fontSize: '0.82rem' }}>Submit a ticket on the left to see real-time updates streamed here.</div>
                  </div>
                ) : (
                  displayedTickets.map((t) => (
                    <div key={t.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1rem 1.15rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem', gap: '0.5rem' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.92rem', color: 'var(--text)' }}>{t.title}</div>
                        <span style={{ background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.25)', color: 'var(--primary)', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.72rem', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 800, flexShrink: 0 }}>
                          {t.id}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--text2)', flexWrap: 'wrap' }}>
                        <span>Category: <strong style={{ color: 'var(--text)' }}>{t.cat}</strong></span>
                        <span>Priority: <strong style={{ color: 'var(--primary)' }}>{t.priority}</strong></span>
                        <span>Status: <strong style={{ color: '#10b981' }}>● {t.status}</strong></span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text3)' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={14} color="var(--primary)" /> Avg. First Response: <strong style={{ color: 'var(--text)' }}>&lt; 15 mins</strong>
              </span>
              <span>rdksupport@ragefps.in</span>
            </div>
          </div>
        </div>
      </div>

      {/* Post-Submission Modal Prompt */}
      {showSuccessModal && createdTicket && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              background: 'var(--card)',
              border: '1px solid var(--primary)',
              borderRadius: '20px',
              maxWidth: '520px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 20px 50px rgba(124, 58, 237, 0.25)',
              position: 'relative',
              animation: 'fadeIn 0.25s ease',
            }}
          >
            <button
              onClick={() => setShowSuccessModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--text2)',
                cursor: 'pointer',
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', margin: 0 }}>Ticket Dispatched!</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                  Ref: #{createdTicket.id}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text2)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Your ticket has been sent to our <strong>Engineering &amp; Admin Portal</strong> and an email confirmation has been sent to <strong>{createdTicket.client}</strong>.
            </p>

            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.35rem' }}>
                Track Live Conversation &amp; Status:
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text3)', margin: 0, lineHeight: 1.5 }}>
                Log in or sign up with <strong>{createdTicket.client}</strong> to chat directly with engineers, track SLA status, and access live updates.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={handleOpenAuth}
                className="btn btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.85rem',
                  fontWeight: 700,
                  fontSize: '0.925rem',
                }}
              >
                <LogIn size={18} /> Log In to Client Portal <ArrowRight size={16} />
              </button>

              <button
                onClick={handleDownloadNewTicket}
                className="btn btn-outline"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  fontSize: '0.85rem',
                }}
              >
                <Download size={16} /> Download Ticket Transcript (.txt)
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
