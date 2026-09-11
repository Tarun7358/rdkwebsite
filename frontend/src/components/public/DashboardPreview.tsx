import React from 'react';
import { LayoutDashboard, Folder, Ticket, MessageSquare, CreditCard, Bell, User, CheckCircle2 } from 'lucide-react';

export const DashboardPreview: React.FC = () => {
  return (
    <section id="portal-preview" style={{ padding: '5rem 0', position: 'relative' }}>
      <div className="section-inner">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', margin: '0 auto 0.75rem' }}>
            <LayoutDashboard size={14} /> Enterprise Client Console
          </div>
          <h2 className="section-title">Track Everything In Real Time</h2>
          <p className="section-sub" style={{ margin: '0 auto' }}>
            A unified client portal to monitor sprint progress, inspect deliverables, review architecture tickets, and communicate directly with engineers.
          </p>
        </div>

        <div style={{
          background: 'var(--card-glass)',
          border: '1px solid var(--border)',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: 'var(--card-shadow), 0 25px 50px -12px rgba(124, 58, 237, 0.15)',
          backdropFilter: 'blur(16px)',
          maxWidth: '1060px',
          margin: '0 auto'
        }}>
          {/* Mac OS Window Header */}
          <div style={{
            padding: '0.85rem 1.25rem',
            background: 'var(--bg2)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></div>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono, monospace)', color: 'var(--text3)', marginLeft: '0.75rem' }}>
                rdk-console://client.rdkreations.io
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }}></span>
              Live Sync Active
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '440px' }}>
            {/* Sidebar Preview */}
            <div style={{
              background: 'var(--bg2)',
              borderRight: '1px solid var(--border)',
              padding: '1.5rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem'
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.75rem', paddingLeft: '0.5rem' }}>
                WORKSPACE
              </div>
              {[
                { icon: <LayoutDashboard size={16} />, label: 'Overview', active: true },
                { icon: <Folder size={16} />, label: 'Projects & Sprints', active: false },
                { icon: <Ticket size={16} />, label: 'Support Tickets', active: false, badge: '2' },
                { icon: <MessageSquare size={16} />, label: 'Lead Engineer Chat', active: false },
                { icon: <CreditCard size={16} />, label: 'Billing & Invoices', active: false },
                { icon: <Bell size={16} />, label: 'System Logs', active: false },
                { icon: <User size={16} />, label: 'Account Profile', active: false },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: item.active ? 700 : 500,
                    background: item.active ? 'rgba(124, 58, 237, 0.14)' : 'transparent',
                    color: item.active ? 'var(--primary)' : 'var(--text2)',
                    border: item.active ? '1px solid rgba(124, 58, 237, 0.25)' : '1px solid transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '10px', background: 'var(--primary)', color: '#fff' }}>
                      {item.badge}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Main Area Preview */}
            <div style={{ padding: '1.75rem', background: 'var(--card)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                    Enterprise Client Portal
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text3)', marginTop: '0.2rem' }}>
                    Sprint Cycle 04 · SLA 99.98% Uptime
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.25)', fontWeight: 700 }}>
                  Active Retainer
                </span>
              </div>

              {/* Stats Chips */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
                {[
                  { label: 'Active Projects', val: '3' },
                  { label: 'Pending Tickets', val: '2' },
                  { label: 'Invoices Paid', val: '$18.5k' },
                  { label: 'Avg Latency', val: '42ms' },
                ].map((stat, idx) => (
                  <div key={idx} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1rem' }}>
                    <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)' }}>
                      {stat.val}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '0.2rem', fontWeight: 600 }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Sprint Progress Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { name: 'Vetri Gas Enterprise Suite v2.4', pct: 92, tag: 'Production Deployment', due: 'Tomorrow' },
                  { name: 'Luxora Distributed Microservices', pct: 68, tag: 'Integration Sprint', due: 'In 5 Days' },
                ].map((p, idx) => (
                  <div key={idx} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.15rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.92rem', color: 'var(--text)' }}>
                          {p.name}
                        </span>
                        <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '6px', background: 'rgba(124, 58, 237, 0.12)', color: 'var(--primary)', fontWeight: 700 }}>
                          {p.tag}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text3)', fontFamily: 'var(--font-mono, monospace)' }}>
                        {p.due}
                      </span>
                    </div>

                    <div style={{ height: '7px', background: 'var(--border)', borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
                      <div style={{ width: `${p.pct}%`, height: '100%', background: 'var(--primary-gradient)', borderRadius: '10px' }}></div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--text3)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#10b981', fontWeight: 600 }}>
                        <CheckCircle2 size={13} /> Automated CI/CD Passing
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: 'var(--text)' }}>
                        {p.pct}% Complete
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
