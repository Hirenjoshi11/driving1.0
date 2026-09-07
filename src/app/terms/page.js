import Link from 'next/link';
import { IconAlert } from '@/components/icons/Icons';
import styles from '@/app/legal.module.css';

export const metadata = {
  title: 'Terms & Conditions | Driving License Form',
  description: 'Terms and Conditions governing the use of Driving License Form private application assistance services.',
};

export default function TermsPage() {
  return (
    <div className={styles.legalPage}>
      <div className={styles.container}>
        <div className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <span>/</span>
          <span>Terms & Conditions</span>
        </div>

        <div className={styles.header}>
          <h1 className={styles.title}>
            Terms & Conditions
          </h1>
          <p className={styles.subtitle}>
            Governing the use of Driving License Form private application assistance services.
          </p>
          <div className={styles.metaNotice}>
            Last Updated: September 2026 • Governed by the Laws of the Republic of India
          </div>
        </div>

        <div className={styles.disclaimerBox}>
          <div className={styles.disclaimerTitle}>
            <IconAlert size={16} /> Statutory Private Service Notice
          </div>
          <p>
            Driving License Form is an independent private consultancy and document assistance portal. We are <strong>NOT</strong> affiliated with, authorized by, or an official agency of the Government of India, State Transport Departments, or Parivahan Sewa. Official applications can also be lodged directly by citizens at <a href="https://parivahan.gov.in" target="_blank" rel="noopener noreferrer" className={styles.inlineLink}>parivahan.gov.in</a>.
          </p>
        </div>

        <div className={styles.contentFlow}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              1. Scope of Services
            </h2>
            <div className={styles.sectionBody}>
              <p>
                Driving License Form provides citizen assistance in form preparation, document digitization, statutory rule verification (such as Motor Vehicles Act age and category checks), and jurisdictional RTO routing for driving licence and learner licence applicants across supported Indian states.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              2. User Responsibilities & Representations
            </h2>
            <div className={styles.sectionBody}>
              <p>
                By submitting an application or draft on this portal, you affirm and warrant that:
              </p>
              <ul className={styles.list}>
                <li>All personal particulars, dates of birth, residential addresses, and declarations are genuine, accurate, and correspond to official government identity documents.</li>
                <li>Uploaded documents are unaltered, legible copies of genuine originals issued by competent authorities.</li>
                <li>For applicants aged 16 to 17 applying for MCWOG licences, explicit parental/guardian consent under Section 4(1) of the Motor Vehicles Act 1988 has been obtained.</li>
                <li>Any misrepresentation, forgery, or suppression of material facts may result in cancellation of the application and criminal prosecution under applicable Indian penal provisions.</li>
              </ul>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              3. Regulatory Authority & Final Licensing
            </h2>
            <div className={styles.sectionBody}>
              <p>
                The issuance of any Learner Licence, Permanent Driving Licence, or International Driving Permit remains the exclusive statutory prerogative of the Licensing Authority under the relevant State Regional Transport Office. Driving License Form cannot guarantee the approval, grant, or issuance of any licence, nor can it exempt an applicant from mandatory biometric capture or driving skill tests at designated RTO test tracks.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              4. Limitation of Liability
            </h2>
            <div className={styles.sectionBody}>
              <p>
                To the maximum extent permitted by Indian law, Driving License Form and its operators shall not be liable for any indirect, incidental, or consequential delays, government server downtimes, RTO appointment rescheduling, or administrative rejections arising from incorrect applicant submissions.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              5. Governing Law & Jurisdiction
            </h2>
            <div className={styles.sectionBody}>
              <p>
                These terms are governed by and construed in accordance with the laws of the Republic of India. Any disputes arising in connection with these services shall be subject to the exclusive jurisdiction of the competent courts in India.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
