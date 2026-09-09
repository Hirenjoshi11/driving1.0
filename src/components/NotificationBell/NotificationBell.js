'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import styles from './NotificationBell.module.css';

const POLL_MS = 30000;

export default function NotificationBell() {
  const { state, t } = useApp();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  const isCitizen = state.isAuthenticated && (!state.user?.role || state.user.role === 'citizen');

  const load = useCallback(() => {
    fetch('/api/notifications')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setItems(d.notifications || []);
          setUnread(d.unread || 0);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isCitizen) return undefined;
    load();
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, [isCitizen, load]);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const markAllRead = () => {
    fetch('/api/notifications/read', { method: 'POST' })
      .then((r) => (r.ok ? r.json() : null))
      .then(() => {
        setUnread(0);
        setItems((prev) => prev.map((n) => ({ ...n, read_at: n.read_at || 'read' })));
      })
      .catch(() => {});
  };

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) markAllRead();
  };

  if (!isCitizen) return null;

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        type="button"
        className={styles.bellBtn}
        onClick={toggle}
        aria-label={t('notifications.title') || 'Notifications'}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && <span className={styles.badge}>{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div className={styles.dropdown} role="region" aria-label={t('notifications.title') || 'Notifications'}>
          <div className={styles.head}>
            <span className={styles.headTitle}>{t('notifications.title') || 'Notifications'}</span>
          </div>
          {items.length === 0 ? (
            <p className={styles.empty}>{t('notifications.empty') || 'You have no notifications yet.'}</p>
          ) : (
            <ul className={styles.list}>
              {items.map((n) => (
                <li key={n.id} className={`${styles.item} ${!n.read_at ? styles.itemUnread : ''}`}>
                  <span className={styles.itemTitle}>{t(n.title_key) || n.title_key}</span>
                  <span className={styles.itemBody}>{t(n.body_key, n.params || {}) || n.body_key}</span>
                  <span className={styles.itemTime}>
                    {new Date(n.created_at + 'Z').toLocaleString(
                      state.language === 'en' ? 'en-IN' : state.language === 'gu' ? 'gu-IN' : 'hi-IN',
                      { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
