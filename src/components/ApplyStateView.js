'use client';
import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';
import { IconArrowRight } from '@/components/icons/Icons';
import styles from '@/app/apply/apply.module.css';

export default function ApplyStateView({ states = [] }) {
  const { t, localize } = useApp();

  return (
    <div className={styles.applyPage}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.title}>{t('common.selectState') || 'Select State'}</h1>
          <p className={styles.subtitle}>
            {t('home.statesSubtitle') || "Choose the state where you want to apply for your driving licence. We'll show you the relevant RTOs, documents and services."}
          </p>
        </div>

        <div className={styles.stateGrid}>
          {states.map((s, i) => (
            <Link
              key={s.id}
              href={`/apply/${s.slug}`}
              className={styles.stateCard}
              style={{ '--card-index': i }}
            >
              {/* The RTO code is the state's real mark — it opens every
                  number plate registered there, so it identifies the
                  jurisdiction far better than a decorative glyph. */}
              <span className={styles.stateCodeMark} aria-hidden="true">
                {s.code}
              </span>
              <h2 className={styles.stateName}>{localize(s, 'name') || s.name}</h2>
              <p className={styles.stateDesc}>{localize(s, 'description') || s.description}</p>
              <span className={styles.stateArrow}>
                <span>{t('common.continue') || 'Select'}</span>
                <IconArrowRight size={16} className={styles.stateArrowIcon} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
