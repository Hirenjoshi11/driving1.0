'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import styles from '../AdminConsole.module.css';

export default function AdminLocationsPage() {
  const { t } = useApp();
  const [activeTab, setActiveTab] = useState('rtos'); // 'states', 'rtos', 'centres'
  const [states, setStates] = useState([]);
  const [rtos, setRtos] = useState([]);
  const [testCentres, setTestCentres] = useState([]);
  const [selectedStateId, setSelectedStateId] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = selectedStateId ? `?stateId=${selectedStateId}` : '';
    fetch(`/api/admin/locations${q}`)
      .then(res => res.json())
      .then(d => {
        setStates(d.states || []);
        setRtos(d.rtos || []);
        setTestCentres(d.testCentres || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedStateId]);

  const filteredRtos = rtos.filter(r => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return r.name?.toLowerCase().includes(term) || r.code?.toLowerCase().includes(term) || r.district_name?.toLowerCase().includes(term);
  });

  const filteredCentres = testCentres.filter(tc => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return tc.name?.toLowerCase().includes(term) || tc.rto_code?.toLowerCase().includes(term) || tc.address?.toLowerCase().includes(term);
  });

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{t('staff.navLocations') || 'Locations & RTO Offices'}</h1>
          <p className={styles.pageSubtitle}>
            Jurisdiction hierarchy: States, Regional Transport Offices, and Designated Driving Test Tracks
          </p>
        </div>
      </div>

      {/* Tabs & Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('rtos')}
            style={{
              padding: '6px 14px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeTab === 'rtos' ? '#ffffff' : 'none',
              color: activeTab === 'rtos' ? '#0f172a' : '#64748b',
              boxShadow: activeTab === 'rtos' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            RTO Offices ({rtos.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('states')}
            style={{
              padding: '6px 14px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeTab === 'states' ? '#ffffff' : 'none',
              color: activeTab === 'states' ? '#0f172a' : '#64748b',
              boxShadow: activeTab === 'states' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            States & Districts ({states.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('centres')}
            style={{
              padding: '6px 14px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeTab === 'centres' ? '#ffffff' : 'none',
              color: activeTab === 'centres' ? '#0f172a' : '#64748b',
              boxShadow: activeTab === 'centres' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            Test Centres ({testCentres.length})
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            value={selectedStateId}
            onChange={(e) => setSelectedStateId(e.target.value)}
            className={styles.filterSelect}
            aria-label="Filter by state"
          >
            <option value="">All States</option>
            {states.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Filter by code or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.filterInput}
          />
        </div>
      </div>

      {/* Content Table */}
      <div className={styles.tableContainer}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            Loading locations...
          </div>
        ) : activeTab === 'rtos' ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>RTO Code</th>
                <th>Office Name</th>
                <th>State</th>
                <th>District</th>
                <th className={styles.numberCell}>Applications Filed</th>
              </tr>
            </thead>
            <tbody>
              {filteredRtos.map(r => (
                <tr key={r.id}>
                  <td className={styles.monoCell}>{r.code}</td>
                  <td style={{ fontWeight: 600 }}>{r.name}</td>
                  <td>{r.state_name} ({r.state_code})</td>
                  <td>{r.district_name || '—'}</td>
                  <td className={styles.numberCell}>{r.application_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : activeTab === 'states' ? (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>State Name</th>
                <th>Code</th>
                <th className={styles.numberCell}>Districts</th>
                <th className={styles.numberCell}>RTO Offices</th>
                <th className={styles.numberCell}>Total Applications</th>
              </tr>
            </thead>
            <tbody>
              {states.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td className={styles.monoCell}>{s.code}</td>
                  <td className={styles.numberCell}>{s.district_count}</td>
                  <td className={styles.numberCell}>{s.rto_count}</td>
                  <td className={styles.numberCell} style={{ fontWeight: 700 }}>{s.application_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Track / Centre Name</th>
                <th>Assigned RTO</th>
                <th>State</th>
                <th>Address Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredCentres.map(tc => (
                <tr key={tc.id}>
                  <td style={{ fontWeight: 600 }}>{tc.name}</td>
                  <td>
                    <span className={styles.monoCell}>{tc.rto_code}</span> ({tc.rto_name})
                  </td>
                  <td>{tc.state_name}</td>
                  <td style={{ fontSize: '12px', color: '#475569' }}>{tc.address || 'Designated RTO Track'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
