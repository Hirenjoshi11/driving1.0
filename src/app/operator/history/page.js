'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import styles from '@/app/operator/OperatorConsole.module.css';

export default function OperatorHistoryPage() {
  const { t } = useApp();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(me => {
        if (!me?.user?.userId) return;
        return fetch(`/api/admin/audit?actorId=${me.user.userId}`);
      })
      .then(res => res ? res.json() : { logs: [] })
      .then(d => {
        setLogs(d.logs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{t('staff.navHistory') || 'My Processing History'}</h1>
          <p className={styles.pageSubtitle}>
            Traceable chronological log of all cases, document verifications, and transitions performed by you
          </p>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>Target Record</th>
              <th>Summary</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  Loading your processing history...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No actions recorded in your personal log yet.
                </td>
              </tr>
            ) : (
              logs.map(log => (
                <tr key={log.id}>
                  <td style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap' }}>
                    {log.created_at}
                  </td>
                  <td>
                    <span style={{
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono, monospace)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: log.action.includes('reject') ? '#fee2e2' : '#f1f5f9',
                      color: log.action.includes('reject') ? '#b91c1c' : '#0f172a',
                      fontWeight: 600
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td>
                    <span className={styles.monoCell}>
                      {log.entity_type} {log.entity_id ? `(#${log.entity_id})` : ''}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: '#334155' }}>
                    {log.summary}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
