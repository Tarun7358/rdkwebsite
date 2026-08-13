import React, { useState } from 'react';
import { MessageSquare, Folder, Search, Send, Bot, CheckCircle2 } from 'lucide-react';
import { chatApi } from '../../api/chat';
import { useAppStore } from '../../store/appStore';
import { analyzeProjectRequirement } from '../../lib/aiRequirementEngine';

export const ChatPreview: React.FC = () => {
  const storeMessages = useAppStore((s) => s.chatMessages);
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultMessages = [
    { sender: 'in' as const, senderName: 'RDK Support', text: 'Hello! Welcome to RDK Tech. How can we assist with your software project today?', time: '10:30 AM' },
    { sender: 'out' as const, senderName: 'Client Partner', text: 'What stack do you use for enterprise mobile applications?', time: '10:31 AM' },
    { sender: 'in' as const, senderName: 'RDK Support', text: 'We specialize in React Native & Flutter with offline SQLite, real-time WebSockets, and Supabase / Node.js backends.', time: '10:32 AM' }
  ];

  const messages = storeMessages && storeMessages.length > 0 ? storeMessages : defaultMessages;

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    if (!textToSend) setInputText('');
    setIsSubmitting(true);

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const localMsg = { sender: 'out' as const, senderName: 'Visitor Client', text, time: timeStr };
    const currentMsgs = storeMessages && storeMessages.length > 0 ? storeMessages : defaultMessages;
    useAppStore.getState().setState({ chatMessages: [...currentMsgs, localMsg] });

    try {
      await chatApi.send({
        sender: 'out',
        senderName: 'Visitor Client',
        text
      });
    } catch (err) {
      console.warn('Chat send warning:', err);
    } finally {
      setIsSubmitting(false);
    }

    // AI Requirement Engine Response
    setTimeout(() => {
      const aiResult = analyzeProjectRequirement(text, 'Visitor Client');
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const aiMsg = { sender: 'in' as const, senderName: 'RDK AI Assistant', text: aiResult.replyText, time: replyTime };
      const latestMsgs = useAppStore.getState().chatMessages ?? [];
      useAppStore.getState().setState({ chatMessages: [...latestMsgs, aiMsg] });
    }, 500);
  };

  return (
    <section id="chat-stream">
      <div className="section-inner" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3.5rem', alignItems: 'center' }}>
        
        {/* Real-time Chat Widget */}
        <div>
          <div className="chat-preview" style={{ border: '1px solid var(--border, #e5e7eb)', borderRadius: '20px', background: 'var(--card, #ffffff)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
            
            {/* Header */}
            <div className="chat-header" style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border, #e5e7eb)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg2, #f8f9fa)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ea580c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)' }}>
                  <Bot size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.925rem', color: 'var(--text, #111827)' }}>RDK Real-Time Stream</div>
                  <div style={{ fontSize: '0.75rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}>
                    <div className="online-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }}></div>
                    Live Supabase SSE
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text2, #6b7280)', background: 'var(--card, #ffffff)', padding: '0.25rem 0.6rem', borderRadius: '8px', border: '1px solid var(--border, #e5e7eb)' }}>
                Database Connected
              </span>
            </div>

            {/* Messages Body */}
            <div className="chat-body" style={{ padding: '1.25rem', height: '290px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem', background: 'var(--card, #ffffff)' }}>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`msg ${msg.sender === 'in' ? 'msg-in' : 'msg-out'}`}
                  style={{
                    alignSelf: msg.sender === 'in' ? 'flex-start' : 'flex-end',
                    background: msg.sender === 'in' ? 'var(--bg2, #f8f9fa)' : '#ea580c',
                    color: msg.sender === 'in' ? 'var(--text, #111827)' : '#ffffff',
                    padding: '0.7rem 1rem',
                    borderRadius: '14px',
                    borderBottomLeftRadius: msg.sender === 'in' ? '2px' : '14px',
                    borderBottomRightRadius: msg.sender === 'out' ? '2px' : '14px',
                    fontSize: '0.85rem',
                    maxWidth: '85%',
                    border: msg.sender === 'in' ? '1px solid var(--border, #e5e7eb)' : 'none',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
                  }}
                >
                  {msg.text}
                  <div className="msg-time" style={{ fontSize: '0.675rem', color: msg.sender === 'in' ? 'var(--text2, #6b7280)' : 'rgba(255,255,255,0.7)', marginTop: '0.3rem', textAlign: 'right' }}>
                    {msg.time}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Prompts */}
            <div className="no-scrollbar" style={{ padding: '0.6rem 0.85rem', borderTop: '1px solid var(--border, #e5e7eb)', background: 'var(--bg2, #f8f9fa)', display: 'flex', gap: '0.5rem', overflowX: 'auto', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
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
                    background: 'var(--card, #ffffff)',
                    border: '1px solid var(--border, #e5e7eb)',
                    color: 'var(--text, #111827)',
                    padding: '0.35rem 0.8rem',
                    borderRadius: '14px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    flexShrink: 0
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="chat-footer" style={{ padding: '0.85rem 1rem', borderTop: '1px solid var(--border, #e5e7eb)', display: 'flex', gap: '0.5rem', background: 'var(--card, #ffffff)' }}>
              <input
                className="chat-input"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a real-time message..."
                style={{ flex: 1, padding: '0.6rem 1rem', border: '1px solid var(--border, #e5e7eb)', borderRadius: '24px', background: 'var(--bg2, #f8f9fa)', color: 'var(--text, #111827)', outline: 'none', fontSize: '0.85rem' }}
              />
              <button type="submit" disabled={isSubmitting} className="send-btn" style={{ padding: '0.6rem 1.15rem', background: '#ea580c', color: '#fff', border: 'none', borderRadius: '24px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)' }}>
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

          <div style={{ marginTop: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {[
              { icon: <MessageSquare size={18} color="#ea580c" />, text: 'Real-time WebSocket & SSE message streams with read receipts' },
              { icon: <Folder size={18} color="#ea580c" />, text: 'Direct asset, code snippet, and design file sharing' },
              { icon: <Search size={18} color="#ea580c" />, text: 'Indexed & searchable project archive logs' },
              { icon: <CheckCircle2 size={18} color="#ea580c" />, text: 'Guaranteed 1-hour engineering team SLA response' }
            ].map((feat, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg2, #f8f9fa)', border: '1px solid var(--border, #e5e7eb)', borderRadius: '50%', flexShrink: 0 }}>
                  {feat.icon}
                </div>
                <span style={{ fontSize: '0.925rem', color: 'var(--text, #111827)', fontWeight: 600 }}>{feat.text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
