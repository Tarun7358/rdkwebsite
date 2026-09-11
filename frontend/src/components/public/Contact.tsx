import React, { useState } from 'react';
import { 
  Mail, Bot, MapPin, Clock, Send, ArrowRight, LifeBuoy, CheckCircle2,
  User, Building2, MessageSquare, Layers, Cpu, Calendar, FileText,
  ChevronDown
} from 'lucide-react';
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
              <div className="contact-icon" style={{ background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.2)', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={18} color="var(--primary)" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text2)', fontWeight: 700, textTransform: 'uppercase' }}>Direct Email</div>
                <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.925rem' }}>hello@rdkreations.io</div>
              </div>
            </div>

            <div className="contact-detail" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
              <div className="contact-icon" style={{ background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.2)', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={18} color="var(--primary)" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text2)', fontWeight: 700, textTransform: 'uppercase' }}>Discord Community</div>
                <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.925rem' }}>discord.gg/rdkreations</div>
              </div>
            </div>

            <div className="contact-detail" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
              <div className="contact-icon" style={{ background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.2)', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={18} color="var(--primary)" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text2)', fontWeight: 700, textTransform: 'uppercase' }}>Global Operations</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text)', fontWeight: 600 }}>Remote-First · GMT+0 to GMT+5:30</div>
              </div>
            </div>

            <div className="contact-detail" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
              <div className="contact-icon" style={{ background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.2)', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={18} color="var(--primary)" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text2)', fontWeight: 700, textTransform: 'uppercase' }}>SLA Response Time</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text)', fontWeight: 600 }}>Within 2 Hours (Business Days)</div>
              </div>
            </div>

            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--card-glass)', borderRadius: '16px', border: '1px solid var(--border)', backdropFilter: 'blur(12px)' }}>
              <div style={{ fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontSize: '0.95rem' }}>
                <LifeBuoy size={18} /> Existing Client Support Portal
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text2)', marginBottom: '1rem', lineHeight: '1.5' }}>
                Already an RDK partner? Submit active tickets for sprint updates, SLA tracking, and code revisions.
              </div>
              <a href="#tickets" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', borderColor: 'var(--primary)', fontSize: '0.85rem' }}>
                Open Support Ticket <ArrowRight size={14} />
              </a>
            </div>
          </div>

          {/* Form */}
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="field-label">
                  <span>Full Name <span className="req">*</span></span>
                </label>
                <div className="input-field-group">
                  <div className="input-icon-left">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    placeholder="Alex Johnson"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="field-label">
                  <span>Company / Organization</span>
                  <span className="field-label-hint">Optional</span>
                </label>
                <div className="input-field-group">
                  <div className="input-icon-left">
                    <Building2 size={16} />
                  </div>
                  <input
                    type="text"
                    placeholder="Acme Enterprise"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="field-label">
                  <span>Work Email <span className="req">*</span></span>
                </label>
                <div className="input-field-group">
                  <div className="input-icon-left">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    placeholder="alex@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="field-label">
                  <span>Discord Handle</span>
                  <span className="field-label-hint">Live dev chat</span>
                </label>
                <div className="input-field-group">
                  <div className="input-icon-left">
                    <MessageSquare size={16} />
                  </div>
                  <input
                    type="text"
                    placeholder="alex#0001"
                    value={formData.discord}
                    onChange={(e) => setFormData({ ...formData, discord: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="field-label">
                  <span>Target Service Architecture</span>
                </label>
                <div className="input-field-group">
                  <div className="input-icon-left">
                    <Layers size={16} />
                  </div>
                  <select
                    value={formData.projectType}
                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                  >
                    <option>Website & SaaS Engineering</option>
                    <option>Mobile Application (PWA / Native)</option>
                    <option>Discord Bot & Automation</option>
                    <option>AI Intelligence & RAG System</option>
                    <option>Full-Stack Enterprise Architecture</option>
                    <option>Cloud Infrastructure & DevOps</option>
                    <option>Custom Engineering</option>
                  </select>
                  <ChevronDown size={15} className="select-chevron" />
                </div>
              </div>

              <div className="form-group">
                <label className="field-label">
                  <span>Target Scope Scale</span>
                </label>
                <div className="input-field-group">
                  <div className="input-icon-left">
                    <Cpu size={16} />
                  </div>
                  <select
                    value={formData.budgetRange}
                    onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                  >
                    <option>MVP / Sprint Scope</option>
                    <option>Core Product Architecture</option>
                    <option>Enterprise Suite</option>
                    <option>Custom Retainer</option>
                  </select>
                  <ChevronDown size={15} className="select-chevron" />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="field-label">
                <span>Target Launch Date</span>
                <span className="field-label-hint">Estimated Milestone</span>
              </label>
              <div className="input-field-group">
                <div className="input-icon-left">
                  <Calendar size={16} />
                </div>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="field-label">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <FileText size={14} style={{ color: 'var(--primary)' }} />
                  Technical Specifications & Requirements <span className="req">*</span>
                </span>
                <span className="field-label-hint">Markdown supported</span>
              </label>
              <div className="textarea-field-group">
                <textarea
                  placeholder="Detail your target features, compliance requirements, third-party API integrations, and expected milestone timeline..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
            </div>

            <button type="submit" className="submit-btn-hero" disabled={isSubmitting}>
              {isSubmitting ? (
                <span>Submitting Scope Proposal...</span>
              ) : (
                <>
                  <span>Submit Technical Scope Proposal</span>
                  <Send size={16} className="send-icon" />
                </>
              )}
            </button>

            {submitted && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: '#10b981',
                marginTop: '1.25rem',
                padding: '1rem 1.25rem',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}>
                <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 800 }}>Scope proposal registered successfully!</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '2px' }}>
                    Queued for technical review. Our engineering leads will reach out within the SLA window.
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};
