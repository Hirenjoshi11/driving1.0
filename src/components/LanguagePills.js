'use client';
import { useApp } from '@/contexts/AppContext';
import { IconCheck } from '@/components/icons/Icons';
import styles from '@/app/page.module.css';

export default function LanguagePills() {
  const { state: appState, dispatch } = useApp();

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  ];

  const handleLanguageChange = (code) => {
    dispatch({ type: 'SET_LANGUAGE', payload: code });
  };

  return (
    <div className={styles.langPills}>
      {languages.map((lang) => {
        const isActive = appState.language === lang.code;
        return (
          <button
            key={lang.code}
            type="button"
            className={`${styles.langPill} ${isActive ? styles.langPillActive : ''}`}
            onClick={() => handleLanguageChange(lang.code)}
            aria-pressed={isActive}
            aria-label={`Switch language to ${lang.name} (${lang.nativeName})`}
          >
            {isActive && <IconCheck size={16} />}
            {lang.nativeName} ({lang.name})
          </button>
        );
      })}
    </div>
  );
}
