import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getSessionUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { logDocumentAccess } from '@/lib/audit';
import { isApplicationInScope } from '@/lib/scope';
import { checkRateLimit, rateLimitExceededResponse } from '@/lib/rateLimit';

export async function GET(request, { params }) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const clientIp = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(`doc_${session.userId}_${clientIp}`, 30, 60 * 1000);
    if (!rateCheck.allowed) {
      return rateLimitExceededResponse(rateCheck.resetTime);
    }

    const resolvedParams = await params;
    const docId = resolvedParams.docId;
    if (!docId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    const db = getDb();
    const doc = db.prepare(`
      SELECT ad.*, a.user_id as applicant_user_id, a.id as app_id
      FROM application_documents ad
      JOIN applications a ON ad.application_id = a.id
      WHERE ad.id = ?
    `).get(docId);

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Role-based authorization
    if (session.role === 'citizen') {
      if (doc.applicant_user_id !== session.userId) {
        return NextResponse.json({ error: 'Forbidden: Document does not belong to you' }, { status: 403 });
      }
    } else if (session.role === 'operator') {
      const inScope = isApplicationInScope(db, session, doc.app_id);
      if (!inScope) {
        return NextResponse.json({ error: 'Not found: Out of jurisdiction' }, { status: 404 });
      }
    } else if (session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verify file exists on disk
    if (!doc.file_path || !fs.existsSync(doc.file_path)) {
      return NextResponse.json({ error: 'Document file storage missing' }, { status: 404 });
    }

    // Log document access audit
    logDocumentAccess(db, {
      documentId: doc.id,
      applicationId: doc.app_id,
      actorId: session.userId,
      actorRole: session.role,
      action: 'download',
      ip: clientIp,
      userAgent: request.headers.get('user-agent'),
    });

    const fileBuffer = fs.readFileSync(doc.file_path);
    const mimeType = doc.mime_type || 'application/octet-stream';
    const filename = encodeURIComponent(doc.original_filename || 'document');

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'",
      },
    });
  } catch (error) {
    console.error('Error downloading document:', error);
    return NextResponse.json({ error: 'Internal server error downloading document' }, { status: 500 });
  }
}
