import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useDashboardStore } from '../store/dashboardStore';
import { useTheme } from '../hooks/useTheme';
import { useAppStore } from '../store/appStore';
import {
  Hero,
  Stats,
  Services,
  Workflow,
  Portfolio,
  DashboardPreview,
  TicketSection,
  ChatPreview,
  MeetingsSection,
  Testimonials,
  Pricing,
  Contact,
  Careers
} from '../components/public';
import { AuthModal, ToastContainer } from '../components/ui';
import '../index.css';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setAuthModalOpen = useDashboardStore((s) => s.setAuthModalOpen);
  const { toggle } = useTheme();
  const theme = useAppStore((s) => s.theme);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAuthAction = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      setAuthModalOpen(true);
    }
  };

  return (
    <div id="publicSite">
      {/* Navigation */}
      <nav id="navbar">
        <div className="nav-inner">
          <a href="#home" className="logo">
            <div>
              <span className="abbr">RDK</span>
              <span className="full">Reliable Digital Kreations</span>
            </div>
          </a>
          <div className="nav-links">
            <a href="#services">Services</a>
            <a href="#portfolio">Portfolio</a>
            <a href="#pricing">Pricing</a>
            <a href="#about">About</a>
            <a href="#careers">Careers</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="nav-right">
            <button id="themeToggle" className="btn btn-ghost" onClick={toggle}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button className="btn btn-ghost" onClick={handleAuthAction}>
              {user ? 'Console' : 'Log in'}
            </button>
            <a href="#contact" className="btn btn-primary">
              Start a project
            </a>
          </div>
          <div className="hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu open" id="mobileMenu" style={{ display: 'flex', flexDirection: 'column' }}>
          <a href="#services" onClick={() => setMobileMenuOpen(false)}>Services</a>
          <a href="#portfolio" onClick={() => setMobileMenuOpen(false)}>Portfolio</a>
          <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
          <a href="#about" onClick={() => setMobileMenuOpen(false)}>About</a>
          <a href="#careers" onClick={() => setMobileMenuOpen(false)}>Careers</a>
          <a href="#contact" onClick={() => setMobileMenuOpen(false)}>Contact</a>
          <button
            className="btn btn-ghost btn-lg"
            onClick={() => {
              setMobileMenuOpen(false);
              handleAuthAction();
            }}
          >
            {user ? 'Console' : 'Log in'}
          </button>
          <a href="#contact" className="btn btn-primary btn-lg" onClick={() => setMobileMenuOpen(false)}>
            Start a project
          </a>
        </div>
      )}

      {/* Sections */}
      <Hero />
      <Stats />
      <Services />
      <Workflow />
      <Portfolio />
      <DashboardPreview />
      <TicketSection />
      <ChatPreview />
      <MeetingsSection />
      <Testimonials />
      <Pricing />
      <Contact />
      <Careers />

      {/* Footer */}
      <footer style={{ background: 'var(--card)', borderTop: '1px solid var(--border)', padding: '3rem 2rem', marginTop: '4rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: '1.2rem', marginBottom: '0.5rem' }}>RDK Industries</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text3)' }}>Reliable Digital Kreations · Professional Software Development</div>
          </div>
          <div style={{ display: 'flex', gap: '4rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--text)' }}>Platform</span>
              <a href="#services" style={{ color: 'var(--text3)' }}>Services</a>
              <a href="#portfolio" style={{ color: 'var(--text3)' }}>Portfolio</a>
              <a href="#pricing" style={{ color: 'var(--text3)' }}>Pricing</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--text)' }}>Company</span>
              <a href="#about" style={{ color: 'var(--text3)' }}>About Us</a>
              <a href="#careers" style={{ color: 'var(--text3)' }}>Careers</a>
              <a href="#contact" style={{ color: 'var(--text3)' }}>Contact</a>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: '1200px', margin: '2rem auto 0', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text3)' }}>
          <span>&copy; {new Date().getFullYear()} RDK Industries. All rights reserved.</span>
          <span>Built for scale.</span>
        </div>
      </footer>

      {/* Overlays */}
      <AuthModal />
      <ToastContainer />
    </div>
  );
};
export default Home;
