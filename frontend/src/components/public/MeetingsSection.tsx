import React, { useState } from 'react';
import { Video, MonitorPlay, Bot, PhoneCall, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { meetingsApi } from '../../api/meetings';
import { useAppStore } from '../../store/appStore';

const meetingsData = [
  { icon: <Video size={24} color="#38bdf8" />, name: 'Google Meet Discovery', desc: '30 or 60 min video consultation & scope breakdown', type: 'Google Meet' },
  { icon: <MonitorPlay size={24} color="#a855f7" />, name: 'Architecture Review (Zoom)', desc: 'Technical deep-dive with system architect', type: 'Zoom' },
  { icon: <Bot size={24} color="#f59e0b" />, name: 'Discord Engineering Session', desc: 'Real-time voice & screen share on Discord', type: 'Discord' },
  { icon: <PhoneCall size={24} color="#22c55e" />, name: 'Direct Executive Phone Call', desc: 'Direct phone consultation with lead engineer', type: 'Phone' },
];

export const MeetingsSection: React.FC = () => {
  const addToast = useAppStore((s) => s.addToast);
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('Tomorrow, 2:00 PM EST');
  const [clientEmail, setClientEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [booked, setBooked] = useState(false);

  const handleBookMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientEmail) return;
    setIsSubmitting(true);
    try {
      const res = await meetingsApi.schedule({
        client: clientEmail,
        type: selectedMeeting || 'Google Meet',
        date: selectedDate.split(',')[0],
        time: selectedDate.split(',')[1] || '2:00 PM'
      });
      if (res.success) {
        setBooked(true);
        addToast('Meeting persisted to real-time calendar!', 'success');
      } else {
        addToast(res.message || 'Failed to schedule meeting', 'error');
      }
    } catch (err: any) {
      addToast(err.message || 'An error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section>
      <div className="section-inner">
        <h2 className="section-title">Schedule an Engineering Session</h2>
        <p className="section-sub">Select your preferred communication channel — real-time booking synced to production database.</p>
        
        <div className="meeting-grid">
          {meetingsData.map((meet, idx) => (
            <div key={idx} className="meet-card visible" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="meet-icon" style={{ background: 'var(--surface, #1f2937)', border: '1px solid var(--border, #374151)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  {meet.icon}
                </div>
                <div className="meet-name" style={{ fontWeight: 700, fontSize: '1rem' }}>{meet.name}</div>
                <div className="meet-desc" style={{ fontSize: '0.8rem', color: 'var(--text3, #9ca3af)', marginTop: '0.3rem' }}>{meet.desc}</div>
              </div>
              <div style={{ marginTop: '1.25rem' }}>
                <button
                  onClick={() => {
                    setSelectedMeeting(meet.type);
                    setBooked(false);
                  }}
                  className="btn btn-outline"
                  style={{ width: '100%', textAlign: 'center', cursor: 'pointer' }}
                >
                  Schedule Call
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Booking Modal */}
        {selectedMeeting && (
          <div style={{ marginTop: '2.5rem', background: 'var(--card-glass)', border: '1px solid var(--border)', borderRadius: '18px', padding: '1.75rem', backdropFilter: 'blur(12px)', boxShadow: 'var(--card-shadow)' }}>
            {!booked ? (
              <form onSubmit={handleBookMeeting}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={18} /> Schedule {selectedMeeting} Session
                  </div>
                  <button type="button" onClick={() => setSelectedMeeting(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '1rem' }}>Close ✕</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                  <div>
                    <label style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: '0.4rem' }}>Select Available Slot:</label>
                    <select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      style={{ width: '100%', padding: '0.75rem', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '10px', fontSize: '0.875rem' }}
                    >
                      <option>Today, 4:00 PM EST</option>
                      <option>Tomorrow, 10:00 AM EST</option>
                      <option>Tomorrow, 2:00 PM EST</option>
                      <option>Friday, 11:00 AM EST</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: '0.4rem' }}>Work Email Address:</label>
                    <input
                      type="email"
                      required
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="alex@company.com"
                      style={{ width: '100%', padding: '0.75rem', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '10px', fontSize: '0.875rem' }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
                    {isSubmitting ? 'Syncing...' : 'Confirm & Save Meeting'} <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                <CheckCircle2 size={42} color="#10b981" style={{ margin: '0 auto 0.75rem auto' }} />
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)' }}>Meeting Confirmed & Saved to Database!</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text2)', marginTop: '0.4rem' }}>
                  A {selectedMeeting} calendar invitation for <strong>{selectedDate}</strong> has been dispatched for <strong>{clientEmail}</strong>.
                </p>
                <button onClick={() => setSelectedMeeting(null)} className="btn btn-outline" style={{ marginTop: '1.25rem' }}>Done</button>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
};
