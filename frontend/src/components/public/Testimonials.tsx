import React from 'react';
import { Star, Award } from 'lucide-react';


const testimonialsData = [
  {
    text: '"RDK delivered our enterprise marketplace in exactly 6 weeks as promised. The code quality was exceptional — clean, modular TypeScript, well-documented, and ready for production scaling."',
    name: 'Marcus Reid',
    co: 'CEO, Luxora — E-Commerce Platform',
    avatar: 'MR',
  },
  {
    text: '"The AI intelligence platform RDK built for us handles 80% of client inquiries automatically. It has saved our operations team over 40 hours a week with instant, accurate responses."',
    name: 'Priya Lal',
    co: 'CTO, SupportBase — Enterprise AI Integration',
    avatar: 'PL',
  },
  {
    text: '"Our Discord platform scaled to 200,000+ active members and the moderation bot RDK built handles event routing flawlessly with zero downtime and sub-50ms latency."',
    name: 'Tom Keller',
    co: 'Founder, GamingHub — Community Automation',
    avatar: 'TK',
  },
];

export const Testimonials: React.FC = () => {
  return (
    <section>
      <div className="section-inner">
        <div className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <Award size={14} /> Client Endorsements
        </div>
        <h2 className="section-title">Verified Client Feedback</h2>
        <p className="section-sub">Here is how engineering leaders and founders evaluate our software delivery.</p>
        <div className="testi-grid">
          {testimonialsData.map((t, idx) => (
            <div key={idx} className="testi-card visible" style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', gap: '0.2rem', color: '#f59e0b', marginBottom: '1rem' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="#f59e0b" stroke="#f59e0b" />
                  ))}
                </div>
                <div className="testi-text" style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text2, #d1d5db)', fontStyle: 'italic' }}>
                  {t.text}
                </div>
              </div>
              <div className="testi-author" style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="avatar" style={{ background: '#ea580c', color: '#ffffff', fontWeight: 800, fontSize: '0.85rem' }}>
                  {t.avatar}
                </div>
                <div>
                  <div className="testi-name" style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t.name}</div>
                  <div className="testi-co" style={{ fontSize: '0.75rem', color: 'var(--text3, #9ca3af)' }}>{t.co}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
