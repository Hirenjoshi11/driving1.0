'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { IconScale, IconTrash, IconAlert } from '@/components/icons/Icons';
import styles from '../privacy.module.css';

export default function PrivacyRequestsPage() {
  const { t } = useApp();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erasureReason, setErasureReason] = useState('');
  const [submittingErasure, setSubmittingErasure] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const loadRequests = async () => {
    try {
      const res = await fetch('/api/privacy/requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleErasureSubmit = async (e) => {
    e.preventDefault();
    setSubmittingErasure(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/privacy/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType: 'erasure',
          reason: erasureReason || 'Citizen requested erasure under DPDP Act Section 12',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit erasure request');

      setStatusMsg({
        type: 'success',
        text: `Controlled erasure request #${data.request.requestNumber} registered. Our privacy officer will conduct statutory retention and legal hold checks before irreversible anonymization.`,
      });
      setErasureReason('');
      await loadRequests();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Erasure request failed' });
    } finally {
      setSubmittingErasure(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {statusMsg && (
        <div className={statusMsg.type === 'success' ? styles.alertBox : styles.alertBoxDanger}>
          {statusMsg.text}
        </div>
      )}

      {/* Requests Queue */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          <IconScale size={20} />
          <span>{t('privacy.navRequests') || 'My Privacy Rights Requests'}</span>
        </h2>
        <p className={styles.cardDesc}>
          Track status and administrative review of your Data Principal requests submitted under Chapter III of the DPDP Act 2023.
        </p>

        {loading ? (
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading your privacy requests...</p>
        ) : requests.length === 0 ? (
          <div className={styles.alertBox}>
            You have not submitted any privacy rights requests yet. You can submit data correction or erasure requests below.
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Request #</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Identity Verification</th>
                  <th>Submitted At</th>
                  <th>Resolution / Outcome</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => {
                  const statusClass =
                    r.status === 'completed' ? styles.pillGreen :
                    r.status === 'rejected' ? styles.pillRed : styles.pillYellow;

                  return (
                    <tr key={r.id}>
                      <td><strong>{r.request_number}</strong></td>
                      <td style={{ textTransform: 'capitalize' }}>{r.request_type?.replace(/_/g, ' ')}</td>
                      <td><span className={statusClass}>{r.status?.replace(/_/g, ' ')}</span></td>
                      <td>
                        <span className={r.verification_status === 'verified' ? styles.pillGreen : styles.pillYellow}>
                          {r.verification_status || 'verified'}
                        </span>
                      </td>
                      <td>{new Date(r.created_at).toLocaleDateString()}</td>
                      <td style={{ maxWidth: '300px' }}>
                        {r.resolution || (r.reason ? `Pending review: ${r.reason}` : 'In review by compliance officer')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Controlled Erasure Request Form */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          <IconTrash size={20} />
          <span>{t('privacy.erasureTitle') || 'Request Account & Data Erasure'}</span>
        </h2>
        <p className={styles.cardDesc}>
          {t('privacy.erasureDesc') || 'Under Section 12(3) of the DPDP Act 2023, you may request erasure of personal data that is no longer necessary for the purpose for which it was processed.'}
        </p>

        <div className={styles.alertBoxWarning}>
          <strong>Statutory Deletion Protocol:</strong> In compliance with the law, personal data cannot be deleted if you have active driving licence applications under review by the RTO, or if retention is required by the Motor Vehicles Act, tax laws, or an active legal hold. Once verified, eligible records are irreversibly anonymized.
        </div>

        <form onSubmit={handleErasureSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Reason for Deletion Request</label>
            <textarea
              required
              rows={3}
              className={styles.formTextarea}
              placeholder="e.g., Completed licence issuance, closing account, no longer require citizen portal assistance..."
              value={erasureReason}
              onChange={(e) => setErasureReason(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={submittingErasure}
            className={styles.btnDanger}
          >
            <IconAlert size={16} />
            <span>{submittingErasure ? t('common.processing') : t('privacy.submitErasureBtn')}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
