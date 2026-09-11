import React, { useState } from 'react';
import { Ticket, Bell, Paperclip, Users, Send, CheckCircle2 } from 'lucide-react';
import { ticketsApi } from '../../api/tickets';
import { useAppStore } from '../../store/appStore';

export const TicketSection: React.FC = () => {
  const addToast = useAppStore((s) => s.addToast);
  const storeTickets = useAppStore((s) => s.tickets);

  const [ticketTitle, setTicketTitle] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const defaultTickets = [
    { id: 'WEB-2026-0041', title: 'E-commerce Checkout Timeout', cat: 'Web Engineering', priority: 'High', status: 'Active', assigned: 'Sarah K.' },
    { id: 'APP-2026-0112', title: 'Biometrics Sync Latency Audit', cat: 'Mobile & IoT', priority: 'Medium', status: 'In Review', assigned: 'RDK Core Team' },
  ];

  const displayedTickets = storeTickets && storeTickets.length > 0
    ? storeTickets.map(t => ({
        id: t.id,
        title: t.title,
        cat: t.category,
        priority: t.priority,
        status: t.status,
        assigned: t.assignedTo || 'Unassigned'
      }))
    : defaultTickets;

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
        setTicketTitle('');
        setSubmitted(true);
        addToast('Support ticket created & synced in real-time!', 'success');
        setTimeout(() => setSubmitted(false), 4000);
      } else {
        addToast(res.message || 'Failed to submit ticket', 'error');
      }
    } catch (err: any) {
      addToast(err.message || 'An error occurred submitting ticket', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="ticket-section" id="tickets" style={{ padding: '5rem 0' }}>
      <div className="section-inner" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem', alignItems: 'start' }}>
        
        {/* Left Column: Info & Ticket Form */}
        <div>
          <h2 className="section-title">Track Support & Engineering Tickets</h2>
          <p className="section-sub" style={{ marginBottom: '2rem' }}>
            All client accounts include access to dedicated ticketing with real-time SSE notifications, SLA tracking, and developer assignment.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {[
              { icon: <Ticket size={18} color="var(--primary)" />, title: 'Automated Ticket ID & Escrow Tracking' },
              { icon: <Bell size={18} color="var(--primary)" />, title: 'Real-Time Webhook & Email Status Notifications' },
              { icon: <Paperclip size={18} color="var(--primary)" />, title: 'Secure Log Attachments & Diagnostic Dumps' },
              { icon: <Users size={18} color="var(--primary)" />, title: 'Dedicated Lead Engineer Assignment' },
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
            <div style={{ fontSize: '0.825rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Create Real-Time Support Ticket
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
            {submitted && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.85rem', marginTop: '0.85rem', fontWeight: 600 }}>
                <CheckCircle2 size={16} /> Ticket registered and persisted to real-time database!
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Ticket Feed */}
        <div>
          <div className="ticket-demo" style={{ background: 'var(--card-glass)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.75rem', backdropFilter: 'blur(12px)', boxShadow: 'var(--card-shadow)' }}>
            <div style={{ fontSize: '0.775rem', color: 'var(--text2)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1.25rem', letterSpacing: '0.06em' }}>
              Real-Time Database Ticket Feed
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '420px', overflowY: 'auto' }}>
              {displayedTickets.map((t) => (
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
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
