'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { IconHandshake } from '@/components/icons/Icons';
import styles from '../privacy.module.css';

export default function NominationPage() {
  const { t } = useApp();
  const [nomination, setNomination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nomineeName, setNomineeName] = useState('');
  const [nomineeRelationship, setNomineeRelationship] = useState('');
  const [nomineePhone, setNomineePhone] = useState('');
  const [nomineeEmail, setNomineeEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const loadNomination = async () => {
    try {
      const res = await fetch('/api/privacy/nomination');
      if (res.ok) {
        const data = await res.json();
        setNomination(data.nomination);
        if (data.nomination) {
          setNomineeName(data.nomination.nominee_name || '');
          setNomineeRelationship(data.nomination.nominee_relationship || '');
          setNomineePhone(data.nomination.nominee_phone || '');
          setNomineeEmail(data.nomination.nominee_email || '');
        }
      }
    } catch (err) {
      console.error('Failed to load nomination:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNomination();
  }, []);

  const handleSaveNominee = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/privacy/nomination', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomineeName,
          nomineeRelationship,
          nomineePhone,
          nomineeEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to designate nominee');

      setStatusMsg({ type: 'success', text: 'Nominee successfully designated under DPDP Act Section 14.' });
      await loadNomination();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to save nomination' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevoke = async () => {
    if (!confirm('Are you sure you want to revoke your designated nominee?')) return;
    setSubmitting(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/privacy/nomination', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revoke' }),
      });

      if (!res.ok) throw new Error('Failed to revoke nomination');
      setStatusMsg({ type: 'success', text: 'Nomination revoked successfully.' });
      setNomination(null);
      setNomineeName('');
      setNomineeRelationship('');
      setNomineePhone('');
      setNomineeEmail('');
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Revocation failed' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {statusMsg && (
        <div className={statusMsg.type === 'success' ? styles.alertBox : styles.alertBoxDanger}>
          {statusMsg.text}
        </div>
      )}

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          <IconHandshake size={20} />
          <span>{t('privacy.navNomination') || 'Right of Nomination (DPDP Section 14)'}</span>
        </h2>
        <p className={styles.cardDesc}>
          Under Section 14 of the DPDP Act 2023, you have the statutory right to designate another individual who shall, in the event of death or incapacity, exercise your Data Principal rights on your behalf.
        </p>

        {nomination ? (
          <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                Active Nominee: {nomination.nominee_name}
              </h3>
              <span className={styles.pillGreen}>Active Statutory Designation</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              <div><strong>Relationship:</strong> {nomination.nominee_relationship}</div>
              <div><strong>Contact Phone:</strong> {nomination.nominee_phone}</div>
              <div><strong>Email:</strong> {nomination.nominee_email || '—'}</div>
              <div><strong>Designated On:</strong> {new Date(nomination.created_at).toLocaleDateString()}</div>
            </div>
            <div style={{ marginTop: '1.25rem' }}>
              <button
                type="button"
                onClick={handleRevoke}
                disabled={submitting}
                className={styles.btnDanger}
              >
                Revoke Designation
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveNominee}>
            <div className={styles.gridTwo}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t('privacy.guardianName') || 'Nominee Legal Full Name'}</label>
                <input
                  type="text"
                  required
                  className={styles.formInput}
                  placeholder="Full name of designated representative"
                  value={nomineeName}
                  onChange={(e) => setNomineeName(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t('privacy.guardianRelation') || 'Relationship to Data Principal'}</label>
                <input
                  type="text"
                  required
                  className={styles.formInput}
                  placeholder="e.g., Spouse, Adult Child, Parent, Legal Representative"
                  value={nomineeRelationship}
                  onChange={(e) => setNomineeRelationship(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t('privacy.guardianContact') || 'Nominee Mobile Phone'}</label>
                <input
                  type="tel"
                  required
                  className={styles.formInput}
                  placeholder="10-digit mobile number"
                  value={nomineePhone}
                  onChange={(e) => setNomineePhone(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nominee Email Address (Optional)</label>
                <input
                  type="email"
                  className={styles.formInput}
                  placeholder="nominee@example.com"
                  value={nomineeEmail}
                  onChange={(e) => setNomineeEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={styles.btnPrimary}
            >
              <span>{submitting ? 'Saving...' : 'Save Nominee Designation'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
