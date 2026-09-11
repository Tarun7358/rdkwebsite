import React from 'react';
import { MessageSquare, ClipboardList, Palette, Cpu, TestTube, Rocket, ShieldCheck, GitCommit } from 'lucide-react';

const workflowSteps = [
  { num: '01', icon: <MessageSquare size={20} color="#a855f7" />, name: 'Technical Discovery', desc: 'Requirements analysis & scope definition' },
  { num: '02', icon: <ClipboardList size={20} color="#a855f7" />, name: 'Architecture Blueprint', desc: 'System design & technology stack selection' },
  { num: '03', icon: <Palette size={20} color="#a855f7" />, name: 'UX & Interactive Design', desc: 'High-fidelity wireframes & component libraries' },
  { num: '04', icon: <Cpu size={20} color="#a855f7" />, name: 'Agile Engineering', desc: 'Sprint-based development & automated CI/CD' },
  { num: '05', icon: <TestTube size={20} color="#a855f7" />, name: 'QA & Security Audit', desc: 'Performance benchmarking & vulnerability testing' },
  { num: '06', icon: <Rocket size={20} color="#a855f7" />, name: 'Production Launch', desc: 'Zero-downtime deployment & DNS configuration' },
  { num: '07', icon: <ShieldCheck size={20} color="#a855f7" />, name: 'SLA Maintenance', desc: 'Continuous monitoring & enterprise support' },
];

export const Workflow: React.FC = () => {
  return (
    <section className="workflow-section" id="about" style={{ background: 'var(--bg2)', padding: '5rem 0', position: 'relative' }}>
      <div className="section-inner">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', margin: '0 auto 0.75rem' }}>
            <GitCommit size={14} /> Software Lifecycle Methodology
          </div>
          <h2 className="section-title">Structured Engineering Workflow</h2>
          <p className="section-sub" style={{ margin: '0 auto' }}>
            A transparent, sprint-based process designed to deliver enterprise software on schedule with zero guesswork.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.25rem' }}>
          {workflowSteps.map((step, idx) => (
            <div
              key={idx}
              className="glass-card"
              style={{
                background: 'var(--card-glass)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '1.5rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                boxShadow: 'var(--card-shadow)',
                backdropFilter: 'blur(12px)',
                transition: 'all 0.25s ease',
                position: 'relative'
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
              <div style={{ 
                background: 'rgba(124, 58, 237, 0.12)', 
                border: '1px solid rgba(124, 58, 237, 0.25)',
                width: '46px', 
                height: '46px', 
                borderRadius: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: '1rem' 
              }}>
                {step.icon}
              </div>
              <div style={{ 
                fontFamily: 'var(--font-mono, monospace)', 
                fontSize: '0.725rem', 
                fontWeight: 800, 
                color: 'var(--primary)', 
                letterSpacing: '0.08em', 
                marginBottom: '0.4rem' 
              }}>
                STEP {step.num}
              </div>
              <div style={{ 
                fontFamily: 'var(--font-display)', 
                fontWeight: 700, 
                fontSize: '0.92rem', 
                color: 'var(--text)', 
                marginBottom: '0.4rem', 
                lineHeight: '1.3' 
              }}>
                {step.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text2)', lineHeight: '1.45', fontWeight: 400 }}>
                {step.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

