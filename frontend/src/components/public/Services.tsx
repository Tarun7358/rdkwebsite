import React from 'react';
import { useAppStore } from '../../store/appStore';
import { Globe, Smartphone, Bot, Zap, Brain, Cloud, Clock, ArrowRight, Layers } from 'lucide-react';

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

      </div>
    </section>
  );
};
