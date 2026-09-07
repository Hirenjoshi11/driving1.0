'use client';
import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';
import { IconPin, IconDocument, IconAlert } from '@/components/icons/Icons';
import styles from '@/app/documents/documents.module.css';

export default function DocumentsView({
  states = [],
  activeState,
  services = [],
  activeService,
  documents = [],
}) {
  const { t, localize } = useApp();

  const activeStateName = localize(activeState, 'name') || activeState?.name || 'State';
  const activeServiceName = localize(activeService, 'name') || activeService?.name || 'Service';

  return (
    <div className={styles.documentsPage}>
      <div className="container">
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>
            {t('documents.title') || 'Document Requirements Directory'}
          </h1>
          <p className={styles.heroDesc}>
            {t('documents.subtitle') || 'Official document checklists and acceptable specifications across all supported jurisdictions.'}
          </p>
        </div>

        {/* State & Service Selectors */}
        <div className={styles.controlsCard}>
          {/* State Tabs */}
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>
              {t('documents.selectState') || 'Select State / Jurisdiction:'}
            </label>
            <div className={styles.stateTabs}>
              {states.map((st) => {
                const stName = localize(st, 'name') || st.name;
                return (
                  <Link
                    key={st.id}
                    href={`/documents?state=${st.slug}${activeService ? `&service=${activeService.slug}` : ''}`}
                    className={`${styles.stateTab} ${st.id === activeState?.id ? styles.stateTabActive : ''}`}
                  >
                    <IconPin size={13} />
                    {stName} ({st.code})
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Service Links */}
          <div className={styles.controlGroup}>
            <label className={styles.controlLabel}>
              {t('documents.selectService') || 'Select Licence Service:'}
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {services.map((svc) => {
                const svcName = localize(svc, 'name') || svc.name;
                return (
                  <Link
                    key={svc.id}
                    href={`/documents?state=${activeState?.slug}&service=${svc.slug}`}
                    className={`${styles.serviceTab} ${svc.id === activeService?.id ? styles.serviceTabActive : ''}`}
                  >
                    {svcName}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className={styles.docsContainer}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text-dark)' }}>
              {t('documents.requirementsFor', { service: activeServiceName, state: activeStateName }) || `Required Documents for ${activeServiceName} (${activeStateName})`}
            </h2>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              {documents.length} {t('common.required') || 'required'}
            </span>
          </div>

          {documents.length > 0 ? (
            documents.map((doc) => {
              const docName = localize(doc, 'name') || doc.name;
              const docDesc = localize(doc, 'description') || doc.description;
              const docWhere = localize(doc, 'where_to_get') || doc.where_to_get || 'Authorized issuing department / UIDAI';

              return (
                <div key={doc.id} className={styles.docCard}>
                  <div className={styles.docCardHeader}>
                    <div className={styles.docTitle}>
                      <IconDocument size={16} />
                      {docName}
                    </div>
                    <span className={doc.is_required === 1 ? styles.badgeMandatory : styles.badgeConditional}>
                      {doc.is_required === 1 ? (t('documents.mandatory') || 'Mandatory') : (t('documents.conditional') || 'Conditional')}
                    </span>
                  </div>

                  <p className={styles.docDesc}>
                    {docDesc}
                  </p>

                  <div className={styles.docMetaGrid}>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>{t('documents.whereToGet') || 'Where to Obtain'}:</span>
                      <span className={styles.metaValue}>{docWhere}</span>
                    </div>

                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>{t('documents.acceptedFormats') || 'Accepted Formats & Size'}:</span>
                      <span className={styles.metaValue}>
                        PDF, JPG, PNG (Max {doc.max_size_mb || 2} MB)
                      </span>
                    </div>

                    {doc.condition_description && (
                      <div className={`${styles.metaItem} ${styles.metaItemFull}`}>
                        <span className={styles.metaLabel}>{t('common.conditional') || 'Condition for Requirement'}:</span>
                        <span className={`${styles.metaValue} ${styles.metaValueCondition}`}>
                          <IconAlert size={14} />
                          {doc.condition_description}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className={styles.emptyMessage}>
              {t('common.noData') || 'No document checklist found for this service.'}
            </p>
          )}

          {/* CTA Box */}
          {activeState && activeService && (
            <div className={styles.ctaCard}>
              <h3 className={styles.ctaTitle}>{t('common.startApplication') || 'Ready with your documents?'}</h3>
              <p className={styles.ctaDesc}>
                {t('home.heroSubtitle') || `Begin your online driving licence application for ${activeStateName} in under 5 minutes.`}
              </p>
              <Link
                href={`/apply/${activeState.slug}/${activeService.slug}`}
                className="btn btn-primary"
              >
                {t('home.startService') || `Apply for ${activeServiceName} Now →`}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
