'use client';
import { useState, useEffect } from 'react';
import styles from '@/app/account/privacy/privacy.module.css';

export default function AdminPrivacyRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [actionProcessingId, setActionProcessingId] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);

  const loadRequests = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (typeFilter !== 'all') params.set('type', typeFilter);

      const res = await fetch(`/api/admin/privacy/requests?${params.toString()}`);
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
  }, [statusFilter, typeFilter]);

  const handleAction = async (requestId, action, resolutionNotes = '') => {
    if (action === 'execute_erasure') {
      if (!confirm('CAUTION: This will irreversibly anonymize the citizen’s profile and applications after checking legal holds and active purposes. Proceed?')) {
        return;
      }
    }

    setActionProcessingId(requestId);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/admin/privacy/requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action, notes: resolutionNotes, resolution: resolutionNotes }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');

      setStatusMsg({ type: 'success', text: `Action "${action}" processed successfully!` });
      await loadRequests();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Error processing request' });
    } finally {
      setActionProcessingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {statusMsg && (
        <div className={statusMsg.type === 'success' ? styles.alertBox : styles.alertBoxDanger}>
          {statusMsg.text}
        </div>
      )}

      <div className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h2 className={styles.cardTitle}>
              <span>⚖️</span>
              <span>Data Principal Rights Requests Triage Queue</span>
            </h2>
            <p className={styles.cardDesc} style={{ margin: 0 }}>
              Review, verify identity, process, and resolve statutory citizen requests under the DPDP Act 2023.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <select
              className={styles.formSelect}
              style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="created">Created</option>
              <option value="verified">Verified</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              className={styles.formSelect}
              style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="access">Access</option>
              <option value="correction">Correction</option>
              <option value="erasure">Erasure</option>
              <option value="consent_withdrawal">Withdrawal</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#64748b' }}>Loading requests queue...</p>
        ) : requests.length === 0 ? (
          <p style={{ color: '#64748b' }}>No requests matching current filters.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Request #</th>
                  <th>Citizen</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Reason / Context</th>
                  <th>Submitted At</th>
                  <th>Administrative Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => {
                  const statusClass =
                    r.status === 'completed' ? styles.pillGreen :
                    r.status === 'rejected' ? styles.pillRed : styles.pillYellow;

                  const isWorking = actionProcessingId === r.id;

                  return (
                    <tr key={r.id}>
                      <td><strong>{r.request_number}</strong></td>
                      <td>
                        <strong>{r.citizen_name}</strong>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{r.citizen_phone}</div>
                      </td>
                      <td><span className={styles.pillBlue}>{r.request_type?.replace(/_/g, ' ')}</span></td>
                      <td><span className={statusClass}>{r.status?.replace(/_/g, ' ')}</span></td>
                      <td style={{ maxWidth: '250px', fontSize: '0.82rem' }}>{r.reason}</td>
                      <td>{new Date(r.created_at).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          {r.status === 'created' && (
                            <button
                              type="button"
                              disabled={isWorking}
                              onClick={() => handleAction(r.id, 'verify_identity')}
                              className={styles.btnPrimary}
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
                            >
                              Verify Identity
                            </button>
                          )}

                          {r.status === 'verified' && (
                            <button
                              type="button"
                              disabled={isWorking}
                              onClick={() => handleAction(r.id, 'start_processing')}
                              className={styles.btnPrimary}
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
                            >
                              Start Processing
                            </button>
                          )}

                          {r.request_type === 'erasure' && r.status !== 'completed' && (
                            <button
                              type="button"
                              disabled={isWorking}
                              onClick={() => handleAction(r.id, 'execute_erasure', 'Approved by administrator')}
                              className={styles.btnDanger}
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
                            >
                              Execute Erasure
                            </button>
                          )}

                          {r.status !== 'completed' && r.status !== 'rejected' && (
                            <>
                              <button
                                type="button"
                                disabled={isWorking}
                                onClick={() => handleAction(r.id, 'resolve', 'Resolved by administrator')}
                                className={styles.btnPrimary}
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
                              >
                                Mark Resolved
                              </button>
                              <button
                                type="button"
                                disabled={isWorking}
                                onClick={() => handleAction(r.id, 'reject', 'Statutory grounds not satisfied')}
                                className={styles.btnDanger}
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
