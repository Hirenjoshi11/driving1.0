'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import styles from './validation.module.css';

export default function SessionExpiredDialog({
  isOpen,
  applicationId,
  currentStepIndex,
  onClose
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { t, state } = useApp();

  if (!isOpen) return null;

  const handleSignIn = () => {
    // Store safe return context in sessionStorage (NO sensitive data in URL!)
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(
          'dlf_return_context',
          JSON.stringify({
            returnRoute: pathname,
            applicationId: applicationId || null,
            currentStep: currentStepIndex !== undefined ? currentStepIndex : null,
            language: state.language || 'en',
            timestamp: Date.now()
          })
        );
      } catch (e) {
        console.warn('Failed to save return context to sessionStorage:', e);
      }
    }
    // Redirect to login
    router.push('/login?returnContext=1');
  };

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="session-expired-title">
      <div className={styles.modalCard}>
        <div className={styles.modalIcon}>🔒</div>
        <h3 id="session-expired-title" className={styles.modalTitle}>
          {t('validation.sessionExpiredTitle') || 'Session Expired'}
        </h3>
        <p className={styles.modalDesc}>
          {t('validation.sessionExpiredDesc') ||
            'For your security, please sign in again to continue. Your application details have been safely preserved.'}
        </p>

        <div className={styles.modalActions}>
          <button
            type="button"
            onClick={handleSignIn}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {t('validation.signInBtn') || 'Sign In & Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
