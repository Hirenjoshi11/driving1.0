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

  // Handle Escape key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen]);

  // Lock body scroll on small screens when mobile drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isMobileOpen]);

  const activeRole = forcedRole || user?.role || 'operator';
  const rolePortalClass = activeRole === 'admin' ? styles.adminPortal : styles.operatorPortal;

  return (
    <div className={`${styles.consoleRoot} ${styles[density]} ${rolePortalClass}`}>
      {/* WCAG 2.2 AA Skip Link */}
      <a href="#main-content" className={styles.skipLink}>
        {t('staff.skipToContent') || 'Skip to main content'}
      </a>

      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className={styles.sidebarBackdrop}
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${isMobileOpen ? styles.sidebarOpen : ''}`}
        aria-label={activeRole === 'admin' ? 'State Administration Sidebar' : 'RTO Operator Sidebar'}
      >
        {/* Brand Banner */}
        <div className={styles.brand}>
          <div className={styles.brandLogo} aria-hidden="true">
            <img src="/logo-app.png" alt="Driving License Form" className={styles.brandLogoImg} />
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
          {/* Mobile Drawer Close Button */}
          <button
            type="button"
            className={styles.sidebarCloseBtn}
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close navigation menu"
          >
            ✕
          </button>
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
                {user?.phone ? maskMobile(user.phone) : (user?.name || (activeRole === 'admin' ? 'Admin Authority' : 'RTO Clerk'))}
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
          role={activeRole}
          density={density}
          onDensityChange={handleDensityChange}
          isMobileOpen={isMobileOpen}
          onToggleMobile={() => setIsMobileOpen(prev => !prev)}
        />

        <main id="main-content" tabIndex="-1" className={styles.contentArea}>
          {children}
        </main>
      </div>
    </div>
  );
}
