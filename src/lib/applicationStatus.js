/**
 * Application Status State Machine & Semantic Definitions
 * 
 * Statuses:
 * draft → payment_pending → paid → submitted → assigned → under_review →
 * (correction_required ⇄ resubmitted) → government_processing → completed
 */

export const APPLICATION_STATUSES = [
  'draft',
  'payment_pending',
  'paid',
  'submitted',
  'assigned',
  'under_review',
  'correction_required',
  'resubmitted',
  'government_processing',
  'completed'
];

export const PAYMENT_STATUSES = [
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded'
];

export const DOCUMENT_STATUSES = [
  'uploaded',
  'verified',
  'rejected'
];

/**
 * Transition rules definition:
 * Each entry specifies:
 * - allowedRoles: Array of roles ('operator', 'admin')
 * - requiresFields: Array of field names that must be present and non-empty
 * - checkPreconditions: function(context) returning { ok: boolean, reason?: string }
 */
export const STATUS_TRANSITIONS = {
  submitted: {
    assigned: {
      allowedRoles: ['operator', 'admin'],
      requiresFields: ['operator_id'],
      labelKey: 'action_assign',
      descriptionKey: 'action_assign_desc',
      validate: (context, role) => {
        if (role === 'operator') {
          // Self-claim only: operator can only assign to themselves
          if (context.operator_id && Number(context.operator_id) !== Number(context.currentUserId)) {
            return { ok: false, reason: 'Operators may only self-claim applications within their jurisdiction.' };
          }
        }
        return { ok: true };
      }
    }
  },
  assigned: {
    under_review: {
      allowedRoles: ['operator', 'admin'],
      requiresFields: [],
      labelKey: 'action_start_review',
      descriptionKey: 'action_start_review_desc',
      validate: (context, role) => {
        if (role === 'operator') {
          if (context.assigned_operator_id && Number(context.assigned_operator_id) !== Number(context.currentUserId)) {
            return { ok: false, reason: 'Only the assigned operator or an admin may start review.' };
          }
        }
        return { ok: true };
      }
    }
  },
  under_review: {
    correction_required: {
      allowedRoles: ['operator', 'admin'],
      requiresFields: ['correction_reason'],
      labelKey: 'action_request_correction',
      descriptionKey: 'action_request_correction_desc',
      validate: (context) => {
        if (!context.correction_reason || !context.correction_reason.trim()) {
          return { ok: false, reason: 'Correction reason is required.' };
        }
        return { ok: true };
      }
    },
    government_processing: {
      allowedRoles: ['operator', 'admin'],
      requiresFields: [],
      labelKey: 'action_send_government',
      descriptionKey: 'action_send_government_desc',
      validate: (context) => {
        if (context.payment_status !== 'completed') {
          return {
            ok: false,
            reason: `Payment must be completed before government submission (current: ${context.payment_status || 'unpaid'}).`
          };
        }
        if (context.unverifiedDocumentCount && context.unverifiedDocumentCount > 0) {
          return {
            ok: false,
            reason: `All required documents must be verified first (${context.unverifiedDocumentCount} pending/unverified).`
          };
        }
        if (context.hasRejectedDocuments) {
          return {
            ok: false,
            reason: 'Cannot forward to government processing while documents are rejected.'
          };
        }
        return { ok: true };
      }
    }
  },
  correction_required: {
    // Citizen action only — staff may not set this directly
    resubmitted: {
      allowedRoles: ['citizen'],
      requiresFields: [],
      labelKey: 'action_resubmit',
      descriptionKey: 'action_resubmit_desc',
      validate: () => ({ ok: true })
    }
  },
  resubmitted: {
    under_review: {
      allowedRoles: ['operator', 'admin'],
      requiresFields: [],
      labelKey: 'action_resume_review',
      descriptionKey: 'action_resume_review_desc',
      validate: (context, role) => {
        if (role === 'operator' && context.assigned_operator_id) {
          if (Number(context.assigned_operator_id) !== Number(context.currentUserId)) {
            return { ok: false, reason: 'Only the assigned operator or an admin may resume review.' };
          }
        }
        return { ok: true };
      }
    }
  },
  government_processing: {
    completed: {
      allowedRoles: ['operator', 'admin'],
      requiresFields: ['government_application_number'],
      labelKey: 'action_mark_completed',
      descriptionKey: 'action_mark_completed_desc',
      validate: (context) => {
        if (!context.government_application_number || !context.government_application_number.trim()) {
          return { ok: false, reason: 'Government application number is required to mark as completed.' };
        }
        return { ok: true };
      }
    }
  }
};

/**
 * Check if a status transition is permitted.
 * @param {string} role - 'admin', 'operator', or 'citizen'
 * @param {string} from - current status
 * @param {string} to - target status
 * @param {Object} [context={}] - application context (payment_status, unverifiedDocumentCount, currentUserId, etc.)
 * @returns {{ allowed: boolean, reason?: string, isOverride?: boolean }}
 */
export function canTransition(role, from, to, context = {}) {
  if (!from || !to) {
    return { allowed: false, reason: 'Invalid from or to status.' };
  }

  if (from === to) {
    return { allowed: false, reason: 'Application is already in this status.' };
  }

  // Admin override capability for any -> any
  if (role === 'admin' && context.isOverride) {
    if (!context.override_reason || !context.override_reason.trim()) {
      return { allowed: false, reason: 'Admin status override requires a typed reason.' };
    }
    return { allowed: true, isOverride: true };
  }

  const fromTransitions = STATUS_TRANSITIONS[from];
  if (!fromTransitions || !fromTransitions[to]) {
    // If admin didn't explicitly flag isOverride, but transition is not in graph
    if (role === 'admin') {
      return {
        allowed: false,
        reason: `Transition from "${from}" to "${to}" is not a standard workflow transition. Admin override with a typed reason is required.`
      };
    }
    return {
      allowed: false,
      reason: `Transition from "${from}" to "${to}" is not permitted.`
    };
  }

  const transition = fromTransitions[to];
  if (!transition.allowedRoles.includes(role)) {
    return {
      allowed: false,
      reason: `Role "${role}" is not authorized to transition from "${from}" to "${to}".`
    };
  }

  // Check required fields
  if (transition.requiresFields) {
    for (const field of transition.requiresFields) {
      if (!context[field] || (typeof context[field] === 'string' && !context[field].trim())) {
        return {
          allowed: false,
          reason: `Missing required field: ${field}.`
        };
      }
    }
  }

  // Execute custom validation
  if (transition.validate) {
    const valResult = transition.validate(context, role);
    if (!valResult.ok) {
      return { allowed: false, reason: valResult.reason };
    }
  }

  return { allowed: true };
}

/**
 * Returns list of field keys required when transitioning to `toStatus`.
 * @param {string} toStatus 
 * @returns {string[]}
 */
export function requiredFieldsFor(toStatus) {
  switch (toStatus) {
    case 'assigned':
      return ['operator_id'];
    case 'correction_required':
      return ['correction_reason'];
    case 'completed':
      return ['government_application_number'];
    default:
      return [];
  }
}

/**
 * Returns available transitions for a given application state and user role.
 * @param {string} role
 * @param {string} currentStatus
 * @param {Object} context
 * @returns {Array<{ to: string, labelKey: string, descriptionKey: string, allowed: boolean, reason?: string }>}
 */
export function getAvailableTransitions(role, currentStatus, context = {}) {
  const transitions = STATUS_TRANSITIONS[currentStatus] || {};
  return Object.keys(transitions).map(targetStatus => {
    const check = canTransition(role, currentStatus, targetStatus, context);
    const rule = transitions[targetStatus];
    return {
      to: targetStatus,
      labelKey: rule.labelKey,
      descriptionKey: rule.descriptionKey,
      allowed: check.allowed,
      reason: check.reason || null
    };
  });
}

/**
 * Status UI metadata: semantic colors, badge variants, and icons.
 * Never encode status by color alone.
 */
export const STATUS_METADATA = {
  draft: {
    variant: 'neutral',
    color: '#6b7280',
    bg: '#f3f4f6',
    border: '#d1d5db',
    icon: 'DraftIcon',
    symbol: '○',
    labelKey: 'status_draft'
  },
  payment_pending: {
    variant: 'warning',
    color: '#b45309',
    bg: '#fef3c7',
    border: '#fde68a',
    icon: 'ClockIcon',
    symbol: '⏳',
    labelKey: 'status_payment_pending'
  },
  paid: {
    variant: 'info',
    color: '#1d4ed8',
    bg: '#eff6ff',
    border: '#bfdbfe',
    icon: 'CreditCardIcon',
    symbol: '💳',
    labelKey: 'status_paid'
  },
  submitted: {
    variant: 'neutral',
    color: '#475569',
    bg: '#f1f5f9',
    border: '#cbd5e1',
    icon: 'InboxIcon',
    symbol: '📥',
    labelKey: 'status_submitted'
  },
  assigned: {
    variant: 'info',
    color: '#0369a1',
    bg: '#e0f2fe',
    border: '#bae6fd',
    icon: 'UserCheckIcon',
    symbol: '👤',
    labelKey: 'status_assigned'
  },
  under_review: {
    variant: 'info',
    color: '#1d4ed8',
    bg: '#eff6ff',
    border: '#bfdbfe',
    icon: 'SearchIcon',
    symbol: '🔍',
    labelKey: 'status_under_review'
  },
  correction_required: {
    variant: 'warning',
    color: '#b45309',
    bg: '#fef3c7',
    border: '#fde68a',
    icon: 'AlertTriangleIcon',
    symbol: '⚠️',
    labelKey: 'status_correction_required'
  },
  resubmitted: {
    variant: 'info',
    color: '#0891b2',
    bg: '#ecfeff',
    border: '#a5f3fc',
    icon: 'RefreshCwIcon',
    symbol: '🔄',
    labelKey: 'status_resubmitted'
  },
  government_processing: {
    variant: 'violet',
    color: '#6d28d9',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    icon: 'BuildingIcon',
    symbol: '🏛️',
    labelKey: 'status_government_processing'
  },
  completed: {
    variant: 'success',
    color: '#15803d',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    icon: 'CheckCircleIcon',
    symbol: '✓',
    labelKey: 'status_completed'
  }
};

/**
 * Payment Status UI metadata
 */
export const PAYMENT_STATUS_METADATA = {
  pending: { variant: 'neutral', color: '#6b7280', bg: '#f3f4f6', symbol: '○', labelKey: 'payment_pending' },
  processing: { variant: 'info', color: '#1d4ed8', bg: '#eff6ff', symbol: '⏳', labelKey: 'payment_processing' },
  completed: { variant: 'success', color: '#15803d', bg: '#f0fdf4', symbol: '✓', labelKey: 'payment_completed' },
  failed: { variant: 'danger', color: '#b91c1c', bg: '#fef2f2', symbol: '✕', labelKey: 'payment_failed' },
  refunded: { variant: 'neutral', color: '#475569', bg: '#f1f5f9', symbol: '↩', labelKey: 'payment_refunded' }
};

/**
 * Document upload status UI metadata
 */
export const DOCUMENT_STATUS_METADATA = {
  uploaded: { variant: 'neutral', color: '#0369a1', bg: '#e0f2fe', symbol: '📄', labelKey: 'doc_uploaded' },
  verified: { variant: 'success', color: '#15803d', bg: '#f0fdf4', symbol: '✓', labelKey: 'doc_verified' },
  rejected: { variant: 'danger', color: '#b91c1c', bg: '#fef2f2', symbol: '✕', labelKey: 'doc_rejected' }
};
