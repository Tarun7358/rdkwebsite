import React, { useState, useEffect, useRef } from 'react';
import { Badge } from './Badge';
import { ticketsApi } from '../../api/tickets';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { downloadTicketTranscript } from '../../lib/transcriptGenerator';
import type { Ticket } from '../../types';
import { Download, Send, CheckCircle2, RotateCcw, User, ShieldCheck, Mail } from 'lucide-react';

interface TicketWorkspaceProps {
  ticket: Ticket;
  onStatusChange?: (ticketId: string, status: 'Active' | 'Resolved') => void;
}

export const TicketWorkspace: React.FC<TicketWorkspaceProps> = ({ ticket, onStatusChange }) => {
  const user = useAuthStore((s) => s.user);
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatMsgListRef = useRef<HTMLDivElement>(null);
  const addToast = useAppStore((s) => s.addToast);

  const isAdminOrEmployee = user?.role === 'admin' || user?.role === 'employee';

  useEffect(() => {
    if (chatMsgListRef.current) {
      chatMsgListRef.current.scrollTop = chatMsgListRef.current.scrollHeight;
    }
  }, [ticket.messages]);

  const handleSend = async () => {
    if (!text.trim() || !user || isSending) return;
    const msgText = text.trim();
    setText('');
    setIsSending(true);

    try {
      const res = await ticketsApi.sendMessage({
        ticketId: ticket.id,
        sender: user.role === 'client' ? 'client' : 'employee',
        senderName: user.name,
        text: msgText,
      });
      if (!res.success) {
        addToast(res.message, 'error');
      } else {
        addToast('Reply dispatched cleanly!', 'success');
      }
    } catch (e: any) {
      addToast(e.message || 'Failed to send message', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = ticket.status === 'Active' ? 'Resolved' : 'Active';
    try {
      if (newStatus === 'Resolved') {
        const res = await ticketsApi.close(ticket.id);
        if (res.success) {
          addToast(`Ticket ${ticket.id} marked as Resolved!`, 'success');
          onStatusChange?.(ticket.id, 'Resolved');
        } else {
          addToast(res.message, 'error');
        }
      } else {
        const res = await ticketsApi.assign(ticket.id, ticket.assignedTo || 'engineering@rdktech.com', 'Active');
        if (res.success) {
          addToast(`Ticket ${ticket.id} reopened!`, 'success');
          onStatusChange?.(ticket.id, 'Active');
        } else {
          addToast(res.message, 'error');
        }
      }
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  const handleDownloadTranscript = () => {
    downloadTicketTranscript(ticket);
    addToast(`Downloaded transcript for #${ticket.id}`, 'info');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        background: 'var(--card)',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        padding: '1.5rem',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      {/* Header Info */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '1rem',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span
              style={{
                background: 'rgba(124, 58, 237, 0.12)',
                border: '1px solid rgba(124, 58, 237, 0.25)',
                color: 'var(--primary)',
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.75rem',
                padding: '0.2rem 0.55rem',
                borderRadius: '6px',
                fontWeight: 800,
              }}
            >
              {ticket.id}
            </span>
            <Badge status={ticket.status} />
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: ticket.priority === 'Critical' ? '#ef4444' : ticket.priority === 'High' ? '#f59e0b' : 'var(--text2)',
                background: 'var(--bg2)',
                padding: '0.2rem 0.5rem',
                borderRadius: '6px',
                border: '1px solid var(--border)',
              }}
            >
              {ticket.priority} Priority
            </span>
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text)', margin: '0.25rem 0' }}>{ticket.title}</h3>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.78rem', color: 'var(--text2)', flexWrap: 'wrap', marginTop: '0.3rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <User size={13} color="var(--primary)" /> Client: <strong style={{ color: 'var(--text)' }}>{ticket.client}</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ShieldCheck size={13} color="var(--primary)" /> Assignee: <strong style={{ color: 'var(--text)' }}>{ticket.assignedTo || 'Lead Team'}</strong>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleDownloadTranscript}
            className="btn btn-outline"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontSize: '0.78rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '8px',
              fontWeight: 700,
            }}
            title="Download full message exchange & diagnostic transcript"
          >
            <Download size={14} /> Download Transcript (.txt)
          </button>

          {isAdminOrEmployee && (
            <button
              onClick={handleToggleStatus}
              className={`btn ${ticket.status === 'Active' ? 'btn-primary' : 'btn-outline'}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.78rem',
                padding: '0.45rem 0.85rem',
                borderRadius: '8px',
                fontWeight: 700,
              }}
            >
              {ticket.status === 'Active' ? (
                <>
                  <CheckCircle2 size={14} /> Mark as Resolved
                </>
              ) : (
                <>
                  <RotateCcw size={14} /> Reopen Ticket
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Description Snippet */}
      {ticket.description && (
        <div
          style={{
            fontSize: '0.84rem',
            background: 'var(--bg2)',
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            marginBottom: '1rem',
            color: 'var(--text2)',
            lineHeight: 1.5,
          }}
        >
          <strong style={{ color: 'var(--text)' }}>Initial Scope / Diagnostic: </strong>
          {ticket.description}
        </div>
      )}

      {/* Live Chat History */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: '280px',
          background: 'var(--bg2)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}
      >
        <div
          ref={chatMsgListRef}
          style={{
            flex: 1,
            maxHeight: '340px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            padding: '1rem',
          }}
        >
          {(!ticket.messages || ticket.messages.length === 0) ? (
            <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: '0.85rem', padding: '2rem' }}>
              No messages logged yet. Type below to communicate in real-time.
            </div>
          ) : (
            ticket.messages.map((m, idx) => {
              const isMe =
                (user?.role === 'client' && m.sender === 'client') ||
                (user?.role !== 'client' && m.sender === 'employee');

              return (
                <div
                  key={idx}
                  style={{
                    maxWidth: '80%',
                    padding: '0.75rem 1rem',
                    borderRadius: '14px',
                    fontSize: '0.85rem',
                    lineHeight: '1.5',
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                    background: isMe ? 'var(--primary)' : 'var(--card)',
                    color: isMe ? '#fff' : 'var(--text)',
                    border: isMe ? 'none' : '1px solid var(--border)',
                    borderBottomRightRadius: isMe ? '4px' : '14px',
                    borderBottomLeftRadius: isMe ? '14px' : '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.725rem',
                      fontWeight: 700,
                      marginBottom: '0.2rem',
                      opacity: isMe ? 0.9 : 0.75,
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                    }}
                  >
                    <span>{m.senderName} ({m.sender === 'client' ? 'Client' : 'Engineering Team'})</span>
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
                  <div
                    style={{
                      fontSize: '0.675rem',
                      marginTop: '0.35rem',
                      opacity: 0.65,
                      textAlign: isMe ? 'right' : 'left',
                    }}
                  >
                    {m.time}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Footer */}
        <div
          style={{
            padding: '0.85rem 1rem',
            background: 'var(--card)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: '0.6rem',
            alignItems: 'center',
          }}
        >
          <input
            type="text"
            placeholder={isAdminOrEmployee ? "Type engineering reply or diagnostic update to client..." : "Type message to assigned engineers..."}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={ticket.status === 'Resolved' && !isAdminOrEmployee}
            style={{
              flex: 1,
              padding: '0.65rem 1rem',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              fontSize: '0.85rem',
              outline: 'none',
              background: 'var(--bg2)',
              color: 'var(--text)',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || isSending}
            className="btn btn-primary"
            style={{
              padding: '0.65rem 1.15rem',
              borderRadius: '10px',
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: 700,
            }}
          >
            {isSending ? 'Sending...' : 'Send'} <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketWorkspace;
