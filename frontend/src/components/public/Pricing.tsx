import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, CheckCircle2, ArrowUpRight, Shield, Zap, X, Copy } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

interface OwnedGuild {
  id: string;
  name: string;
  icon?: string | null;
}

interface DiscordUser {
  id: string;
  username: string;
  global_name?: string;
}

interface CheckoutData {
  invoiceId: string;
  upiVpa: string;
  upiName: string;
  upiUri: string;
  qrDataUrl: string;
  amountInr: number;
}

export const Pricing: React.FC = () => {
  const addToast = useAppStore((s) => s.addToast);
  const [showProModal, setShowProModal] = useState(false);
  const [discordUser, setDiscordUser] = useState<DiscordUser | null>(null);
  const [ownedGuilds, setOwnedGuilds] = useState<OwnedGuild[]>([]);
  const [selectedGuildId, setSelectedGuildId] = useState('');
  const [confirmedOwner, setConfirmedOwner] = useState(false);
  const [clientEmail, setClientEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [checkout, setCheckout] = useState<CheckoutData | null>(null);
  const [utr, setUtr] = useState('');
  const [utrSubmitted, setUtrSubmitted] = useState(false);

  useEffect(() => {
    const onMessage = (ev: MessageEvent) => {
      if (ev.data?.type === 'RDK_DISCORD_AUTH' && ev.data?.user) {
        setDiscordUser(ev.data.user);
        const guilds: OwnedGuild[] = ev.data.ownedGuilds || [];
        setOwnedGuilds(guilds);
        if (guilds.length > 0) setSelectedGuildId(guilds[0].id);
        setConfirmedOwner(false);
        addToast(`Verified Discord account: ${ev.data.user.username}`, 'success');
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [addToast]);

  const handleDiscordAuth = () => {
    window.open('/api/discord/login', 'rdk_discord_oauth', 'width=520,height=720');
  };

  const selectedGuild = ownedGuilds.find((g) => g.id === selectedGuildId);
  const isLifetimePro = Boolean(
    discordUser?.id === '1140892126402596905' ||
    selectedGuild?.id === '1266048940101599293'
  );

  const handleOpenProCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discordUser || !selectedGuild) {
      addToast('Please connect Discord and select a server you own.', 'error');
      return;
    }
    if (!confirmedOwner) {
      addToast('Please confirm server ownership before proceeding.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/rage-pro/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guildId: selectedGuild.id,
          guildName: selectedGuild.name,
          ownerId: discordUser.id,
          ownerUsername: discordUser.global_name || discordUser.username,
          email: clientEmail.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout creation failed');
      setCheckout(data);
      setUtrSubmitted(false);
      setUtr('');

      // Immediately launch Razorpay Checkout if SDK is loaded
      if ((window as any).Razorpay) {
        const orderRes = await fetch('/api/payments/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invoiceId: data.invoiceId, amount: 99, currency: 'INR' })
        });
        const order = await orderRes.json();
        if (!orderRes.ok || !order.orderId) throw new Error(order.error || 'Failed to initialize Razorpay order');
        const rzp = new (window as any).Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: 'RDK Tech — Rage Pro',
          description: `30-Day License for ${selectedGuild.name}`,
          order_id: order.orderId,
          prefill: { email: clientEmail.trim() || undefined },
          theme: { color: '#7c3aed' },
          modal: { ondismiss: () => setIsLoading(false) },
          handler: async (response: any) => {
            try {
              const vRes = await fetch('/api/payments/razorpay/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  invoiceId: data.invoiceId,
                  email: clientEmail.trim(),
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                })
              });
              const vData = await vRes.json();
              if (!vRes.ok || !vData.success) throw new Error(vData.error || 'Payment verification failed');
              setUtrSubmitted(true);
              addToast('Payment verified via Razorpay! Rage Pro invoice marked Paid.', 'success');
            } catch (err: any) {
              addToast(err.message || 'Verification failed', 'error');
            } finally {
              setIsLoading(false);
            }
          }
        });
        rzp.open();
        return;
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to initialize Razorpay checkout', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkout || !discordUser || !selectedGuild) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/rage-pro/submit-utr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: checkout.invoiceId,
          utr: utr.trim(),
          guildId: selectedGuild.id,
          guildName: selectedGuild.name,
          ownerId: discordUser.id,
          ownerUsername: discordUser.global_name || discordUser.username
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'UTR submission failed');
      setUtrSubmitted(true);
      addToast('UTR submitted! Owner notified on Discord for activation.', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to submit UTR', 'error');
    } finally {
      setIsLoading(false);
    }
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
            <Link to="/pay/rage-pro" className="btn btn-primary" style={{ justifyContent: 'center', width: '100%' }}>
              Upgrade to Rage Pro (₹99) <ArrowUpRight size={16} />
            </Link>
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

      {/* Rage Pro Discord OAuth Verification & Inline UPI Checkout Modal */}
      {showProModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', maxWidth: '450px', width: '100%', padding: '1.75rem', position: 'relative', maxHeight: '92vh', overflowY: 'auto' }}>
            <button onClick={() => setShowProModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
            <h3 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '0.4rem', color: 'var(--text)' }}>Upgrade to Rage Pro (₹99)</h3>

            {!discordUser ? (
              <>
                <p style={{ fontSize: '0.84rem', color: 'var(--text2)', marginBottom: '1.1rem' }}>
                  Verify your Discord account to auto-detect servers you own before paying.
                </p>
                <button
                  type="button"
                  onClick={handleDiscordAuth}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', background: '#5865F2', borderColor: '#5865F2' }}
                >
                  Connect Discord to Verify Server Owner
                </button>
              </>
            ) : !checkout ? (
              <form onSubmit={handleOpenProCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.5rem' }}>
                <div style={{ padding: '0.75rem 0.9rem', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '0.84rem' }}>
                  <div><strong>Discord Owner:</strong> {discordUser.global_name || discordUser.username} (<code>{discordUser.id}</code>)</div>
                </div>

                {ownedGuilds.length === 0 ? (
                  <div style={{ fontSize: '0.84rem', color: '#ef4444' }}>
                    No Discord servers owned by this account were found.
                  </div>
                ) : isLifetimePro ? (
                  <>
                    <select
                      value={selectedGuildId}
                      onChange={(e) => setSelectedGuildId(e.target.value)}
                      style={{ padding: '0.75rem 0.9rem', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '10px', fontSize: '0.875rem' }}
                    >
                      {ownedGuilds.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} ({g.id})
                        </option>
                      ))}
                    </select>
                    <div style={{ padding: '0.95rem', borderRadius: '10px', background: 'rgba(16,185,129,0.12)', border: '1px solid #10b981', color: '#10b981', fontSize: '0.86rem', fontWeight: 600, textAlign: 'center' }}>
                      Lifetime Rage Pro Active! <strong>{selectedGuild?.name}</strong> is covered by Owner / Support Lifetime Pro — no payment required.
                    </div>
                  </>
                ) : (
                  <>
                    <select
                      value={selectedGuildId}
                      onChange={(e) => setSelectedGuildId(e.target.value)}
                      style={{ padding: '0.75rem 0.9rem', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '10px', fontSize: '0.875rem' }}
                    >
                      {ownedGuilds.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} ({g.id})
                        </option>
                      ))}
                    </select>

                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="Email for invoice receipt (optional)"
                      style={{ padding: '0.75rem 0.9rem', background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '10px', fontSize: '0.875rem' }}
                    />

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text2)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={confirmedOwner}
                        onChange={(e) => setConfirmedOwner(e.target.checked)}
                      />
                      <span>
                        I confirm I am the owner of <strong>{selectedGuild?.name}</strong> (<code>{selectedGuild?.id}</code>)
                      </span>
                    </label>

                    <button type="submit" disabled={isLoading} className="btn btn-primary" style={{ justifyContent: 'center', marginTop: '0.25rem' }}>
                      {isLoading ? 'Opening Razorpay...' : 'Confirm & Pay ₹99 (Razorpay)'} <ArrowUpRight size={16} />
                    </button>
                  </>
                )}
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '0.5rem' }}>
                <div style={{ fontSize: '0.84rem', color: 'var(--text2)', padding: '0.75rem 0.9rem', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                  <div>Invoice: <strong>{checkout.invoiceId}</strong></div>
                  <div style={{ marginTop: '0.2rem' }}>Server: <strong>{selectedGuild?.name}</strong></div>
                  <div style={{ marginTop: '0.2rem', color: 'var(--primary)', fontWeight: 800 }}>Amount: ₹99 INR (30 Days)</div>
                </div>

                {utrSubmitted ? (
                  <div style={{ padding: '0.9rem', borderRadius: '10px', background: 'rgba(16,185,129,0.12)', border: '1px solid #10b981', color: '#10b981', fontSize: '0.86rem', fontWeight: 600, textAlign: 'center' }}>
                    Payment confirmed via Razorpay! Rage Pro for <strong>{selectedGuild?.name}</strong> is queued for activation.
                  </div>
                ) : (
                  <button type="button" onClick={handleOpenProCheckout} disabled={isLoading} className="btn btn-primary" style={{ justifyContent: 'center' }}>
                    {isLoading ? 'Opening Razorpay...' : 'Pay ₹99 with Razorpay'} <ArrowUpRight size={16} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
