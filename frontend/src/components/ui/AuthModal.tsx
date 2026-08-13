import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardStore } from '../../store/dashboardStore';
import { useAppStore } from '../../store/appStore';
import { authApi, setUserRole } from '../../api/auth';
import { Lock, Mail, User, Building2, Briefcase, Rocket, Settings, ShieldCheck, CheckCircle2, Globe, Eye, EyeOff, X } from 'lucide-react';

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

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await authApi.signInWithGoogle();
      if (error) {
        addToast(error.message, 'error');
      }
    } catch (err: any) {
      addToast(err.message || 'An error occurred during Google OAuth', 'error');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsSubmitting(true);
    try {
      const { error } = await authApi.signInWithPassword(email, password);
      if (error) {
        addToast(error.message, 'error');
      } else {
        addToast('Authentication verified. Accessing console…', 'success');
        setIsOpen(false);
        navigate('/dashboard');
      }
    } catch (err: any) {
      addToast(err.message || 'An error occurred during authentication', 'error');
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
        addToast('Account created! Please check your email to confirm registration.', 'success');
        setTab('login');
      }
    } catch (err: any) {
      addToast(err.message || 'An error occurred during registration', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleOptions = [
    { value: 'client', icon: <Building2 size={18} color="#ea580c" />, label: 'Client', sub: 'Commission & oversee software builds' },
    { value: 'employee', icon: <Briefcase size={18} color="#ea580c" />, label: 'Employee', sub: 'Execute production sprints' },
    { value: 'freelancer', icon: <Rocket size={18} color="#ea580c" />, label: 'Contractor', sub: 'Specialized module engineering' },
    { value: 'admin', icon: <Settings size={18} color="#ea580c" />, label: 'Administrator', sub: 'System oversight & governance' },
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
          background: 'var(--card, #111827)',
          border: '1px solid var(--border, #374151)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '460px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
          position: 'relative',
          animation: 'authSlideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        }}>

          {/* Glow accent */}
          <div style={{
            position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)',
            width: '300px', height: '200px',
            background: 'radial-gradient(ellipse at center, rgba(234, 88, 12, 0.2) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* ── HEADER ── */}
          <div style={{ padding: '2rem 2rem 0', position: 'relative' }}>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                position: 'absolute', top: '1.25rem', right: '1.25rem',
                background: 'var(--surface, #1f2937)', border: '1px solid var(--border, #374151)',
                color: '#9CA3AF', borderRadius: '8px', width: '32px', height: '32px',
                cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center',
                justifyContent: 'center', transition: 'all 0.2s',
              }}
            >
              <X size={16} />
            </button>

            {/* Logo mark */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: '#ea580c',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', fontWeight: 900, color: '#fff', letterSpacing: '-1px',
                boxShadow: '0 4px 16px rgba(234, 88, 12, 0.4)',
              }}>R</div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.3px' }}>
                RDK <span style={{ color: '#ea580c' }}>Industries</span>
              </span>
            </div>

            {tab === 'login' ? (
              <>
                <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#fff', margin: '0 0 0.4rem', letterSpacing: '-0.5px' }}>
                  Enterprise Console Access
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text2, #9ca3af)', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
                  Sign in with your verified credentials or Google Workspace account.
                </p>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#fff', margin: '0 0 0.4rem', letterSpacing: '-0.5px' }}>
                  Register Client Portal
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text2, #9ca3af)', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
                  Join partner organizations leveraging RDK's enterprise software suite.
                </p>
              </>
            )}

            {/* ── GOOGLE OAUTH BUTTON ── */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '12px',
                color: '#1f2937',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                marginBottom: '1.25rem',
                transition: 'transform 0.15s ease, background 0.15s ease'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Continue with Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border, #374151)' }}></div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text3, #9ca3af)', fontWeight: 700, textTransform: 'uppercase' }}>Or sign in with email</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border, #374151)' }}></div>
            </div>

            {/* ── TAB SWITCHER ── */}
            <div style={{
              display: 'flex', background: 'var(--surface, #1f2937)',
              border: '1px solid var(--border, #374151)',
              borderRadius: '12px', padding: '4px', gap: '4px', marginBottom: '1.5rem',
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
                      ? '#ea580c'
                      : 'transparent',
                    color: tab === t ? '#fff' : 'var(--text3, #9ca3af)',
                    boxShadow: tab === t ? '0 2px 12px rgba(234, 88, 12, 0.35)' : 'none',
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

                <Field label="Email Address" icon={<Mail size={16} color="#ea580c" />}>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </Field>

                <Field label="Password" icon={<Lock size={16} color="#ea580c" />} right={
                  <button type="button" onClick={() => setShowPwd(!showPwd)} style={eyeBtn}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Enter your security password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </Field>

                <SubmitButton loading={isSubmitting} label="Authenticate & Sign In" loadingLabel="Authenticating…" />

                <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text3, #9ca3af)', marginTop: '0.5rem' }}>
                  Don't have a corporate account?{' '}
                  <span
                    onClick={() => setTab('register')}
                    style={{ color: '#ea580c', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Register here
                  </span>
                </div>
              </form>
            )}

            {/* ─── REGISTER FORM ─── */}
            {tab === 'register' && (
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Field label="Full Name" icon={<User size={16} color="#ea580c" />}>
                  <input
                    type="text"
                    placeholder="Alex Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </Field>

                <Field label="Work Email" icon={<Mail size={16} color="#ea580c" />}>
                  <input
                    type="email"
                    placeholder="alex@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </Field>

                <Field label="Password" icon={<Lock size={16} color="#ea580c" />} right={
                  <button type="button" onClick={() => setShowPwd(!showPwd)} style={eyeBtn}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </Field>

                {/* Role selector */}
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text3, #9ca3af)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.6rem' }}>
                    Select Access Role
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    {roleOptions.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRole(r.value as any)}
                        style={{
                          background: role === r.value
                            ? 'rgba(234, 88, 12, 0.15)'
                            : 'var(--surface, #1f2937)',
                          border: role === r.value
                            ? '1px solid #ea580c'
                            : '1px solid var(--border, #374151)',
                          borderRadius: '10px',
                          padding: '0.65rem 0.75rem',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{r.icon}</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: role === r.value ? '#ea580c' : '#D1D5DB' }}>{r.label}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text3, #9ca3af)', lineHeight: 1.3 }}>{r.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <SubmitButton loading={isSubmitting} label="Create Enterprise Account" loadingLabel="Creating account…" />

                <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text3, #9ca3af)' }}>
                  Already have an account?{' '}
                  <span
                    onClick={() => setTab('login')}
                    style={{ color: '#ea580c', fontWeight: 600, cursor: 'pointer' }}
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
              borderTop: '1px solid var(--border, #374151)',
            }}>
              {[
                { icon: <ShieldCheck size={14} color="#ea580c" />, text: 'End-to-End Encryption' },
                { icon: <CheckCircle2 size={14} color="#4ade80" />, text: 'SOC 2 Ready' },
                { icon: <Globe size={14} color="#38bdf8" />, text: '99.9% Uptime SLA' },
              ].map((b, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: 'var(--text3, #9ca3af)' }}>
                  {b.icon}<span>{b.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/* ── Helper components ── */

const Field: React.FC<{
  label: string;
  icon: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
}> = ({ label, icon, right, children }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text3, #9ca3af)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        {icon}
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
        ? 'rgba(234, 88, 12, 0.5)'
        : '#ea580c',
      border: 'none',
      borderRadius: '12px',
      color: '#fff',
      fontSize: '0.95rem',
      fontWeight: 700,
      cursor: loading ? 'not-allowed' : 'pointer',
      letterSpacing: '-0.2px',
      transition: 'all 0.2s',
      boxShadow: loading ? 'none' : '0 4px 24px rgba(234, 88, 12, 0.45)',
      marginTop: '0.25rem',
    }}
  >
    {loading ? loadingLabel : label}
  </button>
);

/* Shared input styles */
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  background: 'var(--surface, #1f2937)',
  border: '1px solid var(--border, #374151)',
  borderRadius: '10px',
  color: '#F9FAFB',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box',
};

const eyeBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: '0.85rem', color: '#9CA3AF', padding: '0',
};

export default AuthModal;
