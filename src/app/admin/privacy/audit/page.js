'use client';
import { useState, useEffect } from 'react';
import styles from '@/app/account/privacy/privacy.module.css';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const loadLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (actionFilter) params.set('action', actionFilter);
      if (roleFilter) params.set('role', roleFilter);
      params.set('limit', '100');

      const res = await fetch(`/api/admin/privacy/audit?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [actionFilter, roleFilter]);

  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (actionFilter) params.set('action', actionFilter);
    if (roleFilter) params.set('role', roleFilter);
    params.set('format', 'csv');
    window.open(`/api/admin/privacy/audit?${params.toString()}`, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h2 className={styles.cardTitle}>
              <span>🛡️</span>
              <span>Privileged Data Access & Modification Audit Trail</span>
            </h2>
            <p className={styles.cardDesc} style={{ margin: 0 }}>
              Immutable statutory record of all staff access to citizen documents, PII reveals, data exports, status mutations, and policy edits.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Filter by action..."
              className={styles.formInput}
              style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            />

            <select
              className={styles.formSelect}
              style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="operator">Operator</option>
              <option value="citizen">Citizen</option>
              <option value="system">System</option>
            </select>

            <button
              type="button"
              onClick={handleExportCsv}
              className={styles.btnSecondary}
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
            >
              📥 Export CSV
            </button>
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#64748b' }}>Loading audit logs...</p>
        ) : logs.length === 0 ? (
          <p style={{ color: '#64748b' }}>No audit events found matching filters.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Log ID</th>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Summary</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td><code>#{l.id}</code></td>
                    <td><small>{new Date(l.created_at).toLocaleString()}</small></td>
                    <td><strong>{l.actor_name || (l.actor_id ? `User #${l.actor_id}` : 'System')}</strong></td>
                    <td><span className={styles.pillBlue}>{l.actor_role || 'system'}</span></td>
                    <td><code>{l.action}</code></td>
                    <td>{l.entity_type} {l.entity_id ? `(#${l.entity_id})` : ''}</td>
                    <td style={{ maxWidth: '300px', fontSize: '0.82rem' }}>{l.summary}</td>
                    <td><small>{l.ip || '—'}</small></td>
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
