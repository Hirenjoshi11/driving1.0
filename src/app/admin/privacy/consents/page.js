'use client';
import { useState, useEffect } from 'react';
import styles from '@/app/account/privacy/privacy.module.css';

export default function AdminConsentsPage() {
  const [purposes, setPurposes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [selectedBasis, setSelectedBasis] = useState('');
  const [statusMsg, setStatusMsg] = useState(null);

  const loadPurposes = async () => {
    try {
      const res = await fetch('/api/admin/privacy/purposes');
      if (res.ok) {
        const data = await res.json();
        setPurposes(data.purposes || []);
      }
    } catch (err) {
      console.error('Failed to load purposes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPurposes();
  }, []);

  const handleUpdateLegalBasis = async (purposeId) => {
    if (!selectedBasis) return;
    setStatusMsg(null);
    try {
      const res = await fetch('/api/admin/privacy/purposes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: purposeId, legalBasis: selectedBasis }),
      });

      if (!res.ok) throw new Error('Failed to update purpose configuration');
      setStatusMsg({ type: 'success', text: 'Legal basis updated successfully.' });
      setEditingId(null);
      await loadPurposes();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Update failed' });
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
        <h2 className={styles.cardTitle}>
          <span>🔒</span>
          <span>Processing Purposes & Legal Basis Engine</span>
        </h2>
        <p className={styles.cardDesc}>
          Under the DPDP Act 2023, personal data may only be processed for specific lawful bases (Consent, Legitimate Use, Legal Obligation, or Contract). Administrators can configure the basis per purpose without hardcoding legal assumptions.
        </p>

        {loading ? (
          <p style={{ color: '#64748b' }}>Loading processing purposes...</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Purpose Name</th>
                  <th>Legal Basis</th>
                  <th>Mandatory / Optional</th>
                  <th>Active Consents</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {purposes.map((p) => (
                  <tr key={p.id}>
                    <td><code>{p.code}</code></td>
                    <td>
                      <strong>{p.name}</strong>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{p.description}</div>
                    </td>
                    <td>
                      {editingId === p.id ? (
                        <select
                          className={styles.formSelect}
                          style={{ padding: '0.3rem 0.5rem', fontSize: '0.82rem' }}
                          value={selectedBasis}
                          onChange={(e) => setSelectedBasis(e.target.value)}
                        >
                          <option value="consent">Consent</option>
                          <option value="legitimate_use">Legitimate Use</option>
                          <option value="legal_requirement">Legal Requirement</option>
                          <option value="contract">Contract</option>
                          <option value="other_configured_basis">Other Configured Basis</option>
                        </select>
                      ) : (
                        <span className={styles.pillGreen}>{p.legal_basis}</span>
                      )}
                    </td>
                    <td>
                      {p.is_mandatory ? (
                        <span className={styles.pillYellow}>Mandatory</span>
                      ) : (
                        <span className={styles.pillBlue}>Optional</span>
                      )}
                    </td>
                    <td><strong>{p.active_consents_count || 0}</strong></td>
                    <td>{p.is_active ? 'Active' : 'Inactive'}</td>
                    <td>
                      {editingId === p.id ? (
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            type="button"
                            onClick={() => handleUpdateLegalBasis(p.id)}
                            className={styles.btnPrimary}
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className={styles.btnSecondary}
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(p.id);
                            setSelectedBasis(p.legal_basis);
                          }}
                          className={styles.btnSecondary}
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
                        >
                          Edit Basis
                        </button>
                      )}
                    </td>
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
