import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboardStore } from '../../store/dashboardStore';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';
import { Lock, Mail, User, Eye, EyeOff, X } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const navigate = useNavigate();
  const isOpen = useDashboardStore((s) => s.authModalOpen);
  const setIsOpen = useDashboardStore((s) => s.setAuthModalOpen);
  const addToast = useAppStore((s) => s.addToast);

  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  if (!isOpen) return null;

  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to send OTP');
      setOtpSent(true);
      addToast('6-digit OTP sent to your email!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Could not send OTP', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otp || !newPassword) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim(), newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || 'Failed to reset password');
      addToast('Password updated! You can now sign in.', 'success');
      setOtp('');
      setNewPassword('');
      setOtpSent(false);
      setTab('login');
    } catch (err: any) {
      addToast(err.message || 'Password reset failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsSubmitting(true);
    try {
      const { data, error } = await authApi.signInWithPassword(email, password);
      if (error) {
        addToast(error.message, 'error');
      } else {
        const u = data?.user;
        if (u) {
          useAuthStore.getState().setUser({
            email: u.email!,
            name: u.user_metadata?.full_name ?? u.email?.split('@')[0] ?? 'User',
            role: (u.user_metadata?.role as any) || (u.email?.includes('admin') ? 'admin' : 'client'),
            details: 'Enterprise Partner'
          });
        }
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
        addToast('Account created! Please check your email to confirm registration.', 'success');
        setTab('login');
      }
    } catch (err: any) {
      addToast(err.message || 'An error occurred during registration', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          background: 'var(--card, #ffffff)',
          border: '1px solid var(--border, #e5e7eb)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '460px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          position: 'relative',
          animation: 'authSlideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        }}>

          {/* Glow accent */}
          <div style={{
            position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)',
            width: '320px', height: '220px',
            background: 'radial-gradient(ellipse at center, rgba(124, 58, 237, 0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* ── HEADER ── */}
          <div style={{ padding: '2rem 2rem 0', position: 'relative' }}>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                position: 'absolute', top: '1.25rem', right: '1.25rem',
                background: 'var(--bg2, #f3f4f6)', border: '1px solid var(--border, #e5e7eb)',
                color: 'var(--text2, #6b7280)', borderRadius: '8px', width: '32px', height: '32px',
                cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center',
                justifyContent: 'center', transition: 'all 0.2s',
              }}
            >
              <X size={16} />
            </button>

            {/* Logo mark */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <img src="/logo-icon.png" alt="RDK Tech" style={{ width: '42px', height: '42px', objectFit: 'contain', filter: 'drop-shadow(0 2px 10px rgba(124, 58, 237, 0.35))' }} />
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text, #111827)', letterSpacing: '-0.3px', lineHeight: 1.1 }}>
                  RDK <span style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TECH</span>
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text3, #9ca3af)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700 }}>
                  Reliable Digital Kreations
                </div>
              </div>
            </div>

            {tab === 'login' ? (
              <>
                <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text, #111827)', margin: '0 0 0.4rem', letterSpacing: '-0.5px' }}>
                  Enterprise Console Access
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text2, #6b7280)', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
                  Sign in to access your enterprise dashboard.
                </p>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text, #111827)', margin: '0 0 0.4rem', letterSpacing: '-0.5px' }}>
                  Register Client Portal
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text2, #6b7280)', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
                  Join partner organizations leveraging RDK's enterprise software suite.
                </p>
              </>
            )}

            {/* ── TAB SWITCHER ── */}
            <div style={{
              display: 'flex', background: 'var(--bg2, #f3f4f6)',
              border: '1px solid var(--border, #e5e7eb)',
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
                      ? 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)'
                      : 'transparent',
                    color: tab === t ? '#fff' : 'var(--text2, #6b7280)',
                    boxShadow: tab === t ? '0 2px 12px rgba(124, 58, 237, 0.35)' : 'none',
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

                <Field label="Email Address" icon={<Mail size={16} color="#7c3aed" />}>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </Field>

                <Field label="Password" icon={<Lock size={16} color="#7c3aed" />} right={
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

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-0.35rem' }}>
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setTab('forgot'); }}
                    style={{ background: 'none', border: 'none', color: '#7c3aed', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Forgot password?
                  </button>
                </div>

                <SubmitButton loading={isSubmitting} label="Authenticate & Sign In" loadingLabel="Authenticating…" />

                <button
                  type="button"
                  onClick={async () => {
                    const { error } = (await authApi.signInWithGoogle()) as any;
                    if (error && !String(error.message || '').includes('closed')) addToast(error.message, 'error');
                    else if (!error) { addToast('Signed in with Google!', 'success'); setIsOpen(false); }
                  }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.72rem', borderRadius: '10px', border: '1px solid var(--border, #d1d5db)', background: '#ffffff', color: '#111827', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.2-1.4 3.6-5.4 3.6-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.1 14.6 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.8 0 9.6-4.1 9.6-9.8 0-.7-.1-1.2-.2-1.7H12z"/></svg>
                  Continue with Google
                </button>

                <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text3, #9ca3af)', marginTop: '0.5rem' }}>
                  Don't have a corporate account?{' '}
                  <span
                    onClick={() => setTab('register')}
                    style={{ color: '#7c3aed', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Register here
                  </span>
                </div>
              </form>
            )}

            {/* ─── FORGOT PASSWORD (EMAIL OTP) ─── */}
            {tab === 'forgot' && (
              !otpSent ? (
                <form onSubmit={handleSendResetOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text2, #6b7280)', lineHeight: 1.5 }}>
                    Enter your registered email address and we'll send you a 6-digit OTP to reset your password.
                  </p>
                  <Field label="Email Address" icon={<Mail size={16} color="#7c3aed" />}>
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={inputStyle}
                    />
                  </Field>
                  <SubmitButton loading={isSubmitting} label="Send 6-Digit OTP" loadingLabel="Sending OTP…" />
                  <button type="button" onClick={() => setTab('login')} style={{ background: 'none', border: 'none', color: '#7c3aed', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                    ← Back to Sign In
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text2, #6b7280)', lineHeight: 1.5 }}>
                    Enter the 6-digit OTP sent to <strong>{email}</strong> and choose a new password.
                  </p>
                  <Field label="6-Digit Email OTP" icon={<Lock size={16} color="#7c3aed" />}>
                    <input
                      type="text"
                      placeholder="e.g. 482910"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      maxLength={6}
                      style={inputStyle}
                    />
                  </Field>
                  <Field label="New Password (min 6 chars)" icon={<Lock size={16} color="#7c3aed" />}>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      style={inputStyle}
                    />
                  </Field>
                  <SubmitButton loading={isSubmitting} label="Verify OTP & Update Password" loadingLabel="Updating…" />
                  <button type="button" onClick={() => setOtpSent(false)} style={{ background: 'none', border: 'none', color: '#7c3aed', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                    Resend OTP
                  </button>
                </form>
              )
            )}

            {/* ─── REGISTER FORM ─── */}
            {tab === 'register' && (
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Field label="Full Name" icon={<User size={16} color="#7c3aed" />}>
                  <input
                    type="text"
                    placeholder="Alex Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </Field>

                <Field label="Work Email" icon={<Mail size={16} color="#7c3aed" />}>
                  <input
                    type="email"
                    placeholder="alex@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </Field>

                <Field label="Password" icon={<Lock size={16} color="#7c3aed" />} right={
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

                <SubmitButton loading={isSubmitting} label="Create Enterprise Account" loadingLabel="Creating account…" />

                <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text3, #9ca3af)' }}>
                  Already have an account?{' '}
                  <span
                    onClick={() => setTab('login')}
                    style={{ color: '#7c3aed', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Sign in
                  </span>
                </div>
              </form>
            )}
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
      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text2, #4b5563)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
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
        ? 'rgba(124, 58, 237, 0.5)'
        : 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
      border: 'none',
      borderRadius: '12px',
      color: '#fff',
      fontSize: '0.95rem',
      fontWeight: 700,
      cursor: loading ? 'not-allowed' : 'pointer',
      letterSpacing: '-0.2px',
      transition: 'all 0.2s',
      boxShadow: loading ? 'none' : '0 4px 20px rgba(124, 58, 237, 0.4)',
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
  background: 'var(--bg2, #f9fafb)',
  border: '1px solid var(--border, #e5e7eb)',
  borderRadius: '10px',
  color: 'var(--text, #111827)',
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box',
};

const eyeBtn: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: '0.85rem', color: 'var(--text3, #9ca3af)', padding: '0',
};

export default AuthModal;
