import React from 'react';

const meetingsData = [
  { icon: '📹', name: 'Google Meet', desc: '30 or 60 min video call' },
  { icon: '🎥', name: 'Zoom call', desc: 'Video meeting + screen share' },
  { icon: '🎮', name: 'Discord voice', desc: 'Voice or video on Discord' },
  { icon: '📞', name: 'Phone call', desc: 'Direct phone consultation' },
];

export const MeetingsSection: React.FC = () => {
  return (
    <section>
      <div className="section-inner">
        <div className="section-label">Meetings</div>
        <h2 className="section-title">Schedule a consultation</h2>
        <p className="section-sub">Pick the format that works for you — RDK will send the invite instantly.</p>
        <div className="meeting-grid">
          {meetingsData.map((meet, idx) => (
            <div key={idx} className="meet-card visible">
              <div className="meet-icon">{meet.icon}</div>
              <div className="meet-name">{meet.name}</div>
              <div className="meet-desc">{meet.desc}</div>
              <div>
                <a href="#contact" className="btn btn-outline">Schedule</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
