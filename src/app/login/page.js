'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';
import { IconAlert, IconInfo, IconUser, IconShield, IconDocument } from '@/components/icons/Icons';
import styles from './login.module.css';

function GoogleIcon() {
  return (
    <svg className={styles.googleIcon} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect');
  const errorParam = searchParams.get('error');
  const { dispatch, t } = useApp();

  const [role, setRole] = useState('citizen'); // 'citizen' | 'admin'
  const [citizenMethod, setCitizenMethod] = useState('email'); // 'email' | 'mobile'
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(errorParam === 'oauth_failed' ? 'Google Sign-In was cancelled or failed. Please try again.' : '');
  const [info, setInfo] = useState('');

  const resolveTarget = () => {
    let target = redirectPath;
    if (!target && typeof window !== 'undefined') {
      try {
        const recovery = sessionStorage.getItem('dlf_auth_recovery');
        if (recovery) {
          const parsed = JSON.parse(recovery);
          if (parsed.return_route) {
            target = parsed.return_route;
          }
        }
      } catch (_) {}
    }
    if (!target || target.startsWith('/admin')) {
      target = '/'; // As requested: as soon as user login, bring them to http://localhost:3000/
    }
    return target;
  };

  // Handle Passwordless Direct Email Login
  const handleDirectEmailLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setInfo('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError(t('auth.directEmailPlaceholder') || 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign in with email');
      }

      dispatch({ type: 'SET_USER', payload: data.user });
      router.push(resolveTarget());
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle Citizen OTP Send
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setInfo('');

    const cleanedMobile = mobile.replace(/\D/g, '');
    if (cleanedMobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', mobile: cleanedMobile }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setOtpSent(true);
      setInfo(data.message || 'OTP sent successfully to your mobile number.');
    } catch (err) {
      setError(err.message || 'Error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  // Handle Citizen OTP Verify
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setInfo('');

    if (!otp || otp.length < 4) {
      setError('Please enter the verification OTP');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          mobile: mobile.replace(/\D/g, ''),
          otp: otp.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }

      dispatch({ type: 'SET_USER', payload: data.user });
      router.push(resolveTarget());
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth Click
  const handleGoogleSignIn = () => {
    const target = resolveTarget();
    window.location.href = `/api/auth/oauth/google?redirect=${encodeURIComponent(target)}`;
  };

  // Handle Operator / Admin Login
  const handleOperatorLogin = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!identifier || !password) {
      setError('Please enter both identifier and password');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      dispatch({ type: 'SET_USER', payload: data.user });

      const target = redirectPath || (data.user.role === 'citizen' ? '/dashboard' : '/admin');
      router.push(target);
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className={styles.loginCard}>
      <div className={styles.header}>
        <img
          src="/logo-website.png"
          alt={t('common.appName') || 'Driving License Form'}
          className={styles.loginLogo}
        />
        <h1 className={styles.title}>{t('auth.login') || 'Sign In to Your Account'}</h1>
        <p className={styles.desc}>
          {t('auth.loginDesc') || 'Access your licence applications, draft forms, and document upload history.'}
        </p>
      </div>

      {/* Role Tabs */}
      <div className={styles.roleTabs}>
        <button
          type="button"
          className={`${styles.roleTab} ${role === 'citizen' ? styles.roleTabActive : ''}`}
          onClick={() => {
            setRole('citizen');
            setError('');
            setInfo('');
          }}
        >
          {t('auth.citizenTab') || 'Citizen'}
        </button>
        <button
          type="button"
          className={`${styles.roleTab} ${role === 'admin' ? styles.roleTabActive : ''}`}
          onClick={() => {
            setRole('admin');
            setError('');
            setInfo('');
          }}
        >
          {t('auth.operatorTab') || 'RTO Officer / Admin'}
        </button>
      </div>

      {error && <div className={styles.errorMsg} role="alert"><IconAlert size={15} /> {error}</div>}
      {info && <div className={styles.infoMsg} role="status"><IconInfo size={15} /> {info}</div>}

      {/* Citizen Flow */}
      {role === 'citizen' ? (
        <div>
          {/* OAuth: Continue with Google */}
          <button
            type="button"
            className={styles.googleBtn}
            onClick={handleGoogleSignIn}
            disabled={loading}
            aria-label="Continue with Google"
          >
            <GoogleIcon />
            <span>{t('auth.continueWithGoogle') || 'Continue with Google'}</span>
          </button>

          {/* Divider */}
          <div className={styles.divider}>{t('auth.orDivider') || 'OR'}</div>

          {/* Direct Email Login Form */}
          <form className={styles.form} onSubmit={handleDirectEmailLogin}>
            <div className={styles.formGroup}>
              <label className={styles.label}>{t('auth.usernameEmail') || 'Email Address'}</label>
              <input
                type="email"
                className={styles.input}
                placeholder={t('auth.emailPlaceholder') || 'name@example.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              className={`btn btn-primary btn-lg ${styles.submitBtn}`}
              disabled={loading}
            >
              {loading ? t('common.loading') : 'Log In'}
            </button>
          </form>
        </div>
      ) : (
        /* Operator / Admin Form (Bcrypt Password) */
        <form className={styles.form} onSubmit={handleOperatorLogin}>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('auth.usernameEmail')}</label>
            <input
              type="text"
              className={styles.input}
              placeholder={t('auth.emailPlaceholder')}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{t('auth.password')}</label>
            <input
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className={`btn btn-primary btn-lg ${styles.submitBtn}`}
            disabled={loading}
          >
            {loading ? t('common.loading') : t('auth.signInOfficer')}
          </button>
        </form>
      )}

    </div>
  );
}

export default function LoginPage() {
  return (
    <div className={styles.loginPage}>
      <div className="container">
        <Suspense fallback={<div className="loading-center"><div className="spinner"></div></div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
