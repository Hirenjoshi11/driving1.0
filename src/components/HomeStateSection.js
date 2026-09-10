'use client';
import { useApp } from '@/contexts/AppContext';
import { IconCheck } from '@/components/icons/Icons';
import styles from '@/app/page.module.css';

export default function HomeStateSection({ states = [] }) {
  const { localize, language } = useApp();

  return (
    <div className={styles.statesShowcaseWrap}>
      <div className={styles.statesShowcaseGrid}>
        {states.map((st) => {
          const stateName = localize ? (localize(st, 'name') || st.name) : st.name;
          const nativeName = language === 'gu' ? st.name_gu : language === 'hi' ? st.name_hi : (st.name_gu || st.name_hi);

          return (
            <div key={st.slug} className={styles.stateShowcaseCard}>
              <div className={styles.stateShowcaseHeader}>
                <span className={styles.stateCodeBadge}>{st.code}</span>
                <span className={styles.stateActiveBadge}>
                  <span className={styles.stateActiveDot} />
                  <span>Service Active</span>
                </span>
              </div>

              <div className={styles.stateShowcaseBody}>
                <div className={styles.stateNameRow}>
                  <h3 className={styles.stateShowcaseName}>{stateName}</h3>
                  {nativeName && nativeName !== stateName && (
                    <span className={styles.stateShowcaseNative}>({nativeName})</span>
                  )}
                </div>
                
                <p className={styles.stateShowcaseDesc}>
                  {localize ? (localize(st, 'description') || st.description) : st.description}
                </p>
              </div>

              <div className={styles.stateShowcaseFooter}>
                <div className={styles.stateShowcaseFeature}>
                  <IconCheck size={14} className={styles.stateCheckIcon} />
                  <span>{st.district_count ? `${st.district_count}+ Districts & RTOs` : 'Statewide RTOs'}</span>
                </div>
                <div className={styles.stateShowcaseFeature}>
                  <IconCheck size={14} className={styles.stateCheckIcon} />
                  <span>Online Application Assistance</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

