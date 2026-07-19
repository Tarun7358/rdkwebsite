import React from 'react';
import { useAppStore } from '../../store/appStore';

const defaultServices = [
  {
    id: 1,
    name: 'Website development',
    icon: '🌐',
    desc: 'Custom websites, business sites, landing pages, CMS-driven platforms, dashboards, and e-commerce solutions with full SEO and performance optimization.',
    tags: ['Next.js', 'WordPress', 'Shopify', 'Webflow', 'SEO'],
    delivery: '⏱ 2–8 weeks',
    themeClass: 'icon-blue'
  },
  {
    id: 2,
    name: 'Mobile development',
    icon: '📱',
    desc: 'Native Android and iOS apps, cross-platform Flutter and React Native solutions with API integration, Firebase backend, and app store submission.',
    tags: ['Flutter', 'React Native', 'iOS', 'Android', 'Firebase'],
    delivery: '⏱ 4–12 weeks',
    themeClass: 'icon-purple'
  },
  {
    id: 3,
    name: 'Discord development',
    icon: '🤖',
    desc: 'Custom bots for verification, moderation, tickets, anti-nuke protection, AI-powered assistants, dashboards, logging systems, and full automation.',
    tags: ['Discord.js', 'Python', 'AI bots', 'Dashboard'],
    delivery: '⏱ 1–4 weeks',
    themeClass: 'icon-orange'
  },
  {
    id: 4,
    name: 'Full-stack development',
    icon: '⚡',
    desc: 'Production-ready applications with Next.js, React, Node.js, NestJS, PostgreSQL, MongoDB, REST APIs, GraphQL, and robust authentication systems.',
    tags: ['Next.js', 'NestJS', 'PostgreSQL', 'GraphQL'],
    delivery: '⏱ 6–16 weeks',
    themeClass: 'icon-green'
  },
  {
    id: 5,
    name: 'AI solutions',
    icon: '🧠',
    desc: 'Custom AI assistants, LLM integrations, intelligent chatbots, voice AI, document intelligence, recommendation systems, and full automation pipelines.',
    tags: ['OpenAI', 'LangChain', 'RAG', 'Voice AI'],
    delivery: '⏱ 3–10 weeks',
    themeClass: 'icon-pink'
  },
  {
    id: 6,
    name: 'Cloud & DevOps',
    icon: '☁️',
    desc: 'Docker containerization, AWS and Google Cloud deployment, CI/CD pipelines, Linux server setup, monitoring, scaling, and full infrastructure management.',
    tags: ['Docker', 'AWS', 'CI/CD', 'GCP', 'Linux'],
    delivery: '⏱ 1–6 weeks',
    themeClass: 'icon-teal'
  }
];

export const Services: React.FC = () => {
  const storeServices = useAppStore((s) => s.services);
  const services = storeServices && storeServices.length > 0 ? storeServices : defaultServices;

  return (
    <section id="services">
      <div className="section-inner">
        <div className="section-label">What we build</div>
        <h2 className="section-title">Services built for scale</h2>
        <p className="section-sub">
          End-to-end software development for teams that need more than a template. RDK ships production-grade solutions, on time.
        </p>
        <div className="services-grid">
          {services.map((svc) => (
            <div key={svc.id} className="svc-card visible">
              <div className={`svc-icon ${svc.themeClass || 'icon-blue'}`}>{svc.icon}</div>
              <div className="svc-name">{svc.name}</div>
              <div className="svc-desc">{svc.desc}</div>
              <div className="svc-tags">
                {svc.tags.map((tag, idx) => (
                  <span key={idx} className="tag">{tag}</span>
                ))}
              </div>
              <div className="svc-footer">
                <span className="svc-delivery">{svc.delivery}</span>
                <span className="svc-link">Learn more →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
