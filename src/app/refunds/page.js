import Link from 'next/link';
import { IconBank, IconBriefcase } from '@/components/icons/Icons';
import styles from '@/app/legal.module.css';

export const metadata = {
  title: 'Cancellation & Refund Policy | Driving License Form',
  description: 'Transparent fee and cancellation refund policy for Driving License Form assistance services.',
};

export default function RefundsPage() {
  return (
    <div className={styles.legalPage}>
      <div className={styles.container}>
        <div className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <span>/</span>
          <span>Refund Policy</span>
        </div>

        <div className={styles.header}>
          <h1 className={styles.title}>
            Cancellation & Refund Policy
          </h1>
          <p className={styles.subtitle}>
            Clear, upfront statutory breakdown and citizen fee protection principles.
          </p>
          <div className={styles.metaNotice}>
            Effective Date: September 2026 • Transparent Citizen Assistance Fee Structure
          </div>
        </div>

        {/* Overview Fee Comparison */}
        <div className={`${styles.section} ${styles.sectionSpaced}`}>
          <h2 className={styles.sectionTitle}>
            Understanding Your Fee Breakdown
          </h2>
          <div className={styles.sectionBody}>
            <p>
              Any fee charged on this portal consists of two distinct components, explicitly itemized before payment:
            </p>
          </div>

          <div className={`${styles.cardsGrid} ${styles.cardGridTight}`}>
            <div className={`${styles.card} ${styles.cardAccent}`}>
              <div className={styles.cardIcon}><IconBank size={22} /></div>
              <h3 className={`${styles.cardTitle} ${styles.cardTitleAccent}`}>
                1. Government Statutory Fee
              </h3>
              <p className={styles.cardDesc}>
                Mandated by the respective State Transport Department for learner licence, permanent licence, test track slots, and smart card issuance.
              </p>
            </div>

            <div className={`${styles.card} ${styles.cardAccent}`}>
              <div className={styles.cardIcon}><IconBriefcase size={22} /></div>
              <h3 className={`${styles.cardTitle} ${styles.cardTitleAccent}`}>
                2. Platform Assistance Fee
              </h3>
              <p className={styles.cardDesc}>
                Covers digitisation, document verification, format validation, draft saving, and real-time citizen tracking assistance.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.contentFlow}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              1. Cancellation Before Submission
            </h2>
            <div className={styles.sectionBody}>
              <p>
                If you decide to cancel your application before our verification team has processed your documents and before statutory lodgement with the transport department, you are eligible for a <strong>100% full refund</strong> of the platform assistance fee.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              2. After Government Lodgement
            </h2>
            <div className={styles.sectionBody}>
              <p>
                Once an application has been lodged with the Regional Transport Office (RTO) and government fees have been remitted to the state treasury on your behalf:
              </p>
              <ul className={styles.list}>
                <li>Government statutory fees are strictly non-refundable as per state transport financial rules.</li>
                <li>If an application is rejected by the RTO due to deficiency in documentation provided by the applicant, our team will provide one round of free re-submission assistance.</li>
              </ul>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              3. Refund Process & Timelines
            </h2>
            <div className={styles.sectionBody}>
              <p>
                To initiate a cancellation or refund request, send an email to <a href="mailto:refunds@drivinglicenseform.com" className={styles.emailLink}>refunds@drivinglicenseform.com</a> citing your unique Application Reference Number (e.g. <code>DLF-GJ-202609-XXXXX</code>) and the reason for cancellation.
              </p>
              <p>
                Approved refunds are credited back to the original source payment method (Bank Account, UPI, or Card) within <strong>5 to 7 working days</strong>.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              4. Demonstration Mode Exemption
            </h2>
            <div className={styles.sectionBody}>
              <p>
                While the portal is operating in demonstration mode, no actual financial transactions or debits occur. Consequently, no fee deductions exist to be refunded during demonstration periods.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
