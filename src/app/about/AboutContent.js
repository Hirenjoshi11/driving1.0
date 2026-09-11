'use client';
import Link from 'next/link';
import { useApp } from '@/contexts/AppContext';
import {
  IconArrowRight,
  IconCheck,
  IconShield,
  IconDocument,
  IconSteps,
} from '@/components/icons/Icons';
import styles from './about.module.css';

export default function AboutContent() {
  const { t } = useApp();

  const socialPillars = [
    {
      num: '01',
      title: t('about.pillar1Title') || 'स्कूल किट और स्टेशनरी',
      desc: t('about.pillar1Desc') || 'ज़रूरतमंद बच्चों को स्कूल बैग, नोटबुक, पेन, पेंसिल और ज्यामिति बॉक्स जैसी आवश्यक अध्ययन सामग्री प्रदान करना।',
      icon: '🎒',
    },
    {
      num: '02',
      title: t('about.pillar2Title') || 'डिजिटल शिक्षा संसाधन',
      desc: t('about.pillar2Desc') || 'ग्रामीण और वंचित स्कूलों में कंप्यूटर, टैबलेट और डिजिटल शिक्षण सामग्री तक पहुंच सुनिश्चित करना।',
      icon: '💻',
    },
    {
      num: '03',
      title: t('about.pillar3Title') || 'सड़क सुरक्षा जागरूकता',
      desc: t('about.pillar3Desc') || 'युवा छात्रों और नए चालकों के लिए सड़क सुरक्षा, यातायात नियम और नागरिक जिम्मेदारी पर विशेष सत्र।',
      icon: '🚦',
    },
    {
      num: '04',
      title: t('about.pillar4Title') || '100% पारदर्शी निधि',
      desc: t('about.pillar4Desc') || 'कोई बिचौलिया नहीं — इस फंड का प्रत्येक रुपया सीधे जमीनी स्तर पर स्कूलों और बच्चों की ज़रूरतों में लगाया जाता है।',
      icon: '🤝',
    },
  ];

  const values = [
    {
      title: t('about.val1Title') || 'नागरिक सशक्तिकरण',
      desc: t('about.val1Desc') || 'सरकारी नियमों और दस्तावेज़ आवश्यकताओं की स्पष्ट जानकारी बिना किसी जटिलता के।',
      icon: <IconDocument size={24} />,
    },
    {
      title: t('about.val2Title') || 'डेटा गोपनीयता और सम्मान',
      desc: t('about.val2Desc') || 'DPDP अधिनियम 2023 के तहत सख्त डेटा सुरक्षा। आपका डेटा कभी किसी तीसरे पक्ष को नहीं बेचा जाता।',
      icon: <IconShield size={24} />,
    },
    {
      title: t('about.val3Title') || 'पारदर्शी शुल्क व्यवस्था',
      desc: t('about.val3Desc') || 'सरकारी शुल्क और सेवा शुल्क का स्पष्ट विभाजन ताकि हर नागरिक को पता हो कि वे क्या भुगतान कर रहे हैं।',
      icon: <IconSteps size={24} />,
    },
  ];

  return (
    <div className={styles.aboutPage}>
      <div className="container">
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">{t('nav.home') || 'Home'}</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbActive}>{t('about.title') || 'About Us'}</span>
        </nav>

        {/* HERO SECTION */}
        <header className={styles.heroSection}>
          <div className={styles.heroBadgeWrap}>
            <span className={styles.heroBadge}>
              <span aria-hidden="true">💚</span>
              <span>{t('about.heroTag') || 'नागरिक प्रथम पहल'}</span>
            </span>
          </div>

          <h1 className={styles.heroTitle}>
            {t('about.title') || 'About Driving License Form'}
          </h1>

          <p className={styles.heroSubtitle}>
            {t('about.subtitle') || 'A transparent, citizen-centric platform simplifying driving licence applications across India.'}
          </p>
        </header>

        {/* MISSION & VISION */}
        <section className={styles.missionCard}>
          <div className={styles.missionGrid}>
            <div className={styles.missionContent}>
              <h2 className={styles.missionTitle}>
                {t('about.missionTitle') || 'Our Mission'}
              </h2>
              <p className={styles.missionText}>
                {t('about.missionDesc') ||
                  'Driving License Form is an independent digital application assistance platform created to make the RTO driving licence journey simple, transparent, and hassle-free for citizens — free from agent commissions, hidden fees, or bureaucratic confusion.'}
              </p>
              <div className={styles.missionHighlights}>
                <div className={styles.highlightItem}>
                  <IconCheck size={18} className={styles.checkIcon} />
                  <span>3 Supported States (Gujarat, Rajasthan, Uttar Pradesh)</span>
                </div>
                <div className={styles.highlightItem}>
                  <IconCheck size={18} className={styles.checkIcon} />
                  <span>Transparent Government Fee &amp; Assistance Fee Separation</span>
                </div>
                <div className={styles.highlightItem}>
                  <IconCheck size={18} className={styles.checkIcon} />
                  <span>Full Compliance with Digital Personal Data Protection (DPDP) Act, 2023</span>
                </div>
              </div>
            </div>

            <div className={styles.missionStats}>
              <div className={styles.statBox}>
                <div className={styles.statNumber}>100%</div>
                <div className={styles.statLabel}>Transparent Pricing</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statNumber}>3</div>
                <div className={styles.statLabel}>Languages Supported (EN, HI, GU)</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statNumber}>7%</div>
                <div className={styles.statLabel}>Profit Dedicated to Education</div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            SOCIAL COMMITMENT SPOTLIGHT: 7% FOR EDUCATION
            ============================================================ */}
        <section id="social-commitment" className={styles.socialSpotlight}>
          <div className={styles.spotlightCard}>
            <div className={styles.spotlightHeader}>
              <div className={styles.socialBadgeWrap}>
                <span className={styles.socialBadge}>
                  <span aria-hidden="true">💚</span>
                  <span>{t('home.socialBadge') || 'हमारा सामाजिक संकल्प'}</span>
                </span>
              </div>

              <h2 className={styles.spotlightTitle}>
                {t('about.socialInitiativeTitle') || 'शिक्षा के लिए 7% — हमारा सामाजिक संकल्प'}
              </h2>

              <p className={styles.spotlightSubtitle}>
                {t('about.socialInitiativeSubtitle') || 'हर नागरिक आवेदन के साथ हम देश के बच्चों के उज्ज्वल भविष्य में निवेश करते हैं।'}
              </p>

              <p className={styles.spotlightDesc}>
                {t('about.socialInitiativeDesc') ||
                  'हमारा मानना है कि एक जिम्मेदार संस्था के रूप में समाज को वापस लौटाना हमारा कर्तव्य है। इसलिए हम अपने कुल शुद्ध मुनाफे का 7% सीधे जरूरतमंद बच्चों की बुनियादी शिक्षा और स्कूली संसाधनों पर खर्च करने के लिए समर्पित करते हैं।'}
              </p>
            </div>

            {/* 4 Pillars of the Commitment */}
            <div className={styles.pillarsGrid}>
              {socialPillars.map((p) => (
                <div key={p.num} className={styles.pillarCard}>
                  <div className={styles.pillarIconWrap}>
                    <span className={styles.pillarEmoji}>{p.icon}</span>
                    <span className={styles.pillarNum}>{p.num}</span>
                  </div>
                  <h3 className={styles.pillarTitle}>{p.title}</h3>
                  <p className={styles.pillarDesc}>{p.desc}</p>
                </div>
              ))}
            </div>

            {/* Direct Accountability Note */}
            <div className={styles.transparencyBox}>
              <div className={styles.transparencyIcon}>📋</div>
              <div className={styles.transparencyText}>
                <strong>हमारा पारदर्शिता वचन:</strong> इस पहल के अंतर्गत खर्च होने वाले प्रत्येक रुपये की नियमित समीक्षा की जाती है। हम सीधे सरकारी और गैर-सरकारी प्राथमिक विद्यालयों तथा वंचित छात्रों तक शिक्षण सामग्री पहुँचाते हैं, ताकि कोई भी बच्चा साधनों के अभाव में अपनी पढ़ाई से वंचित न रहे।
              </div>
            </div>
          </div>
        </section>

        {/* CORE VALUES */}
        <section className={styles.valuesSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              {t('about.valuesTitle') || 'Our Core Values'}
            </h2>
            <p className={styles.sectionSubtitle}>
              The foundational principles guiding every feature and service we provide.
            </p>
          </div>

          <div className={styles.valuesGrid}>
            {values.map((v, i) => (
              <div key={i} className={styles.valueCard}>
                <div className={styles.valueIcon}>{v.icon}</div>
                <h3 className={styles.valueTitle}>{v.title}</h3>
                <p className={styles.valueDesc}>{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* NON-GOVERNMENT TRANSPARENCY DISCLAIMER */}
        <div className={styles.disclaimerBox}>
          <strong>{t('common.disclaimer') || 'Notice'}:</strong> Driving License Form is an independent private application assistance platform. We are NOT an official government portal and are not affiliated with MoRTH, Parivahan Sewa, or any State Regional Transport Authority. We collect data solely with informed citizen consent to prepare applications for official submission.
        </div>

        {/* CTA BANNER */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaCard}>
            <h2 className={styles.ctaTitle}>
              Ready to Prepare Your Driving Licence Application?
            </h2>
            <p className={styles.ctaDesc}>
              Experience simple, step-by-step assistance with zero commission and transparent tracking.
            </p>
            <div className={styles.ctaActions}>
              <Link href="/apply" className="btn btn-primary btn-lg">
                <span>{t('home.startCta') || 'Start Application'}</span>
                <IconArrowRight size={18} />
              </Link>
              <Link href="/help" className="btn btn-outline btn-lg">
                <span>{t('nav.help') || 'Help & FAQs'}</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
