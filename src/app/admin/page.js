'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';
import { StatusPill } from '@/components/console';
import styles from './AdminConsole.module.css';

export default function AdminDashboardPage() {
  const { t } = useApp();
  const [days, setDays] = useState('30');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetch(`/api/admin/stats?days=${days}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(resData => {
        if (isMounted) {
          setData(resData);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError('Failed to load oversight metrics. Please try again.');
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [days]);

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{t('staff.adminPortalTitle') || 'State Administration Console'}</h1>
          <p className={styles.pageSubtitle}>
            Cross-jurisdiction oversight, throughput analysis, and workload governance
          </p>
        </div>
        <div className={styles.headerActions}>
          <select
            className={styles.filterSelect}
            value={days}
            onChange={(e) => setDays(e.target.value)}
            aria-label="Filter date range"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="0">All Time</option>
          </select>

          <Link href="/admin/applications" className={styles.btnPrimary}>
            <span>📋</span>
            <span>View All Applications</span>
          </Link>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', color: '#b91c1c', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          Loading oversight statistics...
        </div>
      ) : data ? (
        <>
          {/* Top KPI Cards — All drill-through enabled */}
          <div className={styles.kpiGrid}>
            <Link href="/admin/applications" className={styles.kpiCard}>
              <div className={styles.kpiLabel}>
                <span>Total Applications</span>
                <span>📁</span>
              </div>
              <div className={styles.kpiValue}>{data.summary?.totalApplications ?? 0}</div>
              <div className={styles.kpiSub}>Across all services & states →</div>
            </Link>

            <Link href="/admin/applications?status=under_review" className={styles.kpiCard}>
              <div className={styles.kpiLabel}>
                <span>Actionable / Pending</span>
                <span>⏳</span>
              </div>
              <div className={styles.kpiValue} style={{ color: '#0369a1' }}>
                {data.summary?.pendingReviewApplications ?? 0}
              </div>
              <div className={styles.kpiSub}>Submitted, resubmitted, or review →</div>
            </Link>

            <Link href="/admin/applications?overdue=1" className={styles.kpiCard}>
              <div className={styles.kpiLabel}>
                <span>SLA Overdue</span>
                <span>⚠️</span>
              </div>
              <div className={styles.kpiValue} style={{ color: data.summary?.overdueApplications > 0 ? '#b91c1c' : '#15803d' }}>
                {data.summary?.overdueApplications ?? 0}
              </div>
              <div className={styles.kpiSub}>Cases exceeding target turnaround →</div>
            </Link>

            <Link href="/admin/applications?status=completed" className={styles.kpiCard}>
              <div className={styles.kpiLabel}>
                <span>Completed</span>
                <span>✓</span>
              </div>
              <div className={styles.kpiValue} style={{ color: '#15803d' }}>
                {data.summary?.completedApplications ?? 0}
              </div>
              <div className={styles.kpiSub}>Government dispatched & closed →</div>
            </Link>
          </div>

          {/* Status Breakdown & Payment Reconciliation */}
          <div className={styles.twoColGrid}>
            {/* Status Volume */}
            <div className={styles.panelCard}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>
                  <span>📊</span> Volume by Application Status
                </h2>
              </div>
              <div className={styles.panelBody} style={{ padding: '8px 0' }}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th className={styles.numberCell}>Count</th>
                      <th className={styles.numberCell}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.statusDistribution || []).map(item => (
                      <tr key={item.status}>
                        <td>
                          <StatusPill status={item.status} type="application" />
                        </td>
                        <td className={styles.numberCell} style={{ fontWeight: 600 }}>
                          {item.count}
                        </td>
                        <td className={styles.numberCell}>
                          <Link
                            href={`/admin/applications?status=${item.status}`}
                            style={{ color: 'var(--color-primary)', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}
                          >
                            Filter list →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Reconciliation */}
            <div className={styles.panelCard}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>
                  <span>💳</span> Payment Reconciliation (INR)
                </h2>
              </div>
              <div className={styles.panelBody} style={{ padding: '8px 0' }}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Payment State</th>
                      <th className={styles.numberCell}>Transactions</th>
                      <th className={styles.numberCell}>Rupee Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.payments || []).map(p => (
                      <tr key={p.payment_status}>
                        <td>
                          <StatusPill status={p.payment_status} type="payment" />
                        </td>
                        <td className={styles.numberCell}>{p.count}</td>
                        <td className={styles.numberCell} style={{ fontWeight: 700, color: p.payment_status === 'completed' ? '#15803d' : '#0f172a' }}>
                          ₹{Number(p.total_amount).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* State & Service Distributions */}
          <div className={styles.twoColGrid}>
            {/* By State */}
            <div className={styles.panelCard}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>
                  <span>📍</span> Applications by State
                </h2>
              </div>
              <div className={styles.panelBody} style={{ padding: '8px 0' }}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>State</th>
                      <th>Code</th>
                      <th className={styles.numberCell}>Applications</th>
                      <th className={styles.numberCell}>Drill Through</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.stateDistribution || []).map(s => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 600 }}>{s.name}</td>
                        <td className={styles.monoCell}>{s.code}</td>
                        <td className={styles.numberCell}>{s.count}</td>
                        <td className={styles.numberCell}>
                          <Link
                            href={`/admin/applications?stateId=${s.id}`}
                            style={{ color: 'var(--color-primary)', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}
                          >
                            View {s.code} queue →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* By Service */}
            <div className={styles.panelCard}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}>
                  <span>⚙️</span> Applications by Service
                </h2>
              </div>
              <div className={styles.panelBody} style={{ padding: '8px 0' }}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Service Name</th>
                      <th>Code</th>
                      <th className={styles.numberCell}>Count</th>
                      <th className={styles.numberCell}>Drill Through</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.serviceDistribution || []).map(srv => (
                      <tr key={srv.id}>
                        <td style={{ fontWeight: 600 }}>{srv.name}</td>
                        <td className={styles.monoCell}>{srv.code}</td>
                        <td className={styles.numberCell}>{srv.count}</td>
                        <td className={styles.numberCell}>
                          <Link
                            href={`/admin/applications?serviceId=${srv.id}`}
                            style={{ color: 'var(--color-primary)', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}
                          >
                            View {srv.code} →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Operator Workload Distribution */}
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>
                <span>👥</span> Operator Workload & Turnaround
              </h2>
              <Link href="/admin/operators" className={styles.btnSecondary} style={{ fontSize: '11px', padding: '4px 8px' }}>
                Manage Operators →
              </Link>
            </div>
            <div className={styles.tableContainer} style={{ border: 'none', borderRadius: 0 }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Operator Name</th>
                    <th>Status</th>
                    <th className={styles.numberCell}>Open Assigned Cases</th>
                    <th className={styles.numberCell}>Completed Today</th>
                    <th className={styles.numberCell}>Oldest Case Age</th>
                  </tr>
                </thead>
                <tbody>
                  {(!data.operators || data.operators.length === 0) ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                        No operators registered yet. <Link href="/admin/operators" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Create operator accounts</Link> to distribute workload.
                      </td>
                    </tr>
                  ) : (
                    data.operators.map(op => (
                      <tr key={op.id}>
                        <td style={{ fontWeight: 600 }}>{op.name}</td>
                        <td>
                          <span style={{
                            fontSize: '11px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: op.is_active ? '#f0fdf4' : '#fef2f2',
                            color: op.is_active ? '#15803d' : '#b91c1c',
                            fontWeight: 600
                          }}>
                            {op.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className={styles.numberCell} style={{ fontWeight: 700 }}>
                          {op.open_cases}
                        </td>
                        <td className={styles.numberCell} style={{ color: '#15803d', fontWeight: 600 }}>
                          {op.completed_today}
                        </td>
                        <td className={styles.numberCell}>
                          {op.oldest_case_age_hours > 0 ? `${op.oldest_case_age_hours} hrs` : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
