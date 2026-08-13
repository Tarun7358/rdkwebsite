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
        addToast('Ticket created & synchronized in real-time!', 'success');
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
      <div className="section-inner">
        <div>
          <div className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <LifeBuoy size={14} /> Enterprise Support Infrastructure
          </div>
          <h2 className="section-title">Track Support & Engineering Tickets</h2>
          <p className="section-sub">
            All client accounts include access to dedicated ticketing with real-time SSE notifications, SLA tracking, and developer assignment.
          </p>

          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { icon: <Ticket size={18} color="#ea580c" />, title: 'Automated Ticket ID & Escrow Tracking' },
              { icon: <Bell size={18} color="#ea580c" />, title: 'Real-Time Webhook & Email Status Notifications' },
              { icon: <Paperclip size={18} color="#ea580c" />, title: 'Secure Log Attachments & Diagnostic Dumps' },
              { icon: <Users size={18} color="#ea580c" />, title: 'Dedicated Lead Engineer Assignment' },
            ].map((feat, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface, #1f2937)', border: '1px solid var(--border, #374151)', borderRadius: '50%', flexShrink: 0 }}>
                  {feat.icon}
                </div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text, #ffffff)', fontWeight: 600 }}>{feat.title}</span>
              </div>
            ))}
          </div>

          {/* Interactive Ticket Form */}
          <div style={{ marginTop: '2rem', background: 'var(--card, #111827)', border: '1px solid var(--border, #374151)', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ea580c', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              Create Real-Time Support Ticket
            </div>
            <form onSubmit={handleSubmitTicket} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input
                type="email"
                required
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="Your email address (e.g. client@company.com)..."
                style={{ padding: '0.55rem 0.75rem', background: 'var(--surface, #1f2937)', border: '1px solid var(--border, #374151)', color: '#ffffff', borderRadius: '6px', fontSize: '0.85rem' }}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  required
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  placeholder="Ticket title / issue description..."
                  style={{ flex: 1, padding: '0.55rem 0.75rem', background: 'var(--surface, #1f2937)', border: '1px solid var(--border, #374151)', color: '#ffffff', borderRadius: '6px', fontSize: '0.85rem' }}
                />
                <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ background: '#ea580c', borderColor: '#ea580c', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                  {isSubmitting ? 'Submitting...' : 'Submit Ticket'} <Send size={14} />
                </button>
              </div>
            </form>
            {submitted && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#4ade80', fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 600 }}>
                <CheckCircle2 size={14} /> Ticket registered and persisted to real-time database!
              </div>
            )}
          </div>
        </div>

        {/* Live Ticket Demo Preview */}
        <div>
          <div className="ticket-demo" style={{ background: 'var(--card, #111827)', border: '1px solid var(--border, #374151)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text3, #9ca3af)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem' }}>
              Real-Time Database Ticket Feed
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '350px', overflowY: 'auto' }}>
              {displayedTickets.map((t) => (
                <div key={t.id} style={{ background: 'var(--surface, #1f2937)', border: '1px solid var(--border, #374151)', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text, #ffffff)' }}>{t.title}</div>
                    <span style={{ background: 'rgba(234, 88, 12, 0.2)', color: '#ea580c', fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: 800 }}>
                      {t.id}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text3, #9ca3af)' }}>
                    <span>Cat: <strong style={{ color: 'var(--text2, #d1d5db)' }}>{t.cat}</strong></span>
                    <span>Status: <strong style={{ color: '#4ade80' }}>● {t.status}</strong></span>
                    <span>Assignee: <strong style={{ color: 'var(--text2, #d1d5db)' }}>{t.assigned}</strong></span>
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
