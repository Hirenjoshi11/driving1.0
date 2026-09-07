'use client';
import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';
import {
  IconBook,
  IconLicence,
  IconRenew,
  IconDuplicate,
  IconCar,
  IconPin,
  IconEdit,
  IconGlobe,
  IconFile,
  IconClock,
  IconArrowRight,
  IconChevronRight,
} from '@/components/icons/Icons';
import styles from '@/app/apply/[stateSlug]/services.module.css';

/* One drawn mark per service. New slugs fall back to IconFile rather
   than shipping an empty box. */
const SERVICE_ICONS = {
  'learner-licence': IconBook,
  'new-driving-licence': IconLicence,
  'renewal': IconRenew,
  'duplicate': IconDuplicate,
  'add-vehicle-class': IconCar,
  'change-address': IconPin,
  'change-name': IconEdit,
  'international-permit': IconGlobe,
};

export default function ServiceSelectionView({ state, services = [] }) {
  const { t, localize } = useApp();

  const stateName = localize(state, 'name') || state.name;

  return (
    <div className={styles.servicePage}>
      <div className="container">
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/apply">{t('common.selectState') || 'States'}</Link>
          <IconChevronRight size={14} aria-hidden="true" />
          <span aria-current="page">{stateName}</span>
        </nav>

        <div className={styles.header}>
          <h1 className={styles.title}>{t('common.selectService') || 'Select Driving Licence Service'}</h1>
          <p className={styles.subtitle}>
            {t('home.servicesSubtitle') || `Select the licence service you need. All services shown below are actively supported in ${stateName}.`}
          </p>
        </div>

        <div className={styles.serviceGrid}>
          {services.map((svc, i) => {
            const svcName = localize(svc, 'name') || svc.name;
            const svcDesc = localize(svc, 'description') || svc.description;
            const ServiceIcon = SERVICE_ICONS[svc.slug] || IconFile;
            const hasFee = svc.total_payable !== null && svc.total_payable !== undefined;

            return (
              <Link
                key={svc.id}
                href={`/apply/${state.slug}/${svc.slug}`}
                className={styles.serviceCard}
                style={{ '--card-index': i }}
              >
                <div className={styles.serviceTop}>
                  <span className={styles.serviceIcon}>
                    <ServiceIcon size={24} />
                  </span>
                  <div className={styles.serviceInfo}>
                    <h2 className={styles.serviceName}>{svcName}</h2>
                    <p className={styles.serviceDesc}>{svcDesc}</p>
                  </div>
                </div>

                {svc.requires_driving_test === 1 && (
                  <span className={styles.serviceTag}>
                    {t('form.drivingTest') || 'Requires Driving Test'}
                  </span>
                )}

                <div className={styles.serviceBottom}>
                  <div className={styles.serviceMeta}>
                    {svc.estimated_days && (
                      <span className={styles.serviceTime}>
                        <IconClock size={14} aria-hidden="true" />
                        ~{svc.estimated_days} {t('common.days') || 'days'}
                      </span>
                    )}
                    {hasFee && (
                      <span className={styles.serviceFee}>
                        <span className={styles.serviceFeeLabel}>
                          {t('common.totalPayable') || 'Total Payable'}
                        </span>
                        <span className={styles.serviceFeeAmount}>
                          ₹{svc.total_payable.toLocaleString('en-IN')}
                        </span>
                      </span>
                    )}
                  </div>
                  <span className={styles.serviceArrow}>
                    <IconArrowRight size={18} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
