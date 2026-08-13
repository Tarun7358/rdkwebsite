import React, { useState } from 'react';
import { projectsApi } from '../../api/projects';
import { useAppStore } from '../../store/appStore';
import { Mail, Bot, MapPin, Clock, LifeBuoy, Send, ArrowRight } from 'lucide-react';

export const Contact: React.FC = () => {
  const addToast = useAppStore((s) => s.addToast);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    discord: '',
    projectType: 'Website development',
    budgetRange: 'Standard Scope',
    deadline: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.description) {
      addToast('Please fill out all required fields.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await projectsApi.request({
        name: `${formData.projectType} for ${formData.company || formData.name}`,
        client: formData.email,
        budget: formData.budgetRange,
        deadline: formData.deadline || new Date().toISOString().split('T')[0],
        desc: `Client Name: ${formData.name}\nDiscord: ${formData.discord}\n\nDescription:\n${formData.description}`,
      });
      if (res.success) {
        addToast('Project inquiry submitted successfully!', 'success');
        setFormData({
          name: '',
          company: '',
          email: '',
          discord: '',
          projectType: 'Website development',
          budgetRange: 'Standard Scope',
          deadline: '',
          description: '',
        });
      } else {
        addToast(res.message || 'Failed to submit project request.', 'error');
      }
    } catch (err: any) {
      addToast(err.message || 'An error occurred during submission.', 'error');
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
        <div className="contact-grid">
          <div className="contact-info">
            <h3>Architectural Discovery & Proposal</h3>
            <p>
              Provide your technical specifications and our engineering leads will deliver a formal scope document within 24 hours.
            </p>
            
            <div className="contact-detail" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.25rem' }}>
              <div className="contact-icon" style={{ background: 'var(--surface, #1f2937)', border: '1px solid var(--border, #374151)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={18} color="#ea580c" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text3, #9ca3af)', fontWeight: 700 }}>Direct Email</div>
                <div style={{ color: '#ea580c', fontWeight: 700, fontSize: '0.9rem' }}>hello@rdkreations.io</div>
              </div>
            </div>

            <div className="contact-detail" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
              <div className="contact-icon" style={{ background: 'var(--surface, #1f2937)', border: '1px solid var(--border, #374151)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={18} color="#ea580c" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text3, #9ca3af)', fontWeight: 700 }}>Discord Community</div>
                <div style={{ color: '#ea580c', fontWeight: 700, fontSize: '0.9rem' }}>discord.gg/rdkreations</div>
              </div>
            </div>

            <div className="contact-detail" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
              <div className="contact-icon" style={{ background: 'var(--surface, #1f2937)', border: '1px solid var(--border, #374151)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={18} color="#ea580c" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text3, #9ca3af)', fontWeight: 700 }}>Global Operations</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text, #ffffff)' }}>Remote-First · GMT+0 to GMT+5:30</div>
              </div>
            </div>

            <div className="contact-detail" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
              <div className="contact-icon" style={{ background: 'var(--surface, #1f2937)', border: '1px solid var(--border, #374151)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={18} color="#ea580c" />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text3, #9ca3af)', fontWeight: 700 }}>SLA Business Hours</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text, #ffffff)' }}>Mon–Fri, 9:00 AM – 7:00 PM</div>
              </div>
            </div>

            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--surface, #1f2937)', borderRadius: '12px', border: '1px solid var(--border, #374151)' }}>
              <div style={{ fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ea580c' }}>
                <LifeBuoy size={18} /> Existing Client Support Portal
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text2, #d1d5db)', marginBottom: '1rem', lineHeight: '1.4' }}>
                Already an RDK partner? Submit active tickets for sprint updates and code revisions.
              </div>
              <a href="#tickets" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                Open Support Ticket <ArrowRight size={14} />
              </a>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  placeholder="Alex Johnson"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Company / Organization</label>
                <input
                  type="text"
                  placeholder="Acme Enterprise"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Work Email *</label>
                <input
                  type="email"
                  placeholder="alex@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Discord Handle</label>
                <input
                  type="text"
                  placeholder="alex#0001"
                  value={formData.discord}
                  onChange={(e) => setFormData({ ...formData, discord: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Target Service Architecture</label>
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
              </div>
              <div className="form-group">
                <label>Target Scope Scale</label>
                <select
                  value={formData.budgetRange}
                  onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                >
                  <option>MVP / Sprint Scope</option>
                  <option>Core Product Architecture</option>
                  <option>Enterprise Suite</option>
                  <option>Custom Retainer</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Target Target Launch Date</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Technical Specifications & Requirements *</label>
              <textarea
                placeholder="Detail your target features, compliance requirements, third-party API integrations, and expected milestone timeline..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#ea580c', borderColor: '#ea580c' }}>
              {isSubmitting ? 'Submitting Scope...' : 'Submit Technical Scope Proposal'} <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
