import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  LogOut,
  RefreshCw,
  Shield,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { DEFAULT_PRODUCT_ID, RDK_PRODUCTS } from '../data/products';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

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
  const user = useAuthStore((s) => s.user);
  const logoutRdk = useAuthStore((s) => s.logout);

  const resolvedId = productId && RDK_PRODUCTS[productId] ? productId : DEFAULT_PRODUCT_ID;
  const product = RDK_PRODUCTS[resolvedId];
  const queryGuildId = searchParams.get('guildId') || '';

  // Inline RDK Account Auth state
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Checkout state
  const [billingMode, setBillingMode] = useState<'onetime' | 'autopay'>('onetime');
  const [discordUser, setDiscordUser] = useState<DiscordUser | null>(null);
  const [ownedGuilds, setOwnedGuilds] = useState<OwnedGuild[]>([]);
  const [selectedGuildId, setSelectedGuildId] = useState(queryGuildId);
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
        setConfirmedOwner(false);
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

  const handleRdkAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: authEmail.trim(),
          password: authPassword,
          options: { data: { full_name: authName.trim() || authEmail.split('@')[0], role: 'client' } },
        });
        if (error) throw error;
        addToast('RDK Tech account created & signed in!', 'success');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail.trim(),
          password: authPassword,
        });
        if (error) throw error;
        addToast('Signed in to your RDK Tech account!', 'success');
      }
    } catch (err: any) {
      addToast(err.message || 'Authentication failed', 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' }) as any;
      if (error) throw new Error(error.message);
      addToast('Signed in with Google!', 'success');
    } catch (err: any) {
      if (!String(err.message || '').includes('closed')) {
        addToast(err.message || 'Google sign-in failed', 'error');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDiscordAuth = () => {
    window.open('/api/discord/login', 'rdk_discord_oauth', 'width=520,height=720');
  };

  const handleDiscordLogout = () => {
    setDiscordUser(null);
    setOwnedGuilds([]);
    setSelectedGuildId(queryGuildId);
    setConfirmedOwner(false);
    addToast('Discord account disconnected. Connect another account anytime.', 'info');
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      addToast('Please sign in or create an RDK Tech account first.', 'error');
      return;
    }
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
          ownerUsername: discordUser?.global_name || discordUser?.username || user.name,
          email: user.email,
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
          prefill: { email: user.email, name: user.name },
          theme: { color: '#7c3aed' },
          modal: { ondismiss: () => setIsLoading(false) },
          handler: async (response: any) => {
            try {
              const vRes = await fetch('/api/payments/razorpay/verify-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  invoiceId: checkoutData.invoiceId,
                  email: user.email,
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
        prefill: { email: user.email, name: user.name },
        theme: { color: '#7c3aed' },
        modal: { ondismiss: () => setIsLoading(false) },
        handler: async (response: any) => {
          try {
            const vRes = await fetch('/api/payments/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                invoiceId: checkoutData.invoiceId,
                email: user.email,
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {user && (
              <Link to="/dashboard" className="btn btn-outline" style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem', borderColor: 'rgba(124,58,237,0.35)', color: '#7c3aed' }}>
                Client Console
              </Link>
            )}
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

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem', padding: '1rem 1.2rem', background: '#faf8ff', border: '1px solid #ede9fe', borderRadius: '14px', marginBottom: '1.6rem' }}>
            <span style={{ fontSize: '2.2rem', fontWeight: 900, color: '#7c3aed', letterSpacing: '-0.02em' }}>₹{product.priceInr}</span>
            <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>/ {product.periodLabel}</span>
          </div>

          <h3 style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', margin: '0 0 1rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Included Features
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

        {/* Right: Account + Discord + Checkout Card */}
        <section style={{ background: '#ffffff', border: '1px solid #ede9fe', borderRadius: '20px', padding: '2rem', boxShadow: '0 8px 30px rgba(124, 58, 237, 0.08)' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.3rem', color: '#111827', letterSpacing: '-0.01em' }}>Checkout</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1.35rem', lineHeight: 1.5 }}>
            Your invoices, payment receipts, and renewal reminders are saved to your RDK Tech account.
          </p>

          {/* Step 1: RDK Account Required */}
          {!user ? (
            <form onSubmit={handleRdkAuth} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.1rem', background: '#faf8ff', border: '1px solid #ede9fe', borderRadius: '14px', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, fontSize: '0.9rem', color: '#7c3aed' }}>
                  <UserPlus size={16} /> {authMode === 'signup' ? 'Create RDK Tech Account' : 'Sign In to RDK Tech'}
                </span>
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}
                  style={{ background: 'none', border: 'none', color: '#7c3aed', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  {authMode === 'signup' ? 'Already have an account?' : 'Create new account'}
                </button>
              </div>
              {authMode === 'signup' && (
                <input
                  type="text"
                  required
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  placeholder="Full Name"
                  style={{ padding: '0.7rem 0.85rem', background: '#ffffff', border: '1px solid #d1d5db', borderRadius: '10px', fontSize: '0.86rem' }}
                />
              )}
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="Email address (for invoices & due alerts)"
                style={{ padding: '0.7rem 0.85rem', background: '#ffffff', border: '1px solid #d1d5db', borderRadius: '10px', fontSize: '0.86rem' }}
              />
              <input
                type="password"
                required
                minLength={6}
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="Password (min 6 chars)"
                style={{ padding: '0.7rem 0.85rem', background: '#ffffff', border: '1px solid #d1d5db', borderRadius: '10px', fontSize: '0.86rem' }}
              />
              <button type="submit" disabled={authLoading} className="btn btn-primary" style={{ justifyContent: 'center', background: '#7c3aed', border: 'none', fontWeight: 700 }}>
                {authLoading ? 'Please wait...' : authMode === 'signup' ? 'Create Account & Continue' : 'Sign In & Continue'}
              </button>
              <button
                type="button"
                disabled={authLoading}
                onClick={handleGoogleAuth}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.68rem', borderRadius: '10px', border: '1px solid #d1d5db', background: '#ffffff', color: '#111827', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.2-1.4 3.6-5.4 3.6-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.1 14.6 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.8 0 9.6-4.1 9.6-9.8 0-.7-.1-1.2-.2-1.7H12z"/></svg>
                Continue with Google
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 0.9rem', background: '#faf8ff', border: '1px solid #ede9fe', borderRadius: '10px', fontSize: '0.83rem', marginBottom: '1rem' }}>
              <div>
                <span style={{ color: '#6b7280' }}>RDK Account:</span> <strong>{user.email}</strong>
              </div>
              <button
                type="button"
                onClick={logoutRdk}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', color: '#7c3aed', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
              >
                <LogOut size={13} /> Switch
              </button>
            </div>
          )}

          {paidInfo ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
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
              <Link
                to="/dashboard"
                className="btn btn-outline"
                style={{ justifyContent: 'center', padding: '0.8rem', fontWeight: 700, borderColor: '#7c3aed', color: '#7c3aed' }}
              >
                View Invoice &amp; Upcoming Due in RDK Console
              </Link>
              <a
                href={discordReturnUrl}
                className="btn btn-primary"
                style={{ justifyContent: 'center', padding: '0.85rem', fontWeight: 700, background: '#7c3aed', border: 'none' }}
              >
                Return to Discord Server <ExternalLink size={16} />
              </a>
            </div>
          ) : user ? (
            <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Billing Mode Selector */}
              {product.supportsAutoPay && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                    Billing Option
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                    <button
                      type="button"
                      onClick={() => setBillingMode('onetime')}
                      style={{
                        padding: '0.85rem',
                        borderRadius: '12px',
                        border: billingMode === 'onetime' ? '2px solid #7c3aed' : '1px solid #e5e7eb',
                        background: billingMode === 'onetime' ? '#faf8ff' : '#ffffff',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800, fontSize: '0.86rem', color: '#111827' }}>
                        <CreditCard size={15} color="#7c3aed" /> One-Time
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.25rem', lineHeight: 1.4 }}>
                        ₹{product.priceInr} for 30 days. Renew manually next month.
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBillingMode('autopay')}
                      style={{
                        padding: '0.85rem',
                        borderRadius: '12px',
                        border: billingMode === 'autopay' ? '2px solid #7c3aed' : '1px solid #e5e7eb',
                        background: billingMode === 'autopay' ? '#faf8ff' : '#ffffff',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800, fontSize: '0.86rem', color: '#111827' }}>
                        <RefreshCw size={15} color="#7c3aed" /> Auto-Pay
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.25rem', lineHeight: 1.4 }}>
                        ₹{product.priceInr}/mo automatic renewal. Cancel anytime.
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Discord Connection + Logout */}
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 0.9rem', background: '#faf8ff', border: '1px solid #ede9fe', borderRadius: '10px', fontSize: '0.83rem', color: '#374151', gap: '0.5rem' }}>
                      <div>
                        <strong>Discord:</strong> {discordUser.global_name || discordUser.username} (<code>{discordUser.id}</code>)
                      </div>
                      <button
                        type="button"
                        onClick={handleDiscordLogout}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', color: '#ef4444', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', flexShrink: 0 }}
                      >
                        <LogOut size={13} /> Logout Discord
                      </button>
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
                <div style={{ padding: '1rem 1.1rem', borderRadius: '12px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.45)', color: '#059669', fontSize: '0.86rem', lineHeight: 1.5, textAlign: 'center' }}>
                  <div style={{ fontWeight: 800, marginBottom: '0.2rem' }}>Lifetime Pro Active</div>
                  <strong>{selectedGuild?.name}</strong> already has complimentary Lifetime access — no payment needed.
                </div>
              ) : (
                discordUser && ownedGuilds.length > 0 && (
                  <>
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
          ) : null}
        </section>
      </main>
    </div>
  );
}
