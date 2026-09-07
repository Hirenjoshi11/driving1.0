import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { getSessionUser } from '@/lib/auth.js';
const { getDb } = require('@/lib/db');

// Helper to detect MIME from magic bytes
function detectMimeType(buffer) {
  if (!buffer || buffer.length < 4) return null;

  // PDF: %PDF- (0x25 0x50 0x44 0x46 0x2D)
  if (
    buffer.length >= 5 &&
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46 &&
    buffer[4] === 0x2d
  ) {
    return { mime: 'application/pdf', ext: '.pdf' };
  }

  // PNG: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { mime: 'image/png', ext: '.png' };
  }

  // JPEG: 0xFF 0xD8 0xFF
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return { mime: 'image/jpeg', ext: '.jpg' };
  }

  return null;
}

// GET /api/applications/[id]/documents
export async function GET(request, { params }) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();

    const application = db.prepare('SELECT id, user_id FROM applications WHERE id = ?').get(id);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (session.role === 'citizen' && application.user_id !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const documents = db
      .prepare(
        `SELECT d.id, d.application_id, d.document_type_id, d.original_filename, 
                d.file_size, d.mime_type, d.upload_status, d.uploaded_at,
                dt.name as document_name, dt.code as document_code
         FROM application_documents d
         LEFT JOIN document_types dt ON d.document_type_id = dt.id
         WHERE d.application_id = ?
         ORDER BY d.uploaded_at DESC`
      )
      .all(id);

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

// POST /api/applications/[id]/documents
export async function POST(request, { params }) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();

    const application = db.prepare('SELECT id, user_id FROM applications WHERE id = ?').get(id);
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (session.role === 'citizen' && application.user_id !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const documentTypeId = formData.get('documentTypeId') || formData.get('document_type_id');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'A valid document file is required' }, { status: 400 });
    }

    if (!documentTypeId) {
      return NextResponse.json(
        { error: 'documentTypeId is required' },
        { status: 400 }
      );
    }

    // Check size (< 5MB)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds maximum permitted limit of 5MB' },
        { status: 400 }
      );
    }

    // Validate MIME by MAGIC BYTES (FLOW-04)
    const detected = detectMimeType(buffer);
    if (!detected) {
      return NextResponse.json(
        {
          error:
            'File failed magic-byte MIME validation. Only genuine, uncorrupted PDF, JPEG, and PNG files are accepted.',
        },
        { status: 400 }
      );
    }

    // Storage: outside web root (FLOW-04)
    const uploadDir = path.join(process.cwd(), 'uploads', 'documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const safeUid = crypto.randomUUID().slice(0, 8);
    const storedFilename = `app_${id}_doc_${documentTypeId}_${Date.now()}_${safeUid}${detected.ext}`;
    const filePath = path.join(uploadDir, storedFilename);

    fs.writeFileSync(filePath, buffer);

    // Insert into application_documents table
    const result = db
      .prepare(
        `INSERT INTO application_documents (
           application_id, document_type_id, original_filename, stored_filename,
           file_path, mime_type, file_size, upload_status, uploaded_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, 'uploaded', datetime('now'))`
      )
      .run(
        id,
        documentTypeId,
        file.name || 'document' + detected.ext,
        storedFilename,
        filePath,
        detected.mime,
        buffer.length
      );

    return NextResponse.json(
      {
        success: true,
        document: {
          id: result.lastInsertRowid,
          applicationId: Number(id),
          documentTypeId: Number(documentTypeId),
          originalFilename: file.name,
          storedFilename,
          mimeType: detected.mime,
          fileSize: buffer.length,
          status: 'uploaded',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload document: ' + error.message },
      { status: 500 }
    );
  }
}
