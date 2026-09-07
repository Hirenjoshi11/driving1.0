'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { StatusPill } from '@/components/console';
import styles from '@/app/admin/AdminConsole.module.css';

export default function OperatorQueuePage() {
  const { t } = useApp();
  const router = useRouter();

  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filters
  const [status, setStatus] = useState('');
  const [assigned, setAssigned] = useState('me'); // 'me', 'unassigned', ''
  const [search, setSearch] = useState('');
  const [showCheatsheet, setShowCheatsheet] = useState(false);

  const loadQueue = useCallback((page = 1) => {
    setLoading(true);
    const q = new URLSearchParams();
    q.set('page', String(page));
    q.set('limit', '25');
    if (status) q.set('status', status);
    if (assigned) q.set('assigned', assigned);
    if (search.trim()) q.set('search', search.trim());

    fetch(`/api/staff/queue?${q.toString()}`)
      .then(res => res.json())
      .then(d => {
        setApplications(d.applications || []);
        if (d.pagination) setPagination(d.pagination);
        setSelectedIndex(0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [status, assigned, search]);

  useEffect(() => {
    loadQueue(1);
  }, [loadQueue]);

  // Keyboard Navigation: j to move down, k to move up, Enter to open, ? for cheatsheet
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.matches('input, textarea, select')) return;

      if (e.key === 'j') {
        setSelectedIndex(prev => Math.min(prev + 1, applications.length - 1));
      } else if (e.key === 'k') {
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && applications[selectedIndex]) {
        router.push(`/operator/applications/${applications[selectedIndex].id}`);
      } else if (e.key === '?') {
        setShowCheatsheet(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [applications, selectedIndex, router]);

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{t('staff.navQueue') || 'RTO Processing Queue'}</h1>
          <p className={styles.pageSubtitle}>
            Full jurisdiction queue • Keyboard nav: <kbd>j</kbd>/<kbd>k</kbd> to move, <kbd>Enter</kbd> to open, <kbd>?</kbd> for shortcuts
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            onClick={() => setShowCheatsheet(true)}
            className={styles.btnSecondary}
            style={{ fontSize: '11px', padding: '4px 8px' }}
          >
            ⌨️ Keyboard Shortcuts (?)
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className={styles.filterBar}>
        <input
          type="text"
          placeholder="Search App #, Name, Mobile..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') loadQueue(1); }}
          className={styles.filterInput}
          style={{ width: '220px' }}
        />

        <select
          value={assigned}
          onChange={(e) => setAssigned(e.target.value)}
          className={styles.filterSelect}
          aria-label="Filter by assignment"
        >
          <option value="me">Assigned to Me</option>
          <option value="unassigned">Unassigned (Claimable)</option>
          <option value="">All in Jurisdiction</option>
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={styles.filterSelect}
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          <option value="submitted">Submitted (Ready to Claim)</option>
          <option value="assigned">Assigned</option>
          <option value="under_review">Under Review</option>
          <option value="correction_required">Correction Required</option>
          <option value="resubmitted">Resubmitted</option>
          <option value="government_processing">Government Processing</option>
          <option value="completed">Completed</option>
        </select>

        <button type="button" onClick={() => loadQueue(1)} className={styles.btnPrimary} style={{ marginLeft: 'auto' }}>
          Refresh
        </button>
      </div>

      {/* Queue Table */}
      <div className={styles.tableContainer}>
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
                  Loading jurisdiction queue...
                </td>
              </tr>
            ) : applications.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No cases found in this jurisdiction view.
                </td>
              </tr>
            ) : (
              applications.map((app, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <tr
                    key={app.id}
                    onClick={() => setSelectedIndex(idx)}
                    style={{
                      backgroundColor: isSelected ? 'rgba(21, 148, 71, 0.08)' : undefined,
                      cursor: 'pointer'
                    }}
                  >
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className={styles.monoCell}>
                          {isSelected ? '▶ ' : ''}{app.application_number}
                        </span>
                        <span style={{ fontSize: '11px', color: app.is_overdue ? '#b91c1c' : '#64748b' }}>
                          {app.is_overdue ? '⚠️ Overdue' : `${app.age_hours}h ago`}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong style={{ fontSize: '13px' }}>{app.applicant_name}</strong>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>{app.masked_mobile}</span>
                      </div>
                    </td>
                    <td>{app.service_name}</td>
                    <td className={styles.monoCell}>{app.rto_code || '—'}</td>
                    <td><StatusPill status={app.status} type="application" /></td>
                    <td>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: app.verified_docs === app.total_docs && app.total_docs > 0 ? '#15803d' : '#64748b'
                      }}>
                        {app.verified_docs}/{app.total_docs}
                      </span>
                    </td>
                    <td><StatusPill status={app.payment_status} type="payment" /></td>
                    <td className={styles.numberCell}>
                      <Link
                        href={`/operator/applications/${app.id}`}
                        className={styles.btnPrimary}
                        style={{ fontSize: '11px', padding: '3px 8px' }}
                      >
                        Open Case →
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', fontSize: '13px', color: '#64748b' }}>
          <div>Page {pagination.page} of {pagination.totalPages} ({pagination.total} cases)</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => loadQueue(pagination.page - 1)}
              className={styles.btnSecondary}
            >
              Previous
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => loadQueue(pagination.page + 1)}
              className={styles.btnSecondary}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Cheatsheet Modal */}
      {showCheatsheet && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalBox} style={{ maxWidth: '420px' }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>⌨️ Workbench Shortcuts</h3>
              <button type="button" onClick={() => setShowCheatsheet(false)} className={styles.modalCloseBtn}>✕</button>
            </div>
            <div className={styles.modalBody} style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Move down one case</span>
                <kbd style={{ padding: '2px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#f8fafc', fontWeight: 600 }}>j</kbd>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Move up one case</span>
                <kbd style={{ padding: '2px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#f8fafc', fontWeight: 600 }}>k</kbd>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Open focused case detail</span>
                <kbd style={{ padding: '2px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#f8fafc', fontWeight: 600 }}>Enter</kbd>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Toggle this shortcuts guide</span>
                <kbd style={{ padding: '2px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#f8fafc', fontWeight: 600 }}>?</kbd>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button type="button" onClick={() => setShowCheatsheet(false)} className={styles.btnSecondary}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
