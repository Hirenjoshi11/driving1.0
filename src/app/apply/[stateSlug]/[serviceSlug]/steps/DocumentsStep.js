'use client';
import { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { calculateAge, isMinorAge } from '@/lib/age.js';
import FieldError from '@/components/validation/FieldError';
import styles from './steps.module.css';

export default function DocumentsStep({
  formData,
  updateFormData,
  serviceId,
  stateId,
  localize,
  t,
  stepErrors = {},
}) {
  const { t: contextT } = useApp();
  const tr = t || contextT;

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Applicant age
  const age = useMemo(() => calculateAge(formData.dob) ?? 25, [formData.dob]);
  const isMinor = isMinorAge(formData.dob);
  const isSenior = age >= 40;

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch(`/api/documents?serviceId=${serviceId || 1}&stateId=${stateId || 1}`);
        const data = await res.json();
        setDocuments(data.documents || []);
      } catch (err) {
        console.error('Failed to load documents:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, [serviceId, stateId]);

  // Determine if a conditional document is applicable
  const isDocApplicable = (doc) => {
    if (doc.is_required === 1) return true;

    if (doc.condition_field === 'age_group') {
      if (doc.condition_value === 'under_40') return !isSenior;
      if (doc.condition_value === 'above_40') return isSenior;
    }

    if (doc.condition_field === 'is_minor') {
      return isMinor;
    }

    return true;
  };

  const applicableDocs = documents.filter(isDocApplicable);
  const uploadedDocs = formData.uploadedDocuments || {};
  const documentFiles = formData.documentFiles || {};
  const [uploadErrors, setUploadErrors] = useState({});

  const [isDragging, setIsDragging] = useState({});

  const handleFileUpload = (docId, file) => {
    if (!file) return;

    // Check size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadErrors((prev) => ({
        ...prev,
        [docId]:
          tr('validation.unsupportedFileDesc') ||
          'File size exceeds the 5MB limit. Please upload a smaller PDF, JPG, or PNG document.',
      }));
      return;
    }

    // Check type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      setUploadErrors((prev) => ({
        ...prev,
        [docId]:
          tr('validation.unsupportedFileDesc') ||
          'Unsupported file type. Please upload a PDF, JPG, or PNG file up to the allowed size.',
      }));
      return;
    }

    setUploadErrors((prev) => {
      const next = { ...prev };
      delete next[docId];
      return next;
    });

    const docMeta = {
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      type: file.type,
      uploadedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    const nextUploads = {
      ...uploadedDocs,
      [docId]: docMeta,
    };
    updateFormData('uploadedDocuments', nextUploads);

    const nextFiles = {
      ...documentFiles,
      [docId]: file,
    };
    updateFormData('documentFiles', nextFiles);
  };

  const handleRemoveDoc = (docId) => {
    const nextUploads = { ...uploadedDocs };
    delete nextUploads[docId];
    updateFormData('uploadedDocuments', nextUploads);

    const nextFiles = { ...documentFiles };
    delete nextFiles[docId];
    updateFormData('documentFiles', nextFiles);
  };

  const generalDocError = stepErrors.documents || stepErrors.uploadedDocuments;

  return (
    <div className={styles.stepContainer} id="field-documents" tabIndex={-1} style={{ outline: 'none' }}>
      <div className={styles.stepHeader}>
        <h3 className={styles.stepTitle}>{tr('form.documentsRequired')}</h3>
        <p className={styles.stepDesc}>
          {tr('form.documentsSubhead')}
        </p>
      </div>

      <div className={styles.noticeBox}>
        <span>📌</span>
        <div>
          <strong>{tr('form.documentsRequired')}</strong>
          <p>
            {tr('form.uploadNotice')}
          </p>
        </div>
      </div>

      {generalDocError && (
        <div style={{ marginBottom: '1rem' }}>
          <FieldError error={generalDocError} id="err-documents" />
        </div>
      )}

      {loading ? (
        <div className="loading-center">
          <div className="spinner"></div>
          <p>{tr('common.loading')}</p>
        </div>
      ) : (
        <div className={styles.documentList}>
          {applicableDocs.map((doc) => {
            const isUploaded = !!uploadedDocs[doc.id];
            const uploadedFile = uploadedDocs[doc.id];
            const isMandatory = doc.is_required === 1 || (doc.condition_field && isDocApplicable(doc));
            const docError = stepErrors[`doc_${doc.id}`] || stepErrors[doc.id] || uploadErrors[doc.id];
            const draggingThis = isDragging[doc.id];

            return (
              <div
                key={doc.id}
                id={`field-doc-${doc.id}`}
                tabIndex={-1}
                className={`${styles.docItem} ${isUploaded ? styles.docItemUploaded : ''} ${
                  docError ? 'fieldErrorBorder' : ''
                }`}
                style={{ outline: 'none' }}
              >
                <div className={styles.docItemHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: 'var(--font-size-lg)' }}>
                      {isUploaded ? '✅' : '📄'}
                    </span>
                    <span className={styles.docItemTitle}>
                      {localize ? localize(doc, 'name') : doc.name}
                    </span>
                  </div>

                  <span className={isMandatory ? styles.docBadgeRequired : styles.docBadgeOptional}>
                    {isMandatory ? tr('common.required') : tr('common.optional')}
                  </span>
                </div>

                <p className={styles.docDesc}>
                  {localize ? localize(doc, 'description') : doc.description}
                </p>

                {doc.where_to_get && (
                  <div className={styles.docWhereToGet}>
                    <strong>{tr('documents.whereToObtain')}:</strong> {localize ? localize(doc, 'where_to_get') : doc.where_to_get}
                  </div>
                )}

                {/* Upload or Uploaded display */}
                {isUploaded ? (
                  <div className={styles.uploadAreaUploaded}>
                    <div className={styles.uploadedFileMeta}>
                      <span style={{ fontSize: 'var(--font-size-xl)' }}>📑</span>
                      <div>
                        <div className={styles.uploadedFileName}>
                          <span style={{ color: 'var(--color-primary)', fontWeight: 700, marginRight: '6px' }}>✓</span>
                          {uploadedFile.name}
                        </div>
                        <div className={styles.uploadedFileSize}>
                          {uploadedFile.size} • {tr('documents.uploaded') || 'Uploaded'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: 600,
                          color: 'var(--color-primary)',
                          cursor: 'pointer',
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--color-border)',
                          background: 'var(--color-white)',
                        }}
                      >
                        <input
                          type="file"
                          className="sr-only"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(doc.id, e.target.files[0])}
                        />
                        ↻ {tr('documents.replace') || 'Replace'}
                      </label>
                      <button
                        type="button"
                        className={styles.removeFileBtn}
                        onClick={() => handleRemoveDoc(doc.id)}
                      >
                        ✕ {tr('documents.remove')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    className={styles.uploadArea}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging((prev) => ({ ...prev, [doc.id]: true }));
                    }}
                    onDragLeave={() => {
                      setIsDragging((prev) => ({ ...prev, [doc.id]: false }));
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging((prev) => ({ ...prev, [doc.id]: false }));
                      if (e.dataTransfer?.files?.[0]) {
                        handleFileUpload(doc.id, e.dataTransfer.files[0]);
                      }
                    }}
                    style={{
                      border: docError
                        ? '2px dashed var(--color-error)'
                        : draggingThis
                        ? '2px dashed var(--color-primary)'
                        : undefined,
                      background: docError
                        ? 'var(--color-error-light)'
                        : draggingThis
                        ? 'var(--color-primary-light)'
                        : undefined,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <input
                      type="file"
                      className="sr-only"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(doc.id, e.target.files[0])}
                    />
                    <div style={{ fontSize: 'var(--font-size-2xl)', marginBottom: '6px' }}>📤</div>
                    <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-primary-dark)', display: 'block' }}>
                      {tr('documents.upload')} {localize ? localize(doc, 'name') : doc.name}
                    </span>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      {tr('form.uploadNotice')}
                    </p>
                    <span style={{
                      display: 'inline-block',
                      marginTop: '6px',
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--color-bg)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-secondary)',
                      fontWeight: 600,
                    }}>
                      PDF, JPG, PNG • Max 5MB
                    </span>
                  </label>
                )}

                {docError && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <FieldError error={docError} id={`err-doc-${doc.id}`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Progress counter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginTop: '1rem' }}>
        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-dark)', fontWeight: 500 }}>
          {tr('documents.title')}: {Object.keys(uploadedDocs).length} / {applicableDocs.length}
        </span>
      </div>
    </div>
  );
}
