import React from 'react';
import { useAppStore } from '../../store/appStore';
import type { CareerItem } from '../../types';

const defaultCareers: CareerItem[] = [
  {
    id: 1,
    title: 'Senior Frontend Developer',
    type: 'Full-time',
    dept: 'Engineering · Remote',
    tags: ['React', 'Next.js', 'TypeScript', '3+ years']
  },
  {
    id: 2,
    title: 'Backend Developer (NestJS)',
    type: 'Full-time',
    dept: 'Engineering · Remote',
    tags: ['NestJS', 'PostgreSQL', 'Node.js', '2+ years']
  },
  {
    id: 3,
    title: 'Flutter Developer',
    type: 'Full-time',
    dept: 'Mobile · Remote',
    tags: ['Flutter', 'Dart', 'Firebase', '2+ years']
  },
  {
    id: 4,
    title: 'AI/ML Engineer',
    type: 'Full-time',
    dept: 'AI · Remote',
    tags: ['Python', 'LangChain', 'OpenAI', '3+ years']
  },
  {
    id: 5,
    title: 'Discord Bot Developer',
    type: 'Freelance',
    dept: 'Bots · Remote',
    tags: ['Discord.js', 'Python', '1+ years']
  },
  {
    id: 6,
    title: 'UI/UX Designer',
    type: 'Full-time',
    dept: 'Design · Remote',
    tags: ['Figma', 'Framer', 'Design systems', '3+ years']
  }
];

import { Globe, ArrowRight } from 'lucide-react';

export const Careers: React.FC = () => {
  const storeCareers = useAppStore((s) => s.careers);
  const careers = storeCareers && storeCareers.length > 0 ? storeCareers : defaultCareers;

  return (
    <section id="careers" style={{ padding: '5rem 0', background: 'var(--bg2)' }}>
      <div className="section-inner">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 className="section-title">Open Positions at RDK</h2>
          <p className="section-sub" style={{ margin: '0 auto' }}>
            We're building mission-critical systems and looking for world-class builders. All roles are 100% remote.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {careers.map((job) => (
            <div
              key={job.id}
              className="glass-card"
              style={{
                background: 'var(--card-glass)',
                border: '1px solid var(--border)',
                borderRadius: '18px',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                backdropFilter: 'blur(12px)',
                boxShadow: 'var(--card-shadow)',
                transition: 'all 0.25s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              <div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)', lineHeight: 1.3 }}>
                    {job.title}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem', color: 'var(--text2)', marginBottom: '1.25rem' }}>
                  <Globe size={14} color="var(--primary)" /> {job.dept}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1.5rem' }}>
                  {job.tags.map((t, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '0.25rem 0.65rem',
                        borderRadius: '6px',
                        background: 'var(--bg)',
                        color: 'var(--text2)',
                        border: '1px solid var(--border)',
                        fontFamily: 'var(--font-mono, monospace)'
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <a
                  href="mailto:careers@rdkreations.io?subject=Career%20Application"
                  className={`btn ${job.type === 'Freelance' ? 'btn-outline' : 'btn-primary'}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', padding: '0.55rem 1.25rem' }}
                >
                  {job.type === 'Freelance' ? 'Apply for Contract' : 'Apply for Role'} <ArrowRight size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

