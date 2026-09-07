'use client';
import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';
import styles from './Footer.module.css';

export default function Footer() {
  const { t } = useApp();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          {/* Column 1: Brand */}
          <div className={styles.brand}>
            <div className={styles.brandName}>
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="8" fill="#159447"/>
                <circle cx="14" cy="14" r="5" stroke="white" strokeWidth="1.5"/>
                <path d="M14 11v3l2 2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>{t('common.appName') || 'Driving License Form'}</span>
            </div>
            <p className={styles.brandTagline}>
              {t('common.tagline') || 'Your Driving Licence Application, Made Simple.'}
            </p>
            <p className={styles.brandDesc}>
              {t('common.supportLine') || 'A citizen-friendly platform designed to guide you through preparation, documentation, and tracking for driving licence applications across Gujarat, Rajasthan, and Uttar Pradesh.'}
            </p>
          </div>

          {/* Column 2: Services */}
          <div className={styles.linkGroup}>
            <h4 className={styles.linkTitle}>{t('footer.services') || 'Licence Services'}</h4>
            <Link href="/apply">{t('services.learnerLicence') || 'Learner Licence'}</Link>
            <Link href="/apply">{t('services.newDrivingLicence') || 'New Driving Licence'}</Link>
          </div>

          {/* Column 3: Resources */}
          <div className={styles.linkGroup}>
            <h4 className={styles.linkTitle}>{t('footer.resources') || 'Citizen Resources'}</h4>
            <Link href="/documents">{t('footer.docGuidelines') || 'Document Guidelines'}</Link>
            <Link href="/#how-it-works">{t('footer.howItWorks') || 'How It Works'}</Link>
            <Link href="/track">{t('footer.trackApp') || 'Track Application'}</Link>
            <Link href="/help">{t('footer.helpSupport') || 'Help & Support'}</Link>
            <Link href="/login">{t('footer.citizenLogin') || 'Citizen Portal Login'}</Link>
          </div>

          {/* Column 4: Company & Legal */}
          <div className={styles.linkGroup}>
            <h4 className={styles.linkTitle}>{t('footer.platform') || 'Platform & Policies'}</h4>
            <Link href="/help">{t('footer.aboutService') || 'About Our Service'}</Link>
            <Link href="/contact">{t('footer.contactUs') || 'Contact Support'}</Link>
            <Link href="/privacy">{t('footer.privacyPolicy') || 'Privacy Policy & Notice'}</Link>
            <Link href="/account/privacy">{t('privacy.centerTitle') || 'Citizen Privacy Center'}</Link>
            <Link href="/account/privacy/grievances">{t('privacy.navGrievances') || 'DPDP Grievance Redressal'}</Link>
            <Link href="/terms">{t('footer.termsConditions') || 'Terms & Conditions'}</Link>
            <Link href="/refunds">{t('footer.feePolicy') || 'Transparent Fee Policy'}</Link>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} {t('common.appName') || 'Driving License Form'}. {t('common.allRightsReserved') || 'All rights reserved.'}
          </p>
          <p className={styles.disclaimer}>
            {t('footer.disclaimerNotice') || 'Important Disclaimer: Driving License Form is an independent private application assistance service and is not an official government website or affiliated with the Ministry of Road Transport and Highways (MoRTH), Parivahan Sewa, or any state RTO authority unless expressly stated otherwise.'}
          </p>
        </div>
      </div>
    </footer>
  );
}
