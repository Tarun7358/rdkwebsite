import React from 'react';
import { ShieldCheck, ArrowUpRight } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="hero" id="home">
      <div className="hero-bg"></div>
      <div className="hero-grid"></div>
      <div className="hero-shapes">
        <div className="shape s1"></div>
        <div className="shape s2"></div>
        <div className="shape s3"></div>
      </div>
      <div className="hero-inner">
        <div>
          <div className="hero-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={16} color="#4ade80" /> Enterprise-Grade Software & Engineering Partner
          </div>
          <h1>
            Build software
            <br />
            that <span className="grad">scales.</span>
          </h1>
          <p className="hero-sub">
            We help businesses, startups, creators, and communities build modern
            websites, mobile apps, Discord bots, AI solutions, automation
            systems, and custom software.
          </p>
          <div className="hero-btns">
            <a href="#contact" className="btn btn-primary btn-xl" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              Start a Project <ArrowUpRight size={20} />
            </a>
            <a href="#portfolio" className="btn btn-ghost btn-xl">
              View Portfolio
            </a>
          </div>
        </div>

        <div className="hero-visual">
          <div>
            <div className="hero-card">
              <div className="code-bar">
                <div className="dot dot-r"></div>
                <div className="dot dot-y"></div>
                <div className="dot dot-g"></div>
                <span>app.tsx — RDK</span>
              </div>
              <div className="code-line">
                <span className="kw">import</span> &#123; <span className="fn">RDK</span> &#125; <span className="kw">from</span> <span className="str">'@rdk/core'</span>
              </div>
              <div className="code-line">
                <span className="kw">const</span> <span className="fn">app</span> = <span className="kw">new</span> <span className="fn">RDK</span>(&#123;
              </div>
              <div className="code-line">
                &nbsp;&nbsp;<span className="fn">stack</span>: <span className="str">'next + nest + pg'</span>,
              </div>
              <div className="code-line">
                &nbsp;&nbsp;<span className="fn">deploy</span>: <span className="str">'vercel + railway'</span>,
              </div>
              <div className="code-line">
                &nbsp;&nbsp;<span className="fn">scale</span>: <span className="str">'∞'</span>
              </div>
              <div className="code-line">&#125;)</div>
              <div>
                <div className="stat-row">
                  <div className="stat-chip">
                    <strong>99.9%</strong>
                    <small>Uptime</small>
                  </div>
                  <div className="stat-chip">
                    <strong>&lt;100ms</strong>
                    <small>Response</small>
                  </div>
                  <div className="stat-chip">
                    <strong>A+</strong>
                    <small>Lighthouse</small>
                  </div>
                </div>
              </div>
              <div className="mini-card">
                <div>
                  <span>E-commerce platform</span>
                  <span className="status-badge status-active">● Live</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '100%' }}></div>
                </div>
                <div>Delivered in 6 weeks · Next.js + Stripe</div>
              </div>
            </div>
            <div className="floating-badge fb1">
              <div className="fb-dot fb-green"></div>
              <span>New project started</span>
            </div>
            <div className="floating-badge fb2">
              <div className="fb-dot fb-blue"></div>
              <span>Payment received ✓</span>
            </div>
            <div className="floating-badge fb3">
              <div className="fb-dot fb-purple"></div>
              <span>AI bot deployed</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
