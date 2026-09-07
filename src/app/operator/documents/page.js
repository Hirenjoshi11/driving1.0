'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';
import { StatusPill } from '@/components/console';
import styles from '@/app/admin/AdminConsole.module.css';

export default function OperatorDocumentsBatchPage() {
  const { t } = useApp();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadDocumentsQueue = () => {
    setLoading(true);
    // Fetch applications in jurisdiction that have uploaded docs
    fetch('/api/staff/queue?limit=50&status=under_review')
      .then(res => res.json())
      .then(async (data) => {
        const apps = data.applications || [];
        // For each application, fetch documents
        const docPromises = apps.map(a =>
          fetch(`/api/staff/applications/${a.id}`)
            .then(r => r.json())
            .then(d => (d.documents || []).map(doc => ({
              ...doc,
              application_id: a.id,
              application_number: a.application_number,
              applicant_name: a.applicant_name
            })))
            .catch(() => [])
        );

        const allAppDocs = await Promise.all(docPromises);
        const flattened = allAppDocs.flat().filter(d => d.upload_id && d.upload_status === 'uploaded');
        setDocuments(flattened);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadDocumentsQueue();
  }, []);

  const handleVerify = async (doc) => {
    try {
      const res = await fetch(`/api/staff/documents/${doc.upload_id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'verified' })
      });
      if (!res.ok) throw new Error('Verification failed');
      loadDocumentsQueue();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;

    try {
      const res = await fetch(`/api/staff/documents/${rejectModal.upload_id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: 'rejected',
          rejectionReason: rejectionReason.trim()
        })
      });
      if (!res.ok) throw new Error('Rejection failed');

      setRejectModal(null);
      setRejectionReason('');
      loadDocumentsQueue();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{t('staff.navDocuments') || 'Batch Document Verification'}</h1>
          <p className={styles.pageSubtitle}>
            Cross-application queue for rapid document verification and compliance checks
          </p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" onClick={loadDocumentsQueue} className={styles.btnSecondary}>
            Refresh Queue
          </button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>App Number</th>
              <th>Applicant</th>
              <th>Document Type</th>
              <th>Uploaded File</th>
              <th>Status</th>
              <th className={styles.numberCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  Loading unverified documents...
                </td>
              </tr>
            ) : documents.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  🎉 No unverified documents pending in your active queue!
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc.upload_id}>
                  <td>
                    <Link
                      href={`/operator/applications/${doc.application_id}`}
                      className={styles.monoCell}
                      style={{ color: 'var(--color-primary)', textDecoration: 'none' }}
                    >
                      {doc.application_number}
                    </Link>
                  </td>
                  <td style={{ fontWeight: 600 }}>{doc.applicant_name}</td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{doc.document_name}</span>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>
                      {doc.document_category} • {doc.is_required ? 'Required' : 'Optional'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: '#334155' }}>📄 {doc.original_filename}</span>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>
                      {doc.file_size ? `${Math.round(doc.file_size / 1024)} KB` : ''}
                    </span>
                  </td>
                  <td>
                    <StatusPill status={doc.upload_status} type="document" />
                  </td>
                  <td className={styles.numberCell}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      {(doc.download_url || doc.upload_id || doc.id) && (
                        <a
                          href={doc.download_url || `/api/documents/download/${doc.upload_id || doc.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.btnSecondary}
                          style={{ padding: '3px 8px', fontSize: '11px' }}
                        >
                          Preview
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleVerify(doc)}
                        className={styles.btnPrimary}
                        style={{ padding: '3px 8px', fontSize: '11px' }}
                      >
                        ✓ Verify
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejectModal(doc)}
                        className={styles.btnDanger}
                        style={{ padding: '3px 8px', fontSize: '11px' }}
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalBox}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Reject Document: {rejectModal.document_name}</h3>
              <button type="button" onClick={() => setRejectModal(null)} className={styles.modalCloseBtn}>✕</button>
            </div>
            <form onSubmit={handleReject}>
              <div className={styles.modalBody}>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                  App: {rejectModal.application_number} • Applicant: {rejectModal.applicant_name}
                </p>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Reason for Rejection (Required):
                  </label>
                  <textarea
                    rows="3"
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter why this document cannot be accepted..."
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setRejectModal(null)} className={styles.btnSecondary}>
                  Cancel
                </button>
                <button type="submit" className={styles.btnDanger}>
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
