import React from 'react';
import { Briefcase, CheckCircle2, ArrowUpRight, DollarSign } from 'lucide-react';

export const Pricing: React.FC = () => {
  return (
    <section id="pricing">
      <div className="section-inner">
        <div className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <DollarSign size={14} /> Transparent Engagement Models
        </div>
        <h2 className="section-title">Tailored Project Engineering Quotes</h2>
        <p className="section-sub">
          We don't sell generic templates. Tell us your exact specifications and we will engineer a custom proposal matching your requirements and milestone schedule.
        </p>
        <div className="pricing-card" style={{ background: 'var(--card, #111827)', border: '1px solid var(--border, #374151)', borderRadius: '16px', padding: '2.5rem', textAlign: 'center' }}>
          <div className="pricing-icon" style={{ background: 'rgba(234, 88, 12, 0.15)', color: '#ea580c', border: '1px solid rgba(234, 88, 12, 0.3)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
            <Briefcase size={28} />
          </div>
          <h3 className="pricing-title" style={{ fontSize: '1.5rem', fontWeight: 800 }}>Milestone-Based Custom Architecture</h3>
          <p className="pricing-sub" style={{ maxWidth: '600px', margin: '0.5rem auto 2rem auto', color: 'var(--text2, #d1d5db)', fontSize: '0.95rem' }}>
            No fixed arbitrary tiers. Receive a complete technical specification document outlining sprint timelines, key deliverables, and structured milestone billing.
          </p>
          
          <div className="pricing-features" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', textAlign: 'left', maxWidth: '750px', margin: '0 auto 2rem auto' }}>
            {[
              'Complimentary 30-Min Discovery Session',
              'Detailed Technical Scope Document',
              'Sprint Delivery Schedule Guarantee',
              'Milestone-Based Escrow Payments',
              'Infrastructure Budget Planning',
              'Zero Hidden Maintenance Fees',
              'Code Quality & Security Guarantee',
              'Post-Deployment Support SLA'
            ].map((feat, idx) => (
              <div key={idx} className="pf-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text, #ffffff)', fontWeight: 600 }}>
                <CheckCircle2 size={16} color="#4ade80" style={{ flexShrink: 0 }} />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          <a href="#contact" className="btn btn-primary btn-xl" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#ea580c', borderColor: '#ea580c' }}>
            Request Engineering Quote <ArrowUpRight size={20} />
          </a>
        </div>
      </div>
    </section>
  );
};
