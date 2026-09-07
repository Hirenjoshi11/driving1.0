'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { StatusPill } from '@/components/console';
import styles from '../AdminConsole.module.css';

export default function AdminApplicationsPage() {
  const { t } = useApp();
  const searchParams = useSearchParams();

  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [stateId, setStateId] = useState(searchParams.get('stateId') || '');
  const [serviceId, setServiceId] = useState(searchParams.get('serviceId') || '');
  const [search, setSearch] = useState('');
  const [overdue, setOverdue] = useState(searchParams.get('overdue') === '1');

  // Master lists for filter dropdowns
  const [statesList, setStatesList] = useState([]);
  const [servicesList, setServicesList] = useState([]);

  useEffect(() => {
    fetch('/api/states')
      .then(res => res.json())
      .then(d => setStatesList(d.states || []))
      .catch(() => {});

    fetch('/api/services')
      .then(res => res.json())
      .then(d => setServicesList(d.services || []))
      .catch(() => {});
  }, []);

  const loadApplications = useCallback((page = 1) => {
    setLoading(true);
    setError(null);

    const query = new URLSearchParams();
    query.set('page', String(page));
    query.set('limit', '25');
    if (status) query.set('status', status);
    if (stateId) query.set('stateId', stateId);
    if (serviceId) query.set('serviceId', serviceId);
    if (search.trim()) query.set('search', search.trim());
    if (overdue) query.set('overdue', '1');

    fetch(`/api/staff/queue?${query.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setApplications(data.applications || []);
        if (data.pagination) setPagination(data.pagination);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load applications. Please verify network or try again.');
        setLoading(false);
      });
  }, [status, stateId, serviceId, search, overdue]);

  useEffect(() => {
    loadApplications(1);
  }, [loadApplications]);

  const handleExportCsv = () => {
    const query = new URLSearchParams();
    if (status) query.set('status', status);
    if (stateId) query.set('stateId', stateId);
    if (serviceId) query.set('serviceId', serviceId);
    window.location.href = `/api/admin/export?${query.toString()}`;
  };

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{t('staff.navAllApplications') || 'All Applications'}</h1>
          <p className={styles.pageSubtitle}>
            Full cross-jurisdiction application queue with SLA monitoring and case administration
          </p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" onClick={handleExportCsv} className={styles.btnSecondary}>
            <span>📥</span>
            <span>Export CSV (Audited)</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <input
          type="text"
          placeholder="Search App #, Name, Mobile..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') loadApplications(1); }}
          className={styles.filterInput}
          style={{ width: '240px' }}
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={styles.filterSelect}
          aria-label="Filter by application status"
        >
          <option value="">All Statuses</option>
          <option value="submitted">Submitted</option>
          <option value="assigned">Assigned</option>
          <option value="under_review">Under Review</option>
          <option value="correction_required">Correction Required</option>
          <option value="resubmitted">Resubmitted</option>
          <option value="government_processing">Government Processing</option>
          <option value="completed">Completed</option>
          <option value="draft">Draft</option>
        </select>

        <select
          value={stateId}
          onChange={(e) => setStateId(e.target.value)}
          className={styles.filterSelect}
          aria-label="Filter by state"
        >
          <option value="">All States</option>
          {statesList.map(s => (
            <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
          ))}
        </select>

        <select
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          className={styles.filterSelect}
          aria-label="Filter by licence service"
        >
          <option value="">All Services</option>
          {servicesList.map(srv => (
            <option key={srv.id} value={srv.id}>{srv.name}</option>
          ))}
        </select>

        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={overdue}
            onChange={(e) => setOverdue(e.target.checked)}
          />
          <span style={{ fontWeight: overdue ? 700 : 400, color: overdue ? '#b91c1c' : 'inherit' }}>
            ⚠️ Overdue Only
          </span>
        </label>

        <button type="button" onClick={() => loadApplications(1)} className={styles.btnPrimary} style={{ marginLeft: 'auto' }}>
          Search / Refresh
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', color: '#b91c1c', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {/* Applications Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Application No.</th>
              <th>Applicant</th>
              <th>Service & State</th>
              <th>RTO</th>
              <th>Status</th>
              <th>Docs</th>
              <th>Payment</th>
              <th>Assignee</th>
              <th className={styles.numberCell}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  Loading applications...
                </td>
              </tr>
            ) : applications.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No applications match the selected filters.
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app.id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className={styles.monoCell}>{app.application_number}</span>
                      <span style={{ fontSize: '11px', color: app.is_overdue ? '#b91c1c' : '#64748b', fontWeight: app.is_overdue ? 700 : 400 }}>
                        {app.is_overdue ? '⚠️ Overdue' : `${app.age_hours}h ago`}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600 }}>{app.applicant_name}</span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{app.masked_mobile}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span>{app.service_name || 'Licence'}</span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{app.state_code}</span>
                    </div>
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
                      color: app.verified_docs === app.total_docs && app.total_docs > 0 ? '#15803d' : '#64748b'
                    }}>
                      {app.verified_docs}/{app.total_docs}
                    </span>
                  </td>
                  <td>
                    <StatusPill status={app.payment_status} type="payment" />
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: app.operator_name ? '#0f172a' : '#94a3b8' }}>
                      {app.operator_name || 'Unassigned'}
                    </span>
                  </td>
                  <td className={styles.numberCell}>
                    <Link
                      href={`/admin/applications/${app.id}`}
                      className={styles.btnSecondary}
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                    >
                      Open Case →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', fontSize: '13px', color: '#64748b' }}>
          <div>
            Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} total applications)
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => loadApplications(pagination.page - 1)}
              className={styles.btnSecondary}
              style={{ padding: '4px 10px', fontSize: '12px' }}
            >
              Previous
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => loadApplications(pagination.page + 1)}
              className={styles.btnSecondary}
              style={{ padding: '4px 10px', fontSize: '12px' }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
