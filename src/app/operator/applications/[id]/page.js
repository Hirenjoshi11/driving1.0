'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { StatusPill } from '@/components/console';
import styles from '@/app/admin/AdminConsole.module.css';

export default function OperatorCaseDetailPage({ params }) {
  const resolvedParams = use(params);
  const applicationId = resolvedParams.id;
  const router = useRouter();
  const { t } = useApp();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);

  // Correction Composer Modal
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [selectedCorrectionDocs, setSelectedCorrectionDocs] = useState([]);
  const [correctionNote, setCorrectionNote] = useState('');

  // Complete Application Modal
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [govtAppNo, setGovtAppNo] = useState('');

  // Reject Document Modal
  const [rejectDocModal, setRejectDocModal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Reveal PII state
  const [revealedPii, setRevealedPii] = useState(null);
  const [revealingPii, setRevealingPii] = useState(false);

  const loadCase = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/staff/applications/${applicationId}`)
      .then(res => {
        if (!res.ok) throw new Error(res.status === 404 ? 'Application not found in your jurisdiction.' : `Error ${res.status}`);
        return res.json();
      })
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [applicationId]);

  useEffect(() => {
    loadCase();
  }, [loadCase]);

  // Execute transition
  const executeTransition = async (targetStatus, payload = {}) => {
    setActionLoading(true);
    setActionNotice(null);
    try {
      const res = await fetch(`/api/staff/applications/${applicationId}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: targetStatus,
          reason: payload.reason,
          fields: payload.fields
        })
      });
      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.error || 'Transition failed');

      setActionNotice({ type: 'success', text: `Action successful: Application transitioned to ${targetStatus}` });
      loadCase();
    } catch (err) {
      setActionNotice({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Claim Case
  const handleSelfClaim = async () => {
    setActionLoading(true);
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (!meData?.user?.userId) throw new Error('Could not resolve current session');

      const res = await fetch(`/api/staff/applications/${applicationId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operatorId: meData.user.userId })
      });
      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.error || 'Failed to claim application');

      setActionNotice({ type: 'success', text: 'Case claimed successfully.' });
      loadCase();
    } catch (err) {
      setActionNotice({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Correction Request to Citizen
  const handleSendCorrection = async (e) => {
    e.preventDefault();
    const docNames = selectedCorrectionDocs.join(', ');
    const composedReason = docNames 
      ? `Required corrections for [${docNames}]: ${correctionNote}` 
      : correctionNote;

    if (!composedReason.trim()) {
      alert('Please select offending documents or type a clear correction note.');
      return;
    }

    await executeTransition('correction_required', {
      reason: composedReason.trim(),
      fields: { correction_reason: composedReason.trim() }
    });

    setShowCorrectionModal(false);
    setSelectedCorrectionDocs([]);
    setCorrectionNote('');
  };

  // Submit Government Completion
  const handleMarkComplete = async (e) => {
    e.preventDefault();
    if (!govtAppNo.trim()) {
      alert('Government reference number is required');
      return;
    }

    await executeTransition('completed', {
      fields: { government_application_number: govtAppNo.trim() }
    });

    setShowCompleteModal(false);
    setGovtAppNo('');
  };

  // Verify Document
  const handleVerifyDoc = async (docId) => {
    try {
      const res = await fetch(`/api/staff/documents/${docId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'verified' })
      });
      if (!res.ok) throw new Error('Verification failed');
      loadCase();
    } catch (err) {
      alert(err.message);
    }
  };

  // Reject Document
  const handleRejectDoc = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      alert('Rejection reason is required');
      return;
    }

    try {
      const res = await fetch(`/api/staff/documents/${rejectDocModal.upload_id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: 'rejected',
          rejectionReason: rejectionReason.trim()
        })
      });
      if (!res.ok) throw new Error('Rejection failed');

      setRejectDocModal(null);
      setRejectionReason('');
      loadCase();
    } catch (err) {
      alert(err.message);
    }
  };

  // Reveal PII
  const handleRevealPii = async () => {
    setRevealingPii(true);
    try {
      const res = await fetch(`/api/staff/applications/${applicationId}/reveal-pii`, { method: 'POST' });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Failed to reveal PII');
      setRevealedPii(d);
    } catch (err) {
      alert(err.message);
    } finally {
      setRevealingPii(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
        Loading case record and verification documents...
      </div>
    );
  }

  if (error || !data?.application) {
    return (
      <div className={styles.pageContainer}>
        <div style={{ padding: '24px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#b91c1c' }}>
          <h3 style={{ margin: '0 0 8px 0' }}>Access Denied or Case Not Found</h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '13px' }}>
            {error || 'This application does not exist or falls outside your assigned RTO jurisdiction.'}
          </p>
          <Link href="/operator/queue" className={styles.btnSecondary}>← Return to My Queue</Link>
        </div>
      </div>
    );
  }

  const { application: app, documents = [], timeline = [], transitions = [], inconsistencies = [], stats } = data;

  return (
    <div className={styles.pageContainer}>
      {/* Top Header */}
      <div className={styles.pageHeader}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
            <Link href="/operator/queue" style={{ color: 'inherit', textDecoration: 'none' }}>← Queue</Link>
            <span>/</span>
            <span className={styles.monoCell}>{app.application_number}</span>
          </div>
          <h1 className={styles.pageTitle} style={{ marginTop: '4px' }}>
            {app.first_name} {app.last_name} — {app.service_name}
          </h1>
          <p className={styles.pageSubtitle}>
            RTO: {app.rto_name} ({app.rto_code}) • Age: {app.date_of_birth || 'Not provided'} • Submitted: {app.submitted_at || app.created_at}
          </p>
        </div>

        <div className={styles.headerActions}>
          <StatusPill status={app.status} type="application" />
          {app.status === 'submitted' && (
            <button
              type="button"
              onClick={handleSelfClaim}
              disabled={actionLoading}
              className={styles.btnPrimary}
            >
              ⚡ Claim Application
            </button>
          )}
        </div>
      </div>

      {/* Inline Consistency Flags */}
      {inconsistencies.map((inc, i) => (
        <div key={i} style={{ padding: '10px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', color: '#92400e', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>⚠️</span>
          <span><strong>Inconsistency Warning:</strong> {inc.message}</span>
        </div>
      ))}

      {actionNotice && (
        <div style={{
          padding: '10px 14px',
          background: actionNotice.type === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${actionNotice.type === 'success' ? '#bbf7d0' : '#fca5a5'}`,
          borderRadius: '6px',
          color: actionNotice.type === 'success' ? '#15803d' : '#b91c1c',
          fontSize: '13px'
        }}>
          {actionNotice.text}
        </div>
      )}

      {/* 3-Column Layout */}
      <div className={styles.caseDetailLayout}>
        {/* Left Column: Actions & Status Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Named Action Buttons Panel */}
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}><span>⚡</span> Actions</h2>
            </div>
            <div className={styles.panelBody} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {transitions.map(tr => {
                let actionBtn = null;
                if (tr.to === 'correction_required') {
                  actionBtn = (
                    <button
                      key={tr.to}
                      type="button"
                      disabled={!tr.allowed || actionLoading}
                      onClick={() => setShowCorrectionModal(true)}
                      className={styles.btnSecondary}
                      style={{ width: '100%', justifyContent: 'center', borderColor: '#f59e0b', color: '#b45309' }}
                    >
                      ⚠️ Request Correction
                    </button>
                  );
                } else if (tr.to === 'completed') {
                  actionBtn = (
                    <button
                      key={tr.to}
                      type="button"
                      disabled={!tr.allowed || actionLoading}
                      onClick={() => setShowCompleteModal(true)}
                      className={styles.btnPrimary}
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      ✓ Mark Completed
                    </button>
                  );
                } else {
                  actionBtn = (
                    <button
                      key={tr.to}
                      type="button"
                      disabled={!tr.allowed || actionLoading}
                      onClick={() => executeTransition(tr.to)}
                      className={tr.allowed ? styles.btnPrimary : styles.btnSecondary}
                      style={{ width: '100%', justifyContent: 'center', opacity: tr.allowed ? 1 : 0.6 }}
                    >
                      {t(`staff.${tr.labelKey}`) || tr.to.replace(/_/g, ' ')}
                    </button>
                  );
                }

                return (
                  <div key={tr.to} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {actionBtn}
                    {!tr.allowed && tr.reason && (
                      <span style={{ fontSize: '11px', color: '#b91c1c', padding: '2px 4px' }}>
                        {tr.reason}
                      </span>
                    )}
                  </div>
                );
              })}

              {transitions.length === 0 && app.status !== 'submitted' && (
                <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', padding: '10px' }}>
                  No transition currently available from status &quot;{app.status}&quot;.
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}><span>🕒</span> History</h2>
            </div>
            <div className={styles.panelBody} style={{ padding: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {timeline.map((item, idx) => (
                  <div key={item.id || idx} style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--color-primary)', marginTop: '4px', flexShrink: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <strong style={{ color: '#0f172a' }}>{item.to_status.replace(/_/g, ' ').toUpperCase()}</strong>
                      <span style={{ fontSize: '10px', color: '#64748b' }}>
                        {item.actor_name || 'System'} • {item.created_at}
                      </span>
                      {item.reason && (
                        <span style={{ fontSize: '11px', color: '#334155', background: '#f8fafc', padding: '3px 6px', borderRadius: '4px', marginTop: '3px' }}>
                          {item.reason}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Centre Column: Application Citizen Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Applicant Card */}
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}><span>👤</span> Applicant Details</h2>
              {!revealedPii && (
                <button
                  type="button"
                  onClick={handleRevealPii}
                  disabled={revealingPii}
                  className={styles.btnSecondary}
                  style={{ fontSize: '11px', padding: '3px 8px' }}
                >
                  👁️ {revealingPii ? 'Revealing...' : 'Reveal Aadhaar (Audited)'}
                </button>
              )}
            </div>
            <div className={styles.panelBody} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', fontSize: '13px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Applicant Name</span>
                <strong>{app.first_name} {app.middle_name || ''} {app.last_name}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Mobile Number</span>
                <span>{revealedPii?.mobile || app.mobile_display}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Date of Birth</span>
                <span>{revealedPii?.date_of_birth || app.date_of_birth || 'Not provided'}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Identity (Aadhaar)</span>
                <strong className={styles.monoCell}>
                  {revealedPii?.identity_number || app.identity_number}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Education</span>
                <span>{app.education || 'Not provided'}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Parent / Guardian</span>
                <span>{app.relation_type || 'Father'}: {app.father_name || app.guardian_name || 'Not provided'}</span>
              </div>
              {app.is_minor ? (
                <div style={{ gridColumn: '1 / -1', background: '#fef3c7', padding: '8px 12px', borderRadius: '6px', fontSize: '12px' }}>
                  <strong>Minor Applicant:</strong> Guardian {app.guardian_name} ({app.guardian_relation}) • Aadhaar: {revealedPii?.guardian_aadhaar || app.guardian_aadhaar}
                </div>
              ) : null}
            </div>
          </div>

          {/* Address Card */}
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}><span>🏠</span> Residential Addresses</h2>
            </div>
            <div className={styles.panelBody} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
              <div>
                <strong style={{ fontSize: '12px', color: '#475569', display: 'block', marginBottom: '4px' }}>Current Address</strong>
                <div>{app.current_house || ''} {app.current_building || ''} {app.current_street || ''}</div>
                <div>{app.current_area || ''} {app.current_city || ''}</div>
                <div style={{ fontWeight: 600 }}>Pincode: {app.current_pincode || '—'}</div>
              </div>
              <div>
                <strong style={{ fontSize: '12px', color: '#475569', display: 'block', marginBottom: '4px' }}>Permanent Address</strong>
                {app.same_as_current ? (
                  <span style={{ color: '#64748b', fontStyle: 'italic' }}>Same as Current Address</span>
                ) : (
                  <>
                    <div>{app.permanent_house || ''} {app.permanent_building || ''} {app.permanent_street || ''}</div>
                    <div>{app.permanent_area || ''} {app.permanent_city || ''}</div>
                    <div style={{ fontWeight: 600 }}>Pincode: {app.permanent_pincode || '—'}</div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Service & Fees Snapshot */}
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}><span>💳</span> Service & Fee Summary</h2>
            </div>
            <div className={styles.panelBody} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', fontSize: '13px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Service Applied</span>
                <strong>{app.service_name}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>RTO Jurisdiction</span>
                <span>{app.rto_name} ({app.rto_code})</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Vehicle Classes</span>
                <span>{app.selected_vehicle_classes || 'MCWG, LMV'}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Total Fee</span>
                <strong style={{ color: '#15803d' }}>₹{Number(app.total_payable || 0).toLocaleString('en-IN')}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Payment Status</span>
                <StatusPill status={app.payment_status} type="payment" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Documents Verification Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>
                <span>📑</span> Checklist ({stats?.verifiedDocs}/{stats?.requiredDocs})
              </h2>
            </div>
            <div className={styles.panelBody} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {documents.map((doc, idx) => (
                <div
                  key={doc.upload_id || doc.service_doc_id || idx}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '12px',
                    background: doc.upload_status === 'verified' ? '#f0fdf4' : doc.upload_status === 'rejected' ? '#fef2f2' : '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{doc.document_name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {doc.is_required ? 'Required Document' : 'Optional'}
                      </div>
                    </div>
                    {doc.upload_status ? (
                      <StatusPill status={doc.upload_status} type="document" />
                    ) : (
                      <span style={{ fontSize: '11px', color: '#b91c1c', fontWeight: 600 }}>Missing</span>
                    )}
                  </div>

                  {doc.upload_id ? (
                    <>
                      <div style={{ fontSize: '11px', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>
                          📄 {doc.original_filename}
                        </span>
                        <span>{doc.file_size ? `${Math.round(doc.file_size / 1024)} KB` : ''}</span>
                      </div>

                      {doc.rejection_reason && (
                        <div style={{ fontSize: '11px', color: '#b91c1c', background: '#fee2e2', padding: '4px 6px', borderRadius: '4px' }}>
                          Reason: {doc.rejection_reason}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                        {(doc.download_url || doc.upload_id) && (
                          <a
                            href={doc.download_url || `/api/documents/download/${doc.upload_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.btnSecondary}
                            style={{ flex: 1, padding: '4px 6px', fontSize: '11px', textAlign: 'center', justifyContent: 'center' }}
                          >
                            Preview
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleVerifyDoc(doc.upload_id)}
                          className={styles.btnPrimary}
                          style={{ flex: 1, padding: '4px 6px', fontSize: '11px', justifyContent: 'center', background: doc.upload_status === 'verified' ? '#166534' : undefined }}
                        >
                          Verify
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejectDocModal(doc)}
                          className={styles.btnDanger}
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                        >
                          Reject
                        </button>
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>
                      Citizen has not uploaded this document yet.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Correction Request Composer Modal */}
      {showCorrectionModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalBox}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Compose Correction Request</h3>
              <button type="button" onClick={() => setShowCorrectionModal(false)} className={styles.modalCloseBtn}>✕</button>
            </div>
            <form onSubmit={handleSendCorrection}>
              <div className={styles.modalBody}>
                <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>
                  Select offending documents and add instructions. The applicant will see this on their tracking portal.
                </p>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Select Offending Documents:
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {documents.map(d => (
                      <label key={d.document_type_id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={selectedCorrectionDocs.includes(d.document_name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCorrectionDocs([...selectedCorrectionDocs, d.document_name]);
                            } else {
                              setSelectedCorrectionDocs(selectedCorrectionDocs.filter(name => name !== d.document_name));
                            }
                          }}
                        />
                        <span>{d.document_name} ({d.upload_status || 'Missing'})</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Actionable Note for Applicant:
                  </label>
                  <textarea
                    rows="3"
                    required
                    value={correctionNote}
                    onChange={(e) => setCorrectionNote(e.target.value)}
                    placeholder="e.g. Please upload clear photo ID showing your full date of birth..."
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setShowCorrectionModal(false)} className={styles.btnSecondary}>
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading} className={styles.btnDanger}>
                  Dispatch Correction Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mark Completed Modal */}
      {showCompleteModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalBox}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Mark Application Completed</h3>
              <button type="button" onClick={() => setShowCompleteModal(false)} className={styles.modalCloseBtn}>✕</button>
            </div>
            <form onSubmit={handleMarkComplete}>
              <div className={styles.modalBody}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Government Application / Smart Card Reference No. (Required):
                  </label>
                  <input
                    type="text"
                    required
                    value={govtAppNo}
                    onChange={(e) => setGovtAppNo(e.target.value)}
                    placeholder="e.g. SARATHI/GJ/2026/099881"
                    className={styles.filterInput}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setShowCompleteModal(false)} className={styles.btnSecondary}>
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading} className={styles.btnPrimary}>
                  Confirm Completion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Document Modal */}
      {rejectDocModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalBox}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Reject Document: {rejectDocModal.document_name}</h3>
              <button type="button" onClick={() => setRejectDocModal(null)} className={styles.modalCloseBtn}>✕</button>
            </div>
            <form onSubmit={handleRejectDoc}>
              <div className={styles.modalBody}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Rejection Reason (Required):
                  </label>
                  <textarea
                    rows="3"
                    required
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Document is blurred or address does not match applicant..."
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setRejectDocModal(null)} className={styles.btnSecondary}>
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
