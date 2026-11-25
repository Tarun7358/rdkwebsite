import React, { useState } from 'react';
import { Globe, ArrowRight, X } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { applicationsApi } from '../../api/applications';
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

export const Careers: React.FC = () => {
  const storeCareers = useAppStore((s) => s.careers);
  const addToast = useAppStore((s) => s.addToast);
  const careers = storeCareers && storeCareers.length > 0 ? storeCareers : defaultCareers;

  const [selectedRole, setSelectedRole] = useState<CareerItem | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [resume, setResume] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !name.trim() || !email.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await applicationsApi.apply({
        name: name.trim(),
        email: email.trim(),
        position: selectedRole.title,
        resume: resume.trim() || 'Not provided'
      });
      if (res.success) {
        addToast(`Application submitted for ${selectedRole.title}! Confirmation sent to ${email.trim()}.`, 'success');
        setSelectedRole(null);
        setName('');
        setEmail('');
        setResume('');
      } else {
        addToast(res.message || 'Failed to submit application', 'error');
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to submit application', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="careers" style={{ padding: '5rem 0', background: 'var(--bg2)' }}>
      <div className="section-inner">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 className="section-title">Open Positions at RDK</h2>
          <p className="section-sub" style={{ margin: '0 auto' }}>
            We&apos;re building mission-critical systems and looking for world-class builders. All roles are 100% remote.
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
                <button
                  type="button"
                  onClick={() => setSelectedRole(job)}
                  className={`btn ${job.type === 'Freelance' ? 'btn-outline' : 'btn-primary'}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', padding: '0.55rem 1.25rem' }}
                >
                  {job.type === 'Freelance' ? 'Apply for Contract' : 'Apply for Role'} <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Role Application Modal */}
      {selectedRole && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--card)', border: '1px solid rgba(124, 58, 237, 0.35)', borderRadius: '20px', maxWidth: '440px', width: '100%', padding: '1.75rem', position: 'relative' }}>
            <button onClick={() => setSelectedRole(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              RDK Tech Careers • {selectedRole.type}
            </div>
            <h3 style={{ fontWeight: 800, fontSize: '1.25rem', margin: '0.25rem 0 0.35rem', color: 'var(--text)' }}>
              {selectedRole.title}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text2)', marginBottom: '1.1rem' }}>
              {selectedRole.dept}
            </p>

            <form onSubmit={handleApplySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Full Name"
                style={{ padding: '0.75rem 0.9rem', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '10px', fontSize: '0.875rem' }}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your Email Address"
                style={{ padding: '0.75rem 0.9rem', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '10px', fontSize: '0.875rem' }}
              />
              <input
                type="text"
                required
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                placeholder="Portfolio / GitHub / Resume Link"
                style={{ padding: '0.75rem 0.9rem', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '10px', fontSize: '0.875rem' }}
              />
              <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ justifyContent: 'center', marginTop: '0.25rem' }}>
                {isSubmitting ? 'Submitting...' : 'Submit Application'} <ArrowRight size={15} />
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
