'use client';

import { STATUS_METADATA, PAYMENT_STATUS_METADATA, DOCUMENT_STATUS_METADATA } from '@/lib/applicationStatus';
import { useApp } from '@/contexts/AppContext';

export default function StatusPill({ status, type = 'application' }) {
  const { t } = useApp();

  let meta = STATUS_METADATA[status];
  let prefix = 'staff.status_';

  if (type === 'payment') {
    meta = PAYMENT_STATUS_METADATA[status];
    prefix = 'staff.payment_';
  } else if (type === 'document') {
    meta = DOCUMENT_STATUS_METADATA[status];
    prefix = 'staff.doc_';
  }

  if (!meta) {
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: 600,
        backgroundColor: '#f1f5f9',
        color: '#475569',
        border: '1px solid #cbd5e1'
      }}>
        <span>○</span>
        <span>{status || 'Unknown'}</span>
      </span>
    );
  }

  const translatedLabel = t(`${prefix}${status}`) || status?.replace(/_/g, ' ') || 'Unknown';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 9px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: 600,
        backgroundColor: meta.bg,
        color: meta.color,
        border: `1px solid ${meta.border || meta.color}40`,
        letterSpacing: '0.02em',
        textTransform: 'capitalize'
      }}
      aria-label={`${type} status: ${translatedLabel}`}
    >
      <span aria-hidden="true" style={{ fontSize: '10px' }}>{meta.symbol}</span>
      <span>{translatedLabel}</span>
    </span>
  );
}
