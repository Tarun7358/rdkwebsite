import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import type { PortfolioItem } from '../../types';
import { VetriGasModal } from './VetriGasModal';

const defaultPortfolio: PortfolioItem[] = [
  {
    id: 1,
    cat: 'mobile',
    title: 'Vetri Gas (Vetri Indane Enterprise)',
    desc: 'Flagship enterprise LPG distribution system featuring real-time GPS fleet tracking, ZKTeco biometric attendance, dashcam snapshots, and inventory control center.',
    tags: ['React Native / PWA', 'TypeScript', 'Node.js', 'SQLite', 'IoT Telemetry'],
    date: 'Active Project (2026)',
    icon: '🔥'
  },
  {
    id: 2,
    cat: 'web',
    title: 'Luxora Marketplace',
    desc: 'Multi-vendor e-commerce platform with real-time inventory, AI recommendations, and integrated payment processing.',
    tags: ['Next.js', 'Stripe', 'PostgreSQL'],
    date: 'Jan 2026',
    icon: '🛒'
  },
  {
    id: 3,
    cat: 'mobile',
    title: 'FitTrack Pro',
    desc: 'Cross-platform fitness tracking app with AI coaching, social features, and health device integrations.',
    tags: ['Flutter', 'Firebase', 'HealthKit'],
    date: 'Nov 2025',
    icon: '📱'
  },
  {
    id: 4,
    cat: 'discord',
    title: 'GuardianBot',
    desc: 'Enterprise-grade Discord moderation system managing 500K+ member server with AI content filtering.',
    tags: ['Discord.js', 'OpenAI', 'Redis'],
    date: 'Oct 2025',
    icon: '🤖'
  },
  {
    id: 5,
    cat: 'ai',
    title: 'LegalMind AI',
    desc: 'Document intelligence platform for a law firm — contract analysis, clause extraction, and risk scoring at scale.',
    tags: ['LangChain', 'FastAPI', 'Pinecone'],
    date: 'Sep 2025',
    icon: '🧠'
  },
  {
    id: 6,
    cat: 'web',
    title: 'MediBook',
    desc: 'Healthcare appointment booking platform with telemedicine, EHR integration, and HIPAA-compliant architecture.',
    tags: ['NestJS', 'React', 'PostgreSQL'],
    date: 'Aug 2025',
    icon: '🏥'
  }
];

export const Portfolio: React.FC = () => {
  const storePortfolio = useAppStore((s) => s.portfolio);
  const portfolio = storePortfolio && storePortfolio.length > 0 ? storePortfolio : defaultPortfolio;
  const [filter, setFilter] = useState<'all' | 'web' | 'mobile' | 'discord' | 'ai'>('all');
  const [isVetriGasOpen, setIsVetriGasOpen] = useState(false);

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
          {filteredItems.map((item) => {
            const isVetri = item.title.includes('Vetri Gas');
            return (
              <div
                key={item.id}
                className="port-card visible"
                data-cat={item.cat}
                style={isVetri ? { border: '2px solid #ea580c', cursor: 'pointer' } : {}}
                onClick={isVetri ? () => setIsVetriGasOpen(true) : undefined}
              >
                <div className="port-img" style={{ background: isVetri ? 'linear-gradient(135deg, #b91c1c, #ea580c)' : item.bg }}>
                  {item.icon}
                </div>
                <div className="port-body">
                  <div className="port-cat" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>
                      {item.cat === 'web'
                        ? 'E-commerce'
                        : item.cat === 'mobile'
                        ? 'Enterprise Fleet & IoT'
                        : item.cat === 'discord'
                        ? 'Discord bot'
                        : 'AI solution'}
                    </span>
                    {isVetri && (
                      <span style={{ background: '#ea580c', color: '#fff', fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '12px', fontWeight: 800 }}>
                        LIVE INTERACTIVE DEMO
                      </span>
                    )}
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
                    {isVetri ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsVetriGasOpen(true);
                        }}
                        className="btn btn-primary"
                        style={{ background: '#ea580c', borderColor: '#ea580c' }}
                      >
                        ⚡ Open Live Demo
                      </button>
                    ) : (
                      <a href="#contact" className="btn btn-outline">
                        Case study
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <VetriGasModal isOpen={isVetriGasOpen} onClose={() => setIsVetriGasOpen(false)} />
    </section>
  );
};

