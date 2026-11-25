import React, { useState } from 'react';
import { Briefcase, CheckCircle2, ArrowUpRight, Shield, Zap, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAppStore } from '../../store/appStore';

const RAGE_PAY_URL = 'https://apirageoptimisercom.altvr.in/pay';

export const Pricing: React.FC = () => {
  const addToast = useAppStore((s) => s.addToast);
  const [showProModal, setShowProModal] = useState(false);
  const [guildId, setGuildId] = useState('');
  const [guildName, setGuildName] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  const handleOpenProCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{15,22}$/.test(guildId.trim())) {
      addToast('Please enter a valid Discord Server ID (15–22 digits).', 'error');
      return;
    }

    // Log invoice in RDK Tech SQLite DB
    const invId = 'INV-RAGE-' + Math.floor(1000 + Math.random() * 9000);
    await supabase.from('invoices').insert({
      id: invId,
      client: clientEmail.trim() || guildId.trim(),
      project: `Rage Pro (30d) — ${guildName.trim() || guildId.trim()}`,
      amount: 99,
      status: 'Unpaid',
      items: ['Rage Pro 30-Day Subscription', `Server ID: ${guildId.trim()}`],
      date: new Date().toISOString().slice(0, 10)
    }).catch(() => {});

    window.open(RAGE_PAY_URL, '_blank', 'noopener,noreferrer');
    addToast(`Invoice ${invId} logged! Opening ₹99 UPI Checkout...`, 'success');
    setShowProModal(false);
  };

  return (
    <section id="pricing">
      <div className="section-inner">
        <h2 className="section-title">Rage Optimiser &amp; Engineering Pricing</h2>
        <p className="section-sub">
          Transparent software licensing for our flagship Discord Security Suite, alongside custom milestone-based engineering proposals.
        </p>

        {/* Rage Optimiser 2-Plan Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {/* Free Plan */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '22px', padding: '2.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontWeight: 800, color: 'var(--text)' }}>
                  <Shield size={18} color="#10b981" /> Rage Optimiser Free
                </span>
                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text)' }}>₹0</span>
              </div>
              <p style={{ color: 'var(--text2)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                Full core server protection for any Discord community size.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
                {[
                  'Core Anti-Nuke, Moderation & AutoMod',
                  'Unlimited Whitelist Bots & All Server Sizes',
                  'Up to 2 Extra Owners & 1 Server Backup',
                  '1 Ticket Panel & Web Support via RDK Tech'
                ].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', color: 'var(--text)' }}>
                    <CheckCircle2 size={15} color="#10b981" style={{ flexShrink: 0 }} />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <a href="#tickets" className="btn btn-outline" style={{ textAlign: 'center', justifyContent: 'center' }}>
              Need Help? Open Ticket
            </a>
          </div>

          {/* Rage Pro ₹99 Plan */}
          <div style={{ background: 'var(--card)', border: '2px solid var(--primary)', borderRadius: '22px', padding: '2.25rem', boxShadow: '0 0 35px rgba(124, 58, 237, 0.16)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontWeight: 800, color: 'var(--primary)' }}>
                  <Zap size={18} /> Rage Pro
                </span>
                <div>
                  <span style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text)' }}>₹99</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text3)' }}> / 30 days</span>
                </div>
              </div>
              <p style={{ color: 'var(--text2)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                Unlock enterprise 2FA, unlimited backups, custom branding, and priority automation.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
                {[
                  'Gmail 2FA Sentinel & Daily EOD Security Reports',
                  'Unlimited Extra Owners, Backups & UPM History',
                  'Custom Server Bot Avatar & Banner',
                  'Unlimited Ticket Panels, Embeds & 24/7 Voice'
                ].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem', color: 'var(--text)', fontWeight: 600 }}>
                    <CheckCircle2 size={15} color="#10b981" style={{ flexShrink: 0 }} />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setShowProModal(true)} className="btn btn-primary" style={{ justifyContent: 'center', width: '100%' }}>
              Upgrade to Rage Pro (₹99) <ArrowUpRight size={16} />
            </button>
          </div>
        </div>

        {/* Custom Engineering Card */}
        <div className="pricing-card" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '24px', padding: '2.5rem 2rem', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
          <div className="pricing-icon" style={{ background: 'rgba(124, 58, 237, 0.12)', color: 'var(--primary)', border: '1px solid rgba(124, 58, 237, 0.25)', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
            <Briefcase size={24} />
          </div>
          <h3 className="pricing-title" style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text)' }}>Custom Software &amp; Enterprise Quotes</h3>
          <p className="pricing-sub" style={{ maxWidth: '600px', margin: '0.5rem auto 1.75rem auto', color: 'var(--text2)', fontSize: '0.92rem', lineHeight: 1.6 }}>
            Need a custom web platform, mobile app, or white-label bot? Book a discovery call for a milestone-based proposal.
          </p>
          <a href="#meetings" className="btn btn-primary btn-xl" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            Book Consultation &amp; Scope <ArrowUpRight size={20} />
          </a>
        </div>
      </div>

      {/* Rage Pro Checkout Modal */}
      {showProModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', maxWidth: '420px', width: '100%', padding: '1.75rem', position: 'relative' }}>
            <button onClick={() => setShowProModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
            <h3 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.4rem', color: 'var(--text)' }}>Upgrade to Rage Pro (₹99)</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text2)', marginBottom: '1.1rem' }}>
              Enter your Discord Server ID to log your RDK invoice and open our ₹99 UPI QR checkout.
            </p>
            <form onSubmit={handleOpenProCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input
                type="text"
                required
                value={guildId}
                onChange={(e) => setGuildId(e.target.value)}
                placeholder="Discord Server ID (e.g. 1266048940101599293)"
                style={{ padding: '0.75rem 0.9rem', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '10px', fontSize: '0.875rem' }}
              />
              <input
                type="text"
                value={guildName}
                onChange={(e) => setGuildName(e.target.value)}
                placeholder="Server Name (optional)"
                style={{ padding: '0.75rem 0.9rem', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '10px', fontSize: '0.875rem' }}
              />
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="Your Email (for invoice receipt)"
                style={{ padding: '0.75rem 0.9rem', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '10px', fontSize: '0.875rem' }}
              />
              <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', marginTop: '0.25rem' }}>
                Proceed to ₹99 UPI Checkout <ArrowUpRight size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
