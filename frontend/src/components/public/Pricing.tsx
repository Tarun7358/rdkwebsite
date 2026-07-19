import React from 'react';

export const Pricing: React.FC = () => {
  return (
    <section id="pricing">
      <div className="section-inner">
        <div className="section-label">Pricing</div>
        <h2 className="section-title">Every project is different</h2>
        <p className="section-sub">
          RDK doesn't do cookie-cutter packages. Tell us what you need and we'll build a proposal that fits your scope and budget.
        </p>
        <div className="pricing-card">
          <div className="pricing-icon">💼</div>
          <div className="pricing-title">Custom quote, every time</div>
          <div className="pricing-sub">
            No fixed pricing tiers — because no two projects are the same. Get a detailed RDK proposal with timeline, deliverables, and payment schedule.
          </div>
          <div className="pricing-features">
            <div className="pf-item">Free 30-min consultation</div>
            <div className="pf-item">Detailed scope document</div>
            <div className="pf-item">Timeline estimate</div>
            <div className="pf-item">Milestone-based payments</div>
            <div className="pf-item">Budget planning support</div>
            <div className="pf-item">No hidden fees</div>
            <div className="pf-item">Revisions included</div>
            <div className="pf-item">Post-launch support</div>
          </div>
          <a href="#contact" className="btn btn-primary btn-xl">Request a quote ↗</a>
        </div>
      </div>
    </section>
  );
};
