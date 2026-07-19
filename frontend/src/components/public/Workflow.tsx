import React from 'react';

const workflowSteps = [
  { num: '💬', name: 'Consultation', desc: 'Free discovery call' },
  { num: '📋', name: 'Planning', desc: 'Scope & timeline' },
  { num: '🎨', name: 'Design', desc: 'UI/UX prototypes' },
  { num: '⚙️', name: 'Development', desc: 'Iterative sprints' },
  { num: '🧪', name: 'Testing', desc: 'QA & review' },
  { num: '🚀', name: 'Deployment', desc: 'Go live' },
  { num: '🛡️', name: 'Support', desc: 'Ongoing care' },
];

export const Workflow: React.FC = () => {
  return (
    <section className="workflow-section" id="about">
      <div className="section-inner">
        <div className="section-label">How we work</div>
        <h2 className="section-title">From idea to deployment</h2>
        <p className="section-sub">
          A structured process that keeps you in the loop at every step — no surprises, just progress.
        </p>
        <div className="workflow-steps">
          {workflowSteps.map((step, idx) => (
            <div key={idx} className="step-item visible">
              <div className="step-num">{step.num}</div>
              <div className="step-name">{step.name}</div>
              <div className="step-desc">{step.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
