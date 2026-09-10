/**
 * DPDP Citizen Data Export Utility
 * 
 * Compiles a structured, sanitized data archive for the citizen's right to access:
 * - Profile details
 * - Applications & History
 * - Document Metadata (no raw local filesystem paths!)
 * - Consents & History
 * - Privacy Requests & Grievances
 * - Third-Party Data Disclosures
 */

import { getDb } from '@/lib/db';
import crypto from 'crypto';

export async function generateCitizenDataPackage(userId) {
  const db = getDb();
  const uid = Number(userId);

  // 1. User Profile
  const user = await db.prepare(`
    SELECT id, name, email, phone, role, preferred_language, created_at, updated_at
    FROM users 
    WHERE id = ?
  `).get(uid);

  if (!user) {
    throw new Error('User record not found');
  }

  // 2. Applications
  const applications = await db.prepare(`
    SELECT a.id, a.application_number, a.status, a.first_name, a.middle_name, a.last_name,
           a.date_of_birth, a.gender, a.mobile, a.email, a.blood_group,
           a.identity_type, a.current_city, a.current_pincode,
           s.name as state_name, ls.name as service_name,
           a.payment_status, a.total_payable, a.created_at, a.updated_at
    FROM applications a
    LEFT JOIN states s ON a.state_id = s.id
    LEFT JOIN licence_services ls ON a.service_id = ls.id
    WHERE a.user_id = ?
    ORDER BY a.created_at DESC
  `).all(uid);

  // 3. Document Metadata
  const appIds = applications.map(a => a.id);
  let documents = [];
  if (appIds.length > 0) {
    const placeholders = appIds.map(() => '?').join(',');
    documents = await db.prepare(`
      SELECT ad.id, ad.application_id, dt.name as document_type,
             ad.original_filename, ad.mime_type, ad.file_size, ad.upload_status, ad.uploaded_at
      FROM application_documents ad
      LEFT JOIN document_types dt ON ad.document_type_id = dt.id
      WHERE ad.application_id IN (${placeholders})
    `).all(...appIds);
  }

  // 4. Consents & Historical Consent Events
  const consents = await db.prepare(`
    SELECT c.*, p.name as purpose_name, p.code as purpose_code, p.legal_basis
    FROM consents c
    JOIN processing_purposes p ON c.purpose_id = p.id
    WHERE c.user_id = ?
  `).all(uid);

  const consentEvents = await db.prepare(`
    SELECT ce.*, p.name as purpose_name
    FROM consent_events ce
    JOIN processing_purposes p ON ce.purpose_id = p.id
    WHERE ce.user_id = ?
    ORDER BY ce.timestamp DESC
  `).all(uid);

  // 5. Privacy Requests
  const privacyRequests = await db.prepare(`
    SELECT id, request_number, request_type, status, reason, resolution, created_at, resolved_at
    FROM privacy_requests
    WHERE user_id = ?
    ORDER BY created_at DESC
  `).all(uid);

  // 6. Grievances
  const grievances = await db.prepare(`
    SELECT id, grievance_number, category, subject, status, resolution, created_at, resolved_at
    FROM grievances
    WHERE user_id = ?
    ORDER BY created_at DESC
  `).all(uid);

  // 7. Data Sharing Disclosures
  const sharingRecords = await db.prepare(`
    SELECT recipient, recipient_type, data_categories, purpose, legal_basis, timestamp
    FROM data_sharing_records
    WHERE user_id = ?
    ORDER BY timestamp DESC
  `).all(uid);

  // 8. Nomination Details
  const nomination = await db.prepare(`
    SELECT nominee_name, nominee_relationship, nominee_phone, nominee_email, status, created_at
    FROM nominations
    WHERE user_id = ? AND status = 'active'
    LIMIT 1
  `).get(uid);

  const exportPayload = {
    metadata: {
      generatedAt: new Date().toISOString(),
      statutoryReference: 'Digital Personal Data Protection Act, 2023 - Section 11 (Right to Access)',
      platform: 'Driving License Form',
      dataPrincipalId: user.id,
      exportHash: crypto.randomUUID(),
    },
    profile: user,
    nomination: nomination || null,
    applications,
    documents,
    consents: {
      currentStatus: consents,
      auditHistory: consentEvents,
    },
    privacyRequests,
    grievances,
    dataDisclosures: sharingRecords,
  };

  return exportPayload;
}
