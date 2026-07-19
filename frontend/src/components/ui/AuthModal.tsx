import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardStore } from '../../store/dashboardStore';
import { useAppStore } from '../../store/appStore';
import { authApi, setUserRole } from '../../api/auth';

export const AuthModal: React.FC = () => {
  const navigate = useNavigate();
  const isOpen = useDashboardStore((s) => s.authModalOpen);
  const setIsOpen = useDashboardStore((s) => s.setAuthModalOpen);
  const addToast = useAppStore((s) => s.addToast);

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'client' | 'employee' | 'freelancer' | 'admin'>('client');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsSubmitting(true);
    try {
      const { error } = await authApi.signInWithPassword(email, password);
      if (error) {
        addToast(error.message, 'error');
      } else {
        addToast('Welcome back! Redirecting to your console…', 'success');
        setIsOpen(false);
        navigate('/dashboard');
      }
    } catch (err: any) {
      addToast(err.message || 'An error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) return;
    setIsSubmitting(true);
    try {
      const { error } = await authApi.signUp(email, password, name);
      if (error) {
        addToast(error.message, 'error');
      } else {
        if (role !== 'client') await setUserRole(email, role);
        addToast('Account created! Check your email to verify, then sign in.', 'success');
        setTab('login');
      }
    } catch (err: any) {
      addToast(err.message || 'An error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleOptions = [
    { value: 'client',     icon: '🏢', label: 'Client',      sub: 'Hire talent & manage projects' },
    { value: 'employee',   icon: '💼', label: 'Employee',     sub: 'Work on client projects' },
    { value: 'freelancer', icon: '🚀', label: 'Freelancer',   sub: 'Independent contractor' },
    { value: 'admin',      icon: '⚙️', label: 'Admin',        sub: 'Platform management access' },
  ];

  return (
    <>
      {/* ── OVERLAY ── */}
      <div
        className="modal-overlay open"
        onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
        style={{ alignItems: 'center', justifyContent: 'center' }}
      >
        {/* ── CARD ── */}
        <div style={{
          background: 'linear-gradient(145deg, #0f1623 0%, #151d2e 100%)',
          border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '460px',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.7), 0 0 60px rgba(99,102,241,0.12)',
          overflow: 'hidden',
          position: 'relative',
          animation: 'authSlideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        }}>

          {/* Glow accent */}
          <div style={{
            position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)',
            width: '300px', height: '200px',
            background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.3) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* ── HEADER ── */}
          <div style={{ padding: '2rem 2rem 0', position: 'relative' }}>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                position: 'absolute', top: '1.25rem', right: '1.25rem',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#9CA3AF', borderRadius: '8px', width: '32px', height: '32px',
                cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center',
                justifyContent: 'center', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLButtonElement).style.color = '#9CA3AF'; }}
            >✕</button>

            {/* Logo mark */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', fontWeight: 900, color: '#fff', letterSpacing: '-1px',
                boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
              }}>R</div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>
                RDK <span style={{ color: '#6366f1' }}>Industries</span>
              </span>
            </div>

            {tab === 'login' ? (
              <>
                <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#fff', margin: '0 0 0.4rem', letterSpacing: '-0.5px' }}>
                  Welcome back
                </h2>
                <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: '0 0 1.75rem', lineHeight: 1.5 }}>
                  Sign in to access your RDK console and manage your projects.
                </p>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#fff', margin: '0 0 0.4rem', letterSpacing: '-0.5px' }}>
                  Create your account
                </h2>
                <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: '0 0 1.75rem', lineHeight: 1.5 }}>
                  Join 200+ businesses scaling with RDK's enterprise platform.
                </p>
              </>
            )}

            {/* ── TAB SWITCHER ── */}
            <div style={{
              display: 'flex', background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px', padding: '4px', gap: '4px', marginBottom: '1.75rem',
            }}>
              {(['login', 'register'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    flex: 1, padding: '0.6rem', border: 'none', borderRadius: '9px',
                    fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: tab === t
                      ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                      : 'transparent',
                    color: tab === t ? '#fff' : '#6B7280',
                    boxShadow: tab === t ? '0 2px 12px rgba(99,102,241,0.35)' : 'none',
                  }}
                >
                  {t === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>
          </div>

          {/* ── FORM BODY ── */}
          <div style={{ padding: '0 2rem 2rem' }}>

            {/* ─── LOGIN FORM ─── */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* ── DEMO QUICK-FILL ── */}
                <div style={{
                  background: 'rgba(99,102,241,0.07)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  borderRadius: '12px',
                  padding: '0.9rem',
                }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#818CF8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>
                    ⚡ Demo accounts — click to fill
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                    {[
                      { icon: '🏢', role: 'Client',     email: 'client@rdk.com',     pwd: 'rdk@demo2026' },
                      { icon: '💼', role: 'Employee',   email: 'employee@rdk.com',   pwd: 'rdk@demo2026' },
                      { icon: '🚀', role: 'Freelancer', email: 'freelancer@rdk.com', pwd: 'rdk@demo2026' },
                      { icon: '⚙️', role: 'Admin',      email: 'admin@rdk.com',      pwd: 'rdk@demo2026' },
                    ].map((d) => (
                      <button
                        key={d.role}
                        type="button"
                        onClick={() => { setEmail(d.email); setPassword(d.pwd); }}
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '8px',
                          padding: '0.45rem 0.6rem',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.15s',
                          color: '#D1D5DB',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(99,102,241,0.5)';
                          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.1)';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)';
                          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
                        }}
                      >
                        <span>{d.icon}</span>
                        <div>
                          <div style={{ color: '#E5E7EB' }}>{d.role}</div>
                          <div style={{ fontSize: '0.68rem', color: '#6B7280', fontWeight: 400 }}>{d.email}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#4B5563', marginTop: '0.5rem', textAlign: 'center' }}>
                    Password for all demo accounts: <code style={{ color: '#818CF8', background: 'rgba(99,102,241,0.15)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>rdk@demo2026</code>
                  </div>
                </div>

                <Field label="Email address" icon="✉️">
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={inputStyle}
                    onFocus={e => Object.assign(e.currentTarget.style, inputFocusStyle)}
                    onBlur={e => Object.assign(e.currentTarget.style, inputBlurStyle)}
                  />
                </Field>

                <Field label="Password" icon="🔒" right={
                  <button type="button" onClick={() => setShowPwd(!showPwd)} style={eyeBtn}>
                    {showPwd ? '🙈' : '👁️'}
                  </button>
                }>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={inputStyle}
                    onFocus={e => Object.assign(e.currentTarget.style, inputFocusStyle)}
                    onBlur={e => Object.assign(e.currentTarget.style, inputBlurStyle)}
                  />
                </Field>

                <SubmitButton loading={isSubmitting} label="Sign In →" loadingLabel="Signing in…" />

                <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#4B5563', marginTop: '0.5rem' }}>
                  Don't have an account?{' '}
                  <span
                    onClick={() => setTab('register')}
                    style={{ color: '#818CF8', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Create one free
                  </span>
                </div>
              </form>
            )}

            {/* ─── REGISTER FORM ─── */}
            {tab === 'register' && (
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Field label="Full name" icon="👤">
                  <input
                    type="text"
                    placeholder="Alex Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={inputStyle}
                    onFocus={e => Object.assign(e.currentTarget.style, inputFocusStyle)}
                    onBlur={e => Object.assign(e.currentTarget.style, inputBlurStyle)}
                  />
                </Field>

                <Field label="Work email" icon="✉️">
                  <input
                    type="email"
                    placeholder="alex@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={inputStyle}
                    onFocus={e => Object.assign(e.currentTarget.style, inputFocusStyle)}
                    onBlur={e => Object.assign(e.currentTarget.style, inputBlurStyle)}
                  />
                </Field>

                <Field label="Password" icon="🔒" right={
                  <button type="button" onClick={() => setShowPwd(!showPwd)} style={eyeBtn}>
                    {showPwd ? '🙈' : '👁️'}
                  </button>
                }>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={inputStyle}
                    onFocus={e => Object.assign(e.currentTarget.style, inputFocusStyle)}
                    onBlur={e => Object.assign(e.currentTarget.style, inputBlurStyle)}
                  />
                </Field>

                {/* Role selector */}
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.6rem' }}>
                    I am joining as…
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    {roleOptions.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRole(r.value as any)}
                        style={{
                          background: role === r.value
                            ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))'
                            : 'rgba(255,255,255,0.03)',
                          border: role === r.value
                            ? '1px solid rgba(99,102,241,0.6)'
                            : '1px solid rgba(255,255,255,0.07)',
                          borderRadius: '10px',
                          padding: '0.65rem 0.75rem',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{r.icon}</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: role === r.value ? '#a5b4fc' : '#D1D5DB' }}>{r.label}</div>
                        <div style={{ fontSize: '0.7rem', color: '#6B7280', lineHeight: 1.3 }}>{r.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <SubmitButton loading={isSubmitting} label="Create Account →" loadingLabel="Creating account…" />

                <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#374151', margin: '0.25rem 0 0', lineHeight: 1.5 }}>
                  By creating an account you agree to our{' '}
                  <span style={{ color: '#6366f1', cursor: 'pointer' }}>Terms of Service</span>
                  {' '}and{' '}
                  <span style={{ color: '#6366f1', cursor: 'pointer' }}>Privacy Policy</span>.
                </p>

                <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#4B5563' }}>
                  Already have an account?{' '}
                  <span
                    onClick={() => setTab('login')}
                    style={{ color: '#818CF8', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Sign in
                  </span>
                </div>
              </form>
            )}

            {/* Trust badges */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '1.25rem', marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}>
              {[
                { icon: '🔐', text: 'End-to-end encrypted' },
                { icon: '✅', text: 'SOC 2 compliant' },
                { icon: '🌍', text: '99.9% uptime SLA' },
              ].map((b) => (
                <div key={b.text} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: '#4B5563' }}>
                  <span>{b.icon}</span><span>{b.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Keyframe injection */}
      <style>{`
        @keyframes authSlideUp {
          from { opacity: 0; transform: translateY(32px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
};

/* ── Helper components ── */

const Field: React.FC<{
  label: string;
  icon: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}> = ({ label, icon: _icon, right, children }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      {right}
    </div>
    {children}
  </div>
);

const SubmitButton: React.FC<{ loading: boolean; label: string; loadingLabel: string }> = ({ loading, label, loadingLabel }) => (
  <button
    type="submit"
    disabled={loading}
    style={{
      width: '100%',
      padding: '0.85rem',
      background: loading
        ? 'rgba(99,102,241,0.4)'
        : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      border: 'none',
      borderRadius: '12px',
      color: '#fff',
      fontSize: '0.95rem',
      fontWeight: 700,
      cursor: loading ? 'not-allowed' : 'pointer',
      letterSpacing: '-0.2px',
      transition: 'all 0.2s',
      boxShadow: loading ? 'none' : '0 4px 24px rgba(99,102,241,0.45)',
      marginTop: '0.25rem',
    }}
    onMouseEnter={e => {
      if (!loading) {
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 32px rgba(99,102,241,0.55)';
      }
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
      (e.currentTarget as HTMLButtonElement).style.boxShadow = loading ? 'none' : '0 4px 24px rgba(99,102,241,0.45)';
    }}
  >
    {loading ? (
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        <span style={{
          width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)',
          borderTop: '2px solid #fff', borderRadius: '50%',
          animation: 'spin 0.7s linear infinite', display: 'inline-block',
        }} />
        {loadingLabel}
      </span>
    ) : label}
  </button>
);

/* Shared input styles */
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px',
  color: '#F9FAFB',
  fontSize: '0.9rem',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxSizing: 'border-box',
};

const inputFocusStyle: React.CSSProperties = {
  borderColor: 'rgba(99,102,241,0.8)',
  boxShadow: '0 0 0 3px rgba(99,102,241,0.15)',
  background: 'rgba(99,102,241,0.06)',
};

const inputBlurStyle: React.CSSProperties = {
  borderColor: 'rgba(255,255,255,0.1)',
  boxShadow: 'none',
  background: 'rgba(255,255,255,0.05)',
};

const eyeBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: '0.85rem', color: '#6B7280', padding: '0',
};

export default AuthModal;
