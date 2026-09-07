import Link from 'next/link';
import { IconSearch } from '@/components/icons/Icons';
import styles from './status.module.css';

export default function NotFound() {
  return (
    <div className={styles.statusCard}>
      <span className={`${styles.statusIcon} ${styles.statusIconNotFound}`}>
        <IconSearch size={30} />
      </span>
      <h1 className={styles.statusTitle}>404 — Page Not Found</h1>
      <p className={styles.statusDesc}>
        The driving licence service, application page, or government reference
        record you requested could not be located. It may have moved or been
        updated.
      </p>

      <div className={styles.statusActions}>
        <Link href="/" className="btn btn-primary">
          Return to Homepage
        </Link>
        <Link href="/apply" className="btn btn-secondary">
          Explore Services
        </Link>
        <Link href="/track" className="btn btn-secondary">
          Track Application
        </Link>
      </div>
    </div>
  );
}
