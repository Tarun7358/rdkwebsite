import React, { useState } from 'react';
import { projectsApi } from '../../api/projects';
import { useAppStore } from '../../store/appStore';

export const Contact: React.FC = () => {
  const addToast = useAppStore((s) => s.addToast);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    discord: '',
    projectType: 'Website development',
    budgetRange: 'Under $1,000',
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
        addToast('Project request submitted successfully!', 'success');
        setFormData({
          name: '',
          company: '',
          email: '',
          discord: '',
          projectType: 'Website development',
          budgetRange: 'Under $1,000',
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
        <div className="section-label">Get in touch</div>
        <h2 className="section-title">Start your project</h2>
        <div className="contact-grid">
          <div className="contact-info">
            <h3>Let's build something great together</h3>
            <p>
              Tell us about your project and the RDK team will get back to you with a detailed proposal within 24 hours. Free consultation included.
            </p>
            <div className="contact-detail">
              <div className="contact-icon">📧</div>
              <div>
                <div>Email</div>
                <div style={{ color: 'var(--blue)', fontWeight: 600 }}>hello@rdkreations.io</div>
              </div>
            </div>
            <div className="contact-detail">
              <div className="contact-icon">🎮</div>
              <div>
                <div>Discord</div>
                <div style={{ color: 'var(--blue)', fontWeight: 600 }}>discord.gg/rdkreations</div>
              </div>
            </div>
            <div className="contact-detail">
              <div className="contact-icon">📍</div>
              <div>
                <div>Office</div>
                <div>Remote-first · GMT+0 to GMT+5:30</div>
              </div>
            </div>
            <div className="contact-detail">
              <div className="contact-icon">🕐</div>
              <div>
                <div>Business hours</div>
                <div>Mon–Fri, 9am–7pm</div>
              </div>
            </div>
            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--bg2)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 800, marginBottom: '0.5rem' }}>🎫 Or open a support ticket</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text3)', marginBottom: '1rem', lineHeight: '1.4' }}>
                Already an RDK client? Use our ticket system for project updates and support.
              </div>
              <a href="#tickets" className="btn btn-ghost" style={{ display: 'inline-block' }}>Open ticket →</a>
            </div>
          </div>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Full name *</label>
                <input
                  type="text"
                  placeholder="Alex Johnson"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Company</label>
                <input
                  type="text"
                  placeholder="Acme Inc."
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  placeholder="alex@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Discord username</label>
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
                <label>Project type</label>
                <select
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                >
                  <option>Website development</option>
                  <option>Mobile app</option>
                  <option>Discord bot</option>
                  <option>AI solution</option>
                  <option>Full-stack platform</option>
                  <option>Cloud / DevOps</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Budget range</label>
                <select
                  value={formData.budgetRange}
                  onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                >
                  <option>Under $1,000</option>
                  <option>$1,000 – $5,000</option>
                  <option>$5,000 – $15,000</option>
                  <option>$15,000 – $50,000</option>
                  <option>$50,000+</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Deadline</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Project description *</label>
              <textarea
                placeholder="Tell the RDK team about your project — what you're building, who it's for, and any specific requirements or integrations..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Send project request ↗'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
