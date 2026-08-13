import React, { useState } from 'react';
import { Mail, Bot, MapPin, Clock, Send, ArrowRight, LifeBuoy, CheckCircle2 } from 'lucide-react';
import { projectsApi } from '../../api/projects';
import { useAppStore } from '../../store/appStore';

export const Contact: React.FC = () => {
  const addToast = useAppStore((s) => s.addToast);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    discord: '',
    projectType: 'Website & SaaS Engineering',
    budgetRange: 'MVP / Sprint Scope',
    deadline: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.description) return;
    setIsSubmitting(true);

    try {
      const res = await projectsApi.request({
        name: formData.projectType,
        client: formData.name,
        desc: `[Client Email: ${formData.email}] ${formData.description}`,
        budget: formData.budgetRange,
        deadline: formData.deadline || 'Flexible'
      });


      if (res.success) {
        setSubmitted(true);
        addToast('Project proposal submitted cleanly to engineering team!', 'success');
        setFormData({
          name: '',
          company: '',
          email: '',
          discord: '',
          projectType: 'Website & SaaS Engineering',
          budgetRange: 'MVP / Sprint Scope',
          deadline: '',
          description: ''
        });
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        addToast(res.message || 'Failed to submit project request', 'error');
      }
    } catch (err: any) {
      addToast(err.message || 'An error occurred submitting request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact">
      <div className="section-inner">
        <div className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <Mail size={14} /> Direct Engagement
        </div>
        <h2 className="section-title">Initiate Your Software Project</h2>
        <p className="section-sub" style={{ marginBottom: '2.5rem' }}>
          Provide your technical specifications and our engineering leads will deliver a formal scope proposal within 24 hours.
        </p>

        <div className="contact-grid">
          <div className="contact-info">
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text, #111827)' }}>
              Architectural Discovery & Proposal
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text2, #6b7280)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Direct technical access to RDK leads for architectural breakdown, security audits, and milestone timelines.
            </p>
            
            <div className="contact-detail" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.25rem' }}>
              <div className="contact-icon" style={{ background: 'var(--bg2, #f8f9fa)', border: '1px solid var(--border, #e5e7eb)', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={18} color="#ea580c" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text2, #6b7280)', fontWeight: 700, textTransform: 'uppercase' }}>Direct Email</div>
                <div style={{ color: '#ea580c', fontWeight: 700, fontSize: '0.925rem' }}>hello@rdkreations.io</div>
              </div>
            </div>

            <div className="contact-detail" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
              <div className="contact-icon" style={{ background: 'var(--bg2, #f8f9fa)', border: '1px solid var(--border, #e5e7eb)', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={18} color="#ea580c" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text2, #6b7280)', fontWeight: 700, textTransform: 'uppercase' }}>Discord Community</div>
                <div style={{ color: '#ea580c', fontWeight: 700, fontSize: '0.925rem' }}>discord.gg/rdkreations</div>
              </div>
            </div>

            <div className="contact-detail" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
              <div className="contact-icon" style={{ background: 'var(--bg2, #f8f9fa)', border: '1px solid var(--border, #e5e7eb)', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={18} color="#ea580c" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text2, #6b7280)', fontWeight: 700, textTransform: 'uppercase' }}>Global Operations</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text, #111827)', fontWeight: 600 }}>Remote-First · GMT+0 to GMT+5:30</div>
              </div>
            </div>

            <div className="contact-detail" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
              <div className="contact-icon" style={{ background: 'var(--bg2, #f8f9fa)', border: '1px solid var(--border, #e5e7eb)', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={18} color="#ea580c" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text2, #6b7280)', fontWeight: 700, textTransform: 'uppercase' }}>SLA Response Time</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text, #111827)', fontWeight: 600 }}>Within 2 Hours (Business Days)</div>
              </div>
            </div>

            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--bg2, #f8f9fa)', borderRadius: '16px', border: '1px solid var(--border, #e5e7eb)' }}>
              <div style={{ fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ea580c', fontSize: '0.95rem' }}>
                <LifeBuoy size={18} /> Existing Client Support Portal
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text2, #6b7280)', marginBottom: '1rem', lineHeight: '1.5' }}>
                Already an RDK partner? Submit active tickets for sprint updates, SLA tracking, and code revisions.
              </div>
              <a href="#tickets" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#ea580c', borderColor: '#ea580c', fontSize: '0.85rem' }}>
                Open Support Ticket <ArrowRight size={14} />
              </a>
            </div>
          </div>

          {/* Form */}
          <form className="contact-form" onSubmit={handleSubmit} style={{ background: 'var(--card, #ffffff)', border: '1px solid var(--border, #e5e7eb)', borderRadius: '16px', padding: '2rem', boxShadow: 'var(--shadow-lg)' }}>
            <div className="form-row">
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text, #111827)', marginBottom: '0.4rem', display: 'block' }}>Full Name *</label>
                <input
                  type="text"
                  placeholder="Alex Johnson"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{ background: 'var(--bg2, #f8f9fa)', border: '1px solid var(--border, #e5e7eb)', color: 'var(--text, #111827)', padding: '0.7rem 1rem', borderRadius: '10px' }}
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text, #111827)', marginBottom: '0.4rem', display: 'block' }}>Company / Organization</label>
                <input
                  type="text"
                  placeholder="Acme Enterprise"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  style={{ background: 'var(--bg2, #f8f9fa)', border: '1px solid var(--border, #e5e7eb)', color: 'var(--text, #111827)', padding: '0.7rem 1rem', borderRadius: '10px' }}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text, #111827)', marginBottom: '0.4rem', display: 'block' }}>Work Email *</label>
                <input
                  type="email"
                  placeholder="alex@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  style={{ background: 'var(--bg2, #f8f9fa)', border: '1px solid var(--border, #e5e7eb)', color: 'var(--text, #111827)', padding: '0.7rem 1rem', borderRadius: '10px' }}
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text, #111827)', marginBottom: '0.4rem', display: 'block' }}>Discord Handle</label>
                <input
                  type="text"
                  placeholder="alex#0001"
                  value={formData.discord}
                  onChange={(e) => setFormData({ ...formData, discord: e.target.value })}
                  style={{ background: 'var(--bg2, #f8f9fa)', border: '1px solid var(--border, #e5e7eb)', color: 'var(--text, #111827)', padding: '0.7rem 1rem', borderRadius: '10px' }}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text, #111827)', marginBottom: '0.4rem', display: 'block' }}>Target Service Architecture</label>
                <select
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                  style={{ background: 'var(--bg2, #f8f9fa)', border: '1px solid var(--border, #e5e7eb)', color: 'var(--text, #111827)', padding: '0.7rem 1rem', borderRadius: '10px' }}
                >
                  <option>Website & SaaS Engineering</option>
                  <option>Mobile Application (PWA / Native)</option>
                  <option>Discord Bot & Automation</option>
                  <option>AI Intelligence & RAG System</option>
                  <option>Full-Stack Enterprise Architecture</option>
                  <option>Cloud Infrastructure & DevOps</option>
                  <option>Custom Engineering</option>
                </select>
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text, #111827)', marginBottom: '0.4rem', display: 'block' }}>Target Scope Scale</label>
                <select
                  value={formData.budgetRange}
                  onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                  style={{ background: 'var(--bg2, #f8f9fa)', border: '1px solid var(--border, #e5e7eb)', color: 'var(--text, #111827)', padding: '0.7rem 1rem', borderRadius: '10px' }}
                >
                  <option>MVP / Sprint Scope</option>
                  <option>Core Product Architecture</option>
                  <option>Enterprise Suite</option>
                  <option>Custom Retainer</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text, #111827)', marginBottom: '0.4rem', display: 'block' }}>Target Launch Date</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                style={{ background: 'var(--bg2, #f8f9fa)', border: '1px solid var(--border, #e5e7eb)', color: 'var(--text, #111827)', padding: '0.7rem 1rem', borderRadius: '10px' }}
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text, #111827)', marginBottom: '0.4rem', display: 'block' }}>Technical Specifications & Requirements *</label>
              <textarea
                placeholder="Detail your target features, compliance requirements, third-party API integrations, and expected milestone timeline..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                style={{ background: 'var(--bg2, #f8f9fa)', border: '1px solid var(--border, #e5e7eb)', color: 'var(--text, #111827)', padding: '0.7rem 1rem', borderRadius: '10px', minHeight: '120px' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#ea580c', borderColor: '#ea580c', padding: '0.8rem 1.75rem', borderRadius: '12px', fontWeight: 700 }}>
              {isSubmitting ? 'Submitting Scope...' : 'Submit Technical Scope Proposal'} <Send size={16} />
            </button>

            {submitted && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', marginTop: '1rem', fontWeight: 700, fontSize: '0.9rem' }}>
                <CheckCircle2 size={18} /> Scope proposal registered and queued for technical review!
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};
