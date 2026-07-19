import React from 'react';

const testimonialsData = [
  {
    stars: '★★★★★',
    text: '"RDK delivered our marketplace in exactly 6 weeks as promised. The code quality was exceptional — clean, well-documented, and easy to hand off to our in-house team."',
    name: 'Marcus Reid',
    co: 'CEO, Luxora — E-commerce platform',
    avatar: 'MR',
  },
  {
    stars: '★★★★★',
    text: '"The AI assistant RDK built for us handles 80% of our support tickets automatically. It\'s saved us 40 hours a week and our customers love the instant responses."',
    name: 'Priya Lal',
    co: 'CTO, SupportBase — AI integration',
    avatar: 'PL',
  },
  {
    stars: '★★★★★',
    text: '"Our Discord server went from 10K to 200K members and the bot RDK built handled everything flawlessly. Zero downtime, near-instant responses, and it saved our mods hours daily."',
    name: 'Tom Keller',
    co: 'Founder, GamingHub — Discord bot',
    avatar: 'TK',
  },
];

export const Testimonials: React.FC = () => {
  return (
    <section>
      <div className="section-inner">
        <div className="section-label">Client reviews</div>
        <h2 className="section-title">What clients say</h2>
        <p className="section-sub">Don't take our word for it — here's what the teams we've worked with have to say.</p>
        <div className="testi-grid">
          {testimonialsData.map((t, idx) => (
            <div key={idx} className="testi-card visible">
              <div className="stars">{t.stars}</div>
              <div className="testi-text">{t.text}</div>
              <div className="testi-author">
                <div className="avatar">{t.avatar}</div>
                <div>
                  <div className="testi-name">{t.name}</div>
                  <div className="testi-co">{t.co}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
