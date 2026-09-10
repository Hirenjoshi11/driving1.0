'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import styles from './Footer.module.css';

export default function Footer() {
  const { t } = useApp();
  const pathname = usePathname();

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/operator')) {
    return null;
  }

  const year = new Date().getFullYear();
  const appName = t('common.appName') || 'Driving License Form';
  const allRights = t('common.allRightsReserved') || 'All rights reserved.';

  return (
    <footer className={styles.footer}>
      {/* Desktop Multi-Column Footer */}
      <div className={styles.desktopFooter}>
        <div className={styles.inner}>
          <div className={styles.grid}>
            {/* Column 1: Brand */}
            <div className={styles.brand}>
              <Link href="/" className={styles.brandLink} aria-label={`${appName} Home`}>
                <img
                  src="/logo-website.png"
                  alt={appName}
                  className={styles.brandLogo}
                />
              </Link>
              <p className={styles.brandTagline}>
                {t('common.tagline') || 'Your Driving Licence Application, Made Simple.'}
              </p>
            </div>

            {/* Column 2: Services */}
            <div className={styles.linkGroup}>
              <h4 className={styles.linkTitle}>{t('footer.services') || 'Licence Services'}</h4>
              <Link href="/apply">{t('footer.allServices') || 'Licence Services (Select State)'}</Link>
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
              <Link href="/contact">{t('footer.contactUs') || 'Contact Support'}</Link>
              <Link href="/privacy">{t('footer.privacyPolicy') || 'Privacy Policy & Notice'}</Link>
              <Link href="/account/privacy">{t('privacy.centerTitle') || 'Citizen Privacy & Grievances'}</Link>
              <Link href="/terms">{t('footer.termsConditions') || 'Terms & Conditions'}</Link>
              <Link href="/refunds">{t('footer.feePolicy') || 'Transparent Fee Policy'}</Link>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.bottom}>
            <p className={styles.copyright}>
              © {year} {appName}. {allRights}
            </p>
            <p className={styles.disclaimer}>
              {t('footer.disclaimerNotice') || 'Important Disclaimer: Driving License Form is an independent private application assistance service and is not an official government website or affiliated with the Ministry of Road Transport and Highways (MoRTH), Parivahan Sewa, or any state RTO authority unless expressly stated otherwise.'}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Single-Line Footer */}
      <div className={styles.mobileFooter}>
        <p className={styles.mobileCopyright}>
          © {year} {appName}. {allRights}
        </p>
      </div>
    </footer>
  );
}
