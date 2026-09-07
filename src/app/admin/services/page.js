'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import styles from '../AdminConsole.module.css';

export default function AdminServicesPage() {
  const { t } = useApp();
  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [serviceDetail, setServiceDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadServices = useCallback(() => {
    setLoading(true);
    fetch('/api/admin/services')
      .then(res => res.json())
      .then(d => {
        setServices(d.services || []);
        if (d.services && d.services.length > 0 && !selectedServiceId) {
          setSelectedServiceId(d.services[0].id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedServiceId]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  useEffect(() => {
    if (!selectedServiceId) return;
    setDetailLoading(true);
    fetch(`/api/admin/services?serviceId=${selectedServiceId}`)
      .then(res => res.json())
      .then(d => {
        setServiceDetail(d);
        setDetailLoading(false);
      })
      .catch(() => setDetailLoading(false));
  }, [selectedServiceId]);

  const handleToggleActive = async (srv) => {
    const newActive = !srv.is_active;
    if (srv.inflight_count > 0 && !newActive) {
      if (!confirm(`Warning: Service "${srv.name}" currently has ${srv.inflight_count} in-flight citizen applications. Deactivating will prevent new applications but ongoing cases remain. Proceed?`)) {
        return;
      }
    }

    try {
      const res = await fetch('/api/admin/services', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: srv.id, is_active: newActive })
      });
      if (!res.ok) throw new Error('Update failed');
      loadServices();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{t('staff.navServices') || 'Services & Form Configuration'}</h1>
          <p className={styles.pageSubtitle}>
            Configure licence application flows, steps hierarchy, field requirements, and mandatory document rules
          </p>
        </div>
      </div>

      {/* Two Column Layout: Services List & Steps/Documents Inspector */}
      <div className={styles.twoColGrid}>
        {/* Left: Services Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
            Licence Services ({services.length})
          </h2>

          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Loading services...</div>
          ) : (
            services.map(srv => {
              const isSelected = selectedServiceId === srv.id;
              return (
                <div
                  key={srv.id}
                  onClick={() => setSelectedServiceId(srv.id)}
                  style={{
                    border: `1px solid ${isSelected ? 'var(--color-primary)' : '#e2e8f0'}`,
                    background: isSelected ? '#f0fdf4' : '#ffffff',
                    borderRadius: '8px',
                    padding: '16px',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 0 0 1px var(--color-primary)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div>
                      <strong style={{ fontSize: '14px', color: '#0f172a' }}>{srv.name}</strong>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        Code: <span className={styles.monoCell}>{srv.code}</span> • Order: #{srv.sort_order}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleToggleActive(srv); }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0
                      }}
                      title="Click to toggle active status"
                    >
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: srv.is_active ? '#f0fdf4' : '#fef2f2',
                        color: srv.is_active ? '#15803d' : '#b91c1c',
                        border: `1px solid ${srv.is_active ? '#bbf7d0' : '#fca5a5'}`,
                        fontWeight: 600
                      }}>
                        {srv.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </button>
                  </div>

                  <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>
                    {srv.description || 'Standard driving licence workflow'}
                  </p>

                  <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: '4px' }}>
                    <span><strong>{srv.step_count}</strong> form steps</span>
                    <span><strong>{srv.doc_count}</strong> doc rules</span>
                    <span><strong>{srv.inflight_count}</strong> active applications</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Selected Service Steps & Document Inspector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {detailLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              Loading workflow steps & requirements...
            </div>
          ) : serviceDetail ? (
            <>
              {/* Form Steps */}
              <div className={styles.panelCard}>
                <div className={styles.panelHeader}>
                  <h2 className={styles.panelTitle}>
                    <span>🪜</span> Form Steps ({serviceDetail.steps?.length || 0})
                  </h2>
                </div>
                <div className={styles.panelBody} style={{ padding: 0 }}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Step Title</th>
                        <th>Key</th>
                        <th>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(serviceDetail.steps || []).map(st => (
                        <tr key={st.id}>
                          <td className={styles.monoCell}>Step {st.step_number}</td>
                          <td style={{ fontWeight: 600 }}>{st.title}</td>
                          <td className={styles.monoCell}>{st.step_key}</td>
                          <td>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>
                              {st.is_active ? 'Required' : 'Optional'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Service Required Documents */}
              <div className={styles.panelCard}>
                <div className={styles.panelHeader}>
                  <h2 className={styles.panelTitle}>
                    <span>📑</span> Required Documents ({serviceDetail.documents?.length || 0})
                  </h2>
                </div>
                <div className={styles.panelBody} style={{ padding: 0 }}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Document</th>
                        <th>State</th>
                        <th>Requirement</th>
                        <th>Condition</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(serviceDetail.documents || []).map(d => (
                        <tr key={d.id}>
                          <td style={{ fontWeight: 600 }}>{d.doc_name}</td>
                          <td>{d.state_name}</td>
                          <td>
                            <span style={{
                              fontSize: '11px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: d.is_required ? '#f0fdf4' : '#fef3c7',
                              color: d.is_required ? '#15803d' : '#92400e',
                              fontWeight: 600
                            }}>
                              {d.is_required ? 'Mandatory' : 'Conditional'}
                            </span>
                          </td>
                          <td style={{ fontSize: '11px', color: '#64748b' }}>
                            {d.condition_description || 'Universal requirement'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
