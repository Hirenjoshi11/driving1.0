'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { maskMobile } from '@/lib/audit';
import ConsoleNav from './ConsoleNav';
import ConsoleHeader from './ConsoleHeader';
import styles from './Console.module.css';

export default function ConsoleShell({ children, role: forcedRole = null }) {
  const { t } = useApp();
  const [user, setUser] = useState(null);
  const [density, setDensity] = useState('comfortable');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Load density preference from localStorage
  useEffect(() => {
    try {
      const savedDensity = localStorage.getItem('dlf_console_density');
      if (savedDensity === 'compact' || savedDensity === 'comfortable') {
        setDensity(savedDensity);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleDensityChange = (newDensity) => {
    setDensity(newDensity);
    try {
      localStorage.setItem('dlf_console_density', newDensity);
    } catch {
      // ignore
    }
  };

  // Fetch authenticated session user
  useEffect(() => {
    let isMounted = true;
    async function fetchMe() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data?.user) {
            setUser(data.user);
          }
        }
      } catch {
        // ignore
      }
    }
    fetchMe();
    return () => { isMounted = false; };
  }, []);

  const activeRole = forcedRole || user?.role || 'operator';

  return (
    <div className={`${styles.consoleRoot} ${styles[density]}`}>
      {/* WCAG 2.2 AA Skip Link */}
      <a href="#main-content" className={styles.skipLink}>
        {t('staff.skipToContent') || 'Skip to main content'}
      </a>

      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${isMobileOpen ? styles.sidebarOpen : ''}`}
        aria-label="Staff Administration Sidebar"
      >
        {/* Brand Banner */}
        <div className={styles.brand}>
          <div className={styles.brandLogo} aria-hidden="true">
            DLF
          </div>
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>
              {activeRole === 'admin'
                ? (t('staff.adminPortalTitle') || 'State Admin Console')
                : (t('staff.operatorPortalTitle') || 'RTO Workbench')}
            </span>
            <span
              className={`${styles.brandRole} ${
                activeRole === 'admin' ? styles.roleAdmin : styles.roleOperator
              }`}
            >
              {activeRole === 'admin'
                ? (t('staff.roleAdmin') || 'State Authority')
                : (t('staff.roleOperator') || 'RTO Clerk')}
            </span>
          </div>
        </div>

        {/* Dynamic Navigation */}
        <ConsoleNav role={activeRole} onNavigate={() => setIsMobileOpen(false)} />

        {/* User Card */}
        <div className={styles.sidebarFooter}>
          <div className={styles.userCard}>
            <div className={styles.userAvatar} aria-hidden="true">
              {activeRole === 'admin' ? 'ADM' : 'OPR'}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>
                {user?.phone ? maskMobile(user.phone) : 'Staff User'}
              </span>
              <span className={styles.userRoleText}>
                ID #{user?.userId || '—'} • {activeRole.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Working Surface */}
      <div className={styles.mainContainer}>
        <ConsoleHeader
          user={user}
          density={density}
          onDensityChange={handleDensityChange}
        />

        <main id="main-content" tabIndex="-1" className={styles.contentArea}>
          {children}
        </main>
      </div>
    </div>
  );
}
