'use client';
import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';
import { IconPhone, IconMail, IconScale, IconClock, IconArrowRight } from '@/components/icons/Icons';
import styles from '@/app/legal.module.css';

export default function ContactPage() {
  const { t } = useApp();

  return (
    <div className={styles.legalPage}>
      <div className={styles.container}>
        <div className={styles.breadcrumb}>
          <Link href="/">{t('nav.home') || 'Home'}</Link>
          <span>/</span>
          <span>{t('footer.contactUs') || 'Contact Support'}</span>
        </div>

        <div className={styles.header}>
          <h1 className={styles.title}>
            {t('legal.contactTitle') || 'Contact Support & Grievance Desk'}
          </h1>
          <p className={styles.subtitle}>
            {t('contact.subtitle')}
          </p>
        </div>

        {/* Contact Channels Grid */}
        <div className={`${styles.cardsGrid} ${styles.cardsGrid3}`}>
          <div className={styles.card}>
            <div className={styles.cardIcon}><IconMail size={22} /></div>
            <h2 className={styles.cardTitle}>
              {t('contact.helpdeskTitle')}
            </h2>
            <p className={styles.cardDesc}>
              {t('contact.helpdeskDesc')}
            </p>
            <a href="mailto:support@drivinglicenseform.com" className={styles.cardAction}>
              support@drivinglicenseform.com
              <IconArrowRight size={14} />
            </a>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}><IconScale size={22} /></div>
            <h2 className={styles.cardTitle}>
              {t('contact.grievanceTitle')}
            </h2>
            <p className={styles.cardDesc}>
              {t('contact.grievanceDesc')}
            </p>
            <a href="mailto:grievance@drivinglicenseform.com" className={styles.cardAction}>
              grievance@drivinglicenseform.com
              <IconArrowRight size={14} />
            </a>
          </div>

          <div className={styles.card}>
            <div className={styles.cardIcon}><IconClock size={22} /></div>
            <h2 className={styles.cardTitle}>
              {t('contact.hoursTitle')}
            </h2>
            <p className={styles.cardDesc}>
              {t('contact.hoursDays')}
              <br />
              <strong>9:00 AM – 7:00 PM IST</strong>
              <br />
              <span className={styles.cardNote}>
                {t('contact.hoursClosed')}
              </span>
            </p>
            <Link href="/help" className={styles.cardAction}>
              {t('nav.help')}
              <IconArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Action Card */}
        <div className={styles.actionCard}>
          <h2 className={styles.actionCardTitle}>
            {t('footer.trackApp') || 'Track Your Application Status'}
          </h2>
          <p className={styles.actionCardDesc}>
            {t('contact.trackDesc')}
          </p>
          <Link href="/track" className="btn btn-primary btn-lg">
            {t('track.trackBtn')}
            <IconArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
