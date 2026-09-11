import React from 'react';
import { Briefcase, CheckCircle2, ArrowUpRight } from 'lucide-react';

export const Pricing: React.FC = () => {
  return (
    <section id="pricing">
      <div className="section-inner">
        <h2 className="section-title">Tailored Project Engineering Quotes</h2>
        <p className="section-sub">
          We don't sell generic templates. Tell us your exact specifications and we will engineer a custom proposal matching your requirements and milestone schedule.
        </p>
        <div className="pricing-card" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '24px', padding: '3rem 2rem', textAlign: 'center', boxShadow: 'var(--shadow-lg), 0 0 35px rgba(124, 58, 237, 0.08)' }}>
          <div className="pricing-icon" style={{ background: 'rgba(124, 58, 237, 0.12)', color: 'var(--primary)', border: '1px solid rgba(124, 58, 237, 0.25)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
            <Briefcase size={28} />
          </div>
          <h3 className="pricing-title" style={{ fontSize: '1.65rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text)' }}>Milestone-Based Custom Architecture</h3>
          <p className="pricing-sub" style={{ maxWidth: '620px', margin: '0.6rem auto 2.25rem auto', color: 'var(--text2)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            No fixed arbitrary tiers. Receive a complete technical specification document outlining sprint timelines, key deliverables, and structured milestone billing.
          </p>
          
          <div className="pricing-features" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', textAlign: 'left', maxWidth: '750px', margin: '0 auto 2.5rem auto' }}>
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
              <div key={idx} className="pf-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text)', fontWeight: 600 }}>
                <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0 }} />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          <a href="#meetings" className="btn btn-primary btn-xl" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            Book Consultation & Scope <ArrowUpRight size={20} />
          </a>
        </div>
      </div>
    </section>
  );
};
