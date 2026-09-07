'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { IconLock } from '@/components/icons/Icons';
import styles from '../privacy.module.css';

export default function ConsentManagementPage() {
  const { t, state } = useApp();
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [message, setMessage] = useState(null);

  const loadConsents = async () => {
    try {
      const res = await fetch('/api/privacy/consent');
      if (res.ok) {
        const data = await res.json();
        setConsents(data.consents || []);
      }
    } catch (err) {
      console.error('Failed to load consents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsents();
  }, []);

  const handleToggleConsent = async (purpose, currentAction) => {
    setUpdatingId(purpose.id);
    setMessage(null);
    try {
      const action = currentAction === 'grant' ? 'grant' : 'withdraw';
      const res = await fetch('/api/privacy/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purposeId: purpose.id,
          action,
          language: state.language || 'en',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update consent');
      }

      setMessage({
        type: 'success',
        text: `Consent for "${purpose.name}" was successfully ${action === 'grant' ? 'granted' : 'withdrawn'}.`,
      });

      await loadConsents();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Error updating consent' });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          <IconLock size={20} />
          <span>{t('privacy.navConsent') || 'Consent & Processing Permissions'}</span>
        </h2>
        <p className={styles.cardDesc}>
          {t('privacy.centerSubtitle') || 'In accordance with DPDP Act 2023 Section 6, your consent must be free, specific, informed, and unambiguous. You can withdraw optional consent at any time without affecting services already delivered.'}
        </p>

        {message && (
          <div className={message.type === 'success' ? styles.alertBox : styles.alertBoxDanger}>
            {message.text}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          {consents.map((item) => {
            const isGranted = item.consent_status === 'granted';
            const isMandatory = item.is_mandatory === 1;

            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1.25rem',
                  borderRadius: '0.75rem',
                  border: '1px solid #e2e8f0',
                  background: isGranted ? '#f8fafc' : '#ffffff',
                  gap: '1rem',
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: '1 1 400px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, margin: 0 }}>
                      {item.name || item.purpose_name}
                    </h3>
                    {isMandatory ? (
                      <span className={styles.pillYellow}>Mandatory Statutory Purpose</span>
                    ) : (
                      <span className={styles.pillBlue}>Optional</span>
                    )}
                    <span className={isGranted ? styles.pillGreen : styles.pillYellow}>
                      {isGranted ? 'Active / Granted' : 'Not Granted / Withdrawn'}
                    </span>
                  </div>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.5 }}>
                    {item.description || item.purpose_description}
                  </p>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '0.4rem' }}>
                    Lawful Basis: <code>{item.legal_basis}</code> • Version: v1.0
                  </div>
                </div>

                <div>
                  {isMandatory ? (
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                      Required by Motor Vehicles Act
                    </span>
                  ) : isGranted ? (
                    <button
                      type="button"
                      disabled={updatingId === item.id}
                      onClick={() => handleToggleConsent(item, 'withdraw')}
                      className={styles.btnDanger}
                      style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
                    >
                      {updatingId === item.id ? 'Withdrawing...' : 'Withdraw Consent'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={updatingId === item.id}
                      onClick={() => handleToggleConsent(item, 'grant')}
                      className={styles.btnPrimary}
                      style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
                    >
                      {updatingId === item.id ? 'Granting...' : 'Grant Consent'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
