import React, { useState } from 'react';
import { Ticket, Bell, Paperclip, Users, Send, CheckCircle2, LogIn, Download, ArrowRight, X } from 'lucide-react';
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
  const [clientEmail, setClientEmail] = useState('');
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

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle || !clientEmail) return;
    setIsSubmitting(true);

    try {
      const res = await ticketsApi.create({
        client: clientEmail,
        clientName: clientEmail.split('@')[0],
        title: ticketTitle,
        priority: 'High',
        category: 'Web Engineering',
        description: ticketTitle
      });

      if (res.success) {
        // Find or create local representation for download/display
        const newTicketObj: TicketType = {
          id: res.data?.id || `WEB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          title: ticketTitle,
          client: clientEmail,
          category: 'Web Engineering',
          priority: 'High',
          status: 'Active',
          assignedTo: 'engineering@rdktech.com',
          description: ticketTitle,
          messages: [
            {
              sender: 'client',
              senderName: clientEmail.split('@')[0],
              text: ticketTitle,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]
        };

        setCreatedTicket(newTicketObj);
        setShowSuccessModal(true);
        setTicketTitle('');
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
      <div className="section-inner" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem', alignItems: 'start' }}>
        
        {/* Left Column: Info & Ticket Form */}
        <div>
          <h2 className="section-title">Track Support & Engineering Tickets</h2>
          <p className="section-sub" style={{ marginBottom: '2rem' }}>
            All client accounts include access to dedicated ticketing with real-time SSE notifications, SLA tracking, developer assignment, and instant transcript downloads.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {[
              { icon: <Ticket size={18} color="var(--primary)" />, title: 'Automated Ticket ID & Real-Time Sync' },
              { icon: <Bell size={18} color="var(--primary)" />, title: 'Instant Email & Webhook Status Notifications' },
              { icon: <Paperclip size={18} color="var(--primary)" />, title: 'Downloadable Communication Transcripts & Logs' },
              { icon: <Users size={18} color="var(--primary)" />, title: 'Dedicated Lead Engineer Assignment in Portal' },
            ].map((feat, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.2)', borderRadius: '10px', flexShrink: 0 }}>
                  {feat.icon}
                </div>
                <span style={{ fontSize: '0.92rem', color: 'var(--text)', fontWeight: 600 }}>{feat.title}</span>
              </div>
            ))}
          </div>

          {/* Interactive Ticket Form */}
          <div style={{ marginTop: '2.5rem', background: 'var(--card-glass)', border: '1px solid var(--border)', borderRadius: '18px', padding: '1.75rem', backdropFilter: 'blur(12px)', boxShadow: 'var(--card-shadow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem' }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Create Support / Engineering Ticket
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>Synced with Admin Portal</span>
            </div>

            <form onSubmit={handleSubmitTicket} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <input
                type="email"
                required
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="Your email address (e.g. client@company.com)..."
                style={{ padding: '0.8rem 1rem', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '10px', fontSize: '0.875rem' }}
              />
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <input
                  type="text"
                  required
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  placeholder="Ticket title / issue description..."
                  style={{ flex: 1, padding: '0.8rem 1rem', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '10px', fontSize: '0.875rem' }}
                />
                <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.875rem', padding: '0.8rem 1.35rem' }}>
                  {isSubmitting ? 'Submitting...' : 'Submit Ticket'} <Send size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Live Ticket Feed */}
        <div>
          <div className="ticket-demo" style={{ background: 'var(--card-glass)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.75rem', backdropFilter: 'blur(12px)', boxShadow: 'var(--card-shadow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.775rem', color: 'var(--text2)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Real-Time Database Ticket Feed
              </div>
              <button onClick={() => setAuthModalOpen(true)} className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem' }}>
                Client Portal Login →
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '420px', overflowY: 'auto' }}>
              {displayedTickets.length === 0 ? (
                <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', background: 'var(--bg2)', borderRadius: '14px', border: '1px solid var(--border)' }}>
                  <div style={{ color: 'var(--text)', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.35rem' }}>No Active Tickets in Queue</div>
                  <div style={{ color: 'var(--text2)', fontSize: '0.8rem' }}>Create a support ticket to see real-time updates streamed directly here.</div>
                </div>
              ) : (
                displayedTickets.map((t) => (
                  <div key={t.id} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.2rem', transition: 'border-color 0.2s ease' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>{t.title}</div>
                      <span style={{ background: 'rgba(124, 58, 237, 0.12)', border: '1px solid rgba(124, 58, 237, 0.25)', color: 'var(--primary)', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.725rem', padding: '0.25rem 0.65rem', borderRadius: '6px', fontWeight: 800 }}>
                        {t.id}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8rem', color: 'var(--text2)', flexWrap: 'wrap' }}>
                      <span>Cat: <strong style={{ color: 'var(--text)' }}>{t.cat}</strong></span>
                      <span>Status: <strong style={{ color: '#10b981' }}>● {t.status}</strong></span>
                      <span>Assignee: <strong style={{ color: 'var(--text)' }}>{t.assigned}</strong></span>
                    </div>
                  </div>
                ))
              )}
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
              Your ticket has been sent to our <strong>Engineering & Admin Portal</strong>. A lead engineer has been notified and will review your request.
            </p>

            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.35rem' }}>
                Track Live Conversation & Status:
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text3)', margin: 0, lineHeight: 1.5 }}>
                Please log in or sign up with <strong>{createdTicket.client}</strong> to chat directly with engineers, track SLA status, and access live updates.
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
                  fontWeight: 600,
                }}
              >
                <Download size={16} /> Download Initial Transcript (.txt)
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
