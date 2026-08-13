import React, { useState } from 'react';
import { Ticket, Bell, Paperclip, Users, LifeBuoy, Send, CheckCircle2 } from 'lucide-react';
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
    <section className="ticket-section" id="tickets">
      <div className="section-inner" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem', alignItems: 'start' }}>
        
        {/* Left Column: Info & Ticket Form */}
        <div>
          <div className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <LifeBuoy size={14} /> Enterprise Support Infrastructure
          </div>
          <h2 className="section-title">Track Support & Engineering Tickets</h2>
          <p className="section-sub" style={{ marginBottom: '1.75rem' }}>
            All client accounts include access to dedicated ticketing with real-time SSE notifications, SLA tracking, and developer assignment.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { icon: <Ticket size={18} color="#ea580c" />, title: 'Automated Ticket ID & Escrow Tracking' },
              { icon: <Bell size={18} color="#ea580c" />, title: 'Real-Time Webhook & Email Status Notifications' },
              { icon: <Paperclip size={18} color="#ea580c" />, title: 'Secure Log Attachments & Diagnostic Dumps' },
              { icon: <Users size={18} color="#ea580c" />, title: 'Dedicated Lead Engineer Assignment' },
            ].map((feat, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg2, #f8f9fa)', border: '1px solid var(--border, #e5e7eb)', borderRadius: '50%', flexShrink: 0 }}>
                  {feat.icon}
                </div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text, #111827)', fontWeight: 600 }}>{feat.title}</span>
              </div>
            ))}
          </div>

          {/* Interactive Ticket Form */}
          <div style={{ marginTop: '2rem', background: 'var(--card, #ffffff)', border: '1px solid var(--border, #e5e7eb)', borderRadius: '16px', padding: '1.5rem', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ fontSize: '0.825rem', fontWeight: 800, color: '#ea580c', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Create Real-Time Support Ticket
            </div>
            <form onSubmit={handleSubmitTicket} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input
                type="email"
                required
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="Your email address (e.g. client@company.com)..."
                style={{ padding: '0.75rem 1rem', background: 'var(--bg2, #f8f9fa)', border: '1px solid var(--border, #e5e7eb)', color: 'var(--text, #111827)', borderRadius: '10px', fontSize: '0.875rem' }}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  required
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  placeholder="Ticket title / issue description..."
                  style={{ flex: 1, padding: '0.75rem 1rem', background: 'var(--bg2, #f8f9fa)', border: '1px solid var(--border, #e5e7eb)', color: 'var(--text, #111827)', borderRadius: '10px', fontSize: '0.875rem' }}
                />
                <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ background: '#ea580c', borderColor: '#ea580c', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', padding: '0.75rem 1.25rem' }}>
                  {isSubmitting ? 'Submitting...' : 'Submit Ticket'} <Send size={14} />
                </button>
              </div>
            </form>
            {submitted && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#16a34a', fontSize: '0.825rem', marginTop: '0.75rem', fontWeight: 600 }}>
                <CheckCircle2 size={16} /> Ticket registered and persisted to real-time database!
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Ticket Feed */}
        <div>
          <div className="ticket-demo" style={{ background: 'var(--card, #ffffff)', border: '1px solid var(--border, #e5e7eb)', borderRadius: '20px', padding: '1.5rem', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ fontSize: '0.775rem', color: 'var(--text2, #6b7280)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1.25rem', letterSpacing: '0.05em' }}>
              Real-Time Database Ticket Feed
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '420px', overflowY: 'auto' }}>
              {displayedTickets.map((t) => (
                <div key={t.id} style={{ background: 'var(--bg2, #f8f9fa)', border: '1px solid var(--border, #e5e7eb)', borderRadius: '14px', padding: '1.15rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text, #111827)' }}>{t.title}</div>
                    <span style={{ background: 'rgba(234, 88, 12, 0.12)', color: '#ea580c', fontSize: '0.725rem', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: 800 }}>
                      {t.id}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text2, #4b5563)', flexWrap: 'wrap' }}>
                    <span>Cat: <strong style={{ color: 'var(--text, #111827)' }}>{t.cat}</strong></span>
                    <span>Status: <strong style={{ color: '#16a34a' }}>● {t.status}</strong></span>
                    <span>Assignee: <strong style={{ color: 'var(--text, #111827)' }}>{t.assigned}</strong></span>
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
