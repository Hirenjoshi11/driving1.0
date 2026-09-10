import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { isApplicationInScope } from '@/lib/scope';
import { maskAadhaar, maskMobile } from '@/lib/audit';
import { getAvailableTransitions } from '@/lib/applicationStatus';
const { getDb } = require('@/lib/db');

/**
 * GET /api/staff/applications/[id]
 * Retrieves comprehensive case detail, document checklist, and status timeline.
 * If operator is out of jurisdiction, returns 404 (not 403) to prevent enumeration.
 */
export async function GET(request, { params }) {
  try {
    const session = await getSessionUser(request);
    if (!session || (session.role !== 'operator' && session.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized staff access' }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();

    // Verify jurisdiction scope: operators outside jurisdiction receive 404
    if (!isApplicationInScope(db, session, id)) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const isNumeric = !isNaN(Number(id));
    const appQuery = `
      SELECT 
        a.*,
        s.name as state_name,
        s.code as state_code,
        ls.name as service_name,
        ls.code as service_code,
        r.code as rto_code,
        r.name as rto_name,
        dtc.name as test_centre_name,
        dtc.address as test_centre_address,
        d.name as district_name,
        u.name as operator_name,
        u.phone as operator_phone
      FROM applications a
      LEFT JOIN states s ON a.state_id = s.id
      LEFT JOIN licence_services ls ON a.service_id = ls.id
      LEFT JOIN rto_offices r ON a.rto_id = r.id
      LEFT JOIN driving_test_centres dtc ON a.test_centre_id = dtc.id
      LEFT JOIN districts d ON a.district_id = d.id
      LEFT JOIN users u ON a.assigned_operator_id = u.id
      WHERE ${isNumeric ? 'a.id = ?' : 'a.application_number = ?'}
      LIMIT 1
    `;

    const app = await db.prepare(appQuery).get(isNumeric ? Number(id) : String(id));
    if (!app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Fetch documents: list all required documents for this service/state joined with uploaded docs
    const docsQuery = `
      SELECT 
        sd.id as service_doc_id,
        sd.is_required,
        sd.help_text,
        dt.id as document_type_id,
        dt.name as document_name,
        dt.code as document_code,
        dt.category as document_category,
        dt.max_size_mb,
        dt.id as document_type_id,
        dt.name as document_name,
        dt.code as document_code,
        dt.category as document_category,
        dt.max_size_mb,
        ad.id as upload_id,
        ad.original_filename,
        CASE WHEN ad.id IS NOT NULL THEN '/api/documents/download/' || ad.id ELSE NULL END as download_url,
        ad.file_size,
        ad.mime_type,
        ad.upload_status,
        ad.rejection_reason,
        ad.uploaded_at,
        ad.verified_at
      FROM service_documents sd
      JOIN document_types dt ON sd.document_type_id = dt.id
      LEFT JOIN application_documents ad ON ad.document_type_id = dt.id AND ad.application_id = ?
      WHERE sd.service_id = ? AND sd.state_id = ? AND sd.is_active = 1
      ORDER BY sd.is_required DESC, sd.sort_order ASC
    `;

    const documents = await db.prepare(docsQuery).all(app.id, app.service_id, app.state_id);

    // Also include any other uploaded documents that may not be in service_documents
    const otherDocsQuery = `
      SELECT 
        ad.id as upload_id,
        ad.original_filename,
        CASE WHEN ad.id IS NOT NULL THEN '/api/documents/download/' || ad.id ELSE NULL END as download_url,
        ad.file_size,
        ad.mime_type,
        ad.upload_status,
        ad.rejection_reason,
        ad.uploaded_at,
        ad.verified_at,
        dt.id as document_type_id,
        dt.name as document_name,
        dt.code as document_code,
        dt.category as document_category,
        0 as is_required
      FROM application_documents ad
      JOIN document_types dt ON ad.document_type_id = dt.id
      WHERE ad.application_id = ?
        AND ad.document_type_id NOT IN (
          SELECT document_type_id FROM service_documents WHERE service_id = ? AND state_id = ?
        )
    `;
    const otherDocs = await db.prepare(otherDocsQuery).all(app.id, app.service_id, app.state_id);
    const allDocuments = [...documents, ...otherDocs];

    // Status Timeline
    const historyQuery = `
      SELECT 
        ash.id,
        ash.from_status,
        ash.to_status,
        ash.reason,
        ash.notes,
        ash.created_at,
        u.name as actor_name,
        u.role as actor_role
      FROM application_status_history ash
      LEFT JOIN users u ON ash.changed_by = u.id
      WHERE ash.application_id = ?
      ORDER BY ash.created_at ASC
    `;
    const timeline = await db.prepare(historyQuery).all(app.id);

    // Document counts for transition evaluation
    const requiredDocs = allDocuments.filter(d => d.is_required === 1);
    const unverifiedRequired = requiredDocs.filter(d => d.upload_status !== 'verified');
    const hasRejectedDocs = allDocuments.some(d => d.upload_status === 'rejected');

    // Context for State Machine
    const transitionContext = {
      payment_status: app.payment_status,
      unverifiedDocumentCount: unverifiedRequired.length,
      hasRejectedDocuments: hasRejectedDocs,
      currentUserId: session.userId,
      assigned_operator_id: app.assigned_operator_id,
      operator_id: app.assigned_operator_id
    };

    const availableTransitions = getAvailableTransitions(session.role, app.status, transitionContext);

    // Consistency Checks (inline alerts)
    const inconsistencies = [];
    if (app.date_of_birth) {
      const birthDate = new Date(app.date_of_birth);
      const ageDifMs = Date.now() - birthDate.getTime();
      const ageDate = new Date(ageDifMs);
      const computedAge = Math.abs(ageDate.getUTCFullYear() - 1970);
      
      if (computedAge < 18 && !app.is_minor) {
        inconsistencies.push({
          field: 'date_of_birth',
          severity: 'warning',
          message: `Applicant is ${computedAge} years old (under 18) but minor declaration is not marked.`
        });
      }
    }

    if (app.medical_required === 1) {
      const hasMedCert = allDocuments.some(d => 
        (d.document_category === 'medical' || d.document_name.toLowerCase().includes('medical')) &&
        d.upload_status === 'verified'
      );
      if (!hasMedCert) {
        inconsistencies.push({
          field: 'medical_required',
          severity: 'warning',
          message: 'Medical certificate is flagged as required, but no verified certificate is on file.'
        });
      }
    }

    // Default detail view: Mask Aadhaar/identity_number
    const maskedIdentityNumber = maskAadhaar(app.identity_number);
    const maskedGuardianAadhaar = maskAadhaar(app.guardian_aadhaar);

    const safeApplication = {
      ...app,
      identity_number: maskedIdentityNumber,
      guardian_aadhaar: maskedGuardianAadhaar,
      raw_mobile: undefined, // Hide raw PII
      mobile_display: maskMobile(app.mobile)
    };

    return NextResponse.json({
      application: safeApplication,
      documents: allDocuments,
      timeline,
      transitions: availableTransitions,
      inconsistencies,
      stats: {
        totalDocs: allDocuments.length,
        requiredDocs: requiredDocs.length,
        verifiedDocs: allDocuments.filter(d => d.upload_status === 'verified').length,
        rejectedDocs: allDocuments.filter(d => d.upload_status === 'rejected').length,
        pendingDocs: unverifiedRequired.length
      }
    });
  } catch (error) {
    console.error('Case detail API error:', error);
    return NextResponse.json({ error: 'Failed to retrieve application detail' }, { status: 500 });
  }
}
