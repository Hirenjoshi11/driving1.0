'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import {
  IconUser,
  IconLock,
  IconDownload,
  IconScale,
  IconShield,
  IconHandshake,
  IconScroll,
} from '@/components/icons/Icons';
import styles from './privacy.module.css';

export default function PrivacyLayout({ children }) {
  const pathname = usePathname();
  const { t, state } = useApp();

  const navItems = [
    { href: '/account/privacy', label: t('privacy.navMyData'), Icon: IconUser },
    { href: '/account/privacy/consent', label: t('privacy.navConsent'), Icon: IconLock },
    { href: '/account/privacy/data', label: t('privacy.navData'), Icon: IconDownload },
    { href: '/account/privacy/requests', label: t('privacy.navRequests'), Icon: IconScale },
    { href: '/account/privacy/grievances', label: t('privacy.navGrievances'), Icon: IconShield },
    { href: '/account/privacy/nomination', label: t('privacy.navNomination'), Icon: IconHandshake },
    { href: '/privacy', label: t('privacy.navNotice'), Icon: IconScroll },
  ];

  return (
    <div className={styles.privacyContainer}>
      {/* Hero Header */}
      <div className={styles.heroCard}>
        <div className={styles.heroBadge}>
          <IconShield size={15} />
          <span>{t('privacy.effectiveDate')}</span>
        </div>
        <h1 className={styles.heroTitle}>{t('privacy.centerTitle') || 'Citizen Privacy & Data Protection Center'}</h1>
        <p className={styles.heroSubtitle}>
          {t('privacy.centerSubtitle') || 'Manage your personal data, consent choices, statutory rights, and grievances under the Digital Personal Data Protection Act, 2023.'}
        </p>
        <div className={styles.heroMeta}>
          <div>
            <strong>{t('privacy.dpoContactTitle') || 'DPO Contact'}:</strong> {t('privacy.dpoName') || 'Shri Animesh Sharma, DPO'} • {t('privacy.dpoEmail') || 'dpo@drivinglicenceform.in'}
          </div>
          <div>
            <strong>SLA:</strong> {t('privacy.dpoSla') || '24h Acknowledgment'}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <nav className={styles.navTabs} aria-label="Privacy Center Navigation">
        {navItems.map(({ href, label, Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`${styles.navTab} ${isActive ? styles.navTabActive : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main Tab Content */}
      <main>{children}</main>
    </div>
  );
}
