import React, { useState } from 'react';
import { X, CheckCircle, Code, Layers, Server, Activity, ShieldCheck, ArrowUpRight } from 'lucide-react';
import type { PortfolioItem } from '../../types';

interface CaseStudyModalProps {
  item: PortfolioItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CaseStudyModal: React.FC<CaseStudyModalProps> = ({ item, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'architecture' | 'metrics'>('overview');

  if (!isOpen || !item) return null;

  const projectDetails: Record<string, { metrics: string[]; highlights: string[]; arch: string }> = {
    'Luxora Marketplace': {
      metrics: ['99.99% Uptime', '150ms Average Latency', '$4.2M Monthly Volume'],
      highlights: [
        'Multi-vendor inventory synchronization with microsecond resolution',
        'Stripe Connect split-payment integration with automated tax calculation',
        'Vector search AI recommendations powering 28% higher conversion rates'
      ],
      arch: 'Next.js 14 App Router · Node.js Microservices · PostgreSQL with Read Replicas · Redis Cache'
    },
    'FitTrack Pro': {
      metrics: ['250K+ Active Users', '4.9 App Store Rating', '98% Offline Sync Reliability'],
      highlights: [
        'Cross-platform Flutter framework with native Apple HealthKit & Google Fit integration',
        'Real-time biometrics streaming over low-latency WebSockets',
        'Offline-first SQLite storage with automatic background synchronization'
      ],
      arch: 'Flutter Mobile App · Node.js Backend API · SQLite Local Database · Firebase Auth'
    },
    'GuardianBot': {
      metrics: ['500K+ Discord Members', '< 50ms Message Scanning', '0 False Positives'],
      highlights: [
        'High-throughput message processing pipeline handling 10,000 events/sec',
        'OpenAI content moderation API with custom rule engine for zero-day spam attacks',
        'Real-time web administration dashboard with webhooks & role management'
      ],
      arch: 'Discord.js v14 · TypeScript · Redis Event Queue · Python Moderation Microservice'
    },
    'LegalMind AI': {
      metrics: ['100K+ Contracts Processed', '94% Clause Accuracy', '10x Faster Analysis'],
      highlights: [
        'RAG (Retrieval-Augmented Generation) pipeline over corporate legal repositories',
        'Pinecone vector database with semantic hybrid search for clause extraction',
        'HIPAA & SOC-2 compliant document encryption in transit and at rest'
      ],
      arch: 'LangChain · OpenAI GPT-4 Enterprise · Pinecone Vector DB · FastAPI · React Dashboard'
    },
    'MediBook': {
      metrics: ['50K+ Appointments/Mo', 'HIPAA Certified', '99.9% Telemedicine Quality'],
      highlights: [
        'HIPAA-compliant video telemedicine streaming using WebRTC',
        'EHR (Electronic Health Record) integration with HL7 FHIR standards',
        'Automated SMS & Email notification engine with calendar sync'
      ],
      arch: 'NestJS Backend · React 18 Web App · PostgreSQL Database · Twilio Video & SMS API'
    }
  };

  const details = projectDetails[item.title] || {
    metrics: ['Enterprise Grade', 'High Scalability', '99.9% Uptime'],
    highlights: [
      'Custom enterprise architecture tailored to client requirements',
      'End-to-end security compliance and automated CI/CD pipeline',
      'High-performance database optimization and real-time monitoring'
    ],
    arch: item.tags.join(' · ')
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ background: 'var(--card, #111827)', color: 'var(--text, #f9fafb)', border: '1px solid var(--border, #374151)', borderRadius: '16px', width: '100%', maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border, #374151)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface, #1f2937)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ea580c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Enterprise Project Case Study
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.2rem 0 0 0', color: 'var(--text, #ffffff)' }}>
              {item.title}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'var(--card, #111827)', border: '1px solid var(--border, #374151)', color: '#ffffff', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border, #374151)', background: 'var(--card, #111827)' }}>
          {[
            { id: 'overview', label: 'Case Study Overview', icon: <Layers size={16} /> },
            { id: 'architecture', label: 'System Architecture', icon: <Server size={16} /> },
            { id: 'metrics', label: 'Performance Metrics', icon: <Activity size={16} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                background: activeTab === tab.id ? '#ea580c' : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : 'var(--text3, #9ca3af)'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem', flex: 1 }}>
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <p style={{ fontSize: '0.95rem', color: 'var(--text2, #d1d5db)', lineHeight: 1.6, margin: 0 }}>
                {item.desc}
              </p>

              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 0.75rem 0', color: '#ea580c' }}>Key Technical Accomplishments:</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {details.highlights.map((h, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text, #ffffff)' }}>
                      <CheckCircle size={16} color="#22c55e" style={{ marginTop: '0.1rem', flexShrink: 0 }} />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text3, #9ca3af)' }}>Technology Stack:</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {item.tags.map((tag, idx) => (
                    <span key={idx} style={{ background: 'var(--surface, #1f2937)', border: '1px solid var(--border, #374151)', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ background: '#0f172a', padding: '1.25rem', borderRadius: '12px', border: '1px solid #1e293b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8', fontWeight: 700, fontSize: '0.85rem' }}>
                  <Code size={18} /> High-Level Architecture Overview
                </div>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.5rem 0 0 0', lineHeight: 1.5 }}>
                  {details.arch}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: 'var(--surface, #1f2937)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border, #374151)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text3, #9ca3af)', fontWeight: 700 }}>Security Compliance</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.3rem', color: '#4ade80', fontSize: '0.85rem', fontWeight: 700 }}>
                    <ShieldCheck size={16} /> SOC-2 & ISO 27001 Ready
                  </div>
                </div>
                <div style={{ background: 'var(--surface, #1f2937)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border, #374151)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text3, #9ca3af)', fontWeight: 700 }}>Deployment Model</span>
                  <div style={{ color: 'var(--text, #ffffff)', marginTop: '0.3rem', fontSize: '0.85rem', fontWeight: 700 }}>
                    Cloud-Native Microservices
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'metrics' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {details.metrics.map((metric, idx) => (
                <div key={idx} style={{ background: 'var(--surface, #1f2937)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border, #374151)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ea580c' }}>{metric}</div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text3, #9ca3af)', marginTop: '0.2rem', display: 'block' }}>Verified Production SLA</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border, #374151)', background: 'var(--surface, #1f2937)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text3, #9ca3af)' }}>RDK Enterprise Portfolio Series</span>
          <a href="#contact" className="btn btn-primary" onClick={onClose} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#ea580c', borderColor: '#ea580c' }}>
            Build Similar Architecture <ArrowUpRight size={16} />
          </a>
        </div>

      </div>
    </div>
  );
};
