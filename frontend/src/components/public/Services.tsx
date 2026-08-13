import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { Globe, Smartphone, Bot, Zap, Brain, Cloud, Clock, Calculator, CheckCircle2, ArrowRight, Layers } from 'lucide-react';

const iconMap: Record<number, React.ReactNode> = {
  1: <Globe size={24} />,
  2: <Smartphone size={24} />,
  3: <Bot size={24} />,
  4: <Zap size={24} />,
  5: <Brain size={24} />,
  6: <Cloud size={24} />,
};

const defaultServices = [
  {
    id: 1,
    name: 'Web Engineering',
    desc: 'Custom web platforms, SaaS applications, CMS architecture, enterprise portals, and high-performance e-commerce engines with SEO & speed optimization.',
    tags: ['Next.js', 'React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    delivery: '2–8 weeks',
    themeClass: 'icon-blue'
  },
  {
    id: 2,
    name: 'Mobile Engineering',
    desc: 'Cross-platform React Native and Flutter mobile applications with offline storage, real-time biometrics, Bluetooth hardware sync, and cloud APIs.',
    tags: ['React Native', 'Flutter', 'iOS', 'Android', 'SQLite'],
    delivery: '4–12 weeks',
    themeClass: 'icon-purple'
  },
  {
    id: 3,
    name: 'Discord & Bot Automation',
    desc: 'Custom Discord bots for verification, ticketing, moderation, antinuke security, payment gateways, and automated webhook management.',
    tags: ['Discord.js', 'Node.js', 'Python', 'Redis', 'Webhooks'],
    delivery: '1–4 weeks',
    themeClass: 'icon-orange'
  },
  {
    id: 4,
    name: 'Full-Stack Enterprise Systems',
    desc: 'Scalable backend architectures, REST/GraphQL APIs, microservices, secure authentication, database schemas, and real-time websockets.',
    tags: ['Next.js', 'NestJS', 'PostgreSQL', 'GraphQL', 'Docker'],
    delivery: '6–16 weeks',
    themeClass: 'icon-green'
  },
  {
    id: 5,
    name: 'AI & Data Intelligence',
    desc: 'Custom LLM agents, document intelligence pipelines, RAG implementations, automated text classification, and voice AI integrations.',
    tags: ['OpenAI', 'LangChain', 'Pinecone', 'Python', 'FastAPI'],
    delivery: '3–10 weeks',
    themeClass: 'icon-pink'
  },
  {
    id: 6,
    name: 'Cloud & Infrastructure',
    desc: 'Production deployment pipelines, Docker containerization, AWS/GCP cloud orchestration, server security hardening, and monitoring.',
    tags: ['Docker', 'AWS', 'GCP', 'Linux', 'CI/CD Pipelines'],
    delivery: '1–6 weeks',
    themeClass: 'icon-teal'
  }
];

export const Services: React.FC = () => {
  const storeServices = useAppStore((s) => s.services);
  const services = storeServices && storeServices.length > 0 ? storeServices : defaultServices;

  // Interactive Scope Estimator State
  const [platformType, setPlatformType] = useState<'web' | 'mobile' | 'fullstack' | 'ai'>('web');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(['auth', 'database']);
  const [timelineSpeed, setTimelineSpeed] = useState<'standard' | 'express'>('standard');

  const toggleFeature = (feat: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feat) ? prev.filter((f) => f !== feat) : [...prev, feat]
    );
  };

  const getEstimatedDuration = () => {
    let base = platformType === 'web' ? 3 : platformType === 'mobile' ? 5 : platformType === 'fullstack' ? 7 : 4;
    base += selectedFeatures.length * 1.2;
    if (timelineSpeed === 'express') base *= 0.7;
    return `${Math.round(base)} Weeks`;
  };


  return (
    <section id="services" style={{ padding: '5rem 0' }}>
      <div className="section-inner">
        <div className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <Layers size={14} /> Core Engineering Capabilities
        </div>
        <h2 className="section-title">Enterprise Services Built for Scale</h2>
        <p className="section-sub">
          End-to-end software development for teams requiring custom engineering architecture. RDK ships production-grade solutions with guaranteed timelines.
        </p>

        {/* Services Grid */}
        <div className="services-grid">
          {services.map((svc) => (
            <div key={svc.id} className="svc-card visible" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className={`svc-icon ${svc.themeClass || 'icon-blue'}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {iconMap[svc.id] || <Globe size={24} />}
                </div>
                <div className="svc-name">{svc.name}</div>
                <div className="svc-desc">{svc.desc}</div>
                <div className="svc-tags">
                  {svc.tags.map((tag, idx) => (
                    <span key={idx} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="svc-footer" style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="svc-delivery" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text3)' }}>
                  <Clock size={14} /> {svc.delivery}
                </span>
                <a href="#contact" className="svc-link" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem' }}>
                  Request Scope <ArrowRight size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Scope & Timeline Estimator */}
        <div style={{ marginTop: '4rem', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ea580c', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Calculator size={18} /> Interactive Scope & Delivery Estimator
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.3rem 0 1rem 0', color: 'var(--text)' }}>Calculate Your Custom Project Timeline</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
            
            {/* Step 1: Platform Selection */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: '0.5rem' }}>
                1. Select Target Architecture:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {[
                  { id: 'web', label: 'Web Application' },
                  { id: 'mobile', label: 'Mobile App (PWA/Native)' },
                  { id: 'fullstack', label: 'Full-Stack Enterprise' },
                  { id: 'ai', label: 'AI Agent System' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setPlatformType(item.id as any)}
                    style={{
                      padding: '0.65rem 0.75rem',
                      borderRadius: '8px',
                      border: `1px solid ${platformType === item.id ? '#ea580c' : 'var(--border)'}`,
                      background: platformType === item.id ? 'rgba(234, 88, 12, 0.15)' : 'var(--bg2)',
                      color: platformType === item.id ? '#ea580c' : 'var(--text)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Required Modules */}
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', display: 'block', marginBottom: '0.5rem' }}>
                2. Select Core Modules:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {[
                  { id: 'auth', label: 'Authentication & RBAC' },
                  { id: 'database', label: 'PostgreSQL / SQLite DB' },
                  { id: 'biometrics', label: 'Biometrics & Hardware' },
                  { id: 'realtime', label: 'Real-time WebSockets' },
                  { id: 'payments', label: 'Payment Gateway' },
                  { id: 'analytics', label: 'Analytics Dashboard' },
                ].map((feat) => (
                  <button
                    key={feat.id}
                    onClick={() => toggleFeature(feat.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.55rem 0.65rem',
                      borderRadius: '8px',
                      border: `1px solid ${selectedFeatures.includes(feat.id) ? '#16a34a' : 'var(--border)'}`,
                      background: selectedFeatures.includes(feat.id) ? 'rgba(22, 163, 74, 0.12)' : 'var(--bg2)',
                      color: selectedFeatures.includes(feat.id) ? '#16a34a' : 'var(--text)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <CheckCircle2 size={14} color={selectedFeatures.includes(feat.id) ? '#16a34a' : 'var(--text2)'} />
                    {feat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Estimated Calculation Box */}
            <div style={{ background: 'var(--bg2)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text2)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Delivery Pace:
                </span>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem', marginBottom: '0.75rem' }}>
                  <button
                    onClick={() => setTimelineSpeed('standard')}
                    style={{
                      flex: 1,
                      padding: '0.4rem',
                      borderRadius: '6px',
                      border: `1px solid ${timelineSpeed === 'standard' ? '#ea580c' : 'var(--border)'}`,
                      background: timelineSpeed === 'standard' ? 'rgba(234, 88, 12, 0.2)' : 'var(--card)',
                      color: timelineSpeed === 'standard' ? '#ea580c' : 'var(--text)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Standard Pace
                  </button>
                  <button
                    onClick={() => setTimelineSpeed('express')}
                    style={{
                      flex: 1,
                      padding: '0.4rem',
                      borderRadius: '6px',
                      border: `1px solid ${timelineSpeed === 'express' ? '#ea580c' : 'var(--border)'}`,
                      background: timelineSpeed === 'express' ? 'rgba(234, 88, 12, 0.2)' : 'var(--card)',
                      color: timelineSpeed === 'express' ? '#ea580c' : 'var(--text)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    ⚡ Fast-Track
                  </button>
                </div>

                <span style={{ fontSize: '0.75rem', color: 'var(--text2)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Estimated Delivery Timeline
                </span>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ea580c', marginTop: '0.2rem' }}>
                  {getEstimatedDuration()}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.2rem', fontWeight: 600 }}>
                  ✔ Milestone Delivery Schedule Included
                </div>
              </div>


              <div style={{ marginTop: '1rem' }}>
                <a
                  href="#contact"
                  className="btn btn-primary"
                  style={{ width: '100%', textAlign: 'center', background: '#ea580c', borderColor: '#ea580c', fontWeight: 700, display: 'block' }}
                >
                  Request Detailed Proposal
                </a>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
