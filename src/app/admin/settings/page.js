'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import styles from '../AdminConsole.module.css';

export default function AdminSettingsPage() {
  const { t } = useApp();
  const [slaHours, setSlaHours] = useState('48');
  const [maxUploadMb, setMaxUploadMb] = useState('2');
  const [correctionWindowDays, setCorrectionWindowDays] = useState('15');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('dlf_admin_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.slaHours) setSlaHours(parsed.slaHours);
        if (parsed.maxUploadMb) setMaxUploadMb(parsed.maxUploadMb);
        if (parsed.correctionWindowDays) setCorrectionWindowDays(parsed.correctionWindowDays);
        if (parsed.maintenanceMode !== undefined) setMaintenanceMode(parsed.maintenanceMode);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    const config = {
      slaHours,
      maxUploadMb,
      correctionWindowDays,
      maintenanceMode
    };
    try {
      localStorage.setItem('dlf_admin_settings', JSON.stringify(config));
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } catch {
      alert('Failed to save settings to storage');
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{t('staff.navSettings') || 'Portal Settings & Governance'}</h1>
          <p className={styles.pageSubtitle}>
            Global operational parameters, SLA limits, document upload rules, and system notices
          </p>
        </div>
      </div>

      {savedNotice && (
        <div style={{ padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', color: '#15803d', fontSize: '13px' }}>
          ✓ Portal settings updated successfully.
        </div>
      )}

      <form onSubmit={handleSave} style={{ maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* SLA Governance */}
        <div className={styles.panelCard}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}><span>⏱️</span> Service Level Agreement (SLA) Controls</h2>
          </div>
          <div className={styles.panelBody} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Application Processing SLA Threshold (Hours):
              </label>
              <input
                type="number"
                min="12"
                max="720"
                value={slaHours}
                onChange={(e) => setSlaHours(e.target.value)}
                className={styles.filterInput}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                Applications exceeding this age in &quot;submitted&quot; or &quot;under_review&quot; are automatically flagged as SLA Overdue.
              </span>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Citizen Correction Grace Period (Days):
              </label>
              <input
                type="number"
                min="1"
                max="90"
                value={correctionWindowDays}
                onChange={(e) => setCorrectionWindowDays(e.target.value)}
                className={styles.filterInput}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                Time allotted for an applicant to provide corrected documents before automatic case closure.
              </span>
            </div>
          </div>
        </div>

        {/* Upload Limits */}
        <div className={styles.panelCard}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}><span>📁</span> Document Ingestion Controls</h2>
          </div>
          <div className={styles.panelBody} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Maximum Single Document File Size (MB):
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={maxUploadMb}
                onChange={(e) => setMaxUploadMb(e.target.value)}
                className={styles.filterInput}
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                Default size limit per uploaded document (standard Indian RTO limit is 2MB per file).
              </span>
            </div>
          </div>
        </div>

        {/* Portal Operation Modes */}
        <div className={styles.panelCard}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}><span>🛡️</span> System Status & Maintenance</h2>
          </div>
          <div className={styles.panelBody}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              <div>
                <strong style={{ fontSize: '13px', color: maintenanceMode ? '#b91c1c' : '#0f172a' }}>
                  Enable Scheduled Maintenance Notice Banner
                </strong>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>
                  Displays an advisory banner to citizens regarding upcoming state transport server maintenance.
                </span>
              </div>
            </label>
          </div>
        </div>

        <button type="submit" className={styles.btnPrimary} style={{ alignSelf: 'flex-start', padding: '10px 20px' }}>
          Save Configuration
        </button>
      </form>
    </div>
  );
}
