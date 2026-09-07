'use client';
import { useState, useEffect } from 'react';
import styles from '@/app/account/privacy/privacy.module.css';

export default function AdminIncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [affectedCategories, setAffectedCategories] = useState('contact,identity');
  const [affectedCount, setAffectedCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const loadIncidents = async () => {
    try {
      const res = await fetch('/api/admin/privacy/incidents');
      if (res.ok) {
        const data = await res.json();
        setIncidents(data.incidents || []);
      }
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const handleCreateIncident = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/admin/privacy/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          title,
          description,
          severity,
          affectedDataCategories: affectedCategories,
          affectedUserCount: affectedCount,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create incident');

      setStatusMsg({
        type: 'success',
        text: `Incident ${data.incident.incidentNumber} created. Mandatory 72-hour Board notification clock initiated (Deadline: ${new Date(data.incident.boardNotificationDueAt).toLocaleString()}).`,
      });
      setTitle('');
      setDescription('');
      setShowCreateForm(false);
      await loadIncidents();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Error creating incident' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransition = async (incidentId, newStatus) => {
    try {
      const res = await fetch('/api/admin/privacy/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_status', incidentId, status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update incident status');
      await loadIncidents();
    } catch (err) {
      alert(err.message || 'Update failed');
    }
  };

  const handleNotifyUsers = async (incidentId) => {
    const notifyTitle = 'Important Security Notice regarding your Driving Licence Application account';
    const notifyMsg = 'We detected and contained a security event. In accordance with DPDP Act 2023, your account has been secured. No unauthorized actions were completed.';
    try {
      const res = await fetch('/api/admin/privacy/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'notify_users', incidentId, title: notifyTitle, message: notifyMsg }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Dispatch failed');
      alert(`Dispatched breach alerts to ${data.sentCount} affected users.`);
      await loadIncidents();
    } catch (err) {
      alert(err.message || 'Failed to notify users');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {statusMsg && (
        <div className={statusMsg.type === 'success' ? styles.alertBox : styles.alertBoxDanger}>
          {statusMsg.text}
        </div>
      )}

      <div className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h2 className={styles.cardTitle}>
              <span>🚨</span>
              <span>Security Incidents & Breach Response Workflow</span>
            </h2>
            <p className={styles.cardDesc} style={{ margin: 0 }}>
              Under Section 8(6) of the DPDP Act 2023, personal data breaches must be notified to the Data Protection Board and affected Data Principals in the prescribed form and manner.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateForm(!showCreateForm)}
            className={styles.btnPrimary}
          >
            <span>{showCreateForm ? 'Close Form' : '+ Record New Incident'}</span>
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <form onSubmit={handleCreateIncident} style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 700 }}>Record Security Event</h3>
            <div className={styles.gridTwo}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Incident Title</label>
                <input
                  type="text"
                  required
                  className={styles.formInput}
                  placeholder="e.g., Suspicious failed login burst on OTP endpoint"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Severity Level</label>
                <select
                  className={styles.formSelect}
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High (Urgent Board Alert)</option>
                  <option value="critical">Critical (Critical Data Exposure)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Potentially Affected Categories</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="e.g., contact, identity, documents"
                  value={affectedCategories}
                  onChange={(e) => setAffectedCategories(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Estimated Affected User Count</label>
                <input
                  type="number"
                  className={styles.formInput}
                  value={affectedCount}
                  onChange={(e) => setAffectedCount(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Detailed Event Description & Initial Containment Action</label>
              <textarea
                required
                rows={3}
                className={styles.formTextarea}
                placeholder="What happened, how it was detected, and immediate containment measures taken..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button type="submit" disabled={submitting} className={styles.btnPrimary}>
              {submitting ? 'Creating...' : 'Initialize 72h Response Timeline'}
            </button>
          </form>
        )}

        {/* Incidents Table */}
        {loading ? (
          <p style={{ color: '#64748b' }}>Loading incidents...</p>
        ) : incidents.length === 0 ? (
          <p style={{ color: '#64748b' }}>No security incidents recorded. System running normally.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Incident #</th>
                  <th>Title</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>72h Board Timer</th>
                  <th>Board Notified</th>
                  <th>Users Notified</th>
                  <th>Workflow Actions</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((inc) => {
                  const sevClass =
                    inc.severity === 'critical' ? styles.pillRed :
                    inc.severity === 'high' ? styles.pillRed :
                    inc.severity === 'medium' ? styles.pillYellow : styles.pillBlue;

                  const remainingMs = new Date(inc.board_notification_due_at).getTime() - Date.now();
                  const remainingHours = Math.round(remainingMs / (1000 * 60 * 60));

                  return (
                    <tr key={inc.id}>
                      <td><strong>{inc.incident_number}</strong></td>
                      <td>
                        <strong>{inc.title}</strong>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{inc.description}</div>
                      </td>
                      <td><span className={sevClass}>{inc.severity}</span></td>
                      <td><span className={styles.pillBlue}>{inc.status?.replace(/_/g, ' ')}</span></td>
                      <td>
                        {inc.board_notified_at ? (
                          <span className={styles.pillGreen}>Reported</span>
                        ) : (
                          <strong style={{ color: remainingHours <= 24 ? '#dc2626' : '#ea580c' }}>
                            {remainingHours > 0 ? `${remainingHours} hrs left` : 'EXPIRED!'}
                          </strong>
                        )}
                      </td>
                      <td>{inc.board_notified_at ? '✅ Notified' : '❌ Pending'}</td>
                      <td>{inc.user_notifications_count > 0 ? `✅ ${inc.user_notifications_count} notified` : '❌ Pending'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          {inc.status === 'detected' && (
                            <button
                              type="button"
                              onClick={() => handleTransition(inc.id, 'contained')}
                              className={styles.btnSecondary}
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              Mark Contained
                            </button>
                          )}
                          {!inc.board_notified_at && (
                            <button
                              type="button"
                              onClick={() => handleTransition(inc.id, 'board_notified')}
                              className={styles.btnPrimary}
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              Report to Board
                            </button>
                          )}
                          {inc.user_notifications_count === 0 && (
                            <button
                              type="button"
                              onClick={() => handleNotifyUsers(inc.id)}
                              className={styles.btnSecondary}
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              Notify Users
                            </button>
                          )}
                          {inc.status !== 'closed' && (
                            <button
                              type="button"
                              onClick={() => handleTransition(inc.id, 'closed')}
                              className={styles.btnPrimary}
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#0f172a' }}
                            >
                              Close Case
                            </button>
                          )}
                        </div>
                      </td>
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
