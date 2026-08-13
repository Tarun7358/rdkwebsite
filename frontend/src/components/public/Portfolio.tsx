import React, { useState } from 'react';
import { useAppStore } from '../../store/appStore';
import type { PortfolioItem } from '../../types';
import { VetriGasModal } from './VetriGasModal';
import { CaseStudyModal } from './CaseStudyModal';
import { Flame, ShoppingCart, Smartphone, Bot, Brain, Activity, ArrowRight, Layers } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  'Vetri Gas (Vetri Indane Enterprise)': <Flame size={28} color="#ffffff" />,
  'Luxora Marketplace': <ShoppingCart size={28} color="#ffffff" />,
  'FitTrack Pro': <Smartphone size={28} color="#ffffff" />,
  'GuardianBot': <Bot size={28} color="#ffffff" />,
  'LegalMind AI': <Brain size={28} color="#ffffff" />,
  'MediBook': <Activity size={28} color="#ffffff" />,
};

const defaultPortfolio: PortfolioItem[] = [
  {
    id: 1,
    cat: 'mobile',
    title: 'Vetri Gas (Vetri Indane Enterprise)',
    desc: 'Flagship enterprise LPG distribution system featuring real-time GPS fleet tracking, ZKTeco biometric attendance, dashcam snapshots, and inventory control center.',
    tags: ['React Native / PWA', 'TypeScript', 'Node.js', 'SQLite', 'IoT Telemetry'],
    date: 'Active Project (2026)',
    icon: 'Flame',
    bg: 'linear-gradient(135deg, #b91c1c, #ea580c)'
  },
  {
    id: 2,
    cat: 'web',
    title: 'Luxora Marketplace',
    desc: 'Multi-vendor e-commerce platform with real-time inventory, AI recommendations, and integrated payment processing.',
    tags: ['Next.js', 'Stripe', 'PostgreSQL'],
    date: 'Jan 2026',
    icon: 'ShoppingCart',
    bg: 'linear-gradient(135deg, #2563eb, #3b82f6)'
  },
  {
    id: 3,
    cat: 'mobile',
    title: 'FitTrack Pro',
    desc: 'Cross-platform fitness tracking app with AI coaching, social features, and health device integrations.',
    tags: ['Flutter', 'Firebase', 'HealthKit'],
    date: 'Nov 2025',
    icon: 'Smartphone',
    bg: 'linear-gradient(135deg, #7c3aed, #a855f7)'
  },
  {
    id: 4,
    cat: 'discord',
    title: 'GuardianBot',
    desc: 'Enterprise-grade Discord moderation system managing 500K+ member server with AI content filtering.',
    tags: ['Discord.js', 'OpenAI', 'Redis'],
    date: 'Oct 2025',
    icon: 'Bot',
    bg: 'linear-gradient(135deg, #d97706, #f59e0b)'
  },
  {
    id: 5,
    cat: 'ai',
    title: 'LegalMind AI',
    desc: 'Document intelligence platform for a law firm — contract analysis, clause extraction, and risk scoring at scale.',
    tags: ['LangChain', 'FastAPI', 'Pinecone'],
    date: 'Sep 2025',
    icon: 'Brain',
    bg: 'linear-gradient(135deg, #db2777, #ec4899)'
  },
  {
    id: 6,
    cat: 'web',
    title: 'MediBook',
    desc: 'Healthcare appointment booking platform with telemedicine, EHR integration, and HIPAA-compliant architecture.',
    tags: ['NestJS', 'React', 'PostgreSQL'],
    date: 'Aug 2025',
    icon: 'Activity',
    bg: 'linear-gradient(135deg, #059669, #10b981)'
  }
];

export const Portfolio: React.FC = () => {
  const storePortfolio = useAppStore((s) => s.portfolio);
  const portfolio = storePortfolio && storePortfolio.length > 0 ? storePortfolio : defaultPortfolio;
  const [filter, setFilter] = useState<'all' | 'web' | 'mobile' | 'discord' | 'ai'>('all');
  
  const [isVetriGasOpen, setIsVetriGasOpen] = useState(false);
  const [selectedCaseStudy, setSelectedCaseStudy] = useState<PortfolioItem | null>(null);

  const filteredItems = portfolio.filter((item) => filter === 'all' || item.cat === filter);

  const handleOpenProject = (item: PortfolioItem) => {
    if (item.title.includes('Vetri Gas')) {
      setIsVetriGasOpen(true);
    } else {
      setSelectedCaseStudy(item);
    }
  };

  return (
    <section id="portfolio">
      <div className="section-inner">
        <div className="section-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          <Layers size={14} /> Proven Track Record
        </div>
        <h2 className="section-title">Featured Enterprise Engineering Case Studies</h2>
        <p className="section-sub">
          A selection of production-grade client implementations — click any card to inspect interactive system architecture & case studies.
        </p>

        {/* Filter Bar */}
        <div className="filter-bar">
          {(['all', 'web', 'mobile', 'discord', 'ai'] as const).map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat === 'all'
                ? 'All Projects'
                : cat === 'web'
                ? 'Websites & SaaS'
                : cat === 'mobile'
                ? 'Mobile & Enterprise IoT'
                : cat === 'discord'
                ? 'Discord & Automation'
                : 'AI Solutions'}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="portfolio-grid" id="portfolioGrid">
          {filteredItems.map((item) => {
            const isVetri = item.title.includes('Vetri Gas');
            return (
              <div
                key={item.id}
                className="port-card visible"
                data-cat={item.cat}
                style={{ cursor: 'pointer', transition: 'all 0.2s ease-in-out' }}
                onClick={() => handleOpenProject(item)}
              >
                <div className="port-img" style={{ background: item.bg || 'linear-gradient(135deg, #1f2937, #374151)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {iconMap[item.title] || <Layers size={28} color="#ffffff" />}
                </div>

                <div className="port-body">
                  <div className="port-cat" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>
                      {item.cat === 'web'
                        ? 'SaaS & E-Commerce'
                        : item.cat === 'mobile'
                        ? 'Enterprise Fleet & IoT'
                        : item.cat === 'discord'
                        ? 'Discord Bot System'
                        : 'AI Intelligence'}
                    </span>
                    {isVetri && (
                      <span style={{ background: '#ea580c', color: '#fff', fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '12px', fontWeight: 800 }}>
                        INTERACTIVE SUITE
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenProject(item);
                      }}
                      className={`btn ${isVetri ? 'btn-primary' : 'btn-outline'}`}
                      style={isVetri ? { background: '#ea580c', borderColor: '#ea580c' } : {}}
                    >
                      {isVetri ? 'Open Live Demo' : 'Inspect Case Study'} <ArrowRight size={14} style={{ marginLeft: '0.3rem' }} />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <VetriGasModal isOpen={isVetriGasOpen} onClose={() => setIsVetriGasOpen(false)} />
      <CaseStudyModal item={selectedCaseStudy} isOpen={!!selectedCaseStudy} onClose={() => setSelectedCaseStudy(null)} />
    </section>
  );
};
