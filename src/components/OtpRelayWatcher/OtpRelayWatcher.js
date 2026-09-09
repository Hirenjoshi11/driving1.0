'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { encryptOtpToPublicKey } from '@/lib/otpCrypto';
import styles from './OtpRelayWatcher.module.css';

const POLL_MS = 5000;

/**
 * Global, invisible poller for authenticated citizens. When an operator opens
 * an OTP relay request on one of the citizen's applications, this surfaces a
 * modal asking the citizen to enter the code the RTO texted them. The code is
 * encrypted on-device before it leaves the browser.
 */
export default function OtpRelayWatcher() {
  const { state, t } = useApp();
  const [relay, setRelay] = useState(null);
  const [consent, setConsent] = useState(false);
  const [otp, setOtp] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | sharing | shared | error
  const [secondsLeft, setSecondsLeft] = useState(null);
  const dismissedRef = useRef(new Set());

  const isCitizen = state.isAuthenticated && (!state.user?.role || state.user.role === 'citizen');

  const poll = useCallback(() => {
    fetch('/api/otp-relay')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        const next = d.relay;
        if (next && dismissedRef.current.has(next.id)) return;
        setRelay((prev) => {
          if (next && (!prev || prev.id !== next.id)) {
            // New request — reset the form.
            setConsent(false);
            setOtp('');
            setPhase('idle');
          }
          return next;
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isCitizen) return undefined;
    poll();
    const id = setInterval(poll, POLL_MS);
    return () => clearInterval(id);
  }, [isCitizen, poll]);

  // Countdown to the relay's server-side expiry.
  useEffect(() => {
    if (!relay?.expiresAt) {
      setSecondsLeft(null);
      return undefined;
    }
    const tick = () => {
      const s = Math.max(0, Math.round((new Date(relay.expiresAt).getTime() - Date.now()) / 1000));
      setSecondsLeft(s);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [relay]);

  const submit = async (e) => {
    e.preventDefault();
    if (!relay || !otp.trim()) return;
    setPhase('sharing');
    try {
      const ciphertext = await encryptOtpToPublicKey(relay.operatorPublicKey, otp.trim());
      const res = await fetch('/api/otp-relay/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: relay.id, ciphertext }),
      });
      if (!res.ok) throw new Error('submit failed');
      setPhase('shared');
      setOtp('');
      // Let the citizen see the confirmation, then dismiss and stop re-prompting.
      const doneId = relay.id;
      setTimeout(() => {
        dismissedRef.current.add(doneId);
        setRelay(null);
      }, 2500);
    } catch {
      setPhase('error');
    }
  };

  const declineOrClose = () => {
    if (relay) dismissedRef.current.add(relay.id);
    setRelay(null);
  };

  if (!isCitizen || !relay) return null;

  const expired = secondsLeft === 0;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="otp-relay-title">
      <div className={styles.modal}>
        <div className={styles.lockRow}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>{t('otp.encryptedNote') || 'Encrypted on your device. We never store your OTP.'}</span>
        </div>

        <h2 id="otp-relay-title" className={styles.title}>
          {t('otp.promptTitle') || 'Enter the OTP sent to your phone'}
        </h2>
        <p className={styles.desc}>{t('otp.promptDesc')}</p>
        {relay.appNo && <p className={styles.appNo}>{relay.appNo}</p>}

        {phase === 'shared' ? (
          <p className={styles.shared}>{t('otp.shared') || 'Thank you. Your OTP has been shared securely.'}</p>
        ) : expired ? (
          <>
            <p className={styles.expired}>{t('otp.expired')}</p>
            <button type="button" className="btn btn-secondary" onClick={declineOrClose}>
              {t('common.close') || 'Close'}
            </button>
          </>
        ) : (
          <form onSubmit={submit} className={styles.form}>
            <label className={styles.consent}>
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span>{t('otp.consentAgree') || 'I agree to share the OTP for this submission'}</span>
            </label>

            <label className={styles.label} htmlFor="otp-relay-input">
              {t('otp.label') || 'One-time password (OTP)'}
            </label>
            <input
              id="otp-relay-input"
              className={styles.input}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 8))}
              disabled={!consent || phase === 'sharing'}
              placeholder="••••••"
            />

            {secondsLeft !== null && secondsLeft > 0 && (
              <p className={styles.countdown}>{secondsLeft}s</p>
            )}
            {phase === 'error' && <p className={styles.error}>{t('otp.expired')}</p>}

            <div className={styles.actions}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!consent || !otp.trim() || phase === 'sharing'}
              >
                {phase === 'sharing'
                  ? t('otp.sharing') || 'Encrypting and sharing…'
                  : t('otp.submit') || 'Share OTP securely'}
              </button>
              <button type="button" className={styles.declineBtn} onClick={declineOrClose}>
                {t('otp.consentDecline') || "No, I'll do it myself"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
