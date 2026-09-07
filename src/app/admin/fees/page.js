'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import styles from '../AdminConsole.module.css';

export default function AdminFeesPage() {
  const { t } = useApp();
  const [fees, setFees] = useState([]);
  const [states, setStates] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterStateId, setFilterStateId] = useState('');
  const [filterServiceId, setFilterServiceId] = useState('');

  // Add Fee Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    serviceId: '',
    stateId: '',
    governmentFee: 200,
    serviceFee: 99,
    smartCardFee: 200,
    testFee: 300,
    gatewayFee: 0,
    lateFee: 0,
    effectiveFrom: new Date().toISOString().slice(0, 10),
    effectiveTo: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const loadFees = useCallback(() => {
    setLoading(true);
    const q = new URLSearchParams();
    if (filterStateId) q.set('stateId', filterStateId);
    if (filterServiceId) q.set('serviceId', filterServiceId);

    fetch(`/api/admin/fees?${q.toString()}`)
      .then(res => res.json())
      .then(d => {
        setFees(d.fees || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filterStateId, filterServiceId]);

  useEffect(() => {
    fetch('/api/states').then(r => r.json()).then(d => setStates(d.states || []));
    fetch('/api/services').then(r => r.json()).then(d => setServices(d.services || []));
  }, []);

  useEffect(() => {
    loadFees();
  }, [loadFees]);

  const computedModalTotal = 
    Number(form.governmentFee || 0) +
    Number(form.serviceFee || 0) +
    Number(form.smartCardFee || 0) +
    Number(form.testFee || 0) +
    Number(form.gatewayFee || 0);

  const handleCreateFee = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        serviceId: Number(form.serviceId),
        stateId: Number(form.stateId),
        governmentFee: Number(form.governmentFee),
        serviceFee: Number(form.serviceFee),
        smartCardFee: Number(form.smartCardFee),
        testFee: Number(form.testFee),
        gatewayFee: Number(form.gatewayFee),
        lateFee: Number(form.lateFee),
        effectiveFrom: form.effectiveFrom,
        effectiveTo: form.effectiveTo || null,
        isActive: true
      };

      const res = await fetch('/api/admin/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.error || 'Failed to create fee structure');

      setShowAddModal(false);
      loadFees();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{t('staff.navFees') || 'Fee Structures'}</h1>
          <p className={styles.pageSubtitle}>
            Effective-dated fee schedules per licence service × state jurisdiction with computed totals
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className={styles.btnPrimary}
          >
            <span>+</span>
            <span>Add Fee Structure</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <select
          value={filterStateId}
          onChange={(e) => setFilterStateId(e.target.value)}
          className={styles.filterSelect}
          aria-label="Filter by state"
        >
          <option value="">All States</option>
          {states.map(s => (
            <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
          ))}
        </select>

        <select
          value={filterServiceId}
          onChange={(e) => setFilterServiceId(e.target.value)}
          className={styles.filterSelect}
          aria-label="Filter by service"
        >
          <option value="">All Services</option>
          {services.map(srv => (
            <option key={srv.id} value={srv.id}>{srv.name}</option>
          ))}
        </select>
      </div>

      {/* Fees Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>State</th>
              <th>Service</th>
              <th className={styles.numberCell}>Govt Fee</th>
              <th className={styles.numberCell}>Service Fee</th>
              <th className={styles.numberCell}>Smart Card</th>
              <th className={styles.numberCell}>Test Fee</th>
              <th className={styles.numberCell}>Gateway</th>
              <th className={styles.numberCell}>Total (INR)</th>
              <th>Effective Window</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  Loading fee structures...
                </td>
              </tr>
            ) : fees.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No fee structures found for the selected filters.
                </td>
              </tr>
            ) : (
              fees.map(f => (
                <tr key={f.id}>
                  <td style={{ fontWeight: 600 }}>{f.state_name} ({f.state_code})</td>
                  <td>{f.service_name}</td>
                  <td className={styles.numberCell}>₹{f.government_fee}</td>
                  <td className={styles.numberCell}>₹{f.service_fee}</td>
                  <td className={styles.numberCell}>₹{f.smart_card_fee || 0}</td>
                  <td className={styles.numberCell}>₹{f.test_fee || 0}</td>
                  <td className={styles.numberCell}>₹{f.gateway_fee || 0}</td>
                  <td className={styles.numberCell} style={{ fontWeight: 700, color: '#15803d', fontSize: '14px' }}>
                    ₹{f.total_computed_fee}
                  </td>
                  <td style={{ fontSize: '11px', color: '#64748b' }}>
                    {f.effective_from ? f.effective_from.slice(0, 10) : 'Now'} → {f.effective_to ? f.effective_to.slice(0, 10) : 'Indefinite'}
                  </td>
                  <td>
                    <span style={{
                      fontSize: '11px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: f.is_active ? '#f0fdf4' : '#fef2f2',
                      color: f.is_active ? '#15803d' : '#b91c1c',
                      fontWeight: 600
                    }}>
                      {f.is_active ? 'Active' : 'Expired'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Fee Structure Modal */}
      {showAddModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalBox}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Add Effective-Dated Fee Structure</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className={styles.modalCloseBtn}>✕</button>
            </div>
            <form onSubmit={handleCreateFee}>
              <div className={styles.modalBody}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>State:</label>
                    <select
                      required
                      value={form.stateId}
                      onChange={(e) => setForm({ ...form, stateId: e.target.value })}
                      className={styles.filterSelect}
                      style={{ width: '100%' }}
                    >
                      <option value="">Select State</option>
                      {states.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Service:</label>
                    <select
                      required
                      value={form.serviceId}
                      onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
                      className={styles.filterSelect}
                      style={{ width: '100%' }}
                    >
                      <option value="">Select Service</option>
                      {services.map(srv => (
                        <option key={srv.id} value={srv.id}>{srv.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Fee Breakdown Inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b' }}>Govt Fee (₹):</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={form.governmentFee}
                      onChange={(e) => setForm({ ...form, governmentFee: e.target.value })}
                      className={styles.filterInput}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b' }}>Service Fee (₹):</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={form.serviceFee}
                      onChange={(e) => setForm({ ...form, serviceFee: e.target.value })}
                      className={styles.filterInput}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b' }}>Smart Card Fee (₹):</label>
                    <input
                      type="number"
                      min="0"
                      value={form.smartCardFee}
                      onChange={(e) => setForm({ ...form, smartCardFee: e.target.value })}
                      className={styles.filterInput}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b' }}>Test Fee (₹):</label>
                    <input
                      type="number"
                      min="0"
                      value={form.testFee}
                      onChange={(e) => setForm({ ...form, testFee: e.target.value })}
                      className={styles.filterInput}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b' }}>Gateway Fee (₹):</label>
                    <input
                      type="number"
                      min="0"
                      value={form.gatewayFee}
                      onChange={(e) => setForm({ ...form, gatewayFee: e.target.value })}
                      className={styles.filterInput}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b' }}>Late Fee (₹):</label>
                    <input
                      type="number"
                      min="0"
                      value={form.lateFee}
                      onChange={(e) => setForm({ ...form, lateFee: e.target.value })}
                      className={styles.filterInput}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                {/* Computed Total Preview */}
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#166534' }}>Computed Total Citizen Payable:</span>
                  <strong style={{ fontSize: '18px', color: '#15803d' }}>₹{computedModalTotal}</strong>
                </div>

                {/* Effective Dates */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b' }}>Effective From:</label>
                    <input
                      type="date"
                      required
                      value={form.effectiveFrom}
                      onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })}
                      className={styles.filterInput}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b' }}>Effective To (Optional):</label>
                    <input
                      type="date"
                      value={form.effectiveTo}
                      onChange={(e) => setForm({ ...form, effectiveTo: e.target.value })}
                      className={styles.filterInput}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setShowAddModal(false)} className={styles.btnSecondary}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className={styles.btnPrimary}>
                  {submitting ? 'Saving...' : 'Save Fee Structure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
