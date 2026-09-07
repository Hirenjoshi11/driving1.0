'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';
import { IconAlert, IconInfo, IconUser, IconShield } from '@/components/icons/Icons';
import styles from './login.module.css';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect');
  const { dispatch, t } = useApp();

  const [role, setRole] = useState('citizen'); // 'citizen' | 'admin'
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

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
      setInfo(data.message || 'OTP sent successfully. Demo OTP: 123456');
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

      // If redirect target is admin, citizen cannot access it, so default to /dashboard or recovery path
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
        target = '/dashboard';
      }
      router.push(target);
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
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

  const handleDemoFill = async (type) => {
    setError('');
    setInfo('');

    if (type === 'citizen') {
      setRole('citizen');
      setMobile('9876543210');
      setOtp('123456');
      setOtpSent(true);
      setInfo('Demo mode: Mobile set to 9876543210 and OTP set to 123456. Click "Verify OTP & Sign In".');
    } else {
      setRole('admin');
      setIdentifier('admin@drivinglicenseform.com');
      setPassword('admin123');
      setInfo(t('auth.demoFilledOperator'));
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
        <h1 className={styles.title}>{t('auth.login')}</h1>
        <p className={styles.desc}>
          {t('auth.loginDesc')}
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
          {t('auth.citizenTab')}
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
          {t('auth.operatorTab')}
        </button>
      </div>

      {error && <div className={styles.errorMsg} role="alert"><IconAlert size={15} /> {error}</div>}
      {info && <div className={styles.infoMsg} role="status"><IconInfo size={15} /> {info}</div>}

      {/* Citizen Form (Mobile + OTP) */}
      {role === 'citizen' ? (
        <form className={styles.form} onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('auth.mobileNumber')}</label>
            <div className={styles.inputRow}>
              <input
                type="tel"
                className={styles.input}
                placeholder={t('auth.mobilePlaceholder')}
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                disabled={loading || otpSent}
                required
              />
              {otpSent && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp('');
                  }}
                  title={t('common.edit')}
                >
                  {t('common.edit')}
                </button>
              )}
            </div>
          </div>

          {otpSent && (
            <div className={styles.formGroup}>
              <div className={styles.labelRow}>
                <label className={styles.label}>{t('auth.otp')}</label>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className={styles.resendBtn}
                >
                  {t('auth.resendOtp')}
                </button>
              </div>
              <input
                type="text"
                className={styles.input}
                placeholder={t('auth.otpPlaceholder')}
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                autoFocus
                required
              />
            </div>
          )}

          <button
            type="submit"
            className={`btn btn-primary btn-lg ${styles.submitBtn}`}
            disabled={loading}
          >
            {loading
              ? t('common.loading')
              : otpSent
              ? t('auth.verifyOtp')
              : t('auth.sendOtp')}
          </button>
        </form>
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

      {/* Quick Demo Fill Buttons */}
      <div className={styles.quickDemo}>
        <span className={styles.demoLabel}>{t('auth.demoSectionLabel')}</span>
        <div className={styles.demoBtns}>
          <button
            type="button"
            className={styles.demoBtn}
            onClick={() => handleDemoFill('citizen')}
          >
            <IconUser size={14} />
            {t('auth.demoCitizenBtn')}
          </button>
          <button
            type="button"
            className={styles.demoBtn}
            onClick={() => handleDemoFill('admin')}
          >
            <IconShield size={14} />
            {t('auth.demoOperatorBtn')}
          </button>
        </div>
      </div>
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
