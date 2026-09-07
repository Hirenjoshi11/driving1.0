'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import {
  IconDocument,
  IconClock,
  IconAward,
  IconLicence,
  IconPin,
  IconInbox,
  IconArrowRight,
} from '@/components/icons/Icons';
import styles from './dashboard.module.css';

/* Colour only — the label always comes from status.* translations. */
const STATUS_CLASS = {
  submitted: 'statusInfo',
  paid: 'statusSuccess',
  under_review: 'statusWarning',
  assigned: 'statusAssigned',
  government_processing: 'statusProcessing',
  completed: 'statusSuccess',
  correction_required: 'statusError',
};

export default function DashboardPage() {
  const router = useRouter();
  const { state, dispatch, t } = useApp();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    }
    dispatch({ type: 'LOGOUT' });
    router.push('/login');
  };

  useEffect(() => {
    fetch('/api/applications')
      .then((r) => {
        if (r.status === 401) {
          router.push('/login?redirect=/dashboard');
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) {
          setApplications(data.applications || []);
        }
      })
      .catch((err) => console.error('Failed to load dashboard applications:', err))
      .finally(() => setLoading(false));
  }, [router]);

  const filteredApps = applications.filter((app) => {
    if (filter === 'all') return true;
    if (filter === 'submitted') return app.status === 'submitted' || app.status === 'paid';
    if (filter === 'in_progress') return app.status === 'under_review' || app.status === 'assigned' || app.status === 'government_processing';
    if (filter === 'completed') return app.status === 'completed';
    return true;
  });

  const totalCount = applications.length;
  const inProgressCount = applications.filter(
    (a) => a.status === 'under_review' || a.status === 'assigned' || a.status === 'government_processing' || a.status === 'submitted'
  ).length;
  const completedCount = applications.filter((a) => a.status === 'completed').length;

  return (
    <div className={styles.dashboardPage}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{t('dashboard.title')}</h1>
            <p className={styles.desc}>
              {state.user?.name ? `${t('dashboard.welcome', { name: state.user.name })} ` : ''}
              {t('dashboard.subtitle')}
            </p>
          </div>
          <div className={styles.headerActions}>
            <Link href="/apply" className="btn btn-primary btn-lg">
              {t('dashboard.newAppBtn')}
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconInfo}`}>
              <IconDocument size={20} />
            </div>
            <div className={styles.statMeta}>
              <span className={styles.statValue}>{totalCount}</span>
              <span className={styles.statLabel}>{t('dashboard.totalApplications')}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconWarning}`}>
              <IconClock size={20} />
            </div>
            <div className={styles.statMeta}>
              <span className={styles.statValue}>{inProgressCount}</span>
              <span className={styles.statLabel}>{t('status.under_review')}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconSuccess}`}>
              <IconAward size={20} />
            </div>
            <div className={styles.statMeta}>
              <span className={styles.statValue}>{completedCount}</span>
              <span className={styles.statLabel}>{t('status.completed')}</span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className={styles.filterBar}>
          <button
            className={`${styles.filterBtn} ${filter === 'all' ? styles.filterBtnActive : ''}`}
            onClick={() => setFilter('all')}
          >
            {t('common.all')} ({totalCount})
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'submitted' ? styles.filterBtnActive : ''}`}
            onClick={() => setFilter('submitted')}
          >
            {t('status.submitted')}
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'in_progress' ? styles.filterBtnActive : ''}`}
            onClick={() => setFilter('in_progress')}
          >
            {t('status.under_review')}
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'completed' ? styles.filterBtnActive : ''}`}
            onClick={() => setFilter('completed')}
          >
            {t('status.completed')}
          </button>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="loading-center">
            <div className="spinner"></div>
            <p>{t('common.loading')}</p>
          </div>
        ) : filteredApps.length > 0 ? (
          <div className={styles.applicationsList}>
            {filteredApps.map((app) => {
              const statusClass = styles[STATUS_CLASS[app.status]] || styles.statusNeutral;
              const statusLabel = t(`status.${app.status}`) !== `status.${app.status}` ? t(`status.${app.status}`) : app.status;
              const isCorrectionRequired = app.status === 'correction_required';
              const isPaymentPending = app.status === 'payment_pending' || app.payment_status === 'pending';

              return (
                <div
                  key={app.id}
                  className={`${styles.appCard} card-interactive`}
                  onClick={() => router.push(`/track?appNo=${encodeURIComponent(app.application_number)}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      router.push(`/track?appNo=${encodeURIComponent(app.application_number)}`);
                    }
                  }}
                >
                  <div className={styles.appMain}>
                    <div className={styles.serviceIcon}><IconLicence size={22} /></div>
                    <div className={styles.appInfo}>
                      <span className={styles.appNumber}>{app.application_number}</span>
                      <span className={styles.serviceName}>{app.service_name}</span>
                      <div className={styles.appMeta}>
                        <span className={styles.metaPin}><IconPin size={13} /> {app.state_name} ({app.rto_code})</span>
                        <span>•</span>
                        <span>{t('form.applicant')}: {app.first_name} {app.last_name}</span>
                        <span>•</span>
                        <span>
                          {new Date(app.created_at).toLocaleDateString(state.language === 'en' ? 'en-IN' : state.language === 'gu' ? 'gu-IN' : 'hi-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.appActions} onClick={(e) => e.stopPropagation()}>
                    <span className={`${styles.statusPill} ${statusClass}`}>{statusLabel}</span>

                    {isCorrectionRequired ? (
                      <Link
                        href={`/apply?appNo=${encodeURIComponent(app.application_number)}`}
                        className={`btn btn-sm ${styles.correctionBtn}`}
                      >
                        {t('track.reviewCorrectionBtn')}
                        <IconArrowRight size={15} />
                      </Link>
                    ) : isPaymentPending ? (
                      <Link
                        href={`/apply?appNo=${encodeURIComponent(app.application_number)}&step=5`}
                        className="btn btn-primary btn-sm"
                      >
                        {t('track.completePaymentBtn')}
                        <IconArrowRight size={15} />
                      </Link>
                    ) : (
                      <Link
                        href={`/track?appNo=${encodeURIComponent(app.application_number)}`}
                        className="btn btn-secondary btn-sm"
                      >
                        {t('track.title')}
                        <IconArrowRight size={15} />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><IconInbox size={40} /></div>
            <h3 className={styles.emptyTitle}>{t('dashboard.noApplications')}</h3>
            <p className={styles.emptyDesc}>
              {t('dashboard.subtitle')}
            </p>
            <Link href="/apply" className="btn btn-primary">
              {t('dashboard.newAppBtn')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
