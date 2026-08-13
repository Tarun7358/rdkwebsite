import React, { useState } from 'react';
import { Video, MonitorPlay, Bot, PhoneCall, Calendar, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

const meetingsData = [
  { icon: <Video size={24} color="#38bdf8" />, name: 'Google Meet Discovery', desc: '30 or 60 min video consultation & scope breakdown', type: 'Google Meet' },
  { icon: <MonitorPlay size={24} color="#a855f7" />, name: 'Architecture Review (Zoom)', desc: 'Technical deep-dive with system architect', type: 'Zoom' },
  { icon: <Bot size={24} color="#f59e0b" />, name: 'Discord Engineering Session', desc: 'Real-time voice & screen share on Discord', type: 'Discord' },
  { icon: <PhoneCall size={24} color="#22c55e" />, name: 'Direct Executive Phone Call', desc: 'Direct phone consultation with lead engineer', type: 'Phone' },
];

export const MeetingsSection: React.FC = () => {
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('Tomorrow, 2:00 PM');
  const [booked, setBooked] = useState(false);

  const handleBookMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    setBooked(true);
  };

  return (
    <section>
      <div className="section-inner">
        <div className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <Calendar size={14} /> Live Technical Consultations
        </div>
        <h2 className="section-title">Schedule an Engineering Session</h2>
        <p className="section-sub">Select your preferred communication channel — instant calendar invitation sent upon submission.</p>
        
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
          <div style={{ marginTop: '2rem', background: 'var(--card, #111827)', border: '1px solid var(--border, #374151)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            {!booked ? (
              <form onSubmit={handleBookMeeting}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border, #374151)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>

                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#ea580c', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={18} /> Schedule {selectedMeeting} Session
                  </div>
                  <button type="button" onClick={() => setSelectedMeeting(null)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>Close ✕</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Select Available Slot:</label>
                    <select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', background: 'var(--surface, #1f2937)', border: '1px solid var(--border, #374151)', color: '#ffffff', borderRadius: '8px' }}
                    >
                      <option>Today, 4:00 PM EST</option>
                      <option>Tomorrow, 10:00 AM EST</option>
                      <option>Tomorrow, 2:00 PM EST</option>
                      <option>Friday, 11:00 AM EST</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Work Email Address:</label>
                    <input
                      type="email"
                      required
                      placeholder="alex@company.com"
                      style={{ width: '100%', padding: '0.6rem', background: 'var(--surface, #1f2937)', border: '1px solid var(--border, #374151)', color: '#ffffff', borderRadius: '8px' }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary" style={{ background: '#ea580c', borderColor: '#ea580c', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                    Confirm & Send Calendar Invite <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <CheckCircle2 size={40} color="#22c55e" style={{ margin: '0 auto 0.5rem auto' }} />
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Meeting Confirmed!</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text2, #d1d5db)' }}>
                  A {selectedMeeting} calendar invitation for <strong>{selectedDate}</strong> has been dispatched.
                </p>
                <button onClick={() => setSelectedMeeting(null)} className="btn btn-outline" style={{ marginTop: '1rem' }}>Done</button>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
};
