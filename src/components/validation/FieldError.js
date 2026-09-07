'use client';
import styles from './validation.module.css';

export default function FieldError({ error, id }) {
  if (!error) return null;

  return (
    <div
      id={id}
      role="alert"
      aria-live="polite"
      className={styles.fieldErrorText}
    >
      <span className={styles.fieldErrorIcon}>⚠️</span>
      <span>{error}</span>
    </div>
  );
}
