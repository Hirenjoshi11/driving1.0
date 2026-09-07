'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { StatusPill } from '@/components/console';
import styles from '../../AdminConsole.module.css';

export default function AdminCaseDetailPage({ params }) {
  const resolvedParams = use(params);
  const applicationId = resolvedParams.id;
  const router = useRouter();
  const { t } = useApp();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals & Action States
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Reveal PII state
  const [revealedPii, setRevealedPii] = useState(null);
  const [revealingPii, setRevealingPii] = useState(false);

  // Override Modal
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideTargetStatus, setOverrideTargetStatus] = useState('under_review');
  const [overrideReason, setOverrideReason] = useState('');

  // Reject Document Modal
  const [rejectDocModal, setRejectDocModal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Operator list for assignment
  const [operatorsList, setOperatorsList] = useState([]);
  const [selectedOperatorId, setSelectedOperatorId] = useState('');

  const loadCaseDetail = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/staff/applications/${applicationId}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(d => {
        setData(d);
        if (d.application?.assigned_operator_id) {
          setSelectedOperatorId(String(d.application.assigned_operator_id));
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Application not found or access denied.');
        setLoading(false);
      });
  }, [applicationId]);

  useEffect(() => {
    loadCaseDetail();
    // Fetch operators list for assignment
    fetch('/api/admin/operators')
      .then(res => res.json())
      .then(d => setOperatorsList(d.operators || []))
      .catch(() => {});
  }, [loadCaseDetail]);

  // Handle standard status transition
  const handleTransition = async (targetStatus, reason = null) => {
    setActionLoading(true);
    setActionMessage(null);

    try {
      const res = await fetch(`/api/staff/applications/${applicationId}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: targetStatus,
          reason,
          fields: {
            government_application_number: targetStatus === 'completed'
              ? `PARIVAHAN/${data.application.state_code || 'GJ'}/${Date.now().toString().slice(-6)}`
              : undefined
          }
        })
      });

      const resJson = await res.json();
      if (!res.ok) {
        throw new Error(resJson.error || 'Transition failed');
      }

      setActionMessage({ type: 'success', text: `Status updated to ${targetStatus}` });
      loadCaseDetail();
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Admin Override
  const handleAdminOverride = async (e) => {
    e.preventDefault();
    if (!overrideReason.trim()) {
      alert('Override reason is required');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/staff/applications/${applicationId}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: overrideTargetStatus,
          isOverride: true,
          overrideReason: overrideReason.trim()
        })
      });

      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.error || 'Override failed');

      setShowOverrideModal(false);
      setOverrideReason('');
      setActionMessage({ type: 'success', text: `Admin override applied: ${overrideTargetStatus}` });
      loadCaseDetail();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Assign Operator
  const handleAssignOperator = async () => {
    if (!selectedOperatorId) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/staff/applications/${applicationId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operatorId: Number(selectedOperatorId) })
      });
      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.error || 'Assignment failed');

      setActionMessage({ type: 'success', text: resJson.message });
      loadCaseDetail();
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Verify Document
  const handleVerifyDoc = async (docId) => {
    try {
      const res = await fetch(`/api/staff/documents/${docId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'verified' })
      });
      if (!res.ok) throw new Error('Verification failed');
      loadCaseDetail();
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle Reject Document
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
      if (!res.ok) throw new Error('Rejection update failed');

      setRejectDocModal(null);
      setRejectionReason('');
      loadCaseDetail();
    } catch (err) {
      alert(err.message);
    }
  };

  // Reveal PII
  const handleRevealPii = async () => {
    setRevealingPii(true);
    try {
      const res = await fetch(`/api/staff/applications/${applicationId}/reveal-pii`, {
        method: 'POST'
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Failed to reveal');
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
        Loading case records and verification checklist...
      </div>
    );
  }

  if (error || !data?.application) {
    return (
      <div className={styles.pageContainer}>
        <div style={{ padding: '24px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#b91c1c' }}>
          <h3>Error</h3>
          <p>{error || 'Application not found'}</p>
          <Link href="/admin/applications" className={styles.btnSecondary}>← Back to All Applications</Link>
        </div>
      </div>
    );
  }

  const { application: app, documents = [], timeline = [], transitions = [], inconsistencies = [], stats } = data;

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link href="/admin/applications" style={{ textDecoration: 'none', color: '#64748b', fontSize: '13px' }}>
              ← All Applications
            </Link>
            <span style={{ color: '#cbd5e1' }}>/</span>
            <span className={styles.monoCell} style={{ fontSize: '16px' }}>{app.application_number}</span>
          </div>
          <h1 className={styles.pageTitle} style={{ marginTop: '6px' }}>
            {app.first_name} {app.last_name} — {app.service_name} ({app.state_code})
          </h1>
          <p className={styles.pageSubtitle}>
            RTO: {app.rto_name} ({app.rto_code}) • Submitted: {app.submitted_at || app.created_at || '—'}
          </p>
        </div>

        <div className={styles.headerActions}>
          <StatusPill status={app.status} type="application" />
          <button
            type="button"
            onClick={() => setShowOverrideModal(true)}
            className={styles.btnSecondary}
            style={{ borderColor: '#c084fc', color: '#7e22ce' }}
          >
            <span>⚡</span>
            <span>Admin Status Override</span>
          </button>
        </div>
      </div>

      {/* Inline Inconsistency / Warning Alerts */}
      {inconsistencies.map((inc, i) => (
        <div key={i} style={{ padding: '10px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', color: '#92400e', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>⚠️</span>
          <span><strong>Data Inconsistency Alert:</strong> {inc.message}</span>
        </div>
      ))}

      {actionMessage && (
        <div style={{
          padding: '10px 14px',
          background: actionMessage.type === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${actionMessage.type === 'success' ? '#bbf7d0' : '#fca5a5'}`,
          borderRadius: '6px',
          color: actionMessage.type === 'success' ? '#15803d' : '#b91c1c',
          fontSize: '13px'
        }}>
          {actionMessage.text}
        </div>
      )}

      {/* Three Column Case Detail Layout */}
      <div className={styles.caseDetailLayout}>
        {/* Left Column: Timeline & Action Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Action Panel */}
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}><span>⚡</span> Workflow Actions</h2>
            </div>
            <div className={styles.panelBody} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {transitions.map(tr => (
                <div key={tr.to} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <button
                    type="button"
                    disabled={!tr.allowed || actionLoading}
                    onClick={() => handleTransition(tr.to)}
                    className={tr.allowed ? styles.btnPrimary : styles.btnSecondary}
                    style={{ width: '100%', justifyContent: 'center', opacity: tr.allowed ? 1 : 0.6 }}
                  >
                    {t(`staff.${tr.labelKey}`) || tr.to.replace(/_/g, ' ')}
                  </button>
                  {!tr.allowed && tr.reason && (
                    <span style={{ fontSize: '11px', color: '#b91c1c', padding: '2px 4px' }}>
                      {tr.reason}
                    </span>
                  )}
                </div>
              ))}

              {transitions.length === 0 && (
                <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', padding: '10px' }}>
                  No automated transitions available from status &quot;{app.status}&quot;.
                </div>
              )}

              {/* Assignment Selector */}
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Assign to Operator:
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <select
                    value={selectedOperatorId}
                    onChange={(e) => setSelectedOperatorId(e.target.value)}
                    className={styles.filterSelect}
                    style={{ flex: 1, fontSize: '12px', padding: '6px' }}
                  >
                    <option value="">Select Operator</option>
                    {operatorsList.map(op => (
                      <option key={op.id} value={op.id}>{op.name} (ID: {op.id})</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAssignOperator}
                    disabled={!selectedOperatorId || actionLoading}
                    className={styles.btnSecondary}
                    style={{ padding: '6px 10px', fontSize: '11px' }}
                  >
                    Assign
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}><span>🕒</span> Status Timeline</h2>
            </div>
            <div className={styles.panelBody} style={{ padding: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {timeline.map((item, idx) => (
                  <div key={item.id || idx} style={{ display: 'flex', gap: '10px', fontSize: '12px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)', marginTop: '4px', flexShrink: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>
                        {item.to_status.replace(/_/g, ' ').toUpperCase()}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        By {item.actor_name || 'System'} ({item.actor_role || 'system'}) • {item.created_at}
                      </div>
                      {item.reason && (
                        <div style={{ fontSize: '11px', color: '#334155', background: '#f8fafc', padding: '4px 8px', borderRadius: '4px', marginTop: '4px' }}>
                          {item.reason}
                        </div>
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
          {/* Applicant Section */}
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}><span>👤</span> Applicant Information</h2>
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
            <div className={styles.panelBody} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '13px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Full Name</span>
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
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Gender / Blood Group</span>
                <span>{app.gender || '—'} • {app.blood_group || '—'}</span>
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
                <span>{app.relation_type || 'Father'}: {app.father_name || app.guardian_name || '—'}</span>
              </div>
              {app.is_minor ? (
                <div style={{ gridColumn: '1 / -1', background: '#fef3c7', padding: '8px 12px', borderRadius: '6px', fontSize: '12px' }}>
                  <strong>Minor Applicant Notice:</strong> Guardian: {app.guardian_name} ({app.guardian_relation}) • Aadhaar: {revealedPii?.guardian_aadhaar || app.guardian_aadhaar}
                </div>
              ) : null}
            </div>
          </div>

          {/* Address Section */}
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}><span>🏠</span> Residential Address</h2>
            </div>
            <div className={styles.panelBody} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
              <div>
                <strong style={{ fontSize: '12px', color: '#475569', display: 'block', marginBottom: '4px' }}>Current Address</strong>
                <div>{app.current_house || ''} {app.current_building || ''} {app.current_street || ''}</div>
                <div>{app.current_area || ''} {app.current_city || ''}</div>
                <div>{app.current_taluka ? `${app.current_taluka}, ` : ''}District #{app.current_district_id || '—'}</div>
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
              <h2 className={styles.panelTitle}><span>💳</span> Service, RTO & Fee Snapshot</h2>
            </div>
            <div className={styles.panelBody} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', fontSize: '13px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Service Applied</span>
                <strong>{app.service_name}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>RTO Office</span>
                <span>{app.rto_name} ({app.rto_code})</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Test Centre</span>
                <span>{app.test_centre_name || 'Designated RTO Track'}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Vehicle Classes</span>
                <span>{app.selected_vehicle_classes || 'MCWG, LMV'}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Total Fee</span>
                <strong style={{ fontSize: '15px', color: '#15803d' }}>₹{Number(app.total_payable || 0).toLocaleString('en-IN')}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Payment State</span>
                <StatusPill status={app.payment_status} type="payment" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Required Documents Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className={styles.panelCard}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>
                <span>📑</span> Document Checklist ({stats?.verifiedDocs}/{stats?.requiredDocs})
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
                        {doc.is_required ? 'Required Document' : 'Optional Document'}
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
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
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

      {/* Admin Override Modal */}
      {showOverrideModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalBox}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>⚡ Admin Status Override</h3>
              <button type="button" onClick={() => setShowOverrideModal(false)} className={styles.modalCloseBtn}>✕</button>
            </div>
            <form onSubmit={handleAdminOverride}>
              <div className={styles.modalBody}>
                <div style={{ padding: '8px 12px', background: '#fef3c7', borderRadius: '6px', fontSize: '12px', color: '#92400e' }}>
                  <strong>Caution:</strong> Status overrides bypass normal state machine validation and are logged directly to the system audit trail.
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Target Status:</label>
                  <select
                    value={overrideTargetStatus}
                    onChange={(e) => setOverrideTargetStatus(e.target.value)}
                    className={styles.filterSelect}
                    style={{ width: '100%' }}
                  >
                    <option value="submitted">Submitted</option>
                    <option value="assigned">Assigned</option>
                    <option value="under_review">Under Review</option>
                    <option value="correction_required">Correction Required</option>
                    <option value="resubmitted">Resubmitted</option>
                    <option value="government_processing">Government Processing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Reason for Override (Required):
                  </label>
                  <textarea
                    rows="3"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="Enter explicit administrative justification..."
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setShowOverrideModal(false)} className={styles.btnSecondary}>
                  Cancel
                </button>
                <button type="submit" disabled={actionLoading} className={styles.btnDanger}>
                  Apply Override
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
                <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>
                  Please enter the explicit reason for rejection. This reason will be visible to the citizen.
                </p>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    Rejection Reason:
                  </label>
                  <textarea
                    rows="3"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Document is blurry, expired, or name does not match..."
                    required
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
