'use client';
import { useApp } from '@/contexts/AppContext';
import styles from './validation.module.css';

export default function UnsavedChangesDialog({
  isOpen,
  onStay,
  onSaveAndContinue,
  onLeave
}) {
  const { t } = useApp();

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-labelledby="unsaved-title">
      <div className={styles.modalCard}>
        <div className={`${styles.modalIcon} ${styles.modalIconWarning}`}>💾</div>
        <h3 id="unsaved-title" className={styles.modalTitle}>
          {t('validation.unsavedChangesTitle') || 'Unsaved Changes'}
        </h3>
        <p className={styles.modalDesc}>
          {t('validation.unsavedChangesDesc') ||
            "You have changes that haven't been submitted yet. Do you want to stay on this page or leave?"}
        </p>

        <div className={styles.modalActions}>
          <button
            type="button"
            onClick={onLeave}
            className="btn btn-ghost"
          >
            {t('validation.leaveWithoutSavingBtn')}
          </button>
          <button
            type="button"
            onClick={onStay}
            className="btn btn-secondary"
          >
            {t('validation.stayOnPageBtn') || 'Stay on Page'}
          </button>
          {onSaveAndContinue && (
            <button
              type="button"
              onClick={onSaveAndContinue}
              className="btn btn-primary"
            >
              {t('validation.saveAndContinueBtn') || 'Save & Continue'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
