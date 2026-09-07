'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';
import styles from '@/app/page.module.css';

export default function HomeStateSection({ states = [] }) {
  const { state: appState, dispatch, localize } = useApp();
  const [selectedSlug, setSelectedSlug] = useState(appState.selectedState?.slug || 'gujarat');

  const handleSelect = (st) => {
    setSelectedSlug(st.slug);
    dispatch({ type: 'SET_STATE', payload: st });
  };

  return (
    <div className={styles.statesHorizontalWrap}>
      <div className={styles.statesHorizontalGrid}>
        {states.map((st) => {
          const isSelected = selectedSlug === st.slug;
          const stateName = localize ? (localize(st, 'name') || st.name) : st.name;

          return (
            <Link
              key={st.slug}
              href={`/apply/${st.slug}`}
              className={`${styles.horizontalStateCard} ${isSelected ? styles.horizontalStateCardActive : ''}`}
              onClick={() => handleSelect(st)}
            >
              <span className={styles.horizontalStateName}>{stateName}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
