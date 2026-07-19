import React from 'react';

export const DashboardPreview: React.FC = () => {
  return (
    <section>
      <div className="section-inner">
        <div className="section-label">Client portal</div>
        <h2 className="section-title">Track everything in one place</h2>
        <p className="section-sub">
          Your dedicated RDK dashboard to monitor project progress, manage tickets, view invoices,
          and communicate with your team.
        </p>
        <div className="dash-preview visible">
          <div className="dash-wrap">
            <div className="dash-sidebar">
              <div style={{ fontWeight: 800, padding: '1rem', borderBottom: '1px solid var(--border)' }}>RDK Portal</div>
              <div className="sidebar-item active">📊 Dashboard</div>
              <div className="sidebar-item">📁 Projects</div>
              <div className="sidebar-item">🎫 Tickets</div>
              <div className="sidebar-item">💬 Messages</div>
              <div className="sidebar-item">💳 Invoices</div>
              <div className="sidebar-item">📂 Files</div>
              <div className="sidebar-item">🔔 Alerts</div>
              <div className="sidebar-item">👤 Profile</div>
            </div>
            <div className="dash-main">
              <div style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>Good morning, Alex ☀️</div>
              <div className="dash-card-grid">
                <div className="dash-card">
                  <div className="dc-num">3</div>
                  <div className="dc-label">Active projects</div>
                </div>
                <div className="dash-card">
                  <div className="dc-num">2</div>
                  <div className="dc-label">Open tickets</div>
                </div>
                <div className="dash-card">
                  <div className="dc-num">1</div>
                  <div className="dc-label">Pending invoice</div>
                </div>
                <div className="dash-card">
                  <div className="dc-num">5</div>
                  <div className="dc-label">Unread messages</div>
                </div>
              </div>
              <div style={{ fontWeight: 800, margin: '1.5rem 0 0.5rem' }}>Active projects</div>
              <div className="proj-item">
                <div className="proj-top">
                  <span className="proj-name">Luxora Marketplace v2</span>
                  <span className="status-badge status-active">In progress</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '72%' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text3)' }}>
                  <span>72% complete</span>
                  <span>Due Jul 20</span>
                </div>
              </div>
              <div className="proj-item">
                <div className="proj-top">
                  <span className="proj-name">Mobile App Redesign</span>
                  <span className="status-badge status-open">Review</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '90%' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text3)' }}>
                  <span>90% complete</span>
                  <span>Due Jul 5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
