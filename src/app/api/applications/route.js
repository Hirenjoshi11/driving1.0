import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth.js';
import { getFullApplicationSchema } from '@/lib/validation.js';
import { calculateAge } from '@/lib/age.js';
const { getDb, generateApplicationNumber } = require('@/lib/db');

// GET /api/applications - Scoped to session user, explicit columns (SEC-03)
export async function GET(request) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const db = getDb();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const stateId = searchParams.get('stateId');
    const stateCode = searchParams.get('stateCode');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');

    let whereClause = 'WHERE 1=1';
    const params = [];

    // Scope to session user for citizen (SEC-03) — matches user_id OR registered email
    if (session.role === 'citizen') {
      if (session.email) {
        whereClause += ' AND (a.user_id = ? OR (a.email IS NOT NULL AND LOWER(a.email) = LOWER(?)))';
        params.push(session.userId, session.email.trim());
      } else {
        whereClause += ' AND a.user_id = ?';
        params.push(session.userId);
      }
    } else if (session.role === 'operator' || session.role === 'admin') {
      const requestedUserId = searchParams.get('userId');
      if (requestedUserId) {
        whereClause += ' AND a.user_id = ?';
        params.push(requestedUserId);
      }
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Compute user summary metrics before extra status/search filters
    const userScopeSql = session.role === 'citizen'
      ? (session.email ? 'WHERE (a.user_id = ? OR (a.email IS NOT NULL AND LOWER(a.email) = LOWER(?)))' : 'WHERE a.user_id = ?')
      : 'WHERE 1=1';
    const userScopeParams = session.role === 'citizen'
      ? (session.email ? [session.userId, session.email.trim()] : [session.userId])
      : [];
    
    const summaryRow = await db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN a.status IN ('submitted', 'paid', 'assigned', 'under_review', 'resubmitted', 'government_processing') THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN a.status IN ('correction_required', 'payment_pending') OR a.payment_status = 'pending' THEN 1 ELSE 0 END) as action_required,
        SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM applications a
      ${userScopeSql}
    `).get(...userScopeParams) || { total: 0, in_progress: 0, action_required: 0, completed: 0 };

    const summary = {
      total: summaryRow.total || 0,
      inProgress: summaryRow.in_progress || 0,
      actionRequired: summaryRow.action_required || 0,
      completed: summaryRow.completed || 0,
    };

    // Semantic status filter
    if (status && status !== 'all') {
      if (status === 'in_progress') {
        whereClause += " AND a.status IN ('submitted', 'paid', 'assigned', 'under_review', 'resubmitted', 'government_processing')";
      } else if (status === 'action_required') {
        whereClause += " AND (a.status IN ('correction_required', 'payment_pending') OR a.payment_status = 'pending')";
      } else if (status === 'completed') {
        whereClause += " AND a.status = 'completed'";
      } else {
        whereClause += ' AND a.status = ?';
        params.push(status);
      }
    }

    if (stateId && stateId !== 'all') {
      whereClause += ' AND a.state_id = ?';
      params.push(stateId);
    }
    if (stateCode && stateCode !== 'all') {
      whereClause += ' AND s.code = ?';
      params.push(stateCode);
    }
    if (search) {
      whereClause += ` AND (
        a.application_number LIKE ? OR 
        a.first_name LIKE ? OR 
        a.last_name LIKE ? OR 
        a.mobile LIKE ? OR 
        a.email LIKE ? OR 
        ls.name LIKE ? OR 
        r.name LIKE ? OR 
        a.government_application_number LIKE ?
      )`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term, term, term, term, term);
    }

    // Determine sorting
    let orderBy = 'ORDER BY COALESCE(a.updated_at, a.created_at) DESC';
    if (sort === 'oldest') {
      orderBy = 'ORDER BY a.created_at ASC';
    } else if (sort === 'newest') {
      orderBy = 'ORDER BY a.created_at DESC';
    } else if (sort === 'recent_updated') {
      orderBy = 'ORDER BY COALESCE(a.updated_at, a.created_at) DESC';
    }

    // Server-side Pagination (DATA-05)
    let pagination = null;
    let limitClause = '';
    const queryParams = [...params];

    if (pageParam !== null || limitParam !== null || session.role === 'operator' || session.role === 'admin') {
      const page = Math.max(1, parseInt(pageParam || '1', 10));
      const limit = Math.max(1, Math.min(100, parseInt(limitParam || '10', 10)));
      const offset = (page - 1) * limit;

      const countSql = `
        SELECT COUNT(*) as total
        FROM applications a
        LEFT JOIN states s ON a.state_id = s.id
        LEFT JOIN licence_services ls ON a.service_id = ls.id
        LEFT JOIN rto_offices r ON a.rto_id = r.id
        ${whereClause}
      `;
      const countRes = await db.prepare(countSql).get(...params);
      const total = countRes ? countRes.total : 0;

      pagination = {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      };

      limitClause = ' LIMIT ? OFFSET ?';
      queryParams.push(limit, offset);
    }

    const query = `
      SELECT a.id,
             a.application_number,
             a.user_id,
             a.status,
             a.payment_status,
             a.payment_method,
             a.first_name,
             a.last_name,
             a.mobile,
             a.gender,
             a.date_of_birth,
             a.current_city,
             a.created_at,
             a.updated_at,
             a.government_application_number as gov_reference_number,
             (CASE WHEN a.final_document_path IS NOT NULL THEN 1 ELSE 0 END) as has_final_document,
             a.final_document_uploaded_at,
             a.correction_reason as rejection_reason,
             a.total_payable as total_fee,
             s.name as state_name, s.code as state_code,
             ls.name as service_name, ls.slug as service_slug,
             r.name as rto_name, r.rto_code,
             d.name as district_name,
             tc.name as test_centre_name
      FROM applications a
      LEFT JOIN states s ON a.state_id = s.id
      LEFT JOIN licence_services ls ON a.service_id = ls.id
      LEFT JOIN rto_offices r ON a.rto_id = r.id
      LEFT JOIN districts d ON a.district_id = d.id
      LEFT JOIN driving_test_centres tc ON a.test_centre_id = tc.id
      ${whereClause}
      ${orderBy}
      ${limitClause}
    `;

    const applications = await db.prepare(query).all(...queryParams);

    return NextResponse.json({ applications, pagination, summary });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

// POST /api/applications - Create new application (SEC-07, FLOW-05, FLOW-11, DATA-03)
export async function POST(request) {
  try {
    const session = await getSessionUser(request);
    const db = getDb();
    const body = await request.json();

    const {
      stateId,
      serviceId,
      districtId,
      rtoId,
      testCentreId,
      formData = {},
      paymentMethod = 'upi',
      isDraft = false,
      applicationId = null,
    } = body;

    if (!stateId || !serviceId) {
      return NextResponse.json(
        { error: 'stateId and serviceId are required' },
        { status: 400 }
      );
    }

    // Get service details
    const serviceRow = await db.prepare('SELECT * FROM licence_services WHERE id = ?').get(serviceId);

    // Validation (FLOW-05): if not a preliminary draft, validate full schema
    if (!isDraft) {
      const payloadToValidate = {
        ...formData,
        rtoId: rtoId || formData.rtoId,
        districtId: districtId || formData.districtId,
        testCentreId: testCentreId || formData.testCentreId,
      };

      const validation = getFullApplicationSchema(
        serviceRow?.slug || '',
        serviceRow
      ).safeParse(payloadToValidate);

      if (!validation.success) {
        return NextResponse.json(
          {
            error: 'Application validation failed',
            details: validation.error.flatten().fieldErrors,
            issues: validation.error.issues.map((i) => ({
              field: i.path.join('.'),
              message: i.message,
            })),
          },
          { status: 400 }
        );
      }
    }

    // Enforce user from session or associate with verified email or phone (SEC-07)
    let effectiveUserId = session ? session.userId : null;
    if (!effectiveUserId) {
      const email = (formData.email || '').trim().toLowerCase();
      const phone = (formData.mobile || '').replace(/\D/g, '').slice(-10);

      let existingUser = null;
      if (email) {
        existingUser = await db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(email);
      }
      if (!existingUser && phone && phone.length === 10) {
        existingUser = await db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
      }

      if (existingUser) {
        effectiveUserId = existingUser.id;
      } else if (email || (phone && phone.length === 10)) {
        const citizenName = `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || 'Citizen';
        const info = db
          .prepare(
            "INSERT INTO users (name, email, phone, role, password_hash, email_verified, phone_verified) VALUES (?, ?, ?, 'citizen', '', ?, ?)"
          )
          .run(citizenName, email || null, phone || null, email ? 1 : 0, phone ? 1 : 0);
        effectiveUserId = info.lastInsertRowid;
      } else {
        effectiveUserId = 1;
      }
    }

    // Server-determined status: draft if saving draft, submitted if submitting
    const initialStatus = isDraft ? 'draft' : 'submitted';

    // Get state code for application number
    const stateRow = await db.prepare('SELECT code FROM states WHERE id = ?').get(stateId);
    const stateCode = stateRow ? stateRow.code : 'XX';

    // Get fee snapshot
    const feeRow = db
      .prepare(
        'SELECT * FROM fee_structure WHERE service_id = ? AND state_id = ? AND is_active = 1 LIMIT 1'
      )
      .get(serviceId, stateId);

    const govtFee = feeRow ? feeRow.government_fee || 0 : 0;
    const serviceFee = feeRow ? feeRow.service_fee || 0 : 0;
    const testFee = feeRow ? feeRow.test_fee || 0 : 0;
    const smartCardFee = feeRow ? feeRow.smart_card_fee || 0 : 0;
    const totalFee = govtFee + serviceFee + testFee + smartCardFee;

    // Birthday-aware age calculation (DATA-02)
    const age = calculateAge(formData.dob);
    const isMinor = age !== null && age < 18 ? 1 : 0;

    // Relationship mappings (DATA-03)
    const relationType = formData.relationType || 'Father';
    let fatherName = formData.fatherName || '';
    let motherName = formData.motherName || '';
    let guardianName = formData.guardianName || '';

    if (relationType === 'Father') {
      fatherName = formData.relationName || fatherName;
    } else if (relationType === 'Mother') {
      motherName = formData.relationName || motherName;
    } else if (relationType === 'Guardian') {
      guardianName = formData.relationName || guardianName;
    }

    const guardianRelation =
      formData.guardianRelation || (relationType === 'Guardian' ? 'Legal Guardian' : '');
    const guardianMobile = formData.guardianMobile || '';
    const rawGuardianAadhaar = formData.guardianAadhaar || '';
    const guardianAadhaar = rawGuardianAadhaar.length >= 4 ? ('XXXX-XXXX-' + rawGuardianAadhaar.slice(-4)) : rawGuardianAadhaar;
    const guardianDeclaration = isMinor && formData.guardianConsent ? 1 : 0;

    const rawIdNumber = formData.identityNumber || '';
    const maskedIdentityNumber = rawIdNumber.length >= 4 ? ('XXXX-XXXX-' + rawIdNumber.slice(-4)) : rawIdNumber;

    // Address mappings (DATA-03)
    const sameAsCurrent = formData.sameAsCurrent !== false ? 1 : 0;
    const currentHouse = formData.currentHouse || '';
    const currentBuilding = formData.currentBuilding || '';
    const currentStreet = formData.currentStreet || '';
    const currentArea = formData.currentArea || '';
    const currentCity = formData.currentCity || '';
    const currentDistrictId = districtId || formData.districtId || null;
    const currentTaluka = formData.currentTaluka || '';
    const currentPincode = formData.currentPincode || '';

    const permanentHouse = sameAsCurrent ? currentHouse : formData.permanentHouse || '';
    const permanentBuilding = sameAsCurrent ? currentBuilding : formData.permanentBuilding || '';
    const permanentStreet = sameAsCurrent ? currentStreet : formData.permanentStreet || '';
    const permanentArea = sameAsCurrent ? currentArea : formData.permanentArea || '';
    const permanentCity = sameAsCurrent ? currentCity : formData.permanentCity || '';
    const permanentDistrictId = sameAsCurrent
      ? currentDistrictId
      : formData.permanentDistrictId || currentDistrictId;
    const permanentTaluka = sameAsCurrent ? currentTaluka : formData.permanentTaluka || '';
    const permanentStateId = stateId;
    const permanentPincode = sameAsCurrent ? currentPincode : formData.permanentPincode || '';

    // Full form data JSON snapshot (DATA-03)
    const formDataJson = JSON.stringify(formData);
    const nowIso = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const submittedAt = initialStatus === 'submitted' ? nowIso : null;

    let finalAppId = applicationId;
    let finalAppNumber = null;

    // Check if updating existing draft
    if (applicationId) {
      const existing = await db.prepare('SELECT * FROM applications WHERE id = ?').get(applicationId);
      if (existing) {
        if (session && session.role === 'citizen' && existing.user_id !== session.userId) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        finalAppNumber = existing.application_number;
        await db.prepare(`
          UPDATE applications SET
            status = ?,
            rto_id = ?,
            test_centre_id = ?,
            district_id = ?,
            first_name = ?,
            middle_name = ?,
            last_name = ?,
            father_name = ?,
            mother_name = ?,
            relation_type = ?,
            guardian_name = ?,
            date_of_birth = ?,
            gender = ?,
            mobile = ?,
            email = ?,
            identity_type = ?,
            identity_number = ?,
            current_house = ?,
            current_building = ?,
            current_street = ?,
            current_area = ?,
            current_city = ?,
            current_district_id = ?,
            current_taluka = ?,
            current_pincode = ?,
            same_as_current = ?,
            permanent_house = ?,
            permanent_building = ?,
            permanent_street = ?,
            permanent_area = ?,
            permanent_city = ?,
            permanent_district_id = ?,
            permanent_taluka = ?,
            permanent_state_id = ?,
            permanent_pincode = ?,
            existing_licence_number = ?,
            learner_licence_number = ?,
            selected_vehicle_classes = ?,
            is_minor = ?,
            guardian_relation = ?,
            guardian_mobile = ?,
            guardian_aadhaar = ?,
            guardian_declaration = ?,
            total_payable = ?,
            payment_status = CASE WHEN payment_status = 'completed' THEN payment_status ELSE ? END,
            payment_method = ?,
            current_step = COALESCE(?, current_step),
            completed_steps = COALESCE(?, completed_steps),
            form_data = ?,
            submitted_at = COALESCE(submitted_at, ?),
            updated_at = datetime('now')
          WHERE id = ?
        `).run(
          initialStatus,
          rtoId || formData.rtoId || null,
          testCentreId || formData.testCentreId || null,
          currentDistrictId,
          formData.firstName || '',
          formData.middleName || '',
          formData.lastName || '',
          fatherName,
          motherName,
          relationType,
          guardianName,
          formData.dob || '',
          formData.gender || 'Male',
          formData.mobile || '',
          formData.email || '',
          formData.identityType || 'aadhaar',
          maskedIdentityNumber,
          currentHouse,
          currentBuilding,
          currentStreet,
          currentArea,
          currentCity,
          currentDistrictId,
          currentTaluka,
          currentPincode,
          sameAsCurrent,
          permanentHouse,
          permanentBuilding,
          permanentStreet,
          permanentArea,
          permanentCity,
          permanentDistrictId,
          permanentTaluka,
          permanentStateId,
          permanentPincode,
          formData.existingDlNumber || '',
          formData.learnerLicenceNumber || '',
          JSON.stringify(formData.selectedVehicleClasses || []),
          isMinor,
          guardianRelation,
          guardianMobile,
          guardianAadhaar,
          guardianDeclaration,
          totalFee,
          isDraft ? 'pending' : 'demo_unpaid',
          paymentMethod || 'demo',
          body.current_step || null,
          body.completed_steps ? JSON.stringify(body.completed_steps) : null,
          formDataJson,
          submittedAt,
          applicationId
        );
      }
    }

    // If new insert
    if (!finalAppNumber) {
      finalAppNumber = generateApplicationNumber(stateCode, serviceId);
      const stmt = await db.prepare(`
        INSERT INTO applications (
          application_number, user_id, state_id, service_id, rto_id, test_centre_id, district_id,
          status, first_name, middle_name, last_name, father_name, mother_name, relation_type, guardian_name,
          date_of_birth, gender, mobile, email, nationality, blood_group, education, identification_mark,
          identity_type, identity_number,
          current_house, current_building, current_street, current_area, current_city, current_district_id,
          current_taluka, current_state_id, current_pincode,
          same_as_current,
          permanent_house, permanent_building, permanent_street, permanent_area, permanent_city, permanent_district_id,
          permanent_taluka, permanent_state_id, permanent_pincode,
          existing_licence_number, learner_licence_number, licence_issue_date, licence_expiry_date, issuing_authority,
          selected_vehicle_classes,
          is_minor, guardian_relation, guardian_mobile, guardian_aadhaar, guardian_declaration,
          government_fee, service_fee, smart_card_fee, test_fee, total_payable,
          payment_status, payment_method, payment_date,
          current_step, completed_steps,
          form_data, submitted_at, created_at, updated_at
        ) VALUES (
          @application_number, @user_id, @state_id, @service_id, @rto_id, @test_centre_id, @district_id,
          @status, @first_name, @middle_name, @last_name, @father_name, @mother_name, @relation_type, @guardian_name,
          @date_of_birth, @gender, @mobile, @email, @nationality, @blood_group, @education, @identification_mark,
          @identity_type, @identity_number,
          @current_house, @current_building, @current_street, @current_area, @current_city, @current_district_id,
          @current_taluka, @current_state_id, @current_pincode,
          @same_as_current,
          @permanent_house, @permanent_building, @permanent_street, @permanent_area, @permanent_city, @permanent_district_id,
          @permanent_taluka, @permanent_state_id, @permanent_pincode,
          @existing_licence_number, @learner_licence_number, @licence_issue_date, @licence_expiry_date, @issuing_authority,
          @selected_vehicle_classes,
          @is_minor, @guardian_relation, @guardian_mobile, @guardian_aadhaar, @guardian_declaration,
          @government_fee, @service_fee, @smart_card_fee, @test_fee, @total_payable,
          @payment_status, @payment_method, @payment_date,
          @current_step, @completed_steps,
          @form_data, @submitted_at, datetime('now'), datetime('now')
        )
      `);

      const insertParams = {
        application_number: finalAppNumber,
        user_id: effectiveUserId,
        state_id: stateId,
        service_id: serviceId,
        rto_id: rtoId || formData.rtoId || null,
        test_centre_id: testCentreId || formData.testCentreId || null,
        district_id: currentDistrictId,
        status: initialStatus,
        first_name: formData.firstName || '',
        middle_name: formData.middleName || '',
        last_name: formData.lastName || '',
        father_name: fatherName,
        mother_name: motherName,
        relation_type: relationType,
        guardian_name: guardianName,
        date_of_birth: formData.dob || '',
        gender: formData.gender || 'Male',
        mobile: formData.mobile || '',
        email: formData.email || '',
        nationality: formData.nationality || 'Indian',
        blood_group: formData.bloodGroup || '',
        education: formData.education || '',
        identification_mark: formData.identificationMark || '',
        identity_type: formData.identityType || 'aadhaar',
        identity_number: maskedIdentityNumber,
        current_house: currentHouse,
        current_building: currentBuilding,
        current_street: currentStreet,
        current_area: currentArea,
        current_city: currentCity,
        current_district_id: currentDistrictId,
        current_taluka: currentTaluka,
        current_state_id: stateId,
        current_pincode: currentPincode,
        same_as_current: sameAsCurrent,
        permanent_house: permanentHouse,
        permanent_building: permanentBuilding,
        permanent_street: permanentStreet,
        permanent_area: permanentArea,
        permanent_city: permanentCity,
        permanent_district_id: permanentDistrictId,
        permanent_taluka: permanentTaluka,
        permanent_state_id: permanentStateId,
        permanent_pincode: permanentPincode,
        existing_licence_number: formData.existingDlNumber || '',
        learner_licence_number: formData.learnerLicenceNumber || '',
        licence_issue_date: formData.licenceIssueDate || '',
        licence_expiry_date: formData.licenceExpiryDate || '',
        issuing_authority: formData.issuingAuthority || '',
        selected_vehicle_classes: JSON.stringify(formData.selectedVehicleClasses || []),
        is_minor: isMinor,
        guardian_relation: guardianRelation,
        guardian_mobile: guardianMobile,
        guardian_aadhaar: guardianAadhaar,
        guardian_declaration: guardianDeclaration,
        government_fee: govtFee,
        service_fee: serviceFee,
        smart_card_fee: smartCardFee,
        test_fee: testFee,
        total_payable: totalFee,
        payment_status: isDraft ? 'pending' : 'demo_unpaid',
        payment_method: paymentMethod || 'demo',
        payment_date: null,
        current_step: body.current_step || 1,
        completed_steps: body.completed_steps ? JSON.stringify(body.completed_steps) : '[]',
        form_data: formDataJson,
        submitted_at: submittedAt,
      };

      let attempts = 0;
      let result;
      while (attempts < 5) {
        try {
          insertParams.application_number = finalAppNumber;
          result = await stmt.run(insertParams);
          break;
        } catch (err) {
          if (err.code === 'SQLITE_CONSTRAINT_UNIQUE' || err.message?.includes('UNIQUE constraint failed: applications.application_number')) {
            attempts++;
            finalAppNumber = generateApplicationNumber(stateCode, serviceId);
            continue;
          }
          throw err;
        }
      }

      finalAppId = result.lastInsertRowid;
    }

    // Record status history
    try {
      await db.prepare(`
        INSERT INTO application_status_history (
          application_id, from_status, to_status, changed_by, notes
        ) VALUES (?, ?, ?, ?, ?)
      `).run(
        finalAppId,
        'draft',
        initialStatus,
        effectiveUserId,
        initialStatus === 'submitted'
          ? 'Application created and submitted online'
          : 'Application draft created'
      );
    } catch (err) {
      console.warn('Status history insert error:', err);
    }

    return NextResponse.json({
      success: true,
      applicationId: finalAppId,
      applicationNumber: finalAppNumber,
      status: initialStatus,
    });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json(
      { error: 'Failed to create application: ' + error.message },
      { status: 500 }
    );
  }
}
