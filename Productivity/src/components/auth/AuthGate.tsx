import React, { FormEvent, useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, Users, Zap, KeyRound } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../../services/supabase';
import type { Session as SupabaseSession, User as SupabaseUser } from '@supabase/supabase-js';

type Mode = 'signin' | 'signup' | 'reset' | 'update_password';

export interface AuthIdentity {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'Member';
  title: string;
  bio: string;
  streakDays: number;
}

interface AuthGateProps {
  children: (identity: AuthIdentity, signOut: () => Promise<void>) => React.ReactNode;
}

function identityFromUser(user: SupabaseUser): AuthIdentity {
  const metadata = user.user_metadata || {};
  const name = String(metadata.full_name || metadata.name || user.email?.split('@')[0] || 'Member');
  return {
    id: user.id,
    name,
    email: user.email || '',
    avatar: String(metadata.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || user.id)}`),
    role: 'Member',
    title: 'Momentum Member',
    bio: '',
    streakDays: 0,
  };
}

export function AuthGate({ children }: AuthGateProps) {
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data, error }) => {
      if (!error && data.session) {
        setSession(data.session);
      }
      setLoading(false);
    }).catch(() => setLoading(false));

    // Listen for auth events including PASSWORD_RECOVERY
    const { data: authListener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);
      setLoading(false);

      if (event === 'PASSWORD_RECOVERY') {
        setMode('update_password');
        setMessage('Please enter a new password for your account.');
      }
    });

    // Check if recovery token is present in hash
    if (window.location.hash.includes('type=recovery')) {
      setMode('update_password');
    }

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setMessage('');
    setBusy(true);

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: name.trim(),
            },
          },
        });
        if (signUpError) throw signUpError;
        if (data.session) {
          setMessage('Your account is ready. Welcome to Momentum.');
        } else {
          setMessage('Account created! Check your email to verify your address, then sign in.');
          setMode('signin');
        }
      } else if (mode === 'signin') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
      } else if (mode === 'reset') {
        const redirectTo = `${window.location.origin}/`;
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo,
        });
        if (resetError) throw resetError;
        setMessage('If an account exists for that email, a password reset link has been sent.');
      } else if (mode === 'update_password') {
        if (newPassword.length < 8) {
          throw new Error('Password must be at least 8 characters long.');
        }
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (updateError) throw updateError;
        setMessage('Password updated successfully! Redirecting...');
        setTimeout(() => {
          setMode('signin');
          window.location.hash = '';
        }, 1500);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
  }

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="auth-mark">M</div>
        <p>Preparing your Momentum workspace…</p>
      </div>
    );
  }

  if (session?.user && mode !== 'update_password') {
    return <>{children(identityFromUser(session.user), signOut)}</>;
  }

  const configured = isSupabaseConfigured;

  return (
    <div className="auth-page">
      <div className="auth-decoration auth-decoration-one" />
      <div className="auth-decoration auth-decoration-two" />
      <header className="auth-topbar">
        <div className="auth-brand">
          <span className="auth-mark">M</span>
          <span>momentum</span>
        </div>
        <span className="auth-top-note">A little progress, every day.</span>
      </header>
      <main className="auth-layout">
        <section className="auth-story">
          <div className="auth-eyebrow">
            <Zap size={14} /> YOUR GOALS, IN MOTION
          </div>
          <h1>
            Make room for
            <br />
            <em>what matters.</em>
          </h1>
          <p className="auth-story-copy">
            A calmer place to turn personal ambitions and shared plans into real progress — together.
          </p>
          <div className="auth-value-list">
            <div>
              <CheckCircle2 size={18} />
              <span>Keep your next step clear</span>
            </div>
            <div>
              <Users size={18} />
              <span>Build momentum with your people</span>
            </div>
            <div>
              <LockKeyhole size={18} />
              <span>Your private goals stay yours</span>
            </div>
          </div>
          <p className="auth-footnote">Less noise. More follow-through.</p>
        </section>

        <section className="auth-card">
          <div className="auth-card-heading">
            <div className="auth-card-icon">
              {mode === 'update_password' ? <KeyRound size={20} /> : <LockKeyhole size={20} />}
            </div>
            <h2>
              {mode === 'signup'
                ? 'Create your account'
                : mode === 'reset'
                ? 'Reset your password'
                : mode === 'update_password'
                ? 'Set new password'
                : 'Welcome back'}
            </h2>
            <p>
              {mode === 'signup'
                ? 'Start with your own space. Invite your team when you’re ready.'
                : mode === 'reset'
                ? 'We’ll email you a secure password reset link.'
                : mode === 'update_password'
                ? 'Choose a strong password with at least 8 characters.'
                : 'Sign in to pick up where you left off.'}
            </p>
          </div>

          {!configured && (
            <div className="auth-warning">
              <strong>Supabase Setup Required</strong>
              <br />
              Add your Supabase publishable key to <code>.env.local</code> as{' '}
              <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>, then restart Vite.
            </div>
          )}

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}
          {message && (
            <div className="auth-success" role="status">
              {message}
            </div>
          )}

          <form onSubmit={submit} className="auth-form">
            {mode === 'signup' && (
              <label>
                Full name
                <input
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                  minLength={2}
                />
              </label>
            )}

            {mode !== 'update_password' && (
              <label>
                Email address
                <span className="auth-input-wrap">
                  <Mail size={17} />
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </span>
              </label>
            )}

            {mode !== 'reset' && mode !== 'update_password' && (
              <label>
                Password
                <span className="auth-input-wrap">
                  <LockKeyhole size={17} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    minLength={8}
                    required
                  />
                  <button
                    className="auth-show-password"
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </span>
              </label>
            )}

            {mode === 'update_password' && (
              <label>
                New Password
                <span className="auth-input-wrap">
                  <LockKeyhole size={17} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    minLength={8}
                    required
                  />
                  <button
                    className="auth-show-password"
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </span>
              </label>
            )}

            {mode === 'signin' && (
              <button
                type="button"
                className="auth-text-button auth-forgot"
                onClick={() => {
                  setMode('reset');
                  setError('');
                  setMessage('');
                }}
              >
                Forgot password?
              </button>
            )}

            <button
              className="auth-submit"
              type="submit"
              disabled={!configured || busy}
            >
              {busy
                ? 'Please wait…'
                : mode === 'signup'
                ? 'Create account'
                : mode === 'reset'
                ? 'Send reset link'
                : mode === 'update_password'
                ? 'Update password'
                : 'Sign in'}{' '}
              {!busy && <ArrowRight size={17} />}
            </button>
          </form>

          <div className="auth-switch">
            {mode === 'signup' ? (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setMode('signin');
                    setError('');
                    setMessage('');
                  }}
                >
                  Sign in
                </button>
              </>
            ) : mode === 'reset' || mode === 'update_password' ? (
              <button
                onClick={() => {
                  setMode('signin');
                  setError('');
                  setMessage('');
                }}
              >
                Back to sign in
              </button>
            ) : (
              <>
                New to Momentum?{' '}
                <button
                  onClick={() => {
                    setMode('signup');
                    setError('');
                    setMessage('');
                  }}
                >
                  Create an account
                </button>
              </>
            )}
          </div>
          <div className="auth-privacy">
            By continuing, you agree to use Momentum respectfully and keep private work private.
          </div>
        </section>
      </main>
      <footer className="auth-footer">
        MOMENTUM <span>·</span> SMALL STEPS, SHARED PROGRESS
      </footer>
    </div>
  );
}
