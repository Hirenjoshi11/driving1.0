'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import styles from '../AdminConsole.module.css';

export default function AdminAuditPage() {
  const { t } = useApp();
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);

  const loadAuditLogs = useCallback((page = 1) => {
    setLoading(true);
    const q = new URLSearchParams();
    q.set('page', String(page));
    q.set('limit', '25');
    if (actionFilter) q.set('action', actionFilter);
    if (entityFilter) q.set('entityType', entityFilter);
    if (search.trim()) q.set('search', search.trim());

    fetch(`/api/admin/audit?${q.toString()}`)
      .then(res => res.json())
      .then(d => {
        setLogs(d.logs || []);
        if (d.pagination) setPagination(d.pagination);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [actionFilter, entityFilter, search]);

  useEffect(() => {
    loadAuditLogs(1);
  }, [loadAuditLogs]);

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{t('staff.navAudit') || 'System Audit Log'}</h1>
          <p className={styles.pageSubtitle}>
            Traceable log of all staff mutations: document verifications, status transitions, PII reveals, and configuration changes
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <input
          type="text"
          placeholder="Search by summary, actor, entity ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') loadAuditLogs(1); }}
          className={styles.filterInput}
          style={{ width: '280px' }}
        />

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className={styles.filterSelect}
          aria-label="Filter by action type"
        >
          <option value="">All Actions</option>
          <option value="document.verify">document.verify</option>
          <option value="document.reject">document.reject</option>
          <option value="application.status_transition">application.status_transition</option>
          <option value="application.status_override">application.status_override</option>
          <option value="application.assign">application.assign</option>
          <option value="pii.reveal">pii.reveal</option>
          <option value="operator.create">operator.create</option>
          <option value="operator.update">operator.update</option>
          <option value="fee.create">fee.create</option>
          <option value="service.update">service.update</option>
          <option value="export.csv">export.csv</option>
        </select>

        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className={styles.filterSelect}
          aria-label="Filter by entity type"
        >
          <option value="">All Entities</option>
          <option value="application">Application</option>
          <option value="document">Document</option>
          <option value="operator">Operator</option>
          <option value="fee_structure">Fee Structure</option>
          <option value="licence_service">Service</option>
        </select>

        <button
          type="button"
          onClick={() => loadAuditLogs(1)}
          className={styles.btnPrimary}
          style={{ marginLeft: 'auto' }}
        >
          Filter
        </button>
      </div>

      {/* Logs Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Summary</th>
              <th className={styles.numberCell}>Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  Loading audit trail...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No audit log entries match the selected filters.
                </td>
              </tr>
            ) : (
              logs.map(log => (
                <tr key={log.id}>
                  <td style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap' }}>
                    {log.created_at}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ fontSize: '12px', color: '#0f172a' }}>{log.actor_name || `User #${log.actor_id || 'System'}`}</strong>
                      <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>{log.actor_role || 'system'}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono, monospace)',
                      background: log.action.includes('reject') || log.action.includes('override') ? '#fee2e2' : '#f1f5f9',
                      color: log.action.includes('reject') || log.action.includes('override') ? '#b91c1c' : '#0f172a',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: 600
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px' }}>
                      {log.entity_type} {log.entity_id ? `(#${log.entity_id})` : ''}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: '#334155' }}>
                    {log.summary}
                  </td>
                  <td className={styles.numberCell}>
                    {log.metadata ? (
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className={styles.btnSecondary}
                        style={{ fontSize: '11px', padding: '3px 7px' }}
                      >
                        Inspect
                      </button>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '11px' }}>—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', fontSize: '13px', color: '#64748b' }}>
          <div>Page {pagination.page} of {pagination.totalPages} ({pagination.total} entries)</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => loadAuditLogs(pagination.page - 1)}
              className={styles.btnSecondary}
            >
              Previous
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => loadAuditLogs(pagination.page + 1)}
              className={styles.btnSecondary}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Metadata Inspector Modal */}
      {selectedLog && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalBox}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Audit Event #{selectedLog.id} — Metadata</h3>
              <button type="button" onClick={() => setSelectedLog(null)} className={styles.modalCloseBtn}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div><strong>Action:</strong> {selectedLog.action}</div>
                <div><strong>Actor:</strong> {selectedLog.actor_name} ({selectedLog.actor_role})</div>
                <div><strong>Timestamp:</strong> {selectedLog.created_at}</div>
                <div><strong>Summary:</strong> {selectedLog.summary}</div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                  Sanitized Metadata Payload:
                </label>
                <pre style={{
                  background: '#0f172a',
                  color: '#38bdf8',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  overflowX: 'auto',
                  fontFamily: 'monospace'
                }}>
                  {JSON.stringify(JSON.parse(selectedLog.metadata || '{}'), null, 2)}
                </pre>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button type="button" onClick={() => setSelectedLog(null)} className={styles.btnSecondary}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
