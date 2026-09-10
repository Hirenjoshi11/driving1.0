'use client';
import { useState, Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';
import {
  IconSearch,
  IconAlert,
  IconLock,
  IconPrinter,
  IconPin,
  IconDocument,
  IconArrowRight,
  IconCheck,
  IconClock,
  IconAward,
  IconInbox,
} from '@/components/icons/Icons';
import styles from './track.module.css';

// Status styling definitions matching citizen-service guidelines
const STATUS_META = {
  draft: { class: styles.statusNeutral, dotClass: styles.statusNeutral },
  payment_pending: { class: styles.statusYellow, dotClass: styles.statusYellow },
  paid: { class: styles.statusGreen, dotClass: styles.statusGreen },
  submitted: { class: styles.statusBlue, dotClass: styles.statusBlue },
  assigned: { class: styles.statusPurple, dotClass: styles.statusPurple },
  under_review: { class: styles.statusYellow, dotClass: styles.statusYellow },
  correction_required: { class: styles.statusRed, dotClass: styles.statusRed },
  resubmitted: { class: styles.statusBlue, dotClass: styles.statusBlue },
  government_processing: { class: styles.statusYellow, dotClass: styles.statusYellow },
  completed: { class: styles.statusGreen, dotClass: styles.statusGreen },
};

function TrackDashboard() {
  const { t, state, dispatch } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialAppNo = searchParams.get('appNo') || '';

  const [applications, setApplications] = useState([]);
  const [summary, setSummary] = useState({ total: 0, inProgress: 0, actionRequired: 0, completed: 0 });
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [emailSigningIn, setEmailSigningIn] = useState(false);
  const [unauthError, setUnauthError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'in_progress' | 'action_required' | 'completed'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent_updated');
  const [page, setPage] = useState(1);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [quickAppNo, setQuickAppNo] = useState(initialAppNo || '');

  // Load single application detailed tracking data
  const loadApplicationDetail = async (appId) => {
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/applications/${appId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedApp(data);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Failed to load application detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Load user applications on filter, search, sort, or page change
  useEffect(() => {
    let ignore = false;

    const loadApps = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filter && filter !== 'all') params.set('status', filter);
        if (searchQuery && searchQuery.trim()) params.set('search', searchQuery.trim());
        if (sortBy) params.set('sort', sortBy);
        params.set('page', page.toString());
        params.set('limit', '10');

        const res = await fetch(`/api/applications?${params.toString()}`);
        if (res.status === 401) {
          if (!ignore) {
            setAuthRequired(true);
            setApplications([]);
          }
          return;
        }

        if (res.ok) {
          const data = await res.json();
          if (!ignore) {
            setApplications(data.applications || []);
            if (data.summary) {
              setSummary(data.summary);
            }
            setPagination(data.pagination || null);
            setAuthRequired(false);

            // If an initialAppNo was in URL, auto-select it
            if (initialAppNo) {
              const matched = (data.applications || []).find(
                (a) => a.application_number?.toUpperCase() === initialAppNo.toUpperCase()
              );
              if (matched) {
                loadApplicationDetail(matched.id);
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to load applications:', err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadApps();

    return () => {
      ignore = true;
    };
  }, [filter, searchQuery, sortBy, page, initialAppNo]);

  // Helper to format dates
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(state.language === 'hi' ? 'hi-IN' : state.language === 'gu' ? 'gu-IN' : 'en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Determine stage progression in lifecycle
  const getStageIndex = (status) => {
    switch (status) {
      case 'draft':
      case 'payment_pending':
        return 0;
      case 'paid':
      case 'submitted':
        return 1;
      case 'assigned':
      case 'under_review':
      case 'correction_required':
      case 'resubmitted':
        return 2;
      case 'government_processing':
        return 3;
      case 'completed':
        return 4;
      default:
        return 1;
    }
  };

  // Detailed lifecycle journey steps
  const detailLifecycleSteps = [
    {
      key: 'submitted',
      title: t('track.stepSubmitted') || 'Application Submitted',
      desc: t('track.stepSubmittedDesc') || 'Application form and applicant data recorded securely.',
    },
    {
      key: 'payment',
      title: t('track.stepPayment') || 'Fee Verification',
      desc: t('track.stepPaymentDesc') || 'Statutory fees assessment and payment verified.',
    },
    {
      key: 'scrutiny',
      title: t('track.stepScrutiny') || 'Document Scrutiny',
      desc: t('track.stepScrutinyDesc') || 'Uploaded proof documents under verification by RTO operator.',
    },
    {
      key: 'govt',
      title: t('track.stepGovt') || 'Government Processing',
      desc: t('track.stepGovtDesc') || 'Biometric authentication and automated test track synchronization.',
    },
    {
      key: 'completed',
      title: t('track.stepCompleted') || 'Licence Dispatched',
      desc: t('track.stepCompletedDesc') || 'Driving licence approved and dispatched via Speed Post.',
    },
  ];

  // Helper for status explanations
  const getStatusExplanation = (status) => {
    return t(`track.statusExplanations.${status}`) || t('track.statusTimeline');
  };

  // If unauthenticated, render clean citizen-service sign-in prompt with quick-search
  if (authRequired) {
    return (
      <div className={styles.trackPage}>
        <div className={styles.pageContainer}>
          <div className={styles.emptyCard} role="status">
            <div className={styles.emptyIconWrap}><IconSearch size={28} /></div>
            <h2 className={styles.emptyTitle}>
              {t('track.quickTrackTitle')}
            </h2>
            <p className={styles.emptyDesc}>
              {t('track.signInPrompt') ||
                'Enter your application number or registered email to verify current status and progress.'}
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setUnauthError('');
                const cleanInput = quickAppNo.trim();
                if (!cleanInput) {
                  router.push('/login?redirect=/track');
                  return;
                }

                // If user entered an email address, directly sign them in with zero password!
                if (cleanInput.includes('@') && cleanInput.includes('.')) {
                  setEmailSigningIn(true);
                  try {
                    const res = await fetch('/api/auth/email', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: cleanInput.toLowerCase() }),
                    });
                    const data = await res.json();
                    if (!res.ok) {
                      throw new Error(data.error || 'Failed to sign in with email');
                    }
                    dispatch({ type: 'SET_USER', payload: data.user });
                    setAuthRequired(false);
                  } catch (err) {
                    setUnauthError(err.message || 'Error signing in');
                  } finally {
                    setEmailSigningIn(false);
                  }
                  return;
                }

                // Application number flow: redirect to login
                router.push(`/login?redirect=${encodeURIComponent(`/track?appNo=${cleanInput.toUpperCase()}`)}`);
              }}
              style={{ width: '100%', maxWidth: '460px', margin: '16px auto 24px' }}
            >
              {unauthError && (
                <div style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-xs)', marginBottom: '8px' }}>
                  {unauthError}
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input
                  type="text"
                  value={quickAppNo}
                  onChange={(e) => setQuickAppNo(e.target.value)}
                  placeholder={t('auth.trackByEmailOrApp') || 'Enter Application No. or Registered Email'}
                  className="form-input"
                  style={{ letterSpacing: '0.02em', fontWeight: '600' }}
                  aria-label={t('auth.trackByEmailOrApp') || 'Application Number or Email'}
                />
                <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }} disabled={emailSigningIn}>
                  {emailSigningIn ? t('common.loading') : (t('track.trackBtn') || 'Track')}
                  <IconArrowRight size={16} />
                </button>
              </div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                <IconLock size={13} /> {quickAppNo.includes('@') ? (t('auth.emailTrackNotice') || 'Entering email provides direct passwordless access to all your applications.') : t('track.privacyNote')}
              </p>
            </form>

            <div className={styles.emptyActions} style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link href="/api/auth/oauth/google?redirect=/track" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  {t('auth.continueWithGoogle') || 'Continue with Google'}
                </Link>
                <Link href="/login?redirect=/track" className="btn btn-secondary">
                  {t('track.signInBtn') || 'Sign In to My Account'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // DETAILED VIEW (When an application is opened)
  // ============================================================
  if (selectedApp?.application) {
    const app = selectedApp.application;
    const documents = selectedApp.documents || [];
    const currentStepIdx = getStageIndex(app.status);
    const statusMeta = STATUS_META[app.status] || { class: styles.statusNeutral, dotClass: styles.statusNeutral };
    const localizedStatus = t(`status.${app.status}`) !== `status.${app.status}` ? t(`status.${app.status}`) : app.status;

    return (
      <div className={styles.trackPage}>
        <div className={styles.pageContainer}>
          {/* Back Navigation Bar */}
          <div className={styles.detailHeaderBar}>
            <button
              type="button"
              className={styles.backBtn}
              onClick={() => {
                setSelectedApp(null);
                router.push('/track', { scroll: false });
              }}
            >
              {t('track.backToApps') || '← Back to My Applications'}
            </button>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className={styles.printReceiptBtn}
                onClick={() => window.print()}
              >
                <IconPrinter size={15} />
                {t('track.printReceipt')}
              </button>
            </div>
          </div>

          <div className={styles.detailContainer}>
            {/* Print Only Header */}
            <div className={styles.printOnlyHeader}>
              <h2 style={{ fontSize: '18pt', fontWeight: 800, margin: '0 0 4pt 0' }}>
                {t('track.officialReceiptTitle') || 'OFFICIAL APPLICATION ACKNOWLEDGEMENT'}
              </h2>
              <p style={{ fontSize: '10pt', margin: 0, color: 'var(--color-text)' }}>
                {t('track.statutoryVerificationStamp') || 'VALIDATED DIGITAL ACKNOWLEDGEMENT • FORM PREPARATION SYSTEM'}
              </p>
            </div>

            {/* 1. Application Summary Card */}
            <section className={styles.detailCard} aria-label="Application Summary">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid var(--color-border-light, #edf2f7)', paddingBottom: '16px', marginBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {t('track.applicationNo') || 'Application Number'}
                  </span>
                  <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-primary-dark, #0d7a38)' }}>
                    {app.application_number}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span className={`${styles.statusBadge} ${statusMeta.class}`}>
                    <span className={`${styles.statusDot} ${statusMeta.dotClass}`}></span>
                    {localizedStatus}
                  </span>
                  <span style={{ background: 'var(--color-info-light)', color: 'var(--color-info)', border: '1px solid rgba(49, 130, 206, 0.25)', padding: '5px 12px', borderRadius: '9999px', fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>
                    <IconPin size={13} /> {app.state_name}
                  </span>
                  <span style={{ background: 'var(--color-primary-light, #EAF6EE)', color: 'var(--color-primary-dark, #0d7a38)', border: '1px solid rgba(21, 148, 71, 0.2)', padding: '5px 12px', borderRadius: '9999px', fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>
                    <IconDocument size={13} /> {app.service_name}
                  </span>
                </div>
              </div>

              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailItemKey}>{t('track.applicantLabel') || 'Applicant'}</span>
                  <span className={styles.detailItemVal}>{app.first_name} {app.last_name}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailItemKey}>{t('track.mobileLabel') || 'Registered Mobile'}</span>
                  <span className={styles.detailItemVal}>
                    {app.mobile ? `******${app.mobile.toString().slice(-4)}` : '—'}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailItemKey}>{t('track.designatedRto') || 'Designated RTO'}</span>
                  <span className={styles.detailItemVal}>{app.rto_name || 'RTO Office'} ({app.rto_code || 'GJ'})</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailItemKey}>{t('track.submittedOn') || 'Submitted Date'}</span>
                  <span className={styles.detailItemVal}>{formatDate(app.created_at)}</span>
                </div>
              </div>
            </section>

            {/* 2. Dominant Current Status Card */}
            <section className={`${styles.detailCard} ${styles.statusCard}`} aria-label="Current Status">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className={styles.eyebrowPulse}></span>
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--color-primary-dark, #0d7a38)', textTransform: 'uppercase' }}>
                  {t('track.currentStatusLabel') || 'CURRENT STATUS'}
                </span>
              </div>
              <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-text-dark, #18232D)', margin: '0 0 6px 0' }}>
                {localizedStatus}
              </h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary, #5B6470)', lineHeight: '1.55', margin: 0 }}>
                {getStatusExplanation(app.status)}
              </p>
            </section>

            {/* 3. Application Journey Timeline */}
            <section className={styles.detailCard} aria-labelledby="timeline-heading">
              <h3 id="timeline-heading" className={styles.detailCardTitle}>
                {t('track.statusTimeline') || 'Application Journey'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '0 0 16px 0' }}>
                {t('track.timelineSubtitle') || 'Clear milestone progression from submission to dispatch'}
              </p>

              <div className={styles.verticalTimeline}>
                {detailLifecycleSteps.map((step, idx) => {
                  const isCompleted = idx < currentStepIdx || app.status === 'completed';
                  const isActive = idx === currentStepIdx && app.status !== 'completed';
                  const isFuture = idx > currentStepIdx && app.status !== 'completed';

                  return (
                    <div
                      key={step.key}
                      className={`${styles.timelineStepItem} ${isCompleted ? styles.lineCompleted : ''}`}
                    >
                      <div
                        className={`${styles.stepNode} ${
                          isCompleted ? styles.nodeCompleted : isActive ? styles.nodeActive : styles.nodeFuture
                        }`}
                        aria-hidden="true"
                      >
                        {isCompleted ? <IconCheck size={13} /> : null}
                      </div>

                      <div className={styles.stepContent}>
                        <div className={styles.stepTitleRow}>
                          <h4 className={styles.stepTitle}>{step.title}</h4>
                          {isActive && (
                            <span className={styles.stepCurrentBadge}>
                              {t('track.currentStage') || 'Current Stage'}
                            </span>
                          )}
                        </div>

                        {isActive ? (
                          <div className={styles.stepActiveHighlight}>
                            <p className={styles.stepDescription}>{step.desc}</p>
                          </div>
                        ) : (
                          <p className={styles.stepDescription}>{step.desc}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 4. Dynamic Next Action */}
            <section aria-label="Next Action">
              {app.status === 'correction_required' ? (
                <div className={`${styles.actionBanner} ${styles.bannerWarning}`} style={{ padding: '18px 22px' }}>
                  <div className={styles.bannerLeft}>
                    <span className={styles.bannerLabel}>{t('track.actionNeeded') || 'ACTION REQUIRED'}</span>
                    <span className={styles.bannerDesc}>
                      {app.rejection_reason || t('track.correctionDesc') || 'Address proof needs to be replaced.'}
                    </span>
                  </div>
                  <Link href={`/apply?appNo=${encodeURIComponent(app.application_number)}`} className={styles.bannerBtn}>
                    {t('track.reviewCorrectionBtn') || 'Review & Correct →'}
                  </Link>
                </div>
              ) : app.status === 'payment_pending' || app.payment_status === 'pending' ? (
                <div className={`${styles.actionBanner} ${styles.bannerAttention}`} style={{ padding: '18px 22px' }}>
                  <div className={styles.bannerLeft}>
                    <span className={styles.bannerLabel}>{t('track.paymentPendingTitle') || 'Payment Pending'}</span>
                    <span className={styles.bannerDesc}>
                      {t('track.amountPayable') || 'Amount Payable:'} ₹{app.total_fee || '—'}
                    </span>
                  </div>
                  <Link href={`/apply?appNo=${encodeURIComponent(app.application_number)}&step=5`} className={styles.bannerBtn}>
                    {t('track.completePaymentBtn') || 'Complete Payment →'}
                  </Link>
                </div>
              ) : (
                <div className={`${styles.actionBanner} ${styles.bannerSuccess}`} style={{ padding: '18px 22px' }}>
                  <div className={styles.bannerLeft}>
                    <span className={styles.bannerLabel}>{t('track.nextActionTitle') || 'NEXT STEP'}</span>
                    <span className={styles.bannerDesc}>
                      {t('track.noActionNeeded') || 'No action is required from you right now. We are actively reviewing your documents with the RTO.'}
                    </span>
                  </div>
                </div>
              )}
            </section>

            {/* 5. Documents Checklist */}
            <section className={styles.detailCard} aria-labelledby="docs-checklist-title">
              <h3 id="docs-checklist-title" className={styles.detailCardTitle}>
                {t('track.documentsTitle') || 'Documents Checklist'}
              </h3>
              <div className={styles.docsList}>
                {documents.length > 0 ? (
                  documents.map((doc, idx) => (
                    <div key={idx} className={styles.docItem}>
                      <div className={styles.docItemLeft}>
                        <IconDocument size={15} />
                        <span className={styles.docItemName}>{doc.document_name || 'Document'}</span>
                      </div>
                      <span className={`${styles.docBadge} ${doc.verified ? styles.docBadgeVerified : doc.status === 'rejected' ? styles.docBadgeRequired : styles.docBadgeUploaded}`}>
                        {doc.verified ? (t('track.docVerified') || 'Verified') : doc.status === 'rejected' ? (t('track.docRejected') || 'Rejected') : (t('track.docUploaded') || 'Uploaded')}
                      </span>
                    </div>
                  ))
                ) : (
                  /* Never assert a verification the record does not contain:
                     this listed three documents as "Verified" whenever the
                     application had no documents at all. */
                  <p className={styles.docsEmpty}>{t('track.docsEmpty')}</p>
                )}
              </div>
            </section>

            {/* 6. Statutory Fees & Government Reference */}
            <section className={styles.detailCard} aria-label="Fee and Reference Information">
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailItemKey}>{t('track.paymentDetails') || 'Statutory Fee'}</span>
                  <span className={styles.detailItemVal} style={{ color: 'var(--color-primary)' }}>
                    ₹{app.total_fee || '—'} ({app.payment_status === 'pending' ? t('status.payment_pending') : t('track.paymentCompleted')})
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailItemKey}>{t('track.govtRefTitle') || 'Government Reference No.'}</span>
                  <span className={styles.detailItemVal}>
                    {app.government_application_number || app.gov_reference_number || (t('track.govtRefPending') || 'Pending registration with state portal')}
                  </span>
                </div>
              </div>
            </section>

            {/* 7. Final Document Available */}
            {app.has_final_document ? (
              <section className={styles.finalDocCard} aria-label="Final Document Download">
                <div>
                  <h4>{t('track.finalDocTitle') || 'Final Document Available'}</h4>
                  <p>{t('track.finalDocDesc') || 'Your official acknowledgement receipt / licence slip is ready for download.'}</p>
                </div>
                <button
                  type="button"
                  className={styles.finalDocDownloadBtn}
                  onClick={() => window.print()}
                >
                  {t('track.downloadDoc') || 'Download Document ↓'}
                </button>
              </section>
            ) : null}

            {/* Help & Support */}
            <footer className={styles.helpSection}>
              <h4 className={styles.helpSectionTitle}>{t('track.needHelpTitle') || 'Need Help?'}</h4>
              <p className={styles.helpSectionText}>{t('track.needHelpDesc') || 'Having trouble finding your application?'}</p>
              <div className={styles.helpLinks}>
                <Link href="/help" className={styles.helpLinkAction}>
                  {t('track.contactSupport') || 'Contact Support'}
                </Link>
                <Link href="/apply" className={styles.helpLinkAction}>
                  {t('track.startNew') || '+ Start New Application'}
                </Link>
              </div>
            </footer>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // MY APPLICATIONS DASHBOARD (Grid View)
  // ============================================================
  return (
    <div className={styles.trackPage}>
      <div className={styles.pageContainer}>
        {/* Page Header */}
        <header className={styles.pageHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.eyebrow}>
              <span className={styles.eyebrowPulse}></span>
              {t('track.eyebrow') || 'APPLICATIONS'}
            </div>
            <h1 className={styles.pageTitle}>
              {t('track.title') || 'My Applications'}
            </h1>
            <p className={styles.pageSubtitle}>
              {t('track.subtitle') || 'View the status and progress of your driving licence applications in one place.'}
            </p>
          </div>

          <Link href="/apply" className={styles.startNewBtn}>
            {t('track.startNew') || '+ Start New Application'}
          </Link>
        </header>

        {/* Compact Summary Cards Row */}
        <div className={styles.summaryRow} role="region" aria-label="Application Summary Metrics">
          <div className={styles.summaryStatCard}>
            <div className={`${styles.statIconWrap} ${styles.statIconInfo}`}>
              <IconDocument size={20} />
            </div>
            <div className={styles.statMeta}>
              <span className={styles.statValue}>{summary.total}</span>
              <span className={styles.statLabel}>{t('track.totalApplications') || 'Total Applications'}</span>
            </div>
          </div>

          <div className={styles.summaryStatCard}>
            <div className={`${styles.statIconWrap} ${styles.statIconProgress}`}>
              <IconClock size={20} />
            </div>
            <div className={styles.statMeta}>
              <span className={styles.statValue}>{summary.inProgress}</span>
              <span className={styles.statLabel}>{t('track.inProgress') || 'In Progress'}</span>
            </div>
          </div>

          <div className={styles.summaryStatCard}>
            <div className={`${styles.statIconWrap} ${styles.statIconAlert}`}>
              <IconAlert size={20} />
            </div>
            <div className={styles.statMeta}>
              <span className={styles.statValue}>{summary.actionRequired}</span>
              <span className={styles.statLabel}>{t('track.actionRequired') || 'Action Required'}</span>
            </div>
          </div>

          <div className={styles.summaryStatCard}>
            <div className={`${styles.statIconWrap} ${styles.statIconDone}`}>
              <IconAward size={20} />
            </div>
            <div className={styles.statMeta}>
              <span className={styles.statValue}>{summary.completed}</span>
              <span className={styles.statLabel}>{t('track.completed') || 'Completed'}</span>
            </div>
          </div>
        </div>

        {/* Controls Bar: Filters, Search & Sort */}
        <div className={styles.controlsBar}>
          <div className={styles.filterTabs} role="tablist" aria-label="Application filters">
            <button
              type="button"
              role="tab"
              aria-selected={filter === 'all'}
              className={`${styles.filterTab} ${filter === 'all' ? styles.filterTabActive : ''}`}
              onClick={() => { setFilter('all'); setPage(1); }}
            >
              {t('track.filterAll') || 'All'}
              <span className={styles.filterCount}>{summary.total}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={filter === 'in_progress'}
              className={`${styles.filterTab} ${filter === 'in_progress' ? styles.filterTabActive : ''}`}
              onClick={() => { setFilter('in_progress'); setPage(1); }}
            >
              {t('track.filterInProgress') || 'In Progress'}
              <span className={styles.filterCount}>{summary.inProgress}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={filter === 'action_required'}
              className={`${styles.filterTab} ${filter === 'action_required' ? styles.filterTabActive : ''}`}
              onClick={() => { setFilter('action_required'); setPage(1); }}
            >
              {t('track.filterActionRequired') || 'Action Required'}
              <span className={styles.filterCount}>{summary.actionRequired}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={filter === 'completed'}
              className={`${styles.filterTab} ${filter === 'completed' ? styles.filterTabActive : ''}`}
              onClick={() => { setFilter('completed'); setPage(1); }}
            >
              {t('track.filterCompleted') || 'Completed'}
              <span className={styles.filterCount}>{summary.completed}</span>
            </button>
          </div>

          <div className={styles.controlsRight}>
            {/* Search my applications */}
            <div className={styles.searchBox}>
              <span className={styles.searchIcon}><IconSearch size={16} /></span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder={t('track.searchPlaceholder') || 'Search my applications by number, email, service or RTO…'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search my applications"
              />
            </div>

            {/* Sort options */}
            <select
              className={styles.sortSelect}
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              aria-label={t('track.sortBy') || 'Sort By'}
            >
              <option value="recent_updated">{t('track.sortRecent') || 'Recently Updated'}</option>
              <option value="newest">{t('track.sortNewest') || 'Newest First'}</option>
              <option value="oldest">{t('track.sortOldest') || 'Oldest First'}</option>
            </select>
          </div>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="loading-center" style={{ minHeight: '260px' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '12px', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
              {t('common.loading') || 'Loading applications…'}
            </p>
          </div>
        ) : applications.length > 0 ? (
          <div className={styles.cardsGrid} role="feed" aria-label="Applications list">
            {applications.map((app) => {
              const stageIdx = getStageIndex(app.status);
              const statusMeta = STATUS_META[app.status] || { class: styles.statusNeutral, dotClass: styles.statusNeutral };
              const localizedStatus = t(`status.${app.status}`) !== `status.${app.status}` ? t(`status.${app.status}`) : app.status;
              const isCorrectionRequired = app.status === 'correction_required';
              const isPaymentPending = app.status === 'payment_pending' || app.payment_status === 'pending';
              const isCompleted = app.status === 'completed';

              return (
                <article
                  key={app.id}
                  className={`${styles.appCard} ${
                    isCorrectionRequired
                      ? styles.cardCorrectionRequired
                      : isPaymentPending
                      ? styles.cardPaymentPending
                      : isCompleted
                      ? styles.cardCompleted
                      : ''
                  }`}
                  onClick={() => {
                    loadApplicationDetail(app.id);
                    router.push(`/track?appNo=${encodeURIComponent(app.application_number)}`, { scroll: false });
                  }}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      loadApplicationDetail(app.id);
                    }
                  }}
                  aria-label={`${app.service_name}, ${app.application_number}`}
                >
                  <div>
                    {/* Top Row: Service & Status */}
                    <div className={styles.cardTopRow}>
                      <h3 className={styles.cardServiceName}>{app.service_name}</h3>
                      <span className={`${styles.statusBadge} ${statusMeta.class}`}>
                        <span className={`${styles.statusDot} ${statusMeta.dotClass}`}></span>
                        {localizedStatus}
                      </span>
                    </div>

                    {/* Application Number */}
                    <div className={styles.cardAppNoBlock}>
                      <span className={styles.cardAppNoLabel}>{t('track.applicationNo') || 'Application No.'}</span>
                      <span className={styles.cardAppNoValue}>{app.application_number}</span>
                    </div>

                    {/* Location & Submitted Date */}
                    <div className={styles.cardMetaRow}>
                      <span className={styles.cardMetaPin}><IconPin size={13} /> {app.state_name}</span>
                      <span className={styles.cardMetaDivider}>•</span>
                      <span>{app.rto_name ? `${app.rto_name} (${app.rto_code || 'RTO'})` : (app.district_name || 'RTO')}</span>
                      <span className={styles.cardMetaDivider}>•</span>
                      <span>{t('track.submittedOn') || 'Submitted'} {formatDate(app.created_at)}</span>
                      {app.email && (
                        <>
                          <span className={styles.cardMetaDivider}>•</span>
                          <span style={{ fontSize: '11px', color: 'var(--color-primary-dark)', background: '#F0FDF4', padding: '1px 8px', borderRadius: '9999px', border: '1px solid #BBF7D0', fontWeight: 600 }}>
                            📧 {app.email}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Status Explanation */}
                    <p className={styles.statusExplanation}>
                      {getStatusExplanation(app.status)}
                    </p>

                    {/* Compact Progress Track */}
                    <div className={styles.progressTrack} aria-label="Progress">
                      <div className={styles.progressHeader}>
                        <span className={styles.progressLabel}>{t('track.progress') || 'Progress'}</span>
                        <span className={styles.progressStageName}>{localizedStatus}</span>
                      </div>
                      <div className={styles.progressStepsRow}>
                        {['Application', 'Documents', 'Review', 'Payment', 'Complete'].map((stepName, sIdx) => {
                          const isDone = sIdx < stageIdx || isCompleted;
                          const isCurrent = sIdx === stageIdx && !isCompleted;
                          return (
                            <div key={stepName} className={styles.stepDotItem}>
                              <div
                                className={`${styles.stepMiniNode} ${
                                  isDone ? styles.stepNodeDone : isCurrent ? styles.stepNodeCurrent : styles.stepNodeUpcoming
                                }`}
                              >
                                {isDone ? <IconCheck size={11} /> : null}
                              </div>
                              <span className={styles.stepNodeName}>
                                {sIdx === 0
                                  ? (t('track.stepProgApplication') || 'Application')
                                  : sIdx === 1
                                  ? (t('track.stepProgDocuments') || 'Docs')
                                  : sIdx === 2
                                  ? (t('track.stepProgReview') || 'Review')
                                  : sIdx === 3
                                  ? (t('track.stepProgPayment') || 'Payment')
                                  : (t('track.stepProgComplete') || 'Issued')}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Specific Attention Banner: Correction Required */}
                    {isCorrectionRequired && (
                      <div
                        className={`${styles.actionBanner} ${styles.bannerWarning}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className={styles.bannerLeft}>
                          <span className={styles.bannerLabel}>{t('track.actionNeeded') || 'ACTION REQUIRED'}</span>
                          <span className={styles.bannerDesc}>
                            {app.rejection_reason || t('track.correctionDesc') || 'Address proof needs to be replaced.'}
                          </span>
                        </div>
                        <Link
                          href={`/apply?appNo=${encodeURIComponent(app.application_number)}`}
                          className={styles.bannerBtn}
                        >
                          {t('track.reviewCorrectionBtn') || 'Review & Correct →'}
                        </Link>
                      </div>
                    )}

                    {/* Specific Attention Banner: Payment Pending */}
                    {isPaymentPending && (
                      <div
                        className={`${styles.actionBanner} ${styles.bannerAttention}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className={styles.bannerLeft}>
                          <span className={styles.bannerLabel}>{t('track.paymentPendingTitle') || 'Payment Pending'}</span>
                          <span className={styles.bannerDesc}>
                            {t('track.amountPayable') || 'Amount:'} ₹{app.total_fee || '—'}
                          </span>
                        </div>
                        <Link
                          href={`/apply?appNo=${encodeURIComponent(app.application_number)}&step=5`}
                          className={styles.bannerBtn}
                        >
                          {t('track.completePaymentBtn') || 'Complete Payment →'}
                        </Link>
                      </div>
                    )}

                    {/* Specific Banner: Completed Application with Government Ref or Final Doc */}
                    {isCompleted && (
                      <div
                        className={`${styles.actionBanner} ${styles.bannerSuccess}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className={styles.bannerLeft}>
                          <span className={styles.bannerLabel}>{t('track.govtRefNo') || 'Govt Reference No.'}</span>
                          <span className={styles.bannerDesc}>
                            {app.gov_reference_number || 'GOV-COMPLETED-DISPATCHED'}
                          </span>
                        </div>
                        {app.has_final_document ? (
                          <button
                            type="button"
                            className={styles.bannerBtn}
                            onClick={() => window.print()}
                          >
                            {t('track.downloadDoc') || 'Download Document ↓'}
                          </button>
                        ) : null}
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Interactive CTA */}
                  <div className={styles.cardFooter}>
                    <span className={styles.cardFooterMeta}>
                      {app.gov_reference_number ? `Ref: ${app.gov_reference_number}` : ''}
                    </span>
                    <span className={styles.viewAppBtn}>
                      {t('track.viewApplication') || 'View Application →'}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* Empty State when 0 applications */
          <div className={styles.emptyCard} role="status">
            <div className={styles.emptyIconWrap}><IconInbox size={28} /></div>
            <h3 className={styles.emptyTitle}>
              {t('track.emptyTitle') || 'No Applications Yet'}
            </h3>
            <p className={styles.emptyDesc}>
              {t('track.emptyDesc') ||
                "You haven't started a driving licence application yet. Choose a service to begin your digital application."}
            </p>
            <div className={styles.emptyActions}>
              <Link href="/apply" className="btn btn-primary btn-lg">
                {t('track.startFirstApp') || 'Start Your First Application →'}
              </Link>
              <Link href="/#services" className="btn btn-secondary btn-lg">
                {t('track.viewServices') || 'View Services'}
              </Link>
            </div>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination && pagination.totalPages > 1 && (
          <div className={styles.paginationBar}>
            <span className={styles.pageInfo}>
              {t('track.pageOf', { page: pagination.page, totalPages: pagination.totalPages }) ||
                `Page ${pagination.page} of ${pagination.totalPages}`}
            </span>
            <div className={styles.paginationActions}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={pagination.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ← {t('track.prev') || 'Previous'}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              >
                {t('track.next') || 'Next'} →
              </button>
            </div>
          </div>
        )}

        {/* Support Section */}
        <footer className={styles.helpSection}>
          <h4 className={styles.helpSectionTitle}>{t('track.needHelpTitle') || 'Need Help?'}</h4>
          <p className={styles.helpSectionText}>{t('track.needHelpDesc') || 'Having trouble finding your application?'}</p>
          <div className={styles.helpLinks}>
            <Link href="/help" className={styles.helpLinkAction}>
              {t('track.contactSupport') || 'Contact Support'}
            </Link>
            <Link href="/apply" className={styles.helpLinkAction}>
              {t('track.startNew') || '+ Start New Application'}
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="loading-center"><div className="spinner"></div></div>}>
      <TrackDashboard />
    </Suspense>
  );
}
