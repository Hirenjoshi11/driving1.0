'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminPolicyManagementPage() {
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState('1.2');
  const [selectedLang, setSelectedLang] = useState('en');
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState(null);
  const [newVersionNum, setNewVersionNum] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  // Fetch all versions
  const loadVersions = async () => {
    try {
      const res = await fetch('/api/admin/privacy/policy');
      if (res.ok) {
        const data = await res.json();
        setVersions(data.versions || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch sections for chosen version & language
  const loadSections = async (ver, lang) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/privacy/policy?version=${ver}&lang=${lang}`);
      if (res.ok) {
        const data = await res.json();
        setSections(data.sections || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVersions();
    loadSections(selectedVersion, selectedLang);
  }, [selectedVersion, selectedLang]);

  // Create new Draft version
  const handleCreateDraft = async (e) => {
    e.preventDefault();
    if (!newVersionNum) return;
    try {
      const res = await fetch('/api/admin/privacy/policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newVersion: newVersionNum,
          sourceVersion: selectedVersion,
          title: `Privacy Notice v${newVersionNum} (Draft)`,
          effectiveFrom: '2026-10-01'
        })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(`Draft Version ${newVersionNum} created successfully!`);
        setShowNewModal(false);
        setNewVersionNum('');
        await loadVersions();
        setSelectedVersion(newVersionNum);
      } else {
        alert(data.error || 'Failed to create version');
      }
    } catch (err) {
      alert('Error creating version');
    }
  };

  // Transition status (draft -> review -> published -> archived)
  const handleStatusChange = async (ver, newStatus) => {
    if (!confirm(`Are you sure you want to change Version ${ver} status to "${newStatus}"?`)) return;
    try {
      const res = await fetch('/api/admin/privacy/policy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_status',
          version: ver,
          status: newStatus
        })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg(data.message);
        loadVersions();
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (err) {
      alert('Error updating status');
    }
  };

  // Save section edits
  const handleSaveSection = async (e) => {
    e.preventDefault();
    if (!editingSection) return;
    try {
      const res = await fetch('/api/admin/privacy/policy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_section',
          sectionId: editingSection.id,
          heading: editingSection.heading,
          content: editingSection.content,
          calloutTitle: editingSection.callout_title,
          calloutContent: editingSection.callout_content
        })
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg('Section updated successfully.');
        setEditingSection(null);
        loadSections(selectedVersion, selectedLang);
      } else {
        alert(data.error || 'Failed to update section');
      }
    } catch (err) {
      alert('Error saving section');
    }
  };

  const currentVersionMeta = versions.find((v) => v.version === selectedVersion && v.language === selectedLang);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', color: '#18232D' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.4rem 0' }}>
            📜 Policy Notice CMS & Version Governance
          </h1>
          <p style={{ color: '#5B6470', fontSize: '0.9rem', margin: 0 }}>
            Manage versioned privacy policy notices, review drafts, edit multilingual sections, and safely publish under DPDP statutory lifecycle controls.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link
            href="/privacy"
            target="_blank"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: '#FFFFFF',
              border: '1px solid #cbd5e1',
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none',
              color: '#18232D'
            }}
          >
            👁️ View Public Page ↗
          </Link>
          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            style={{
              background: '#159447',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.55rem 1.15rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            + Create New Policy Version (Draft)
          </button>
        </div>
      </div>

      {actionMsg && (
        <div style={{ background: '#EAF6EE', border: '1px solid #159447', color: '#159447', padding: '0.75rem 1.25rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.88rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>✓ {actionMsg}</span>
          <button type="button" onClick={() => setActionMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#159447' }}>✕</button>
        </div>
      )}

      {/* Version & Language Switcher Bar */}
      <div style={{ background: '#FFFFFF', border: '1px solid rgba(24, 35, 45, 0.08)', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8893A0', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
              Select Version
            </label>
            <select
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(e.target.value)}
              style={{ padding: '0.5rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 600 }}
            >
              {[...new Set(versions.map((v) => v.version))].map((ver) => (
                <option key={ver} value={ver}>Version {ver}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#8893A0', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
              Language Tab
            </label>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {[
                { code: 'en', label: 'English' },
                { code: 'gu', label: 'ગુજરાતી' },
                { code: 'hi', label: 'हिन्दी' }
              ].map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setSelectedLang(l.code)}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: selectedLang === l.code ? '#159447' : '#cbd5e1',
                    background: selectedLang === l.code ? '#EAF6EE' : '#FFFFFF',
                    color: selectedLang === l.code ? '#159447' : '#5B6470'
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Current Version Workflow Actions */}
        {currentVersionMeta && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#8893A0', textTransform: 'uppercase', fontWeight: 700 }}>Status: </span>
              <span style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '0.25rem 0.65rem',
                borderRadius: '6px',
                background: currentVersionMeta.status === 'published' ? '#EAF6EE' : currentVersionMeta.status === 'review' ? '#FEF3C7' : currentVersionMeta.status === 'draft' ? '#F1F5F9' : '#FEE2E2',
                color: currentVersionMeta.status === 'published' ? '#159447' : currentVersionMeta.status === 'review' ? '#B45309' : currentVersionMeta.status === 'draft' ? '#475569' : '#DC2626'
              }}>
                {currentVersionMeta.status}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {currentVersionMeta.status === 'draft' && (
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedVersion, 'review')}
                  style={{ background: '#F59E0B', color: '#FFFFFF', border: 'none', padding: '0.45rem 0.85rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Submit for Review
                </button>
              )}

              {currentVersionMeta.status === 'review' && (
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedVersion, 'published')}
                  style={{ background: '#159447', color: '#FFFFFF', border: 'none', padding: '0.45rem 0.85rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Approve & Publish Live
                </button>
              )}

              {currentVersionMeta.status === 'published' && (
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedVersion, 'archived')}
                  style={{ background: '#64748B', color: '#FFFFFF', border: 'none', padding: '0.45rem 0.85rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Archive Version
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sections List */}
      <div style={{ background: '#FFFFFF', border: '1px solid rgba(24, 35, 45, 0.08)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
            Policy Sections in {selectedLang.toUpperCase()} ({sections.length} Sections)
          </h2>
          <span style={{ fontSize: '0.82rem', color: '#8893A0' }}>
            Click &ldquo;Edit Clause&rdquo; to modify wording safely
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#5B6470' }}>Loading sections...</div>
        ) : sections.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#5B6470' }}>No sections found for this version.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {sections.map((sec) => (
              <div
                key={sec.id}
                style={{
                  padding: '1.25rem',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '1.5rem'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#159447', background: '#EAF6EE', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                      {sec.section_number}
                    </span>
                    <strong style={{ fontSize: '0.98rem', color: '#18232D' }}>{sec.heading}</strong>
                  </div>
                  {sec.subheading && (
                    <div style={{ fontSize: '0.85rem', color: '#5B6470', marginBottom: '0.5rem' }}>
                      {sec.subheading}
                    </div>
                  )}
                  <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6, margin: 0 }}>
                    {sec.content.length > 220 ? `${sec.content.substring(0, 220)}...` : sec.content}
                  </p>
                  {sec.callout_title && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#159447', fontWeight: 600 }}>
                      💡 Callout: {sec.callout_title}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setEditingSection(sec)}
                    style={{
                      background: '#F1F5F9',
                      border: '1px solid #cbd5e1',
                      padding: '0.4rem 0.75rem',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      color: '#18232D'
                    }}
                  >
                    Edit Clause ✏️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Section Modal */}
      {editingSection && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', maxWidth: '650px', width: '100%', padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1rem 0' }}>
              Edit Section {editingSection.section_number} ({selectedLang.toUpperCase()})
            </h3>
            <form onSubmit={handleSaveSection}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#18232D', display: 'block', marginBottom: '0.35rem' }}>
                  Heading
                </label>
                <input
                  type="text"
                  value={editingSection.heading || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, heading: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#18232D', display: 'block', marginBottom: '0.35rem' }}>
                  Policy Content / Explanation
                </label>
                <textarea
                  rows={6}
                  value={editingSection.content || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, content: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', lineHeight: 1.5 }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#18232D', display: 'block', marginBottom: '0.35rem' }}>
                  Callout Title (Optional)
                </label>
                <input
                  type="text"
                  value={editingSection.callout_title || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, callout_title: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#18232D', display: 'block', marginBottom: '0.35rem' }}>
                  Callout Content (Optional)
                </label>
                <textarea
                  rows={3}
                  value={editingSection.callout_content || ''}
                  onChange={(e) => setEditingSection({ ...editingSection, callout_content: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  style={{ background: '#F1F5F9', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: '#159447', color: '#FFFFFF', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Version Modal */}
      {showNewModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
              Create New Policy Version (Draft)
            </h3>
            <p style={{ color: '#5B6470', fontSize: '0.85rem', margin: '0 0 1.25rem 0' }}>
              This will create a new Draft version cloned from Version {selectedVersion} across all 3 languages (EN, GU, HI). Existing published versions will not be altered until you explicitly publish the draft.
            </p>
            <form onSubmit={handleCreateDraft}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#18232D', display: 'block', marginBottom: '0.35rem' }}>
                  Version Number (e.g. 1.3)
                </label>
                <input
                  type="text"
                  placeholder="1.3"
                  value={newVersionNum}
                  onChange={(e) => setNewVersionNum(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  style={{ background: '#F1F5F9', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: '#159447', color: '#FFFFFF', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Create Draft Version
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
