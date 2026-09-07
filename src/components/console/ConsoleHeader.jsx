'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import styles from './Console.module.css';

export default function ConsoleHeader({ user, density, onDensityChange }) {
  const pathname = usePathname();
  const router = useRouter();
  const { state, dispatch, t } = useApp();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    dispatch({ type: 'LOGOUT' });
    router.push('/login');
  };

  const handleLanguageChange = (e) => {
    dispatch({ type: 'SET_LANGUAGE', payload: e.target.value });
  };

  // Generate breadcrumbs from path
  const pathParts = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathParts.map((part, index) => {
    const url = '/' + pathParts.slice(0, index + 1).join('/');
    const isLast = index === pathParts.length - 1;
    let label = part.charAt(0).toUpperCase() + part.slice(1);
    
    // Map common route segments to i18n
    if (part === 'admin') label = t('staff.navAdmin') || 'Admin';
    if (part === 'operator') label = t('staff.navOperator') || 'Operator';
    if (part === 'queue') label = t('staff.navQueue') || 'Queue';
    if (part === 'applications') label = t('staff.navApplications') || 'Applications';
    if (part === 'documents') label = t('staff.navDocuments') || 'Documents';
    if (part === 'operators') label = t('staff.navOperators') || 'Operators';
    if (part === 'fees') label = t('staff.navFees') || 'Fees';
    if (part === 'locations') label = t('staff.navLocations') || 'Locations';
    if (part === 'audit') label = t('staff.navAudit') || 'Audit';
    if (part === 'settings') label = t('staff.navSettings') || 'Settings';
    if (part === 'history') label = t('staff.navHistory') || 'History';

    return { url, label, isLast };
  });

  return (
    <header className={styles.header}>
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
        <span>DLF</span>
        {breadcrumbs.map((bc) => (
          <span key={bc.url} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span className={styles.breadcrumbSeparator} aria-hidden="true">/</span>
            {bc.isLast ? (
              <span className={styles.breadcrumbCurrent} aria-current="page">{bc.label}</span>
            ) : (
              <a href={bc.url} style={{ color: 'inherit', textDecoration: 'none' }}>{bc.label}</a>
            )}
          </span>
        ))}
      </nav>

      {/* Actions */}
      <div className={styles.headerActions}>
        {/* Density Toggle */}
        <div className={styles.densityToggle} role="group" aria-label={t('staff.density') || 'Density'}>
          <button
            type="button"
            className={`${styles.densityBtn} ${density === 'comfortable' ? styles.densityBtnActive : ''}`}
            onClick={() => onDensityChange('comfortable')}
            aria-pressed={density === 'comfortable'}
            title={t('staff.densityComfortable') || 'Comfortable density'}
          >
            {t('staff.densityComfortableShort') || 'Normal'}
          </button>
          <button
            type="button"
            className={`${styles.densityBtn} ${density === 'compact' ? styles.densityBtnActive : ''}`}
            onClick={() => onDensityChange('compact')}
            aria-pressed={density === 'compact'}
            title={t('staff.densityCompact') || 'Compact density'}
          >
            {t('staff.densityCompactShort') || 'Dense'}
          </button>
        </div>

        {/* Language Selector */}
        <select
          aria-label={t('nav.language') || 'Language'}
          className={styles.langSelect}
          value={state.language}
          onChange={handleLanguageChange}
        >
          <option value="en">English (EN)</option>
          <option value="gu">ગુજરાતી (GU)</option>
          <option value="hi">हिन्दी (HI)</option>
        </select>

        {/* Sign Out */}
        <button
          type="button"
          className={styles.logoutBtn}
          onClick={handleLogout}
          aria-label={t('nav.logout') || 'Sign Out'}
        >
          <span aria-hidden="true">🚪</span>
          <span>{t('nav.logout') || 'Sign Out'}</span>
        </button>
      </div>
    </header>
  );
}
