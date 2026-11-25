import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  CreditCard,
  RefreshCw,
  Shield,
  ShieldCheck,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { DEFAULT_PRODUCT_ID, RDK_PRODUCTS } from '../data/products';
import { useAppStore } from '../store/appStore';

interface OwnedGuild {
  id: string;
  name: string;
}

interface DiscordUser {
  id: string;
  username: string;
  global_name?: string;
}

export default function PaymentPage() {
  const { productId } = useParams<{ productId?: string }>();
  const [searchParams] = useSearchParams();
  const addToast = useAppStore((s) => s.addToast);

  const resolvedId = productId && RDK_PRODUCTS[productId] ? productId : DEFAULT_PRODUCT_ID;
  const product = RDK_PRODUCTS[resolvedId];
  const queryGuildId = searchParams.get('guildId') || '';

  const [billingMode, setBillingMode] = useState<'onetime' | 'autopay'>('onetime');
  const [discordUser, setDiscordUser] = useState<DiscordUser | null>(null);
  const [ownedGuilds, setOwnedGuilds] = useState<OwnedGuild[]>([]);
  const [selectedGuildId, setSelectedGuildId] = useState(queryGuildId);
  const [clientEmail, setClientEmail] = useState('');
  const [confirmedOwner, setConfirmedOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paidInfo, setPaidInfo] = useState<{ paymentId: string; mode: string; invoiceId: string } | null>(null);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === 'RDK_DISCORD_AUTH') {
        setDiscordUser(event.data.user);
        const guilds: OwnedGuild[] = event.data.ownedGuilds || [];
        setOwnedGuilds(guilds);
        if (queryGuildId && guilds.some((g) => g.id === queryGuildId)) {
          setSelectedGuildId(queryGuildId);
        } else if (guilds.length > 0) {
          setSelectedGuildId(guilds[0].id);
        }
        addToast(`Discord connected as ${event.data.user?.username}`, 'success');
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [addToast, queryGuildId]);

  const selectedGuild = ownedGuilds.find((g) => g.id === selectedGuildId);
  const isLifetimePro = Boolean(
    product.id === 'rage-pro' &&
      (discordUser?.id === '1140892126402596905' || selectedGuild?.id === '1266048940101599293')
  );

  const handleDiscordAuth = () => {
    window.open('/api/discord/login', 'rdk_discord_oauth', 'width=520,height=720');
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (product.requiresDiscordGuild && (!discordUser || !selectedGuild)) {
      addToast('Please connect Discord and select your server first.', 'error');
      return;
    }
    if (product.requiresDiscordGuild && !confirmedOwner) {
      addToast('Please confirm server ownership before proceeding.', 'error');
      return;
    }
    if (!(window as any).Razorpay) {
      addToast('Razorpay SDK not loaded. Please refresh the page.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const checkoutRes = await fetch('/api/rage-pro/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guildId: selectedGuild?.id || 'direct',
          guildName: selectedGuild?.name || product.name,
          ownerId: discordUser?.id || 'web',
          ownerUsername: discordUser?.global_name || discordUser?.username || 'Web Client',
          email: clientEmail.trim(),
        }),
      });
      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok) throw new Error(checkoutData.error || 'Checkout creation failed');

      if (billingMode === 'autopay') {
        const subRes = await fetch('/api/payments/razorpay/create-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invoiceId: checkoutData.invoiceId,
            guildId: selectedGuild?.id,
            productId: product.id,
            amount: product.priceInr,
          }),
        });
        const subData = await subRes.json();
        if (!subRes.ok || !subData.subscriptionId) {
          throw new Error(subData.error || 'Could not initialize Auto-Pay subscription');
        }
        const rzp = new (window as any).Razorpay({
          key: subData.keyId,
          subscription_id: subData.subscriptionId,
          name: `RDK Tech — ${product.name}`,
          description: `Monthly Auto-Pay (₹${product.priceInr}/mo) • ${selectedGuild?.name || ''}`,
          prefill: { email: clientEmail.trim() || undefined },
          theme: { color: '#7c3aed' },
          modal: { ondismiss: () => setIsLoading(false) },
          handler: async (response: any) => {
            try {
              const vRes = await fetch('/api/payments/razorpay/verify-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  invoiceId: checkoutData.invoiceId,
                  email: clientEmail.trim(),
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_subscription_id: response.razorpay_subscription_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });
              const vData = await vRes.json();
              if (!vRes.ok || !vData.success) throw new Error(vData.error || 'Auto-Pay verification failed');
              setPaidInfo({ paymentId: response.razorpay_payment_id, mode: 'Auto-Pay Monthly', invoiceId: checkoutData.invoiceId });
              addToast('Auto-Pay enabled & Rage Pro activated!', 'success');
            } catch (err: any) {
              addToast(err.message || 'Verification failed', 'error');
            } finally {
              setIsLoading(false);
            }
          },
        });
        rzp.open();
        return;
      }

      const orderRes = await fetch('/api/payments/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: checkoutData.invoiceId, amount: product.priceInr, currency: 'INR' }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok || !order.orderId) throw new Error(order.error || 'Failed to create Razorpay order');

      const rzp = new (window as any).Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: `RDK Tech — ${product.name}`,
        description: `${product.periodLabel} License • ${selectedGuild?.name || ''}`,
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
                invoiceId: checkoutData.invoiceId,
                email: clientEmail.trim(),
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const vData = await vRes.json();
            if (!vRes.ok || !vData.success) throw new Error(vData.error || 'Verification failed');
            setPaidInfo({ paymentId: response.razorpay_payment_id, mode: 'One-Time (30 Days)', invoiceId: checkoutData.invoiceId });
            addToast('Payment verified & Rage Pro activated!', 'success');
          } catch (err: any) {
            addToast(err.message || 'Verification failed', 'error');
          } finally {
            setIsLoading(false);
          }
        },
      });
      rzp.open();
    } catch (err: any) {
      addToast(err.message || 'Payment initialization failed', 'error');
      setIsLoading(false);
    }
  };

  const discordReturnUrl = selectedGuild
    ? `https://discord.com/channels/${selectedGuild.id}`
    : queryGuildId
    ? `https://discord.com/channels/${queryGuildId}`
    : 'https://discord.com/app';

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7ff', color: '#111827', fontFamily: 'var(--font-sans, Inter, sans-serif)' }}>
      {/* Top Bar */}
      <header style={{ background: '#ffffff', borderBottom: '1px solid #ede9fe', padding: '0.9rem 1.5rem' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: '#111827', fontWeight: 800, fontSize: '1rem' }}>
            <ArrowLeft size={16} color="#7c3aed" />
            RDK <span style={{ color: '#7c3aed' }}>TECH</span> Checkout
          </Link>
          <a
            href={discordReturnUrl}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline"
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem', borderColor: 'rgba(124,58,237,0.35)', color: '#7c3aed', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            Back to Discord <ExternalLink size={14} />
          </a>
        </div>
      </header>

      <main style={{ maxWidth: '1120px', margin: '0 auto', padding: '2.25rem 1.25rem 4rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        {/* Left: Product Overview & Features */}
        <section style={{ background: '#ffffff', border: '1px solid #ede9fe', borderRadius: '20px', padding: '2rem', boxShadow: '0 8px 30px rgba(124, 58, 237, 0.06)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.75rem', borderRadius: '999px', background: '#f3e8ff', color: '#7c3aed', fontSize: '0.75rem', fontWeight: 700 }}>
            <Sparkles size={13} /> {product.badge}
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, margin: '0.85rem 0 0.45rem', color: '#111827' }}>{product.name}</h1>
          <p style={{ color: '#4b5563', fontSize: '0.94rem', lineHeight: 1.6, margin: '0 0 1.5rem' }}>{product.tagline}</p>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', padding: '1rem 1.15rem', background: '#faf8ff', border: '1px solid #ede9fe', borderRadius: '14px', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '2.1rem', fontWeight: 900, color: '#7c3aed' }}>₹{product.priceInr}</span>
            <span style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: 600 }}>/ {product.periodLabel}</span>
          </div>

          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#111827', margin: '0 0 1rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            What You Get
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {product.features.map((f) => (
              <div key={f.title} style={{ display: 'flex', gap: '0.7rem', alignItems: 'flex-start' }}>
                <CheckCircle2 size={18} color="#7c3aed" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111827' }}>{f.title}</div>
                  <div style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.45, marginTop: '0.15rem' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right: Checkout Card */}
        <section style={{ background: '#ffffff', border: '1px solid #ede9fe', borderRadius: '20px', padding: '2rem', boxShadow: '0 8px 30px rgba(124, 58, 237, 0.08)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.35rem', color: '#111827' }}>Complete Your Upgrade</h2>
          <p style={{ fontSize: '0.84rem', color: '#6b7280', margin: '0 0 1.25rem' }}>
            Choose one-time manual renewal or monthly Auto-Pay via Razorpay.
          </p>

          {paidInfo ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '1.15rem', borderRadius: '14px', background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', color: '#065f46' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1rem', color: '#059669' }}>
                  <CheckCircle2 size={20} /> Payment Confirmed!
                </div>
                <div style={{ fontSize: '0.84rem', marginTop: '0.5rem', lineHeight: 1.6 }}>
                  <div><strong>Plan:</strong> {product.name} ({paidInfo.mode})</div>
                  {selectedGuild && <div><strong>Server:</strong> {selectedGuild.name}</div>}
                  <div><strong>Invoice:</strong> {paidInfo.invoiceId}</div>
                  <div><strong>Payment ID:</strong> {paidInfo.paymentId}</div>
                </div>
              </div>
              <a
                href={discordReturnUrl}
                className="btn btn-primary"
                style={{ justifyContent: 'center', padding: '0.85rem', fontWeight: 700, background: '#7c3aed', border: 'none' }}
              >
                Return to Discord Server <ExternalLink size={16} />
              </a>
            </div>
          ) : (
            <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Billing Mode Selector */}
              {product.supportsAutoPay && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '0.45rem' }}>
                    Billing Preference
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                    <button
                      type="button"
                      onClick={() => setBillingMode('onetime')}
                      style={{
                        padding: '0.8rem',
                        borderRadius: '12px',
                        border: billingMode === 'onetime' ? '2px solid #7c3aed' : '1px solid #e5e7eb',
                        background: billingMode === 'onetime' ? '#faf8ff' : '#ffffff',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800, fontSize: '0.84rem', color: '#111827' }}>
                        <CreditCard size={15} color="#7c3aed" /> Pay Monthly
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.2rem' }}>
                        One-time ₹{product.priceInr} for 30 days. Renew manually when needed.
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBillingMode('autopay')}
                      style={{
                        padding: '0.8rem',
                        borderRadius: '12px',
                        border: billingMode === 'autopay' ? '2px solid #7c3aed' : '1px solid #e5e7eb',
                        background: billingMode === 'autopay' ? '#faf8ff' : '#ffffff',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800, fontSize: '0.84rem', color: '#111827' }}>
                        <RefreshCw size={15} color="#7c3aed" /> Auto-Pay
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.2rem' }}>
                        Auto-renew ₹{product.priceInr}/mo via UPI Autopay or Card. Cancel anytime.
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Discord Connection */}
              {product.requiresDiscordGuild && (
                !discordUser ? (
                  <button
                    type="button"
                    onClick={handleDiscordAuth}
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', background: '#5865F2', border: 'none', fontWeight: 700 }}
                  >
                    <Shield size={16} /> Connect Discord to Select Server
                  </button>
                ) : (
                  <>
                    <div style={{ padding: '0.7rem 0.9rem', background: '#faf8ff', border: '1px solid #ede9fe', borderRadius: '10px', fontSize: '0.84rem', color: '#374151' }}>
                      <strong>Discord Owner:</strong> {discordUser.global_name || discordUser.username} (<code>{discordUser.id}</code>)
                    </div>

                    {ownedGuilds.length === 0 ? (
                      <div style={{ fontSize: '0.84rem', color: '#ef4444' }}>
                        No Discord servers owned by this account were found.
                      </div>
                    ) : (
                      <select
                        value={selectedGuildId}
                        onChange={(e) => setSelectedGuildId(e.target.value)}
                        style={{ padding: '0.75rem 0.9rem', background: '#f9fafb', border: '1px solid #d1d5db', color: '#111827', borderRadius: '10px', fontSize: '0.875rem' }}
                      >
                        {ownedGuilds.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.name} ({g.id})
                          </option>
                        ))}
                      </select>
                    )}
                  </>
                )
              )}

              {isLifetimePro ? (
                <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', color: '#059669', fontSize: '0.86rem', fontWeight: 600, textAlign: 'center' }}>
                  Lifetime Rage Pro Active! <strong>{selectedGuild?.name}</strong> is covered by Owner / Support Lifetime Pro — no payment required.
                </div>
              ) : (
                discordUser && ownedGuilds.length > 0 && (
                  <>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="Email for invoice & receipt (optional)"
                      style={{ padding: '0.75rem 0.9rem', background: '#f9fafb', border: '1px solid #d1d5db', color: '#111827', borderRadius: '10px', fontSize: '0.875rem' }}
                    />

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#4b5563', cursor: 'pointer' }}>
                      <input type="checkbox" checked={confirmedOwner} onChange={(e) => setConfirmedOwner(e.target.checked)} />
                      <span>
                        I confirm I am the owner of <strong>{selectedGuild?.name}</strong> (<code>{selectedGuild?.id}</code>)
                      </span>
                    </label>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn btn-primary"
                      style={{ justifyContent: 'center', padding: '0.85rem', fontWeight: 700, background: '#7c3aed', border: 'none' }}
                    >
                      {isLoading
                        ? 'Opening Razorpay...'
                        : billingMode === 'autopay'
                        ? `Enable Auto-Pay (₹${product.priceInr}/mo)`
                        : `Pay ₹${product.priceInr} with Razorpay`}{' '}
                      <ArrowUpRight size={16} />
                    </button>
                  </>
                )
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                <ShieldCheck size={14} color="#7c3aed" /> Secured by Razorpay • Instant Discord Activation
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
