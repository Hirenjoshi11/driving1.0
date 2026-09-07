'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';

export default function AdminPrivacyOverviewPage() {
  const { t } = useApp();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/admin/privacy/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to load admin privacy stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#ffffff',
        padding: '2rem',
        borderRadius: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(21,148,71,0.2)', color: '#4ade80', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            ● Statutory Oversight Active
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.4rem 0' }}>
            {t('adminPrivacy.dashboardTitle') || 'DPDP Privacy & Data Protection Console'}
          </h1>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem', maxWidth: '650px' }}>
            {t('adminPrivacy.dashboardSubtitle') || 'Regulatory compliance monitoring, Data Principal rights triage, 72-hour incident response, and retention engine under DPDP Act 2023.'}
          </p>
        </div>
      </div>

      {/* Compliance Alerts */}
      {stats?.alerts && stats.alerts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {stats.alerts.map((alert, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                borderRadius: '0.5rem',
                background: alert.type === 'critical' ? '#fef2f2' : '#fffbeb',
                borderLeft: `4px solid ${alert.type === 'critical' ? '#ef4444' : '#f59e0b'}`,
                color: alert.type === 'critical' ? '#991b1b' : '#92400e',
                fontSize: '0.9rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.25rem' }}>{alert.type === 'critical' ? '🚨' : '⚠️'}</span>
                <div>
                  <strong>{alert.code}:</strong> {alert.message}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem'
      }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Open Rights Requests</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
            {loading ? '—' : stats?.metrics?.openRequestsCount || 0}
          </div>
          <Link href="/admin/privacy/requests" style={{ fontSize: '0.8rem', color: '#159447', fontWeight: 600, textDecoration: 'none', display: 'inline-block', marginTop: '0.5rem' }}>
            Triage Queue →
          </Link>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Active Security Incidents</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: stats?.metrics?.activeIncidents > 0 ? '#ef4444' : '#0f172a', marginTop: '0.25rem' }}>
            {loading ? '—' : stats?.metrics?.activeIncidents || 0}
          </div>
          <Link href="/admin/privacy/incidents" style={{ fontSize: '0.8rem', color: '#159447', fontWeight: 600, textDecoration: 'none', display: 'inline-block', marginTop: '0.5rem' }}>
            View 72h Response Timers →
          </Link>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Processor Contract Alerts</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: stats?.metrics?.processorAlerts > 0 ? '#f59e0b' : '#0f172a', marginTop: '0.25rem' }}>
            {loading ? '—' : stats?.metrics?.processorAlerts || 0}
          </div>
          <Link href="/admin/privacy/processors" style={{ fontSize: '0.8rem', color: '#159447', fontWeight: 600, textDecoration: 'none', display: 'inline-block', marginTop: '0.5rem' }}>
            Inspect Processors →
          </Link>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Active Legal Holds</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem' }}>
            {loading ? '—' : stats?.metrics?.activeHoldsCount || 0}
          </div>
          <Link href="/admin/privacy/retention" style={{ fontSize: '0.8rem', color: '#159447', fontWeight: 600, textDecoration: 'none', display: 'inline-block', marginTop: '0.5rem' }}>
            Manage Retention Holds →
          </Link>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem',
        marginTop: '0.5rem'
      }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🗂️</span>
            <span>Personal Data Inventory</span>
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
            Centralized dictionary storing field names, legal bases, sensitivity classifications, retention schedules, and export/erasure permissions.
          </p>
          <Link href="/admin/privacy/data-inventory" style={{ display: 'inline-block', marginTop: '0.75rem', padding: '0.5rem 1rem', background: '#0f172a', color: '#ffffff', borderRadius: '0.375rem', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
            Open Inventory
          </Link>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>⏳</span>
            <span>Retention Worker & Controlled Erasure</span>
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
            Configure purpose-specific retention periods (days/months/years), trigger scheduled sweeps, and monitor controlled erasure pipelines.
          </p>
          <Link href="/admin/privacy/retention" style={{ display: 'inline-block', marginTop: '0.75rem', padding: '0.5rem 1rem', background: '#0f172a', color: '#ffffff', borderRadius: '0.375rem', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
            Manage Retention
          </Link>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🛡️</span>
            <span>Privileged Access Audit Trail</span>
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>
            Immutable logs capturing every staff document view, data export, PII access, policy change, and status override with CSV export.
          </p>
          <Link href="/admin/privacy/audit" style={{ display: 'inline-block', marginTop: '0.75rem', padding: '0.5rem 1rem', background: '#0f172a', color: '#ffffff', borderRadius: '0.375rem', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>
            View Audit Logs
          </Link>
        </div>
      </div>
    </div>
  );
}
