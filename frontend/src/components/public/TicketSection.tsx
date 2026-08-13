import React, { useState } from 'react';
import { Ticket, Bell, Paperclip, Users, LifeBuoy, Send, CheckCircle2 } from 'lucide-react';

export const TicketSection: React.FC = () => {
  const [interactiveTickets, setInteractiveTickets] = useState([
    { id: 'WEB-2026-0041', title: 'E-commerce Checkout Timeout', cat: 'Web Engineering', priority: 'High', status: 'Active', assigned: 'Sarah K.' },
    { id: 'APP-2026-0112', title: 'Biometrics Sync Latency Audit', cat: 'Mobile & IoT', priority: 'Medium', status: 'In Review', assigned: 'RDK Core Team' },
  ]);

  const [ticketTitle, setTicketTitle] = useState('');
  const [submitted, setSubmitted] = useState(false);


  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle) return;
    const newId = `TICK-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket = {
      id: newId,
      title: ticketTitle,
      cat: 'Web Engineering',
      priority: 'High',
      status: 'Active',
      assigned: 'Auto-Assigned'
    };

    setInteractiveTickets([newTicket, ...interactiveTickets]);
    setTicketTitle('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
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
              Test Ticket Simulator
            </div>
            <form onSubmit={handleSubmitTicket} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={ticketTitle}
                onChange={(e) => setTicketTitle(e.target.value)}
                placeholder="Enter issue description (e.g. API webhook latency)..."
                style={{ flex: 1, minWidth: '200px', padding: '0.5rem 0.75rem', background: 'var(--surface, #1f2937)', border: '1px solid var(--border, #374151)', color: '#ffffff', borderRadius: '6px', fontSize: '0.85rem' }}
              />
              <button type="submit" className="btn btn-primary" style={{ background: '#ea580c', borderColor: '#ea580c', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                Submit Ticket <Send size={14} />
              </button>
            </form>
            {submitted && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#4ade80', fontSize: '0.8rem', marginTop: '0.5rem', fontWeight: 600 }}>
                <CheckCircle2 size={14} /> Ticket registered and dispatched to developer queue!
              </div>
            )}
          </div>
        </div>

        {/* Live Ticket Demo Preview */}
        <div>
          <div className="ticket-demo" style={{ background: 'var(--card, #111827)', border: '1px solid var(--border, #374151)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text3, #9ca3af)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem' }}>
              Active Client Support Feed
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {interactiveTickets.map((t) => (
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
