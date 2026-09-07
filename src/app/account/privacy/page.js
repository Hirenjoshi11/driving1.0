'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { IconClipboard, IconScale, IconFolder } from '@/components/icons/Icons';
import styles from './privacy.module.css';

export default function PrivacyOverviewPage() {
  const { t } = useApp();
  const [dataInventory, setDataInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/privacy/notice?lang=en');
        // Load data inventory metadata
        const invRes = await fetch('/api/admin/privacy/inventory').catch(() => null);
        if (invRes && invRes.ok) {
          const invData = await invRes.json();
          setDataInventory(invData.inventory || []);
        } else {
          // Default public inventory presentation
          setDataInventory([
            { field_name: 'First & Last Name', data_category: 'Identity', purpose: 'Application Processing', legal_basis: 'Consent', sensitivity_level: 'standard', storage_location: 'Database' },
            { field_name: 'Date of Birth', data_category: 'Identity', purpose: 'Age Eligibility Check', legal_basis: 'Legal Obligation', sensitivity_level: 'sensitive', storage_location: 'Database' },
            { field_name: 'Mobile Number', data_category: 'Contact', purpose: '2FA & Statutory Alerts', legal_basis: 'Consent', sensitivity_level: 'sensitive', storage_location: 'Database' },
            { field_name: 'Residential Address', data_category: 'Address', purpose: 'RTO Jurisdiction & Delivery', legal_basis: 'Consent', sensitivity_level: 'sensitive', storage_location: 'Database' },
            { field_name: 'Identity Document Proof', data_category: 'Documents', purpose: 'RTO Document Verification', legal_basis: 'Legal Obligation', sensitivity_level: 'critical', storage_location: 'Private Encrypted Vault' },
            { field_name: 'Payment Reference', data_category: 'Financial', purpose: 'Treasury Fee Settlement', legal_basis: 'Contract', sensitivity_level: 'sensitive', storage_location: 'Database' },
          ]);
        }
      } catch (err) {
        console.error('Failed to load privacy overview:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Overview Cards */}
      <div className={styles.gridTwo}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <IconClipboard size={20} />
            <span>{t('privacy.navMyData') || 'My Personal Data'}</span>
          </h2>
          <p className={styles.cardDesc}>
            In compliance with DPDP Act 2023 Section 4, we only collect personal data for specified, lawful purposes necessary for your driving licence application.
          </p>
          <div className={styles.alertBox}>
            <strong>Data Minimization Principle:</strong> We do not collect biometric traits or Aadhaar numbers in raw unmasked form. All sensitive documents are stored in private, access-controlled vaults.
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <IconScale size={20} />
            <span>Data Principal Statutory Rights</span>
          </h2>
          <p className={styles.cardDesc}>
            Under Chapter III of the DPDP Act 2023, you have enforceable statutory rights regarding your personal information:
          </p>
          <ul style={{ paddingLeft: '1.2rem', fontSize: 'var(--font-size-sm)', lineHeight: '1.8', color: 'var(--color-text)' }}>
            <li><strong>Right to Access:</strong> View all stored records & disclosures</li>
            <li><strong>Right to Correction:</strong> Update obsolete or incorrect details</li>
            <li><strong>Right to Erasure:</strong> Irreversible deletion upon retention expiry</li>
            <li><strong>Right of Grievance Redressal:</strong> Direct escalation to DPO</li>
            <li><strong>Right to Nominate:</strong> Designate a trusted representative</li>
          </ul>
        </div>
      </div>

      {/* Centralized Personal Data Inventory Table */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>
          <IconFolder size={20} />
          <span>Personal Data Inventory & Processing Transparency</span>
        </h2>
        <p className={styles.cardDesc}>
          Complete transparency matrix detailing what data we hold, why it was collected, its legal basis, and where it is securely stored.
        </p>

        <div className={styles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Data Element</th>
                <th>Category</th>
                <th>Processing Purpose</th>
                <th>Lawful Basis</th>
                <th>Sensitivity</th>
                <th>Storage</th>
              </tr>
            </thead>
            <tbody>
              {dataInventory.map((item, idx) => {
                const sensClass =
                  item.sensitivity_level === 'critical' ? styles.pillRed :
                  item.sensitivity_level === 'sensitive' ? styles.pillYellow : styles.pillBlue;

                return (
                  <tr key={idx}>
                    <td><strong>{item.field_name}</strong></td>
                    <td>{item.data_category}</td>
                    <td>{item.purpose?.replace(/_/g, ' ')}</td>
                    <td><span className={styles.pillGreen}>{item.legal_basis}</span></td>
                    <td><span className={sensClass}>{item.sensitivity_level}</span></td>
                    <td><code>{item.storage_location}</code></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
