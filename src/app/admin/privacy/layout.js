'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import styles from '@/components/console/Console.module.css';

export default function AdminPrivacyLayout({ children }) {
  const pathname = usePathname();
  const { t } = useApp();

  const privacyAdminTabs = [
    { href: '/admin/privacy', label: t('adminPrivacy.navOverview') || 'Compliance Overview', icon: '📊', exact: true },
    { href: '/admin/privacy/data-inventory', label: t('adminPrivacy.navInventory') || 'Data Inventory', icon: '🗂️' },
    { href: '/admin/privacy/consents', label: t('adminPrivacy.navConsents') || 'Consent & Purposes', icon: '🔒' },
    { href: '/admin/privacy/requests', label: t('adminPrivacy.navRequests') || 'Rights Requests Queue', icon: '⚖️' },
    { href: '/admin/privacy/retention', label: t('adminPrivacy.navRetention') || 'Retention & Legal Holds', icon: '⏳' },
    { href: '/admin/privacy/processors', label: t('adminPrivacy.navProcessors') || 'Processors Registry', icon: '🏢' },
    { href: '/admin/privacy/incidents', label: t('adminPrivacy.navIncidents') || 'Incidents & Breaches', icon: '🚨' },
    { href: '/admin/privacy/audit', label: t('adminPrivacy.navAudit') || 'Privileged Audit Logs', icon: '🛡️' },
    { href: '/admin/privacy/policy', label: 'Policy Notice Versions', icon: '📜' },
  ];

  return (
    <div style={{ padding: '1.5rem', width: '100%' }}>
      {/* Secondary Admin Privacy Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '0.75rem',
        marginBottom: '1.5rem',
        borderBottom: '2px solid #e2e8f0',
      }}>
        {privacyAdminTabs.map((tab) => {
          const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.55rem 1rem',
                borderRadius: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                background: isActive ? '#0f172a' : '#f1f5f9',
                color: isActive ? '#ffffff' : '#475569',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
