'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { IconAlert, IconRenew } from '@/components/icons/Icons';
import styles from './status.module.css';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className={styles.statusCard} role="alert">
      <span className={`${styles.statusIcon} ${styles.statusIconError}`}>
        <IconAlert size={30} />
      </span>
      <h2 className={styles.statusTitle}>Something went wrong</h2>
      <p className={styles.statusDesc}>
        An unexpected error occurred while loading this page or processing your
        licensing application. Your entered information has been preserved in your
        local session.
      </p>

      {error?.message && <div className={styles.errorDetail}>{error.message}</div>}

      <div className={styles.statusActions}>
        <button type="button" className="btn btn-primary" onClick={() => reset()}>
          <IconRenew size={16} />
          Try Again
        </button>
        <Link href="/" className="btn btn-secondary">
          Return Home
        </Link>
      </div>
    </div>
  );
}
