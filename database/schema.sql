-- ============================================================
-- DRIVING LICENSE FORM — DATABASE SCHEMA
-- SQLite compatible
-- ============================================================

-- ============================================================
-- 1. STATES
-- ============================================================
CREATE TABLE IF NOT EXISTS states (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    name_hi TEXT,
    name_gu TEXT,
    slug TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    description_hi TEXT,
    description_gu TEXT,
    icon TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- 2. DISTRICTS
-- ============================================================
CREATE TABLE IF NOT EXISTS districts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    state_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    name_hi TEXT,
    name_gu TEXT,
    code TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (state_id) REFERENCES states(id)
);

CREATE INDEX IF NOT EXISTS idx_districts_state ON districts(state_id);

-- ============================================================
-- 3. RTO OFFICES
-- ============================================================
CREATE TABLE IF NOT EXISTS rto_offices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    district_id INTEGER NOT NULL,
    state_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    name_hi TEXT,
    name_gu TEXT,
    rto_code TEXT NOT NULL,
    office_type TEXT NOT NULL DEFAULT 'RTO', -- RTO, ARTO, DTO
    address TEXT,
    city TEXT,
    pincode TEXT,
    phone TEXT,
    email TEXT,
    latitude REAL,
    longitude REAL,
    is_active INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (district_id) REFERENCES districts(id),
    FOREIGN KEY (state_id) REFERENCES states(id)
);

CREATE INDEX IF NOT EXISTS idx_rto_district ON rto_offices(district_id);
CREATE INDEX IF NOT EXISTS idx_rto_state ON rto_offices(state_id);

-- ============================================================
-- 4. DRIVING TEST CENTRES (separate from RTO)
-- ============================================================
CREATE TABLE IF NOT EXISTS driving_test_centres (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rto_id INTEGER NOT NULL,
    district_id INTEGER NOT NULL,
    state_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    name_hi TEXT,
    name_gu TEXT,
    address TEXT,
    city TEXT,
    pincode TEXT,
    rto_code TEXT,
    test_type TEXT DEFAULT 'both', -- learner, driving, both
    two_wheeler_available INTEGER NOT NULL DEFAULT 1,
    four_wheeler_available INTEGER NOT NULL DEFAULT 1,
    transport_vehicle_available INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active', -- active, temporarily_unavailable, verify_before_appointment
    status_note TEXT,
    latitude REAL,
    longitude REAL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (rto_id) REFERENCES rto_offices(id),
    FOREIGN KEY (district_id) REFERENCES districts(id),
    FOREIGN KEY (state_id) REFERENCES states(id)
);

CREATE INDEX IF NOT EXISTS idx_test_centre_rto ON driving_test_centres(rto_id);
CREATE INDEX IF NOT EXISTS idx_test_centre_state ON driving_test_centres(state_id);

-- ============================================================
-- 5. LICENCE SERVICES
-- ============================================================
CREATE TABLE IF NOT EXISTS licence_services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    name_hi TEXT,
    name_gu TEXT,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    description_hi TEXT,
    description_gu TEXT,
    icon TEXT,
    estimated_days INTEGER,
    requires_existing_licence INTEGER NOT NULL DEFAULT 0,
    requires_learner_licence INTEGER NOT NULL DEFAULT 0,
    requires_medical INTEGER NOT NULL DEFAULT 0,
    requires_driving_test INTEGER NOT NULL DEFAULT 0,
    allows_minor INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- 6. STATE-SERVICE MAPPING
-- ============================================================
CREATE TABLE IF NOT EXISTS state_services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    state_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (state_id) REFERENCES states(id),
    FOREIGN KEY (service_id) REFERENCES licence_services(id),
    UNIQUE(state_id, service_id)
);

-- ============================================================
-- 7. SERVICE STEPS (dynamic per service)
-- ============================================================
CREATE TABLE IF NOT EXISTS service_steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id INTEGER NOT NULL,
    step_number INTEGER NOT NULL,
    step_key TEXT NOT NULL, -- applicant, address, licence, vehicle, rto, documents, review, payment
    label TEXT NOT NULL,
    label_hi TEXT,
    label_gu TEXT,
    description TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (service_id) REFERENCES licence_services(id),
    UNIQUE(service_id, step_number)
);

CREATE INDEX IF NOT EXISTS idx_steps_service ON service_steps(service_id);

-- ============================================================
-- 8. SERVICE FIELDS (dynamic form fields)
-- ============================================================
CREATE TABLE IF NOT EXISTS service_fields (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id INTEGER NOT NULL,
    step_key TEXT NOT NULL,
    field_key TEXT NOT NULL,
    label TEXT NOT NULL,
    label_hi TEXT,
    label_gu TEXT,
    field_type TEXT NOT NULL DEFAULT 'text', -- text, email, tel, date, select, radio, checkbox, textarea, file
    placeholder TEXT,
    placeholder_hi TEXT,
    placeholder_gu TEXT,
    help_text TEXT,
    help_text_hi TEXT,
    help_text_gu TEXT,
    options TEXT, -- JSON array for select/radio
    is_required INTEGER NOT NULL DEFAULT 0,
    condition_field TEXT, -- field key that controls visibility
    condition_value TEXT, -- value that makes this visible
    validation_regex TEXT,
    min_length INTEGER,
    max_length INTEGER,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (service_id) REFERENCES licence_services(id)
);

CREATE INDEX IF NOT EXISTS idx_fields_service ON service_fields(service_id);
CREATE INDEX IF NOT EXISTS idx_fields_step ON service_fields(step_key);

-- ============================================================
-- 9. VEHICLE CLASSES
-- ============================================================
CREATE TABLE IF NOT EXISTS vehicle_classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    name_hi TEXT,
    name_gu TEXT,
    description TEXT,
    description_hi TEXT,
    description_gu TEXT,
    min_age INTEGER NOT NULL DEFAULT 18,
    requires_medical INTEGER NOT NULL DEFAULT 0,
    icon TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- 10. SERVICE-VEHICLE CLASS MAPPING
-- ============================================================
CREATE TABLE IF NOT EXISTS service_vehicle_classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id INTEGER NOT NULL,
    state_id INTEGER NOT NULL,
    vehicle_class_id INTEGER NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (service_id) REFERENCES licence_services(id),
    FOREIGN KEY (state_id) REFERENCES states(id),
    FOREIGN KEY (vehicle_class_id) REFERENCES vehicle_classes(id),
    UNIQUE(service_id, state_id, vehicle_class_id)
);

-- ============================================================
-- 11. IDENTITY TYPES
-- ============================================================
CREATE TABLE IF NOT EXISTS identity_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    name_hi TEXT,
    name_gu TEXT,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- 12. STATE IDENTITY TYPES (which IDs accepted per state)
-- ============================================================
CREATE TABLE IF NOT EXISTS state_identity_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    state_id INTEGER NOT NULL,
    identity_type_id INTEGER NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (state_id) REFERENCES states(id),
    FOREIGN KEY (identity_type_id) REFERENCES identity_types(id),
    UNIQUE(state_id, identity_type_id)
);

-- ============================================================
-- 13. DOCUMENT TYPES
-- ============================================================
CREATE TABLE IF NOT EXISTS document_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    name_hi TEXT,
    name_gu TEXT,
    code TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL DEFAULT 'general', -- identity, address, age, medical, photo, signature, other
    description TEXT,
    description_hi TEXT,
    description_gu TEXT,
    where_to_get TEXT,
    where_to_get_hi TEXT,
    where_to_get_gu TEXT,
    accepted_formats TEXT NOT NULL DEFAULT 'pdf,jpg,jpeg,png',
    max_size_mb INTEGER NOT NULL DEFAULT 2,
    is_active INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- 14. SERVICE DOCUMENTS (required docs per service/state)
-- ============================================================
CREATE TABLE IF NOT EXISTS service_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id INTEGER NOT NULL,
    state_id INTEGER NOT NULL,
    document_type_id INTEGER NOT NULL,
    is_required INTEGER NOT NULL DEFAULT 1, -- 1 = required, 0 = conditional
    condition_description TEXT,
    condition_description_hi TEXT,
    condition_description_gu TEXT,
    condition_field TEXT, -- field key that determines if needed
    condition_value TEXT,
    help_text TEXT,
    help_text_hi TEXT,
    help_text_gu TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (service_id) REFERENCES licence_services(id),
    FOREIGN KEY (state_id) REFERENCES states(id),
    FOREIGN KEY (document_type_id) REFERENCES document_types(id)
);

CREATE INDEX IF NOT EXISTS idx_service_docs ON service_documents(service_id, state_id);

-- ============================================================
-- 15. FEE STRUCTURE
-- ============================================================
CREATE TABLE IF NOT EXISTS fee_structure (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id INTEGER NOT NULL,
    state_id INTEGER NOT NULL,
    government_fee REAL NOT NULL DEFAULT 0,
    service_fee REAL NOT NULL DEFAULT 0,
    smart_card_fee REAL DEFAULT 0,
    test_fee REAL DEFAULT 0,
    gateway_fee REAL DEFAULT 0,
    late_fee REAL DEFAULT 0,
    late_fee_description TEXT,
    effective_from TEXT NOT NULL DEFAULT (datetime('now')),
    effective_to TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (service_id) REFERENCES licence_services(id),
    FOREIGN KEY (state_id) REFERENCES states(id)
);

CREATE INDEX IF NOT EXISTS idx_fees_service_state ON fee_structure(service_id, state_id);

-- ============================================================
-- 16. USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'citizen', -- citizen, operator, admin
    state_id INTEGER,
    is_active INTEGER NOT NULL DEFAULT 1,
    email_verified INTEGER NOT NULL DEFAULT 0,
    phone_verified INTEGER NOT NULL DEFAULT 0,
    preferred_language TEXT NOT NULL DEFAULT 'en',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (state_id) REFERENCES states(id)
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================================
-- 17. APPLICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_number TEXT NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    state_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    rto_id INTEGER,
    test_centre_id INTEGER,
    district_id INTEGER,

    -- Status
    status TEXT NOT NULL DEFAULT 'draft', -- draft, payment_pending, paid, submitted, assigned, under_review, correction_required, resubmitted, government_processing, completed
    assigned_operator_id INTEGER,

    -- Applicant
    first_name TEXT,
    middle_name TEXT,
    last_name TEXT,
    father_name TEXT,
    mother_name TEXT,
    relation_type TEXT,
    guardian_name TEXT,
    date_of_birth TEXT,
    gender TEXT,
    mobile TEXT,
    email TEXT,
    nationality TEXT DEFAULT 'Indian',
    blood_group TEXT,
    education TEXT,
    identification_mark TEXT,

    -- Identity
    identity_type TEXT,
    identity_number TEXT,

    -- Address - Current
    current_house TEXT,
    current_building TEXT,
    current_street TEXT,
    current_area TEXT,
    current_city TEXT,
    current_district_id INTEGER,
    current_taluka TEXT,
    current_state_id INTEGER,
    current_pincode TEXT,

    -- Address - Permanent
    same_as_current INTEGER NOT NULL DEFAULT 1,
    permanent_house TEXT,
    permanent_building TEXT,
    permanent_street TEXT,
    permanent_area TEXT,
    permanent_city TEXT,
    permanent_district_id INTEGER,
    permanent_taluka TEXT,
    permanent_state_id INTEGER,
    permanent_pincode TEXT,

    -- Existing Licence (for renewal/duplicate/addition)
    existing_licence_number TEXT,
    learner_licence_number TEXT,
    licence_issue_date TEXT,
    licence_expiry_date TEXT,
    issuing_authority TEXT,
    existing_vehicle_class TEXT,
    previous_rto_id INTEGER,

    -- Vehicle Classes (JSON array of selected class IDs)
    selected_vehicle_classes TEXT,

    -- Medical
    medical_required INTEGER NOT NULL DEFAULT 0,
    medical_certificate_type TEXT, -- form1, form1a
    medical_certificate_date TEXT,

    -- Minor
    is_minor INTEGER NOT NULL DEFAULT 0,
    guardian_relation TEXT,
    guardian_mobile TEXT,
    guardian_aadhaar TEXT,
    guardian_declaration INTEGER NOT NULL DEFAULT 0,

    -- Fees (snapshot at time of application)
    government_fee REAL DEFAULT 0,
    service_fee REAL DEFAULT 0,
    smart_card_fee REAL DEFAULT 0,
    test_fee REAL DEFAULT 0,
    gateway_fee REAL DEFAULT 0,
    late_fee REAL DEFAULT 0,
    discount REAL DEFAULT 0,
    total_payable REAL DEFAULT 0,

    -- Payment
    payment_status TEXT DEFAULT 'pending', -- pending, processing, completed, failed, refunded
    payment_id TEXT,
    payment_method TEXT,
    payment_date TEXT,

    -- Government Reference
    government_application_number TEXT,
    government_transaction_id TEXT,
    government_submission_date TEXT,
    government_rto TEXT,

    -- Final Document
    final_document_path TEXT,
    final_document_uploaded_at TEXT,

    -- Correction
    correction_reason TEXT,
    correction_requested_at TEXT,
    correction_count INTEGER NOT NULL DEFAULT 0,

    -- Meta
    form_data TEXT, -- JSON blob for any extra form fields
    current_step INTEGER NOT NULL DEFAULT 1,
    completed_steps TEXT DEFAULT '[]', -- JSON array
    version INTEGER NOT NULL DEFAULT 1,
    notes TEXT,

    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    submitted_at TEXT,
    assigned_at TEXT,
    sla_due_at TEXT,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (state_id) REFERENCES states(id),
    FOREIGN KEY (service_id) REFERENCES licence_services(id),
    FOREIGN KEY (rto_id) REFERENCES rto_offices(id),
    FOREIGN KEY (test_centre_id) REFERENCES driving_test_centres(id),
    FOREIGN KEY (district_id) REFERENCES districts(id),
    FOREIGN KEY (assigned_operator_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_app_user ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_app_state ON applications(state_id);
CREATE INDEX IF NOT EXISTS idx_app_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_app_number ON applications(application_number);
CREATE INDEX IF NOT EXISTS idx_app_operator ON applications(assigned_operator_id);

-- ============================================================
-- 18. APPLICATION DOCUMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS application_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id INTEGER NOT NULL,
    document_type_id INTEGER NOT NULL,
    original_filename TEXT NOT NULL,
    stored_filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    upload_status TEXT NOT NULL DEFAULT 'uploaded', -- uploaded, verified, rejected
    rejection_reason TEXT,
    uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
    verified_at TEXT,
    FOREIGN KEY (application_id) REFERENCES applications(id),
    FOREIGN KEY (document_type_id) REFERENCES document_types(id)
);

CREATE INDEX IF NOT EXISTS idx_app_docs ON application_documents(application_id);

-- ============================================================
-- 19. APPLICATION STATUS HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS application_status_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id INTEGER NOT NULL,
    from_status TEXT,
    to_status TEXT NOT NULL,
    changed_by INTEGER,
    reason TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (application_id) REFERENCES applications(id),
    FOREIGN KEY (changed_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_status_history_app ON application_status_history(application_id);

-- ============================================================
-- 20. OPERATOR ASSIGNMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS operator_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    operator_id INTEGER NOT NULL,
    state_id INTEGER NOT NULL,
    service_id INTEGER,
    rto_id INTEGER,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (operator_id) REFERENCES users(id),
    FOREIGN KEY (state_id) REFERENCES states(id),
    FOREIGN KEY (service_id) REFERENCES licence_services(id),
    FOREIGN KEY (rto_id) REFERENCES rto_offices(id)
);

CREATE INDEX IF NOT EXISTS idx_op_assign ON operator_assignments(operator_id, state_id);

-- ============================================================
-- 21. AUDIT LOG (General staff mutations and access tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor_id INTEGER,
    actor_role TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    summary TEXT,
    metadata TEXT,
    ip TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (actor_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);

