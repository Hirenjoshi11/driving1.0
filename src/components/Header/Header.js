'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';
import { languages } from '@/lib/i18n';
import { IconLock, IconShield, IconUser } from '@/components/icons/Icons';
import styles from './Header.module.css';

export default function Header() {
  const router = useRouter();
  const { state, dispatch, t, localize } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const langRef = useRef(null);
  const langBtnRef = useRef(null);
  const langOptionRefs = useRef([]);
  const menuBtnRef = useRef(null);
  const mobileNavRef = useRef(null);

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error', e);
    }
    dispatch({ type: 'LOGOUT' });
    router.push('/login');
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open (FE-11)
  useEffect(() => {
    if (menuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [menuOpen]);

  // Handle Escape to close menus (FE-11, FE-12)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (langOpen) {
          setLangOpen(false);
          langBtnRef.current?.focus();
        } else if (menuOpen) {
          setMenuOpen(false);
          menuBtnRef.current?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen, langOpen]);

  // Mobile drawer focus trap (FE-11)
  useEffect(() => {
    if (menuOpen && mobileNavRef.current) {
      const focusable = mobileNavRef.current.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length > 0) {
        focusable[0].focus();
      }

      const handleTrap = (e) => {
        if (e.key !== 'Tab') return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      const navEl = mobileNavRef.current;
      navEl.addEventListener('keydown', handleTrap);
      return () => navEl.removeEventListener('keydown', handleTrap);
    }
  }, [menuOpen]);

  // Auto focus active item when language menu opens (FE-12)
  useEffect(() => {
    if (langOpen) {
      const activeIdx = languages.findIndex(l => l.code === state.language);
      const targetIdx = activeIdx >= 0 ? activeIdx : 0;
      setTimeout(() => {
        langOptionRefs.current[targetIdx]?.focus();
      }, 50);
    }
  }, [langOpen, state.language]);

  const handleLangKeyDown = (e, index) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (index + 1) % languages.length;
      langOptionRefs.current[next]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = (index - 1 + languages.length) % languages.length;
      langOptionRefs.current[prev]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      langOptionRefs.current[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      langOptionRefs.current[languages.length - 1]?.focus();
    }
  };

  // Full set of links for Mobile Navigation Drawer
  const navLinks = [
    { href: '/apply', label: t('nav.services') || 'Services' },
    { href: '/#how-it-works', label: t('nav.howItWorks') || 'How It Works' },
    { href: '/documents', label: t('nav.documents') || 'Documents' },
    { href: '/track', label: t('nav.trackApplication') || 'Track Application' },
    { href: '/help', label: t('nav.help') || 'Help' },
    { href: '/privacy', label: t('footer.privacyPolicy'), Icon: IconLock },
    ...(state.isAuthenticated ? [
      {
        href: state.user?.role === 'admin' || state.user?.role === 'operator' ? '/admin' : '/dashboard',
        label: state.user?.role === 'admin' || state.user?.role === 'operator'
          ? t('nav.admin')
          : t('nav.dashboard'),
        Icon: state.user?.role === 'admin' || state.user?.role === 'operator' ? IconShield : IconUser,
      }
    ] : []),
  ];

  // Curated, compact set of primary links for desktop center nav pill
  const desktopNavLinks = [
    { href: '/apply', label: t('nav.services') || 'Services' },
    { href: '/track', label: t('nav.trackApplication') || 'Track' },
    { href: '/documents', label: t('nav.documents') || 'Documents' },
    { href: '/#how-it-works', label: t('nav.howItWorks') || 'How It Works' },
    { href: '/help', label: t('nav.help') || 'Help' },
  ];

  const currentLang = languages.find(l => l.code === state.language) || languages[0];

  const handleLanguageChange = (code) => {
    dispatch({ type: 'SET_LANGUAGE', payload: code });
    setLangOpen(false);
    langBtnRef.current?.focus();
  };

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.headerInner}>
        {/* Brand Logo & Citizen Portal */}
        <Link href="/" className={styles.logo} aria-label="Driving License Form Home">
          <img
            src="/logo-website.png"
            alt={t('common.appName') || 'Driving License Form'}
            className={styles.desktopLogo}
          />
          <div className={styles.mobileLogoGroup}>
            <img
              src="/logo-app.png"
              alt=""
              className={styles.mobileLogo}
            />
            <div className={styles.logoTextGroup}>
              <span className={styles.logoTitle}>{t('common.appName') || 'Driving License Form'}</span>
              <span className={styles.logoSubtitle}>{t('common.portalBadge') || 'Citizen Services'}</span>
            </div>
          </div>
        </Link>

        {/* Center / Right Desktop Navigation */}
        <nav className={styles.desktopNav} aria-label="Primary navigation">
          {desktopNavLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className={styles.actions}>
          {/* Language Switcher (FE-03, FE-12) */}
          <div className={styles.langWrapper} ref={langRef}>
            <button
              ref={langBtnRef}
              id="lang-select-button"
              className={styles.langBtn}
              onClick={() => setLangOpen(!langOpen)}
              aria-label="Change language"
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              aria-controls="lang-select-listbox"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <span className={styles.langLabel}>{currentLang.nativeName}</span>
              <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor"><path d="M6 8L1 3h10z"/></svg>
            </button>
            {langOpen && (
              <div
                id="lang-select-listbox"
                role="listbox"
                aria-labelledby="lang-select-button"
                className={styles.langDropdown}
              >
                {languages.map((lang, index) => (
                  <button
                    key={lang.code}
                    ref={(el) => (langOptionRefs.current[index] = el)}
                    type="button"
                    role="option"
                    aria-selected={state.language === lang.code}
                    className={`${styles.langOption} ${state.language === lang.code ? styles.langActive : ''}`}
                    onClick={() => handleLanguageChange(lang.code)}
                    onKeyDown={(e) => handleLangKeyDown(e, index)}
                  >
                    <span>{lang.nativeName}</span>
                    <span className={styles.langName}>{lang.name}</span>
                    {state.language === lang.code && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#159447" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Unified Login / Logout Button with Round Logo Icon */}
          {state.isAuthenticated ? (
            <button
              type="button"
              onClick={handleSignOut}
              className={`${styles.authBtn} ${styles.authBtnLogout}`}
              id="header-auth-btn"
              title={`${t('nav.logout') || 'Logout'} (${state.user?.name || 'User'})`}
              aria-label={t('nav.logout') || 'Logout'}
            >
              <span className={`${styles.authRoundIcon} ${styles.authRoundIconLoggedIn}`}>
                {state.user?.name ? state.user.name.charAt(0).toUpperCase() : <IconUser size={15} />}
              </span>
              <span className={styles.authBtnLabel}>
                {t('nav.logout') || 'Logout'}
              </span>
            </button>
          ) : (
            <Link
              href="/login"
              className={styles.authBtn}
              id="header-auth-btn"
              title={t('nav.login') || 'Login'}
              aria-label={t('nav.login') || 'Login'}
            >
              <span className={styles.authRoundIcon}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <span className={styles.authBtnLabel}>
                {t('nav.login') || 'Login'}
              </span>
            </Link>
          )}

          {/* Mobile Hamburger Toggle (Right Aligned) */}
          <button
            ref={menuBtnRef}
            className={styles.menuToggle}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-drawer"
          >
            <span className={`${styles.hamburger} ${menuOpen ? styles.open : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {menuOpen && (
        <>
          <div className={styles.overlay} onClick={() => setMenuOpen(false)} />
          <nav id="mobile-nav-drawer" ref={mobileNavRef} className={styles.mobileNav} aria-label={t('nav.menu') || 'Mobile Navigation'}>
            <div className={styles.mobileNavLinks}>
              {/* Brand Header in Drawer */}
              <div className={styles.mobileDrawerBrand}>
                <img
                  src="/logo-website.png"
                  alt={t('common.appName') || 'Driving License Form'}
                  className={styles.drawerLogo}
                />
              </div>
              {/* Language picker in mobile drawer */}
              <div style={{ display: 'flex', gap: '8px', padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--color-border-light)' }}>
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      handleLanguageChange(lang.code);
                      setMenuOpen(false);
                    }}
                    style={{
                      flex: 1,
                      padding: '6px 8px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: state.language === lang.code ? 700 : 500,
                      background: state.language === lang.code ? 'var(--color-primary-light)' : 'var(--color-bg)',
                      color: state.language === lang.code ? 'var(--color-primary-dark)' : 'var(--color-text-secondary)',
                      border: state.language === lang.code ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                      cursor: 'pointer',
                    }}
                  >
                    {lang.nativeName}
                  </button>
                ))}
              </div>

              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${styles.mobileLink} ${pathname === link.href ? styles.active : ''}`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Unified Mobile Login / Logout Button */}
              {state.isAuthenticated ? (
                <>
                  <Link
                    href={state.user?.role === 'admin' || state.user?.role === 'operator' ? '/admin' : '/dashboard'}
                    className={styles.mobileLink}
                    onClick={() => setMenuOpen(false)}
                  >
                    {state.user?.role === 'admin' || state.user?.role === 'operator' ? (
                      <><IconShield size={16} /> {t('nav.admin')}</>
                    ) : (
                      <><IconUser size={16} /> {t('nav.dashboard')}</>
                    )}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      handleSignOut();
                    }}
                    className={`${styles.authBtn} ${styles.authBtnLogout} ${styles.mobileAuthBtn}`}
                    title={`${t('nav.logout') || 'Logout'} (${state.user?.name || 'User'})`}
                  >
                    <span className={`${styles.authRoundIcon} ${styles.authRoundIconLoggedIn}`}>
                      {state.user?.name ? state.user.name.charAt(0).toUpperCase() : <IconUser size={15} />}
                    </span>
                    <span className={styles.authBtnLabel}>
                      {t('nav.logout') || 'Logout'} ({state.user?.name || 'User'})
                    </span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className={`${styles.authBtn} ${styles.mobileAuthBtn}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className={styles.authRoundIcon}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <span className={styles.authBtnLabel}>
                    {t('nav.login') || 'Login'}
                  </span>
                </Link>
              )}
            </div>
          </nav>
        </>
      )}

      {/* Active State Context Bar if in /apply */}
      {state.selectedState && pathname.startsWith('/apply/') && (
        <div className={styles.stateBar}>
          <div className={styles.stateBarInner}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>Applying in <strong>{localize(state.selectedState, 'name')}</strong></span>
            <button
              className={styles.changeState}
              onClick={() => {
                dispatch({ type: 'SET_STATE', payload: null });
                dispatch({ type: 'SET_SERVICE', payload: null });
              }}
            >
              {t('common.edit') || 'Change'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
