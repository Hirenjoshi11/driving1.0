'use client';
import { useState, useEffect } from 'react';
import styles from '@/app/account/privacy/privacy.module.css';

export default function AdminRetentionPage() {
  const [policies, setPolicies] = useState([]);
  const [legalHolds, setLegalHolds] = useState([]);
  const [deletionJobs, setDeletionJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runningSweep, setRunningSweep] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const loadRetentionData = async () => {
    try {
      const res = await fetch('/api/admin/privacy/retention');
      if (res.ok) {
        const data = await res.json();
        setPolicies(data.policies || []);
        setLegalHolds(data.legalHolds || []);
        setDeletionJobs(data.recentDeletionJobs || []);
      }
    } catch (err) {
      console.error('Failed to load retention data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRetentionData();
  }, []);

  const handleRunSweep = async () => {
    setRunningSweep(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/admin/privacy/retention', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run_sweep' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Retention sweep failed');

      setStatusMsg({
        type: 'success',
        text: `Retention sweep completed successfully! Processed ${data.report.processedCount} expired records.`,
      });
      await loadRetentionData();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Error running retention sweep' });
    } finally {
      setRunningSweep(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {statusMsg && (
        <div className={statusMsg.type === 'success' ? styles.alertBox : styles.alertBoxDanger}>
          {statusMsg.text}
        </div>
      )}

      {/* 1. Retention Policies & Runner */}
      <div className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h2 className={styles.cardTitle}>
              <span>⏳</span>
              <span>Data Retention Policies & Automated Lifecycle</span>
            </h2>
            <p className={styles.cardDesc} style={{ margin: 0 }}>
              Under DPDP Act Section 8(7), a Data Fiduciary must erase personal data upon purpose completion or retention expiry.
            </p>
          </div>

          <button
            type="button"
            disabled={runningSweep}
            onClick={handleRunSweep}
            className={styles.btnPrimary}
          >
            <span>{runningSweep ? 'Running Sweep...' : '⚡ Trigger Retention Sweep Now'}</span>
          </button>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Policy Name</th>
                <th>Category</th>
                <th>Purpose</th>
                <th>Retention Period</th>
                <th>Action</th>
                <th>Legal Basis</th>
                <th>Legal Hold</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.policy_name}</strong></td>
                  <td><span className={styles.pillBlue}>{p.data_category}</span></td>
                  <td>{p.purpose?.replace(/_/g, ' ')}</td>
                  <td><strong>{p.retention_period} {p.retention_unit}</strong></td>
                  <td><span className={p.deletion_action === 'purge' ? styles.pillRed : styles.pillYellow}>{p.deletion_action}</span></td>
                  <td><span className={styles.pillGreen}>{p.legal_basis}</span></td>
                  <td>{p.legal_hold_supported ? 'Supported' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Active Legal Holds */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          <span>🛑</span>
          <span>Statutory Legal Holds</span>
        </h2>
        <p className={styles.cardDesc}>
          Legal holds block automated erasure and anonymization for records subject to ongoing investigations, court orders, or statutory disputes.
        </p>

        {legalHolds.length === 0 ? (
          <p style={{ color: '#64748b' }}>No active legal holds currently in effect.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Hold ID</th>
                  <th>Entity Type</th>
                  <th>Entity ID</th>
                  <th>Reason</th>
                  <th>Legal Reference</th>
                  <th>Placed At</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {legalHolds.map((h) => (
                  <tr key={h.id}>
                    <td><code>HLD-{h.id}</code></td>
                    <td>{h.entity_type}</td>
                    <td>{h.entity_id}</td>
                    <td>{h.reason}</td>
                    <td>{h.legal_reference || '—'}</td>
                    <td>{new Date(h.placed_at).toLocaleDateString()}</td>
                    <td>
                      <span className={h.is_active ? styles.pillRed : styles.pillGreen}>
                        {h.is_active ? 'Active Hold' : 'Released'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Recent Deletion Jobs */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          <span>📋</span>
          <span>Controlled Erasure & Deletion Audit</span>
        </h2>
        <p className={styles.cardDesc}>
          Execution logs of all user anonymization and purge tasks verifying pre-deletion checks.
        </p>

        {deletionJobs.length === 0 ? (
          <p style={{ color: '#64748b' }}>No deletion jobs recorded yet.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Job ID</th>
                  <th>User ID</th>
                  <th>Status</th>
                  <th>Legal Hold Check</th>
                  <th>Active Purpose Check</th>
                  <th>Processor Status</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {deletionJobs.map((j) => (
                  <tr key={j.id}>
                    <td><code>DEL-{j.id}</code></td>
                    <td>User #{j.user_id} ({j.citizen_name || 'Citizen'})</td>
                    <td>
                      <span className={j.status === 'completed' ? styles.pillGreen : styles.pillRed}>
                        {j.status}
                      </span>
                    </td>
                    <td>{j.legal_hold_check}</td>
                    <td>{j.active_purpose_check}</td>
                    <td>{j.processor_deletion_status}</td>
                    <td>{new Date(j.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
