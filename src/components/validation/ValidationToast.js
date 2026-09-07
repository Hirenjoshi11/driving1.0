'use client';
import { useEffect } from 'react';
import styles from './validation.module.css';

export default function ValidationToast({
  title,
  message,
  severity = 'error', // 'error', 'info', 'success'
  onClose,
  autoDismissMs = null
}) {
  useEffect(() => {
    if (autoDismissMs && onClose) {
      const timer = setTimeout(onClose, autoDismissMs);
      return () => clearTimeout(timer);
    }
  }, [autoDismissMs, onClose]);

  if (!message) return null;

  return (
    <div className={styles.toastWrap} role="status" aria-live="polite">
      <div className={styles.toastCard} data-severity={severity}>
        <div className={styles.summaryIcon}>
          {severity === 'success' ? '✓' : severity === 'info' ? 'ℹ' : '!'}
        </div>
        <div className={styles.toastContent}>
          {title && <div className={styles.toastTitle}>{title}</div>}
          <div className={styles.toastMessage}>{message}</div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className={styles.toastCloseBtn}
            aria-label="Close notification"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
