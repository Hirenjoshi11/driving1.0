'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import styles from './Console.module.css';

export default function ConsoleNav({ role, onNavigate }) {
  const pathname = usePathname();
  const { t } = useApp();

  // Navigation items strictly derived by role — never rendered then hidden
  const operatorItems = [
    {
      href: '/operator',
      label: t('staff.navToday') || 'Today’s Queue',
      icon: '⚡',
      exact: true
    },
    {
      href: '/operator/queue',
      label: t('staff.navQueue') || 'Processing Queue',
      icon: '📋'
    },
    {
      href: '/operator/documents',
      label: t('staff.navDocuments') || 'Verify Documents',
      icon: '📑'
    },
    {
      href: '/operator/history',
      label: t('staff.navHistory') || 'My Processing History',
      icon: '🕒'
    }
  ];

  const adminItems = [
    {
      href: '/admin',
      label: t('staff.navOversight') || 'Oversight Dashboard',
      icon: '📊',
      exact: true
    },
    {
      href: '/admin/applications',
      label: t('staff.navAllApplications') || 'All Applications',
      icon: '📁'
    },
    {
      href: '/admin/operators',
      label: t('staff.navOperators') || 'Operators & Jurisdictions',
      icon: '👥'
    },
    {
      href: '/admin/services',
      label: t('staff.navServices') || 'Services & Steps',
      icon: '⚙️'
    },
    {
      href: '/admin/fees',
      label: t('staff.navFees') || 'Fee Structures',
      icon: '💳'
    },
    {
      href: '/admin/locations',
      label: t('staff.navLocations') || 'Locations & RTOs',
      icon: '📍'
    },
    {
      href: '/admin/audit',
      label: t('staff.navAudit') || 'System Audit Log',
      icon: '🛡️'
    },
    {
      href: '/admin/privacy',
      label: t('adminPrivacy.dashboardTitle') || 'DPDP Privacy Console',
      icon: '🔒'
    },
    {
      href: '/admin/settings',
      label: t('staff.navSettings') || 'Portal Settings',
      icon: '🔧'
    }
  ];

  const isCurrentActive = (item) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <nav className={styles.navSection} aria-label="Console Navigation">
      {role === 'operator' && (
        <>
          <div className={styles.sectionHeading}>{t('staff.sectionWorkbench') || 'RTO Workbench'}</div>
          {operatorItems.map((item) => {
            const active = isCurrentActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </>
      )}

      {role === 'admin' && (
        <>
          <div className={styles.sectionHeading}>{t('staff.sectionOversight') || 'State Oversight'}</div>
          {adminItems.map((item) => {
            const active = isCurrentActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </>
      )}
    </nav>
  );
}
