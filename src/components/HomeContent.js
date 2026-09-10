'use client';
import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';
import LanguagePills from '@/components/LanguagePills';
import HomeStateSection from '@/components/HomeStateSection';
import {
  IconBook,
  IconLicence,
  IconArrowRight,
} from '@/components/icons/Icons';
import styles from '@/app/page.module.css';

export default function HomeContent({ services = [], states = [] }) {
  const { t, localize } = useApp();

  const timelineSteps = [
    { num: '01', title: t('home.step1'), desc: t('home.step1Desc') },
    { num: '02', title: t('home.step2'), desc: t('home.step2Desc') },
    { num: '03', title: t('home.step3'), desc: t('home.step3Desc') },
    { num: '04', title: t('home.step4'), desc: t('home.step4Desc') },
    { num: '05', title: t('home.step5'), desc: t('home.step5Desc') },
    { num: '06', title: t('home.step6'), desc: t('home.step6Desc') },
  ];

  return (
    <div className={styles.page}>
      {/* ============================================================
          1. HERO
          ============================================================ */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroTextOnly}>
            <h1 className={styles.heroTitle}>
              {t('home.heroTitle1') || 'Your Driving Licence'}{' '}
              <span className={styles.heroTitleAccent}>
                {t('home.heroTitle2') || 'Application, Made Simple.'}
              </span>
            </h1>

            <p className={styles.heroSubtitle}>
              {t('home.heroSubtitle') || 'Prepare your driving licence application with guided steps, document assistance, and a completely transparent process.'}
            </p>


            <div className={styles.heroActions}>
              <Link href="/apply" className={`btn btn-primary btn-lg ${styles.primaryCta}`}>
                <span>{t('home.startCta') || 'Start Application'}</span>
                <IconArrowRight size={18} className={styles.primaryCtaArrow} />
              </Link>
              <a href="#how-it-works" className={`btn btn-outline btn-lg ${styles.secondaryCta}`}>
                <span>{t('home.seeHowItWorks') || 'See How It Works'}</span>
              </a>
            </div>
          </div>
        </div>
      </section>


      {/* ============================================================
          2. SERVICES
          ============================================================ */}
      <section id="services" className={styles.servicesSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {t('home.servicesTitle') || 'What do you need help with?'}
            </h2>
            <p className={styles.sectionSubtitle}>
              {t('home.servicesSubtitle') || 'Choose your licence service to begin your guided application.'}
            </p>
          </div>

          <div className={styles.servicesGrid}>
            {services.map((service, index) => {
              const serviceName = localize(service, 'name') || service.name;
              const serviceDesc = localize(service, 'description') || service.description;
              const isLearner = service.slug === 'learner-licence';
              const ServiceIcon = isLearner ? IconBook : IconLicence;
              const badgeText = isLearner
                ? (t('home.learnerLicenceTag') || 'Step 1 • First Time Drivers')
                : (t('home.newDrivingLicenceTag') || 'Step 2 • After Learner Licence');

              return (
                <Link
                  key={service.id}
                  href={`/apply/start/${service.slug}`}
                  className={styles.serviceCard}
                  style={{ '--card-index': index }}
                  aria-label={`${serviceName} — ${t('home.startService') || 'Start Application'}`}
                >
                  <div className={styles.serviceCardMain}>
                    <div className={styles.serviceCardTop}>
                      <span className={styles.serviceCardIcon}>
                        <ServiceIcon size={26} />
                      </span>
                      <span className={styles.serviceCardCornerArrow}>
                        <IconArrowRight size={18} />
                      </span>
                    </div>

                    <div className={styles.serviceCardBadge}>
                      {badgeText}
                    </div>

                    <h3 className={styles.serviceCardTitle}>{serviceName}</h3>
                    <p className={styles.serviceCardDesc}>{serviceDesc}</p>
                  </div>

                  <div className={styles.serviceCardAction}>
                    <span className={styles.serviceCardButton}>
                      <span>{t('home.startService') || 'Start Application'}</span>
                      <IconArrowRight size={17} className={styles.serviceCardButtonArrow} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          3. SUPPORTED STATES
          ============================================================ */}
      {states && states.length > 0 && (
        <section id="states" className={styles.statesSection}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                {t('home.statesTitle') || 'We Provide Our Services Across 3 States'}
              </h2>
              <p className={styles.sectionSubtitle}>
                {t('home.statesSubtitle') || 'Full digital application assistance, document guidance, and RTO jurisdictional support for Gujarat, Rajasthan, and Uttar Pradesh.'}
              </p>
            </div>
            <HomeStateSection states={states} />
          </div>
        </section>
      )}

      {/* ============================================================
          4. HOW IT WORKS
          ============================================================ */}
      <section id="how-it-works" className={styles.howSection}>
        <div className="container">
          <div className={styles.howHeader}>
            <h2 className={styles.howTitle}>
              {t('home.howItWorksTitle') || 'How It Works'}
            </h2>
            <p className={styles.howSubtitle}>
              {t('home.howItWorksSubtitle') || 'A simple, guided journey from choosing your service to tracking your application.'}
            </p>
          </div>

          <div className={styles.timelineWrap}>
            <div className={styles.timelineTrackLine} aria-hidden="true" />
            <ol className={styles.timelineGrid}>
              {timelineSteps.map((step, index) => (
                <li
                  key={step.num}
                  className={styles.timelineStep}
                  style={{ '--step-index': index }}
                >
                  <div className={styles.stepNodeWrap}>
                    <div className={styles.stepNumberBadge}>
                      <span>{step.num}</span>
                    </div>
                  </div>
                  <div className={styles.stepContent}>
                    <h3 className={styles.stepTitle}>{step.title}</h3>
                    <p className={styles.stepDesc}>{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ============================================================
          5. DOCUMENT CONFIDENCE
          ============================================================ */}
      <section id="documents-confidence" className={styles.docConfidenceSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {t('home.docConfidenceTitle') || 'Document Confidence Before You Begin'}
            </h2>
            <p className={styles.sectionSubtitle}>
              {t('home.docConfidenceSubtitle') || 'Never guess what paperwork is required. Clear checklists with accepted digital formats prevent RTO rejections.'}
            </p>
          </div>

          <div className={styles.docConfidenceGrid}>
            <div className={styles.docConfidenceCard}>
              <div className={styles.docCardIconWrap}>📋</div>
              <h3 className={styles.docConfidenceCardTitle}>
                {t('home.docCard1Title') || 'Pre-Verified Checklists'}
              </h3>
              <p className={styles.docConfidenceCardDesc}>
                {t('home.docCard1Desc') || 'Know exactly which age, address, and medical documents your specific state RTO mandates before starting.'}
              </p>
            </div>
            <div className={styles.docConfidenceCard}>
              <div className={styles.docCardIconWrap}>🔍</div>
              <h3 className={styles.docConfidenceCardTitle}>
                {t('home.docCard2Title') || 'Digital Format Checks'}
              </h3>
              <p className={styles.docConfidenceCardDesc}>
                {t('home.docCard2Desc') || 'Upload PDF, JPG, or PNG under 5MB with instant resolution checks so applications never get rejected for file errors.'}
              </p>
            </div>
            <div className={styles.docConfidenceCard}>
              <div className={styles.docCardIconWrap}>🛡️</div>
              <h3 className={styles.docConfidenceCardTitle}>
                {t('home.docCard3Title') || 'Direct Authority Guidance'}
              </h3>
              <p className={styles.docConfidenceCardDesc}>
                {t('home.docCard3Desc') || 'Clear instructions on where and how to obtain required proofs from UIDAI, hospitals, or local authorities.'}
              </p>
            </div>
          </div>

          <div className={styles.docConfidenceCta}>
            <Link href="/documents" className="btn btn-secondary">
              <span>{t('home.viewDocChecklist') || 'View Complete Document Checklist'}</span>
              <IconArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          6. TRACKING PREVIEW
          ============================================================ */}
      <section id="tracking-preview" className={styles.trackingPreviewSection}>
        <div className="container">
          <div className={styles.trackingPreviewBox}>
            <div className={styles.trackingPreviewInfo}>
              <span className="badge badge-info">{t('home.trackingBadge') || 'Real-Time Transparency'}</span>
              <h2 className={styles.trackingPreviewTitle}>
                {t('home.trackingTitle') || 'Track Every Step of Your Application'}
              </h2>
              <p className={styles.trackingPreviewDesc}>
                {t('home.trackingDesc') || 'From initial submission and statutory payment to RTO scrutiny and smart card dispatch, monitor your exact milestone status 24/7.'}
              </p>
              <div className={styles.trackingActionWrap}>
                <Link href="/track" className="btn btn-primary">
                  <span>{t('home.trackNowCta') || 'Track Application Status'}</span>
                  <IconArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className={styles.trackingMockCard}>
              <div className={styles.mockHeader}>
                <span className={styles.mockId}>DL-2026-GJ-09418</span>
                <span className="badge badge-success">{t('status.under_review') || 'Under Review'}</span>
              </div>
              <div className={styles.mockService}>Learner Licence • GJ-01 Ahmedabad RTO</div>
              <div className={styles.mockSteps}>
                <div className={`${styles.mockStep} ${styles.mockStepDone}`}>
                  <span className={styles.mockStepDot}>✓</span>
                  <span>{t('timeline.submitted') || 'Form Submitted'}</span>
                </div>
                <div className={`${styles.mockStep} ${styles.mockStepDone}`}>
                  <span className={styles.mockStepDot}>✓</span>
                  <span>{t('timeline.paid') || 'Payment Verified'}</span>
                </div>
                <div className={`${styles.mockStep} ${styles.mockStepActive}`}>
                  <span className={styles.mockStepDot}>●</span>
                  <span>{t('timeline.under_review') || 'RTO Document Scrutiny'}</span>
                </div>
                <div className={styles.mockStep}>
                  <span className={styles.mockStepDot}>○</span>
                  <span>{t('timeline.completed') || 'Licence Issuance & Dispatch'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          7. LANGUAGE SUPPORT
          ============================================================ */}
      <section className={styles.langSection}>
        <div className="container">
          <h2 className={styles.langTitle}>
            {t('home.langTitle') || "Use the Language You're Comfortable With"}
          </h2>
          <p className={styles.langSubtitle}>
            {t('home.langSubtitle') || 'Switch between English, Hindi, and Gujarati anytime.'}
          </p>

          <LanguagePills />
        </div>
      </section>

      {/* ============================================================
          8. FINAL CTA
          ============================================================ */}
      <section className={styles.finalCtaSection}>
        <div className="container">
          <div className={styles.finalCtaCard}>
            <h2 className={styles.finalCtaTitle}>
              {t('home.finalCtaTitle') || 'Ready to Begin Your Driving Licence Application?'}
            </h2>
            <p className={styles.finalCtaSubtitle}>
              {t('home.finalCtaSubtitle') || 'Join thousands of citizens who prepare their licence paperwork without hassle, agent commissions, or confusion.'}
            </p>
            <div className={styles.finalCtaActions}>
              <Link href="/apply" className="btn btn-primary btn-lg">
                <span>{t('home.startCta') || 'Start Application'}</span>
                <IconArrowRight size={18} />
              </Link>
              <Link href="/help" className="btn btn-outline btn-lg">
                <span>{t('nav.help') || 'Get Help & FAQs'}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
