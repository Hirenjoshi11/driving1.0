'use client';
import { useState, useEffect } from 'react';
import styles from '@/app/account/privacy/privacy.module.css';

export default function AdminDataInventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSensitivity, setFilterSensitivity] = useState('');

  const loadInventory = async () => {
    try {
      const params = new URLSearchParams();
      if (filterCategory) params.set('category', filterCategory);
      if (filterSensitivity) params.set('sensitivity', filterSensitivity);

      const res = await fetch(`/api/admin/privacy/inventory?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setInventory(data.inventory || []);
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [filterCategory, filterSensitivity]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h2 className={styles.cardTitle}>
              <span>🗂️</span>
              <span>Centralized Personal Data Inventory</span>
            </h2>
            <p className={styles.cardDesc} style={{ margin: 0 }}>
              Statutory catalog of personal data fields mapped to legal basis, processing purpose, sensitivity, and retention policy.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select
              className={styles.formSelect}
              style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="identity">Identity</option>
              <option value="contact">Contact</option>
              <option value="address">Address</option>
              <option value="biometric">Biometric</option>
              <option value="documents">Documents</option>
              <option value="financial">Financial</option>
              <option value="legal">Legal</option>
            </select>

            <select
              className={styles.formSelect}
              style={{ width: 'auto', padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              value={filterSensitivity}
              onChange={(e) => setFilterSensitivity(e.target.value)}
            >
              <option value="">All Sensitivities</option>
              <option value="standard">Standard</option>
              <option value="sensitive">Sensitive</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#64748b' }}>Loading inventory records...</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Field ID</th>
                  <th>Field Name</th>
                  <th>Category</th>
                  <th>Purpose</th>
                  <th>Legal Basis</th>
                  <th>Sensitivity</th>
                  <th>Storage Location</th>
                  <th>Exportable</th>
                  <th>Erasable</th>
                  <th>Correctable</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => {
                  const sensClass =
                    item.sensitivity_level === 'critical' ? styles.pillRed :
                    item.sensitivity_level === 'sensitive' ? styles.pillYellow : styles.pillBlue;

                  return (
                    <tr key={item.id}>
                      <td><code>{item.field_id}</code></td>
                      <td><strong>{item.field_name}</strong></td>
                      <td><span className={styles.pillBlue}>{item.data_category}</span></td>
                      <td>{item.purpose?.replace(/_/g, ' ')}</td>
                      <td><span className={styles.pillGreen}>{item.legal_basis}</span></td>
                      <td><span className={sensClass}>{item.sensitivity_level}</span></td>
                      <td><small>{item.storage_location}</small></td>
                      <td>{item.exportable ? '✅' : '❌'}</td>
                      <td>{item.erasable ? '✅' : '❌'}</td>
                      <td>{item.correctable ? '✅' : '❌'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
