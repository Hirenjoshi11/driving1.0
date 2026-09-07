'use client';

import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import styles from '../AdminConsole.module.css';

export default function AdminOperatorsPage() {
  const { t } = useApp();
  const [operators, setOperators] = useState([]);
  const [states, setStates] = useState([]);
  const [services, setServices] = useState([]);
  const [rtos, setRtos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    stateId: ''
  });
  const [createLoading, setCreateLoading] = useState(false);

  // Edit Assignment Modal
  const [assignModalOp, setAssignModalOp] = useState(null);
  const [assignmentStateId, setAssignmentStateId] = useState('');
  const [assignmentServiceId, setAssignmentServiceId] = useState('');
  const [assignmentRtoId, setAssignmentRtoId] = useState('');

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/admin/operators').then(r => r.json()),
      fetch('/api/states').then(r => r.json()),
      fetch('/api/services').then(r => r.json()),
      fetch('/api/rto-offices').then(r => r.json())
    ])
      .then(([opData, stData, srvData, rtoData]) => {
        setOperators(opData.operators || []);
        setStates(stData.states || []);
        setServices(srvData.services || []);
        setRtos(rtoData.rtoOffices || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load operators and jurisdiction data.');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateOperator = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        password: formData.password,
        stateId: formData.stateId ? Number(formData.stateId) : undefined,
        assignments: formData.stateId ? [{ stateId: Number(formData.stateId) }] : []
      };

      const res = await fetch('/api/admin/operators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.error || 'Failed to create operator');

      setShowCreateModal(false);
      setFormData({ name: '', phone: '', email: '', password: '', stateId: '' });
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleToggleActive = async (op) => {
    const newActive = !op.is_active;
    const confirmMsg = newActive
      ? `Reactivate account for ${op.name}?`
      : `Deactivate account for ${op.name}? Any open cases will be unassigned to avoid stalling.`;

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch('/api/admin/operators', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operatorId: op.id,
          isActive: newActive
        })
      });
      if (!res.ok) throw new Error('Failed to update operator status');
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddAssignment = async () => {
    if (!assignmentStateId || !assignModalOp) return;

    const newAssignments = [
      ...assignModalOp.assignments.map(a => ({
        stateId: a.state_id,
        serviceId: a.service_id,
        rtoId: a.rto_id
      })),
      {
        stateId: Number(assignmentStateId),
        serviceId: assignmentServiceId ? Number(assignmentServiceId) : null,
        rtoId: assignmentRtoId ? Number(assignmentRtoId) : null
      }
    ];

    try {
      const res = await fetch('/api/admin/operators', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operatorId: assignModalOp.id,
          assignments: newAssignments
        })
      });
      if (!res.ok) throw new Error('Failed to add assignment');

      setAssignmentStateId('');
      setAssignmentServiceId('');
      setAssignmentRtoId('');
      loadData();
      setAssignModalOp(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemoveAssignment = async (indexToRemove) => {
    if (!assignModalOp) return;
    const updatedAssignments = assignModalOp.assignments
      .filter((_, idx) => idx !== indexToRemove)
      .map(a => ({
        stateId: a.state_id,
        serviceId: a.service_id,
        rtoId: a.rto_id
      }));

    try {
      const res = await fetch('/api/admin/operators', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operatorId: assignModalOp.id,
          assignments: updatedAssignments
        })
      });
      if (!res.ok) throw new Error('Failed to update assignments');

      loadData();
      setAssignModalOp(null);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{t('staff.navOperators') || 'Operators & Jurisdictions'}</h1>
          <p className={styles.pageSubtitle}>
            Configure RTO clerk accounts, enforce state and service scoping rules, and balance daily processing load
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className={styles.btnPrimary}
          >
            <span>+</span>
            <span>Create Operator Account</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', color: '#b91c1c', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {/* Operators Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Operator</th>
              <th>Role</th>
              <th>Status</th>
              <th>Active Jurisdictions</th>
              <th className={styles.numberCell}>Open Cases</th>
              <th className={styles.numberCell}>Completed Today</th>
              <th className={styles.numberCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  Loading operators...
                </td>
              </tr>
            ) : operators.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No operator accounts found. Click &quot;Create Operator Account&quot; to add one.
                </td>
              </tr>
            ) : (
              operators.map(op => (
                <tr key={op.id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong style={{ color: '#0f172a' }}>{op.name}</strong>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{op.masked_phone} • {op.email || 'No email'}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: op.role === 'admin' ? 'rgba(147, 51, 234, 0.1)' : 'rgba(37, 99, 235, 0.1)',
                      color: op.role === 'admin' ? '#7e22ce' : '#1d4ed8',
                      fontWeight: 700
                    }}>
                      {op.role}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(op)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0
                      }}
                      title="Click to toggle account status"
                    >
                      <span style={{
                        fontSize: '11px',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        background: op.is_active ? '#f0fdf4' : '#fef2f2',
                        color: op.is_active ? '#15803d' : '#b91c1c',
                        border: `1px solid ${op.is_active ? '#bbf7d0' : '#fca5a5'}`,
                        fontWeight: 600
                      }}>
                        {op.is_active ? '● Active' : '○ Inactive'}
                      </span>
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {op.assignments.length === 0 ? (
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>
                          Universal / None assigned
                        </span>
                      ) : (
                        op.assignments.map((a, i) => (
                          <span
                            key={a.id || i}
                            style={{
                              fontSize: '11px',
                              background: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              borderRadius: '4px',
                              padding: '2px 6px',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {a.state_code}: {a.service_name || 'All Services'} {a.rto_code ? `(${a.rto_code})` : ''}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className={styles.numberCell} style={{ fontWeight: 700 }}>
                    {op.open_cases}
                  </td>
                  <td className={styles.numberCell} style={{ color: '#15803d', fontWeight: 600 }}>
                    {op.completed_today}
                  </td>
                  <td className={styles.numberCell}>
                    <button
                      type="button"
                      onClick={() => setAssignModalOp(op)}
                      className={styles.btnSecondary}
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                    >
                      Configure Scope →
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Operator Modal */}
      {showCreateModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalBox}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Create New Operator Account</h3>
              <button type="button" onClick={() => setShowCreateModal(false)} className={styles.modalCloseBtn}>✕</button>
            </div>
            <form onSubmit={handleCreateOperator}>
              <div className={styles.modalBody}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Full Name:</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={styles.filterInput}
                    style={{ width: '100%' }}
                    placeholder="e.g. Ramesh Patel"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Mobile Number (10 Digits):</label>
                  <input
                    type="text"
                    required
                    pattern="\d{10}"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={styles.filterInput}
                    style={{ width: '100%' }}
                    placeholder="e.g. 9876543210"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Email Address (Optional):</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={styles.filterInput}
                    style={{ width: '100%' }}
                    placeholder="e.g. ramesh@rto.gov.in"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Account Password:</label>
                  <input
                    type="password"
                    required
                    minLength="6"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={styles.filterInput}
                    style={{ width: '100%' }}
                    placeholder="Minimum 6 characters"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Initial Assigned State:</label>
                  <select
                    value={formData.stateId}
                    onChange={(e) => setFormData({ ...formData, stateId: e.target.value })}
                    className={styles.filterSelect}
                    style={{ width: '100%' }}
                  >
                    <option value="">No initial restriction (or configure later)</option>
                    {states.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setShowCreateModal(false)} className={styles.btnSecondary}>
                  Cancel
                </button>
                <button type="submit" disabled={createLoading} className={styles.btnPrimary}>
                  {createLoading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Jurisdiction Assignments Modal */}
      {assignModalOp && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalBox}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Jurisdiction Scope: {assignModalOp.name}</h3>
              <button type="button" onClick={() => setAssignModalOp(null)} className={styles.modalCloseBtn}>✕</button>
            </div>
            <div className={styles.modalBody}>
              <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>
                Operators only see applications that match at least one active assignment row. If an operator has zero assignment rows, they will have no queue access (1=0).
              </p>

              <div>
                <strong style={{ fontSize: '12px', color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                  Current Active Assignments ({assignModalOp.assignments.length}):
                </strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                  {assignModalOp.assignments.length === 0 ? (
                    <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                      No assignment rows. Add an assignment below to grant queue access.
                    </div>
                  ) : (
                    assignModalOp.assignments.map((a, idx) => (
                      <div
                        key={a.id || idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          fontSize: '12px'
                        }}
                      >
                        <div>
                          <strong>{a.state_name} ({a.state_code})</strong>
                          <span style={{ color: '#64748b', marginLeft: '6px' }}>
                            • {a.service_name || 'All Services'} {a.rto_name ? `• ${a.rto_name} (${a.rto_code})` : '• All RTOs'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAssignment(idx)}
                          style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}
                          title="Remove assignment"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add New Assignment Row */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <strong style={{ fontSize: '12px', color: '#0f172a' }}>Add Jurisdiction Assignment:</strong>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b' }}>State (Required):</label>
                    <select
                      value={assignmentStateId}
                      onChange={(e) => setAssignmentStateId(e.target.value)}
                      className={styles.filterSelect}
                      style={{ width: '100%', fontSize: '12px' }}
                    >
                      <option value="">Select State</option>
                      {states.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b' }}>Service (Optional):</label>
                    <select
                      value={assignmentServiceId}
                      onChange={(e) => setAssignmentServiceId(e.target.value)}
                      className={styles.filterSelect}
                      style={{ width: '100%', fontSize: '12px' }}
                    >
                      <option value="">All Services</option>
                      {services.map(srv => (
                        <option key={srv.id} value={srv.id}>{srv.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: '#64748b' }}>RTO Office (Optional):</label>
                  <select
                    value={assignmentRtoId}
                    onChange={(e) => setAssignmentRtoId(e.target.value)}
                    className={styles.filterSelect}
                    style={{ width: '100%', fontSize: '12px' }}
                  >
                    <option value="">All RTO Offices in State</option>
                    {rtos
                      .filter(r => !assignmentStateId || String(r.state_id) === String(assignmentStateId))
                      .map(r => (
                        <option key={r.id} value={r.id}>{r.code} - {r.name}</option>
                      ))}
                  </select>
                </div>

                <button
                  type="button"
                  disabled={!assignmentStateId}
                  onClick={handleAddAssignment}
                  className={styles.btnPrimary}
                  style={{ alignSelf: 'flex-start', marginTop: '4px' }}
                >
                  + Add Assignment Row
                </button>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button type="button" onClick={() => setAssignModalOp(null)} className={styles.btnSecondary}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
