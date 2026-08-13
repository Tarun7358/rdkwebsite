import React, { useState } from 'react';
import { MessageSquare, Folder, Search, Send, Bot, CheckCircle2 } from 'lucide-react';
import { chatApi } from '../../api/chat';
import { useAppStore } from '../../store/appStore';

export const ChatPreview: React.FC = () => {
  const storeMessages = useAppStore((s) => s.chatMessages);
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultMessages = [
    { sender: 'in', senderName: 'RDK Support', text: 'Hello! Welcome to RDK Tech. How can we assist with your software project today?', time: '10:30 AM' },
    { sender: 'out', senderName: 'Client Partner', text: 'What stack do you use for enterprise mobile applications?', time: '10:31 AM' },
    { sender: 'in', senderName: 'RDK Support', text: 'We specialize in React Native & Flutter with offline SQLite, real-time WebSockets, and Supabase / Node.js backends.', time: '10:32 AM' }
  ];

  const messages = storeMessages && storeMessages.length > 0 ? storeMessages : defaultMessages;

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    setIsSubmitting(true);
    try {
      await chatApi.send({
        sender: 'out',
        senderName: 'Visitor Client',
        text
      });
      if (!textToSend) setInputText('');
    } catch (err) {
      console.error('Failed to send chat message:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section>
      <div className="section-inner" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'center' }}>
        
        {/* Real-time Chat Widget */}
        <div>
          <div className="chat-preview" style={{ border: '1px solid var(--border, #374151)', borderRadius: '16px', background: 'var(--card, #111827)', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            
            {/* Header */}
            <div className="chat-header" style={{ padding: '1rem', borderBottom: '1px solid var(--border, #374151)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface, #1f2937)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#ea580c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                  <Bot size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text, #ffffff)' }}>RDK Real-Time Stream</div>
                  <div style={{ fontSize: '0.75rem', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                    <div className="online-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div>
                    Live Supabase SSE
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text3, #9ca3af)', background: 'var(--card, #111827)', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border, #374151)' }}>
                Database Connected
              </span>
            </div>

            {/* Messages Body */}
            <div className="chat-body" style={{ padding: '1rem', height: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--card, #111827)' }}>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`msg ${msg.sender === 'in' ? 'msg-in' : 'msg-out'}`}
                  style={{
                    alignSelf: msg.sender === 'in' ? 'flex-start' : 'flex-end',
                    background: msg.sender === 'in' ? 'var(--surface, #1f2937)' : '#ea580c',
                    color: '#ffffff',
                    padding: '0.6rem 0.85rem',
                    borderRadius: '12px',
                    borderBottomLeftRadius: msg.sender === 'in' ? '2px' : '12px',
                    borderBottomRightRadius: msg.sender === 'out' ? '2px' : '12px',
                    fontSize: '0.82rem',
                    maxWidth: '85%',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {msg.text}
                  <div className="msg-time" style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.25rem', textAlign: 'right' }}>
                    {msg.time}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Prompts */}
            <div style={{ padding: '0.5rem 0.75rem', borderTop: '1px solid var(--border, #374151)', background: 'var(--surface, #1f2937)', display: 'flex', gap: '0.4rem', overflowX: 'auto' }}>
              {[
                'What tech stack do you use?',
                'How fast can you deliver?',
                'Tell me about Vetri Gas project'
              ].map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  style={{
                    whiteSpace: 'nowrap',
                    background: 'var(--card, #111827)',
                    border: '1px solid var(--border, #374151)',
                    color: 'var(--text2, #d1d5db)',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '12px',
                    fontSize: '0.7rem',
                    cursor: 'pointer'
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="chat-footer" style={{ padding: '0.75rem', borderTop: '1px solid var(--border, #374151)', display: 'flex', gap: '0.5rem', background: 'var(--card, #111827)' }}>
              <input
                className="chat-input"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a real-time message..."
                style={{ flex: 1, padding: '0.5rem 0.85rem', border: '1px solid var(--border, #374151)', borderRadius: '20px', background: 'var(--surface, #1f2937)', color: 'var(--text, #ffffff)', outline: 'none', fontSize: '0.82rem' }}
              />
              <button type="submit" disabled={isSubmitting} className="send-btn" style={{ padding: '0.5rem 1rem', background: '#ea580c', color: '#fff', border: 'none', borderRadius: '20px', fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                {isSubmitting ? 'Sending...' : 'Send'} <Send size={14} />
              </button>
            </form>
          </div>
        </div>

        {/* Feature Copy */}
        <div>
          <div className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <MessageSquare size={14} /> Direct Developer Channels
          </div>
          <h2 className="section-title">Transparent Project Communication</h2>
          <p className="section-sub">
            Direct, real-time message streams with your designated engineering leads powered by Supabase SSE streams.
          </p>

          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { icon: <MessageSquare size={18} color="#ea580c" />, text: 'Real-time WebSocket & SSE message streams with read receipts' },
              { icon: <Folder size={18} color="#ea580c" />, text: 'Direct asset, code snippet, and design file sharing' },
              { icon: <Search size={18} color="#ea580c" />, text: 'Indexed & searchable project archive logs' },
              { icon: <CheckCircle2 size={18} color="#ea580c" />, text: 'Guaranteed 1-hour engineering team SLA response' }
            ].map((feat, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface, #1f2937)', border: '1px solid var(--border, #374151)', borderRadius: '50%', flexShrink: 0 }}>
                  {feat.icon}
                </div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text, #ffffff)', fontWeight: 600 }}>{feat.text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
