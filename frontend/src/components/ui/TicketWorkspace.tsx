import React, { useState, useEffect, useRef } from 'react';
import { Badge } from './Badge';
import { ticketsApi } from '../../api/tickets';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import type { Ticket } from '../../types';

interface TicketWorkspaceProps {
  ticket: Ticket;
}

const TicketWorkspace: React.FC<TicketWorkspaceProps> = ({ ticket }) => {
  const user = useAuthStore((s) => s.user);
  const [text, setText] = useState('');
  const chatMsgListRef = useRef<HTMLDivElement>(null);
  const addToast = useAppStore((s) => s.addToast);

  useEffect(() => {
    if (chatMsgListRef.current) {
      chatMsgListRef.current.scrollTop = chatMsgListRef.current.scrollHeight;
    }
  }, [ticket.messages]);

  const handleSend = async () => {
    if (!text.trim() || !user) return;
    const msgText = text.trim();
    setText('');

    try {
      const res = await ticketsApi.sendMessage({
        ticketId: ticket.id,
        sender: user.role === 'client' ? 'client' : 'employee',
        senderName: user.name,
        text: msgText,
      });
      if (!res.success) {
        addToast(res.message, 'error');
      }
    } catch (e: any) {
      addToast(e.message || 'Failed to send message', 'error');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '.75rem',
          marginBottom: '1rem',
        }}
      >
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>{ticket.title}</h3>
          <span style={{ fontSize: '.75rem', color: 'var(--text3)' }}>
            ID: {ticket.id} · Priority: {ticket.priority}
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Badge status={ticket.status} />
        </div>
      </div>
      <div
        style={{
          fontSize: '.82rem',
          background: 'var(--bg2)',
          padding: '.75rem',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          marginBottom: '1rem',
          color: 'var(--text2)',
        }}
      >
        <strong>Description:</strong> {ticket.description}
      </div>

      {/* Chat History */}
      <div className="chat-container">
        <div
          className="chat-msg-list"
          id="ticketChatMsgList"
          ref={chatMsgListRef}
          style={{
            maxHeight: '300px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            padding: '0.5rem',
          }}
        >
          {ticket.messages.map((m, idx) => {
            const isMe =
              (user?.role === 'client' && m.sender === 'client') ||
              (user?.role !== 'client' && m.sender === 'employee');
            return (
              <div
                key={idx}
                className={`msg ${isMe ? 'msg-out' : 'msg-in'}`}
                style={{
                  maxWidth: '75%',
                  padding: '.6rem .9rem',
                  borderRadius: '12px',
                  fontSize: '.85rem',
                  lineHeight: '1.5',
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  background: isMe ? 'var(--blue)' : 'var(--bg2)',
                  color: isMe ? '#fff' : 'var(--text)',
                  border: isMe ? 'none' : '1px solid var(--border)',
                  borderBottomRightRadius: isMe ? '4px' : '12px',
                  borderBottomLeftRadius: isMe ? '12px' : '4px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    fontSize: '.7rem',
                    fontWeight: 700,
                    marginBottom: '.15rem',
                    opacity: 0.9,
                  }}
                >
                  {m.senderName}
                </div>
                <div>{m.text}</div>
                <div
                  style={{
                    fontSize: '.7rem',
                    marginTop: '.3rem',
                    opacity: 0.6,
                    textAlign: isMe ? 'right' : 'left',
                  }}
                >
                  {m.time}
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="chat-footer"
          style={{
            padding: '.75rem',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: '.5rem',
          }}
        >
          <input
            className="chat-input"
            type="text"
            placeholder="Type message to team..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{
              flex: 1,
              padding: '.5rem .9rem',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              fontSize: '.85rem',
              outline: 'none',
              background: 'var(--bg2)',
              color: 'var(--text)',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
          />
          <button
            className="send-btn"
            style={{
              padding: '.5rem 1rem',
              background: 'var(--blue)',
              color: '#fff',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '.85rem',
              fontWeight: 500,
            }}
            onClick={handleSend}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketWorkspace;
export { TicketWorkspace };
