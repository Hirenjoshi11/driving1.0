'use client';
import { useState, useEffect } from 'react';
import styles from '@/app/account/privacy/privacy.module.css';

export default function AdminProcessorsPage() {
  const [processors, setProcessors] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProcessors = async () => {
    try {
      const res = await fetch('/api/admin/privacy/processors');
      if (res.ok) {
        const data = await res.json();
        setProcessors(data.processors || []);
      }
    } catch (err) {
      console.error('Failed to load processors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProcessors();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          <span>🏢</span>
          <span>Data Processor & Sub-processor Registry</span>
        </h2>
        <p className={styles.cardDesc}>
          Under Section 8(2) of the DPDP Act 2023, a Data Fiduciary may only engage a Data Processor under a valid contract (DPA). Personal data must not be transferred without active contractual and security compliance.
        </p>

        {loading ? (
          <p style={{ color: '#64748b' }}>Loading processors registry...</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Vendor / Processor</th>
                  <th>Service Type</th>
                  <th>Data Location</th>
                  <th>Contract Ref</th>
                  <th>DPA Signed</th>
                  <th>Contract Expiry</th>
                  <th>Security Review</th>
                  <th>Processor Status</th>
                </tr>
              </thead>
              <tbody>
                {processors.map((p) => {
                  const statusClass =
                    p.processor_status === 'contracted' ? styles.pillGreen :
                    p.processor_status === 'review_required' ? styles.pillYellow : styles.pillRed;

                  return (
                    <tr key={p.id}>
                      <td>
                        <strong>{p.name}</strong>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{p.vendor} ({p.country})</div>
                      </td>
                      <td><code>{p.service_type}</code></td>
                      <td>{p.storage_location}</td>
                      <td><code>{p.contract_reference || 'N/A'}</code></td>
                      <td>{p.dpa_signed ? '✅ Signed' : '❌ Missing'}</td>
                      <td>{p.expires_at || '—'}</td>
                      <td><span className={styles.pillGreen}>{p.security_review_status}</span></td>
                      <td><span className={statusClass}>{p.processor_status?.replace(/_/g, ' ')}</span></td>
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
