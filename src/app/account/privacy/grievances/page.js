'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { IconShield, IconEdit } from '@/components/icons/Icons';
import styles from '../privacy.module.css';

export default function GrievancesPage() {
  const { t } = useApp();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('data_access');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const loadGrievances = async () => {
    try {
      const res = await fetch('/api/privacy/grievances');
      if (res.ok) {
        const data = await res.json();
        setGrievances(data.grievances || []);
      }
    } catch (err) {
      console.error('Failed to load grievances:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGrievances();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/privacy/grievances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, subject, description }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit grievance');

      setStatusMsg({
        type: 'success',
        text: `Grievance #${data.grievance.grievanceNumber} filed successfully. Our Grievance Officer will respond within the statutory timeframe (Target: ${data.grievance.resolutionDueDate}).`,
      });
      setSubject('');
      setDescription('');
      await loadGrievances();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Error submitting grievance' });
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

      {/* DPO Contact Banner */}
      <div className={styles.alertBox}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <strong>Grievance Redressal Officer Contact:</strong>
            <div style={{ marginTop: '0.25rem', color: 'var(--color-text-secondary)' }}>
              Shri Animesh Sharma, Data Protection Officer • Email: <code>dpo@drivinglicenceform.in</code>
            </div>
          </div>
          <span className={styles.pillGreen}>SLA: 24h Acknowledgment</span>
        </div>
      </div>

      {/* My Grievances */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          <IconShield size={20} />
          <span>{t('privacy.navGrievances') || 'My Registered Grievances'}</span>
        </h2>
        <p className={styles.cardDesc}>
          Under Section 13 of the DPDP Act 2023, you have the statutory right to have grievances redressed by the Data Fiduciary in a timely manner.
        </p>

        {loading ? (
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading grievances...</p>
        ) : grievances.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)' }}>No grievances submitted yet.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Grievance #</th>
                  <th>Category</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Resolution Due</th>
                  <th>Resolution / Update</th>
                </tr>
              </thead>
              <tbody>
                {grievances.map((g) => {
                  const statusClass =
                    g.status === 'resolved' ? styles.pillGreen :
                    g.status === 'closed' ? styles.pillBlue : styles.pillYellow;

                  return (
                    <tr key={g.id}>
                      <td><strong>{g.grievance_number}</strong></td>
                      <td>{g.category?.replace(/_/g, ' ')}</td>
                      <td>{g.subject}</td>
                      <td><span className={statusClass}>{g.status?.replace(/_/g, ' ')}</span></td>
                      <td>{g.resolution_due_date}</td>
                      <td style={{ maxWidth: '250px' }}>
                        {g.resolution || 'Assigned to Grievance Officer for investigation'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* File New Grievance */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          <IconEdit size={20} />
          <span>Lodge a Formal Privacy Grievance</span>
        </h2>
        <p className={styles.cardDesc}>
          Submit any concern regarding unauthorized data processing, delay in rights requests, or data security.
        </p>

        <form onSubmit={handleSubmit}>
          <div className={styles.gridTwo}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Grievance Category</label>
              <select
                className={styles.formSelect}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="data_access">Difficulty Accessing Personal Records</option>
                <option value="data_correction">Delay in Data Correction</option>
                <option value="consent_withdrawal">Consent Withdrawal Not Reflected</option>
                <option value="unauthorized_processing">Concern Over Unauthorized Processing</option>
                <option value="security_concern">Account / Data Security Concern</option>
                <option value="other">Other Statutory Privacy Issue</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Subject</label>
              <input
                type="text"
                required
                className={styles.formInput}
                placeholder="Brief summary of grievance"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Detailed Description & Supporting Context</label>
            <textarea
              required
              rows={4}
              className={styles.formTextarea}
              placeholder="Provide specific details, dates, or application numbers relevant to your grievance..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={styles.btnPrimary}
          >
            <span>{submitting ? 'Submitting...' : 'Register Formal Grievance'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
