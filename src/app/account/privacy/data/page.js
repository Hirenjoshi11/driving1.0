'use client';
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { IconDownload, IconEdit } from '@/components/icons/Icons';
import styles from '../privacy.module.css';

export default function DownloadAndCorrectDataPage() {
  const { t } = useApp();
  const [downloading, setDownloading] = useState(false);
  const [fieldToCorrect, setFieldToCorrect] = useState('first_name');
  const [newValue, setNewValue] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const handleDownload = async () => {
    setDownloading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/privacy/export');
      if (!res.ok) throw new Error('Failed to generate export bundle');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `data_principal_archive_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setStatusMsg({ type: 'success', text: 'Data archive successfully downloaded!' });
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Export failed' });
    } finally {
      setDownloading(false);
    }
  };

  const handleCorrectionSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/privacy/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType: 'correction',
          reason: `Request to update ${fieldToCorrect}: ${reason}`,
          requestDetails: {
            field: fieldToCorrect,
            requestedValue: newValue,
            userReason: reason,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit correction request');

      setStatusMsg({
        type: 'success',
        text: `Correction request #${data.request.requestNumber} submitted successfully! You can track its review progress in the Requests tab.`,
      });
      setNewValue('');
      setReason('');
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Correction submission failed' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {statusMsg && (
        <div className={statusMsg.type === 'success' ? styles.alertBox : styles.alertBoxDanger}>
          {statusMsg.text}
        </div>
      )}

      {/* 1. Download My Data */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          <IconDownload size={20} />
          <span>{t('privacy.exportTitle') || 'Download My Data Archive'}</span>
        </h2>
        <p className={styles.cardDesc}>
          {t('privacy.exportDesc') || 'Under Section 11 of the DPDP Act 2023, you have the statutory right to obtain a full summary of personal data being processed, identity of third parties with whom data was shared, and audit history.'}
        </p>

        <div className={styles.alertBox}>
          <strong>Secure Export Guarantee:</strong> The generated export is digitally timestamped and contains only personal records belonging to your authenticated account. Sensitive identifiers are masked for security.
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className={styles.btnPrimary}
        >
          <IconDownload size={16} />
          <span>{downloading ? t('common.processing') : t('privacy.downloadExportBtn')}</span>
        </button>
      </div>

      {/* 2. Request Data Correction */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          <IconEdit size={20} />
          <span>{t('privacy.correctionTitle') || 'Request Data Correction / Completion'}</span>
        </h2>
        <p className={styles.cardDesc}>
          {t('privacy.correctionDesc') || 'Under Section 12 of the DPDP Act 2023, you have the right to correction of inaccurate or misleading personal data and completion of incomplete personal data.'}
        </p>

        <form onSubmit={handleCorrectionSubmit}>
          <div className={styles.gridTwo}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('privacy.fieldSelect') || 'Select Field to Correct'}</label>
              <select
                className={styles.formSelect}
                value={fieldToCorrect}
                onChange={(e) => setFieldToCorrect(e.target.value)}
              >
                <option value="first_name">First Name</option>
                <option value="last_name">Last Name</option>
                <option value="current_address">Current Residential Address</option>
                <option value="permanent_address">Permanent Domicile Address</option>
                <option value="email">Email Address</option>
                <option value="blood_group">Blood Group</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('privacy.newValue') || 'Requested New Value'}</label>
              <input
                type="text"
                required
                className={styles.formInput}
                placeholder="Enter accurate/updated information"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{t('privacy.correctionReason') || 'Reason for Correction / Supporting Context'}</label>
            <textarea
              required
              rows={3}
              className={styles.formTextarea}
              placeholder="Explain why this correction is required (e.g. typographical error in spelling, change of address)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={styles.btnPrimary}
          >
            <span>{submitting ? 'Submitting...' : 'Submit Formal Correction Request'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
