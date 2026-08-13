import React from 'react';
import { MessageSquare, ClipboardList, Palette, Cpu, TestTube, Rocket, ShieldCheck, GitCommit } from 'lucide-react';

const workflowSteps = [
  { num: '01', icon: <MessageSquare size={20} />, name: 'Technical Discovery', desc: 'Requirements analysis & scope definition' },
  { num: '02', icon: <ClipboardList size={20} />, name: 'Architecture Blueprint', desc: 'System design & technology stack selection' },
  { num: '03', icon: <Palette size={20} />, name: 'UX & Interactive Design', desc: 'High-fidelity wireframes & component libraries' },
  { num: '04', icon: <Cpu size={20} />, name: 'Agile Engineering', desc: 'Sprint-based development & automated CI/CD' },
  { num: '05', icon: <TestTube size={20} />, name: 'QA & Security Audit', desc: 'Performance benchmarking & vulnerability testing' },
  { num: '06', icon: <Rocket size={20} />, name: 'Production Launch', desc: 'Zero-downtime deployment & DNS configuration' },
  { num: '07', icon: <ShieldCheck size={20} />, name: 'SLA Maintenance', desc: 'Continuous monitoring & enterprise support' },
];

export const Workflow: React.FC = () => {
  return (
    <section className="workflow-section" id="about">
      <div className="section-inner">
        <div className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <GitCommit size={14} /> Software Lifecycle Methodology
        </div>
        <h2 className="section-title">Structured Engineering Workflow</h2>
        <p className="section-sub">
          A transparent, sprint-based process designed to deliver enterprise software on schedule with zero guesswork.
        </p>
        <div className="workflow-steps">
          {workflowSteps.map((step, idx) => (
            <div key={idx} className="step-item visible" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ background: 'rgba(234, 88, 12, 0.15)', color: '#ea580c', border: '1px solid rgba(234, 88, 12, 0.3)', width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                {step.icon}
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ea580c', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                STEP {step.num}
              </div>
              <div className="step-name" style={{ fontWeight: 700, fontSize: '0.95rem' }}>{step.name}</div>
              <div className="step-desc" style={{ fontSize: '0.8rem', color: 'var(--text3, #9ca3af)', marginTop: '0.2rem' }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
