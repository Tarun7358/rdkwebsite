import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import type { PortfolioItem } from '../../types';

const defaultPortfolio: PortfolioItem[] = [
  {
    id: 1,
    cat: 'web',
    title: 'Luxora Marketplace',
    desc: 'Multi-vendor e-commerce platform with real-time inventory, AI recommendations, and integrated payment processing.',
    tags: ['Next.js', 'Stripe', 'PostgreSQL'],
    date: 'Jan 2026',
    icon: '🛒'
  },
  {
    id: 2,
    cat: 'mobile',
    title: 'FitTrack Pro',
    desc: 'Cross-platform fitness tracking app with AI coaching, social features, and health device integrations.',
    tags: ['Flutter', 'Firebase', 'HealthKit'],
    date: 'Nov 2025',
    icon: '📱'
  },
  {
    id: 3,
    cat: 'discord',
    title: 'GuardianBot',
    desc: 'Enterprise-grade Discord moderation system managing 500K+ member server with AI content filtering.',
    tags: ['Discord.js', 'OpenAI', 'Redis'],
    date: 'Oct 2025',
    icon: '🤖'
  },
  {
    id: 4,
    cat: 'ai',
    title: 'LegalMind AI',
    desc: 'Document intelligence platform for a law firm — contract analysis, clause extraction, and risk scoring at scale.',
    tags: ['LangChain', 'FastAPI', 'Pinecone'],
    date: 'Sep 2025',
    icon: '🧠'
  },
  {
    id: 5,
    cat: 'web',
    title: 'MediBook',
    desc: 'Healthcare appointment booking platform with telemedicine, EHR integration, and HIPAA-compliant architecture.',
    tags: ['NestJS', 'React', 'PostgreSQL'],
    date: 'Aug 2025',
    icon: '🏥'
  },
  {
    id: 6,
    cat: 'mobile',
    title: 'RideSwift',
    desc: 'Ride-hailing app with real-time GPS tracking, surge pricing, driver matching algorithm, and in-app payments.',
    tags: ['React Native', 'Google Maps', 'Razorpay'],
    date: 'Jul 2025',
    icon: '🚗'
  }
];

export const Portfolio: React.FC = () => {
  const storePortfolio = useAppStore((s) => s.portfolio);
  const portfolio = storePortfolio && storePortfolio.length > 0 ? storePortfolio : defaultPortfolio;
  const [filter, setFilter] = useState<'all' | 'web' | 'mobile' | 'discord' | 'ai'>('all');

  const filteredItems = portfolio.filter((item) => filter === 'all' || item.cat === filter);

  return (
    <section id="portfolio">
      <div className="section-inner">
        <div className="section-label">Our work</div>
        <h2 className="section-title">Projects we're proud of</h2>
        <p className="section-sub">
          A selection of client projects across industries — from scrappy startups to enterprise platforms.
        </p>
        <div className="filter-bar">
          {(['all', 'web', 'mobile', 'discord', 'ai'] as const).map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat === 'all'
                ? 'All projects'
                : cat === 'web'
                ? 'Websites'
                : cat === 'mobile'
                ? 'Mobile apps'
                : cat === 'discord'
                ? 'Discord bots'
                : 'AI solutions'}
            </button>
          ))}
        </div>
        <div className="portfolio-grid" id="portfolioGrid">
          {filteredItems.map((item) => (
            <div key={item.id} className="port-card visible" data-cat={item.cat}>
              <div className="port-img" style={{ background: item.bg }}>{item.icon}</div>
              <div className="port-body">
                <div className="port-cat">
                  {item.cat === 'web'
                    ? 'E-commerce'
                    : item.cat === 'mobile'
                    ? 'Mobile app'
                    : item.cat === 'discord'
                    ? 'Discord bot'
                    : 'AI solution'}
                </div>
                <div className="port-title">{item.title}</div>
                <div className="port-desc">{item.desc}</div>
                <div className="port-stack">
                  {item.tags.map((t, idx) => (
                    <span key={idx} className="tag">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="port-footer">
                  <span className="port-date">{item.date}</span>
                  <a href="#contact" className="btn btn-outline">
                    Case study
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
