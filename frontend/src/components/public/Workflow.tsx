import React from 'react';
import { MessageSquare, ClipboardList, Palette, Cpu, TestTube, Rocket, ShieldCheck, GitCommit } from 'lucide-react';

const workflowSteps = [
  { num: '01', icon: <MessageSquare size={22} color="#ea580c" />, name: 'Technical Discovery', desc: 'Requirements analysis & scope definition' },
  { num: '02', icon: <ClipboardList size={22} color="#ea580c" />, name: 'Architecture Blueprint', desc: 'System design & technology stack selection' },
  { num: '03', icon: <Palette size={22} color="#ea580c" />, name: 'UX & Interactive Design', desc: 'High-fidelity wireframes & component libraries' },
  { num: '04', icon: <Cpu size={22} color="#ea580c" />, name: 'Agile Engineering', desc: 'Sprint-based development & automated CI/CD' },
  { num: '05', icon: <TestTube size={22} color="#ea580c" />, name: 'QA & Security Audit', desc: 'Performance benchmarking & vulnerability testing' },
  { num: '06', icon: <Rocket size={22} color="#ea580c" />, name: 'Production Launch', desc: 'Zero-downtime deployment & DNS configuration' },
  { num: '07', icon: <ShieldCheck size={22} color="#ea580c" />, name: 'SLA Maintenance', desc: 'Continuous monitoring & enterprise support' },
];

export const Workflow: React.FC = () => {
  return (
    <section className="workflow-section" id="about" style={{ background: 'var(--bg2, #f8f9fa)' }}>
      <div className="section-inner">
        <div className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <GitCommit size={14} /> Software Lifecycle Methodology
        </div>
        <h2 className="section-title">Structured Engineering Workflow</h2>
        <p className="section-sub">
          A transparent, sprint-based process designed to deliver enterprise software on schedule with zero guesswork.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.25rem', marginTop: '2.5rem' }}>
          {workflowSteps.map((step, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--card, #ffffff)',
                border: '1px solid var(--border, #e5e7eb)',
                borderRadius: '16px',
                padding: '1.25rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              <div style={{ background: 'rgba(234, 88, 12, 0.12)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>
                {step.icon}
              </div>
              <div style={{ fontSize: '0.725rem', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>
                STEP {step.num}
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text, #111827)', marginBottom: '0.4rem', lineHeight: '1.3' }}>
                {step.name}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text2, #4b5563)', lineHeight: '1.4', fontWeight: 500 }}>
                {step.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
