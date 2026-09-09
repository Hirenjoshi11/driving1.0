'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { generateOperatorKeypair, decryptOtp } from '@/lib/otpCrypto';
import styles from './OperatorOtpPanel.module.css';

const POLL_MS = 3000;

/**
 * Operator-side OTP relay. The operator asks the citizen for the OTP the RTO
 * texted them; it arrives here encrypted to a keypair generated in THIS browser
 * and is decrypted only in memory. The plaintext is never sent to our server.
 */
export default function OperatorOtpPanel({ applicationId }) {
  const { t } = useApp();
  const [phase, setPhase] = useState('idle'); // idle | waiting | received | expired | error
  const [otp, setOtp] = useState('');
  const [copied, setCopied] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const privateKeyRef = useRef(null);
  const expiresRef = useRef(null);

  const base = `/api/staff/applications/${applicationId}/otp-request`;

  const reset = useCallback(() => {
    privateKeyRef.current = null;
    expiresRef.current = null;
    setOtp('');
    setCopied(false);
    setSecondsLeft(null);
    setPhase('idle');
  }, []);

  const request = async () => {
    try {
      setPhase('waiting');
      setOtp('');
      const { publicKeyB64, privateKey } = await generateOperatorKeypair();
      privateKeyRef.current = privateKey;
      const res = await fetch(base, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operatorPublicKey: publicKeyB64 }),
      });
      if (!res.ok) throw new Error('request failed');
      const d = await res.json();
      expiresRef.current = d.expiresAt;
    } catch {
      setPhase('error');
    }
  };

  const clear = useCallback(() => {
    fetch(`${base}/clear`, { method: 'POST' }).catch(() => {});
    reset();
  }, [base, reset]);

  // Poll for the citizen's encrypted submission while waiting.
  useEffect(() => {
    if (phase !== 'waiting') return undefined;
    let active = true;
    const poll = async () => {
      try {
        const res = await fetch(base);
        if (!res.ok) return;
        const d = await res.json();
        if (!active || !d.relay) return;
        if (d.relay.status === 'fulfilled' && d.relay.ciphertext && privateKeyRef.current) {
          try {
            const code = await decryptOtp(privateKeyRef.current, d.relay.ciphertext);
            if (active) {
              setOtp(code);
              setPhase('received');
            }
          } catch {
            if (active) setPhase('error');
          }
        } else if (d.relay.status === 'expired') {
          if (active) setPhase('expired');
        }
      } catch {
        /* transient */
      }
    };
    poll();
    const id = setInterval(poll, POLL_MS);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [phase, base]);

  // 60s on-screen urgency countdown while waiting (the real deadline is server-side).
  useEffect(() => {
    if (phase !== 'waiting' || !expiresRef.current) {
      if (phase !== 'waiting') setSecondsLeft(null);
      return undefined;
    }
    const start = Date.now();
    const tick = () => setSecondsLeft(Math.max(0, 60 - Math.round((Date.now() - start) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [phase]);

  const copy = () => {
    if (!otp) return;
    navigator.clipboard?.writeText(otp).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
      () => {}
    );
  };

  return (
    <section className={styles.panel} aria-label={t('otpRelay.title') || 'OTP relay'}>
      <div className={styles.header}>
        <span className={styles.title}>{t('otpRelay.title') || 'OTP relay'}</span>
      </div>
      <p className={styles.desc}>{t('otpRelay.desc')}</p>

      {phase === 'idle' && (
        <button type="button" className="btn btn-primary btn-sm" onClick={request}>
          {t('otpRelay.request') || 'Request OTP from citizen'}
        </button>
      )}

      {phase === 'waiting' && (
        <div className={styles.waiting}>
          <span className={styles.spinner} aria-hidden="true" />
          <span>
            {t('otpRelay.waiting') || 'Waiting for the citizen to enter the OTP…'}
            {secondsLeft !== null && secondsLeft > 0 ? ` (${secondsLeft}s)` : ''}
          </span>
        </div>
      )}

      {phase === 'received' && (
        <div className={styles.received}>
          <span className={styles.receivedLabel}>{t('otpRelay.received') || 'OTP received'}</span>
          <div className={styles.codeRow}>
            <span className={styles.code}>{otp}</span>
            <button type="button" className="btn btn-secondary btn-sm" onClick={copy}>
              {copied ? t('otpRelay.copied') || 'Copied' : t('otpRelay.copy') || 'Copy'}
            </button>
          </div>
          <button type="button" className={styles.clearBtn} onClick={clear}>
            {t('otpRelay.clear') || 'Clear (used)'}
          </button>
        </div>
      )}

      {phase === 'expired' && (
        <div className={styles.expired}>
          <p>{t('otpRelay.expired') || 'Request expired'}</p>
          <button type="button" className="btn btn-secondary btn-sm" onClick={request}>
            {t('otpRelay.resend') || 'Send a new request'}
          </button>
        </div>
      )}

      {phase === 'error' && (
        <div className={styles.expired}>
          <p>{t('otpRelay.decryptError') || 'Could not complete the relay. Try again.'}</p>
          <button type="button" className="btn btn-secondary btn-sm" onClick={reset}>
            {t('otpRelay.resend') || 'Send a new request'}
          </button>
        </div>
      )}
    </section>
  );
}
