import React from 'react';

export const ChatPreview: React.FC = () => {
  return (
    <section>
      <div className="section-inner" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
        <div>
          <div className="chat-preview" style={{ border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--card)', overflow: 'hidden' }}>
            <div className="chat-header" style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>RDK</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>RDK Support</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <div className="online-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                  Online now
                </div>
              </div>
            </div>
            <div className="chat-body" style={{ padding: '1rem', height: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="msg msg-in" style={{ alignSelf: 'flex-start', background: 'var(--bg2)', padding: '0.5rem 0.75rem', borderRadius: '12px', borderBottomLeftRadius: '4px', fontSize: '0.82rem', maxWidth: '80%' }}>
                Hey! Quick update on your project — the payment integration is complete ✅
                <div className="msg-time" style={{ fontSize: '0.65rem', color: 'var(--text3)', marginTop: '0.25rem', textAlign: 'right' }}>10:32 AM</div>
              </div>
              <div className="msg msg-out" style={{ alignSelf: 'flex-end', background: 'var(--blue)', color: '#fff', padding: '0.5rem 0.75rem', borderRadius: '12px', borderBottomRightRadius: '4px', fontSize: '0.82rem', maxWidth: '80%' }}>
                That's great news! Can I review the staging environment?
                <div className="msg-time" style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.25rem', textAlign: 'right' }}>10:34 AM</div>
              </div>
              <div className="msg msg-in" style={{ alignSelf: 'flex-start', background: 'var(--bg2)', padding: '0.5rem 0.75rem', borderRadius: '12px', borderBottomLeftRadius: '4px', fontSize: '0.82rem', maxWidth: '80%' }}>
                Absolutely! Here's the link: staging.luxora.app — login with your test credentials
                <div className="msg-time" style={{ fontSize: '0.65rem', color: 'var(--text3)', marginTop: '0.25rem', textAlign: 'right' }}>10:35 AM</div>
              </div>
              <div className="msg msg-out" style={{ alignSelf: 'flex-end', background: 'var(--blue)', color: '#fff', padding: '0.5rem 0.75rem', borderRadius: '12px', borderBottomRightRadius: '4px', fontSize: '0.82rem', maxWidth: '80%' }}>
                Perfect. I'll review and get back to you within the hour 🙌
                <div className="msg-time" style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.25rem', textAlign: 'right' }}>10:36 AM</div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text3)', fontStyle: 'italic' }}>RDK Support is typing...</div>
            </div>
            <div className="chat-footer" style={{ padding: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
              <input className="chat-input" type="text" placeholder="Type a message..." style={{ flex: 1, padding: '0.4rem 0.75rem', border: '1px solid var(--border)', borderRadius: '20px', background: 'var(--bg2)', color: 'var(--text)', outline: 'none', fontSize: '0.82rem' }} disabled />
              <button className="send-btn" style={{ padding: '0.4rem 1rem', background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '0.82rem', cursor: 'not-allowed' }} disabled>Send</button>
            </div>
          </div>
        </div>
        <div>
          <div className="section-label">Real-time chat</div>
          <h2 className="section-title">Always in the loop</h2>
          <p className="section-sub">
            Direct communication with your assigned RDK developer. No email chains, no delays —
            just fast, clear conversations.
          </p>
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ fontSize: '1.25rem', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg2)', borderRadius: '50%' }}>💬</div>
              <span>Real-time messaging with read receipts</span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ fontSize: '1.25rem', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg2)', borderRadius: '50%' }}>📁</div>
              <span>File and image sharing</span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ fontSize: '1.25rem', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg2)', borderRadius: '50%' }}>🔍</div>
              <span>Searchable conversation history</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
