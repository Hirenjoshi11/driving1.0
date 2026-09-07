'use client';
import { useApp } from '@/contexts/AppContext';
import styles from './validation.module.css';

export default function FormErrorSummary({ errors = {}, onFieldClick }) {
  const { t } = useApp();
  const errorEntries = Object.entries(errors);

  if (errorEntries.length === 0) return null;

  const handleItemClick = (e, fieldKey) => {
    e.preventDefault();
    if (onFieldClick) {
      onFieldClick(fieldKey);
    } else {
      const el = document.getElementById(`field-${fieldKey}`) || document.getElementsByName(fieldKey)[0];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus({ preventScroll: true });
      }
    }
  };

  const count = errorEntries.length;

  return (
    <div
      role="alert"
      aria-live="assertive"
      tabIndex={-1}
      id="form-error-summary"
      className={styles.summaryCard}
    >
      <div className={styles.summaryHeader}>
        <div className={styles.summaryIcon}>!</div>
        <h3 className={styles.summaryTitle}>
          {t('validation.alertTitleMulti') || 'Please check your application'}
        </h3>
      </div>
      <p className={styles.summaryDesc}>
        {t('validation.alertDescMulti', { count }) || `${count} fields need your attention. Please correct the highlighted fields before continuing.`}
      </p>

      <ul className={styles.summaryList}>
        {errorEntries.map(([key, msg]) => (
          <li key={key} className={styles.summaryItem}>
            <a
              href={`#field-${key}`}
              onClick={(e) => handleItemClick(e, key)}
              className={styles.summaryLink}
            >
              <span>•</span>
              <span>{msg}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
