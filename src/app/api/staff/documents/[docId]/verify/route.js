import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth';
import { isApplicationInScope } from '@/lib/scope';
import { logAudit } from '@/lib/audit';
const { getDb } = require('@/lib/db');

const VerifyDocSchema = z.object({
  decision: z.enum(['verified', 'rejected']),
  rejectionReason: z.string().optional()
}).refine(data => {
  if (data.decision === 'rejected') {
    return !!(data.rejectionReason && data.rejectionReason.trim());
  }
  return true;
}, {
  message: 'Rejection requires a non-empty rejectionReason',
  path: ['rejectionReason']
});

export async function POST(request, { params }) {
  try {
    const session = await getSessionUser(request);
    if (!session || (session.role !== 'operator' && session.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized staff access' }, { status: 401 });
    }

    const { docId } = await params;
    const db = getDb();

    const body = await request.json();
    const parsed = VerifyDocSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const { decision, rejectionReason } = parsed.data;

    // Fetch document and associated application
    const doc = await db.prepare(`
      SELECT 
        ad.id,
        ad.application_id,
        ad.original_filename,
        ad.upload_status,
        dt.name as doc_type_name,
        a.application_number
      FROM application_documents ad
      JOIN document_types dt ON ad.document_type_id = dt.id
      JOIN applications a ON ad.application_id = a.id
      WHERE ad.id = ?
    `).get(Number(docId));

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Verify scope on associated application (404 if out of scope)
    if (!isApplicationInScope(db, session, doc.application_id)) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Update document record
    const updateDoc = db.transaction(async () => {
      await db.prepare(`
        UPDATE application_documents 
        SET upload_status = ?,
            rejection_reason = ?,
            verified_at = datetime('now')
        WHERE id = ?
      `).run(
        decision,
        decision === 'rejected' ? rejectionReason.trim() : null,
        doc.id
      );

      // Write Audit Log
      await logAudit(db, {
        actorId: session.userId,
        actorRole: session.role,
        action: decision === 'verified' ? 'document.verify' : 'document.reject',
        entityType: 'document',
        entityId: doc.id,
        summary: `${decision === 'verified' ? 'Verified' : 'Rejected'} ${doc.doc_type_name} for application ${doc.application_number}`,
        metadata: {
          application_id: doc.application_id,
          application_number: doc.application_number,
          decision,
          rejection_reason: decision === 'rejected' ? rejectionReason : null,
          filename: doc.original_filename
        }
      });
    });

    await updateDoc();

    return NextResponse.json({
      success: true,
      document_id: doc.id,
      upload_status: decision,
      rejection_reason: decision === 'rejected' ? rejectionReason : null
    });
  } catch (error) {
    console.error('Verify document API error:', error);
    return NextResponse.json({ error: 'Failed to update document verification status' }, { status: 500 });
  }
}
