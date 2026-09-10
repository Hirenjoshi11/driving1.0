'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { StatusPill } from '@/components/console';
import styles from './OperatorConsole.module.css';

export default function OperatorTodayPage() {
  const { t } = useApp();
  const router = useRouter();

  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState('actionable'); // 'actionable', 'correction', 'overdue', 'completed'

  const loadTodayQueue = useCallback(() => {
    setLoading(true);
    let q = '?limit=50';
    if (filterMode === 'actionable') {
      q += '&status=under_review';
    } else if (filterMode === 'correction') {
      q += '&status=correction_required';
    } else if (filterMode === 'overdue') {
      q += '&overdue=1';
    } else if (filterMode === 'completed') {
      q += '&status=completed';
    }

    fetch(`/api/staff/queue${q}`)
      .then(res => res.json())
      .then(d => {
        setQueue(d.applications || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filterMode]);

  useEffect(() => {
    loadTodayQueue();
  }, [loadTodayQueue]);

  // Keyboard shortcut: Press Enter to open the oldest actionable case
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && queue.length > 0 && !e.target.matches('input, textarea, select')) {
        router.push(`/operator/applications/${queue[0].id}`);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [queue, router]);

  // Compute counters
  const awaitingCount = queue.filter(a => a.status === 'under_review' || a.status === 'assigned' || a.status === 'submitted').length;
  const overdueCount = queue.filter(a => a.is_overdue).length;

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{t('staff.operatorPortalTitle') || 'RTO Clerk Workbench'}</h1>
          <p className={styles.pageSubtitle}>
            Today&apos;s processing queue — Press <kbd style={{ padding: '2px 5px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#f8fafc', fontSize: '11px', fontFamily: 'monospace' }}>Enter</kbd> to open the oldest actionable case
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/operator/queue" className={styles.btnSecondary}>
            <span>📋</span>
            <span>View Full Queue</span>
          </Link>
          <Link href="/operator/documents" className={styles.btnPrimary}>
            <span>📑</span>
            <span>Batch Doc Checks</span>
          </Link>
        </div>
      </div>

      {/* 4 Primary Actionable Counters / Filters */}
      <div className={styles.kpiGrid}>
        <div
          onClick={() => setFilterMode('actionable')}
          className={styles.kpiCard}
          style={{
            cursor: 'pointer',
            borderColor: filterMode === 'actionable' ? 'var(--color-primary)' : undefined,
            background: filterMode === 'actionable' ? '#f0fdf4' : '#ffffff'
          }}
        >
          <div className={styles.kpiLabel}>
            <span>Awaiting Action</span>
            <span>⚡</span>
          </div>
          <div className={styles.kpiValue} style={{ color: '#0369a1' }}>{awaitingCount}</div>
          <div className={styles.kpiSub}>Under review or assigned to my RTO</div>
        </div>

        <div
          onClick={() => setFilterMode('correction')}
          className={styles.kpiCard}
          style={{
            cursor: 'pointer',
            borderColor: filterMode === 'correction' ? '#f59e0b' : undefined,
            background: filterMode === 'correction' ? '#fffbeb' : '#ffffff'
          }}
        >
          <div className={styles.kpiLabel}>
            <span>Correction on Citizen</span>
            <span>⏳</span>
          </div>
          <div className={styles.kpiValue} style={{ color: '#b45309' }}>
            {queue.filter(a => a.status === 'correction_required').length}
          </div>
          <div className={styles.kpiSub}>Pending applicant resubmission</div>
        </div>

        <div
          onClick={() => setFilterMode('overdue')}
          className={styles.kpiCard}
          style={{
            cursor: 'pointer',
            borderColor: filterMode === 'overdue' ? '#ef4444' : undefined,
            background: filterMode === 'overdue' ? '#fef2f2' : '#ffffff'
          }}
        >
          <div className={styles.kpiLabel}>
            <span>Overdue (&gt;SLA)</span>
            <span>⚠️</span>
          </div>
          <div className={styles.kpiValue} style={{ color: overdueCount > 0 ? '#b91c1c' : '#15803d' }}>
            {overdueCount}
          </div>
          <div className={styles.kpiSub}>Exceeding target processing time</div>
        </div>

        <div
          onClick={() => setFilterMode('completed')}
          className={styles.kpiCard}
          style={{
            cursor: 'pointer',
            borderColor: filterMode === 'completed' ? '#15803d' : undefined,
            background: filterMode === 'completed' ? '#f0fdf4' : '#ffffff'
          }}
        >
          <div className={styles.kpiLabel}>
            <span>Completed Today</span>
            <span>✓</span>
          </div>
          <div className={styles.kpiValue} style={{ color: '#15803d' }}>
            {queue.filter(a => a.status === 'completed').length}
          </div>
          <div className={styles.kpiSub}>Forwarded & government cleared</div>
        </div>
      </div>

      {/* Today's Queue Pre-sorted by Age */}
      <div className={styles.tableContainer}>
        <div style={{ padding: '12px 16px', background: '#fafafa', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <strong style={{ fontSize: '13px', color: '#0f172a' }}>
            Queue: {filterMode.toUpperCase()} ({queue.length} cases)
          </strong>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            Pre-sorted by application age • Focus first row and press Enter
          </span>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>App No. & Age</th>
              <th>Applicant</th>
              <th>Service</th>
              <th>RTO</th>
              <th>Status</th>
              <th>Docs</th>
              <th>Payment</th>
              <th className={styles.numberCell}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  Loading queue...
                </td>
              </tr>
            ) : queue.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  🎉 Queue is empty! No cases pending for this filter.
                </td>
              </tr>
            ) : (
              queue.map((app, index) => (
                <tr key={app.id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className={styles.monoCell}>{app.application_number}</span>
                      <span style={{ fontSize: '11px', color: app.is_overdue ? '#b91c1c' : '#64748b', fontWeight: app.is_overdue ? 700 : 400 }}>
                        {app.is_overdue ? '⚠️ Overdue' : `${app.age_hours}h old`} {index === 0 ? '• [Oldest]' : ''}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ fontSize: '13px' }}>{app.applicant_name}</strong>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{app.masked_mobile}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px' }}>{app.service_name}</span>
                  </td>
                  <td>
                    <span className={styles.monoCell}>{app.rto_code || '—'}</span>
                  </td>
                  <td>
                    <StatusPill status={app.status} type="application" />
                  </td>
                  <td>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: app.verified_docs === app.total_docs && app.total_docs > 0 ? '#15803d' : '#475569'
                    }}>
                      {app.verified_docs}/{app.total_docs}
                    </span>
                  </td>
                  <td>
                    <StatusPill status={app.payment_status} type="payment" />
                  </td>
                  <td className={styles.numberCell}>
                    <Link
                      href={`/operator/applications/${app.id}`}
                      className={styles.btnPrimary}
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                    >
                      Process →
                    </Link>
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
