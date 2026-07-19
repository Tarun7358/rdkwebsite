import React from 'react';

export const TicketSection: React.FC = () => {
  return (
    <section className="ticket-section" id="tickets">
      <div className="section-inner">
        <div>
          <div className="section-label">Support system</div>
          <h2 className="section-title">Track requests with tickets</h2>
          <p className="section-sub">
            Create project requests or support tickets and track them from submission to resolution
            with auto-generated IDs.
          </p>
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ fontSize: '1.25rem', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg2)', borderRadius: '50%' }}>🎫</div>
              <span>Automatic ticket ID generation (WEB-2026-0041)</span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ fontSize: '1.25rem', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg2)', borderRadius: '50%' }}>🔔</div>
              <span>Real-time status updates and notifications</span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ fontSize: '1.25rem', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg2)', borderRadius: '50%' }}>📎</div>
              <span>File attachments and priority settings</span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ fontSize: '1.25rem', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg2)', borderRadius: '50%' }}>👥</div>
              <span>Developer assignment and progress tracking</span>
            </div>
          </div>
        </div>
        <div>
          <div className="ticket-demo">
            <div className="ticket-header">
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>E-commerce Bug Report</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>Payment gateway timeout on checkout</div>
              </div>
              <div className="ticket-id">WEB-2026-0041</div>
            </div>
            <div className="ticket-body">
              <div className="ticket-row">
                <div className="ticket-field">
                  <div className="tf-label">Category</div>
                  <div className="tf-val">Website Dev</div>
                </div>
                <div className="ticket-field">
                  <div className="tf-label">Priority</div>
                  <div className="tf-val">🔴 Critical</div>
                </div>
                <div className="ticket-field">
                  <div className="tf-label">Status</div>
                  <div><span className="status-badge status-active">● Active</span></div>
                </div>
                <div className="ticket-field">
                  <div className="tf-label">Assigned to</div>
                  <div className="tf-val">Sarah K.</div>
                </div>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <div className="tf-label">Description</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text2)', lineHeight: '1.4' }}>
                  Stripe webhooks are timing out after 5s on the production server during peak traffic hours...
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text3)' }}>
                <div>Investigating</div>
                <div>Est. fix: 4h</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
