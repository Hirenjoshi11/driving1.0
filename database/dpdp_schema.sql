-- ============================================================
-- DPDP ACT 2023 + DPDP RULES 2025 DATABASE SCHEMA
-- Driving License Form — Privacy & Data Protection Architecture
-- ============================================================

-- 1. DATA INVENTORY (Centralized Personal Data Catalog)
CREATE TABLE IF NOT EXISTS data_inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    field_id TEXT NOT NULL UNIQUE,
    field_name TEXT NOT NULL,
    data_category TEXT NOT NULL, -- identity, contact, address, biometric, financial, legal, technical
    description TEXT NOT NULL,
    purpose TEXT NOT NULL,
    legal_basis TEXT NOT NULL DEFAULT 'consent', -- consent, legitimate_use, legal_requirement, other_configured_basis
    required INTEGER NOT NULL DEFAULT 1,
    state_scope TEXT NOT NULL DEFAULT 'ALL', -- ALL or comma-separated state codes
    service_scope TEXT NOT NULL DEFAULT 'ALL', -- ALL or comma-separated service slugs
    retention_policy_id INTEGER,
    sensitivity_level TEXT NOT NULL DEFAULT 'standard', -- public, standard, sensitive, critical
    storage_location TEXT NOT NULL DEFAULT 'database', -- database, private_storage, encrypted_vault
    processor_mapping TEXT, -- comma-separated processor codes or JSON array
    user_visible INTEGER NOT NULL DEFAULT 1,
    exportable INTEGER NOT NULL DEFAULT 1,
    erasable INTEGER NOT NULL DEFAULT 1,
    correctable INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_inventory_category ON data_inventory(data_category);
CREATE INDEX IF NOT EXISTS idx_inventory_sensitivity ON data_inventory(sensitivity_level);

-- 2. PROCESSING PURPOSES
CREATE TABLE IF NOT EXISTS processing_purposes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    name_hi TEXT,
    name_gu TEXT,
    description TEXT,
    description_hi TEXT,
    description_gu TEXT,
    legal_basis TEXT NOT NULL DEFAULT 'consent', -- consent, legitimate_use, legal_requirement, other_configured_basis
    is_mandatory INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 3. PRIVACY NOTICES & VERSIONS
CREATE TABLE IF NOT EXISTS privacy_notices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    title_hi TEXT,
    title_gu TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS privacy_notice_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    notice_id INTEGER NOT NULL,
    version TEXT NOT NULL, -- e.g. 1.0, 1.1
    language TEXT NOT NULL DEFAULT 'en', -- en, hi, gu
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    purposes_json TEXT, -- JSON array of purpose codes included
    data_categories_json TEXT, -- JSON array of data categories covered
    effective_from TEXT NOT NULL DEFAULT (datetime('now')),
    effective_until TEXT,
    created_by INTEGER,
    approved_by INTEGER,
    status TEXT NOT NULL DEFAULT 'published', -- draft, published, archived
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (notice_id) REFERENCES privacy_notices(id),
    UNIQUE(notice_id, version, language)
);

CREATE INDEX IF NOT EXISTS idx_notice_version ON privacy_notice_versions(notice_id, version);

-- 3.1 PRIVACY POLICY SECTIONS (CMS-driven multilingual policy sections)
CREATE TABLE IF NOT EXISTS privacy_policy_sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section_key TEXT NOT NULL, -- e.g. '01-overview', '02-information-collected'
    version TEXT NOT NULL DEFAULT '1.0',
    language TEXT NOT NULL DEFAULT 'en', -- en, hi, gu
    section_number TEXT NOT NULL DEFAULT '01',
    heading TEXT NOT NULL,
    subheading TEXT,
    content TEXT NOT NULL,
    structured_json TEXT, -- JSON holding expandable categories, mapping, processors, etc.
    callout_title TEXT,
    callout_content TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(section_key, version, language)
);

CREATE INDEX IF NOT EXISTS idx_sections_ver_lang ON privacy_policy_sections(version, language);
CREATE INDEX IF NOT EXISTS idx_sections_sort ON privacy_policy_sections(sort_order);

-- 4. CONSENTS & IMMUTABLE CONSENT EVENTS
CREATE TABLE IF NOT EXISTS consents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    purpose_id INTEGER NOT NULL,
    notice_version_id INTEGER,
    language TEXT NOT NULL DEFAULT 'en',
    consent_status TEXT NOT NULL DEFAULT 'granted', -- granted, withdrawn, expired, superseded
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    source TEXT NOT NULL DEFAULT 'web_form', -- web_form, profile_settings, privacy_center
    ip_address TEXT,
    device_ref TEXT,
    withdrawn_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (purpose_id) REFERENCES processing_purposes(id),
    FOREIGN KEY (notice_version_id) REFERENCES privacy_notice_versions(id),
    UNIQUE(user_id, purpose_id)
);

CREATE INDEX IF NOT EXISTS idx_consents_user ON consents(user_id);
CREATE INDEX IF NOT EXISTS idx_consents_status ON consents(consent_status);

CREATE TABLE IF NOT EXISTS consent_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    consent_id INTEGER,
    user_id INTEGER NOT NULL,
    purpose_id INTEGER NOT NULL,
    notice_version_id INTEGER,
    language TEXT NOT NULL DEFAULT 'en',
    action TEXT NOT NULL, -- grant, withdraw, renew, supersede
    reason TEXT,
    ip_address TEXT,
    device_ref TEXT,
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (consent_id) REFERENCES consents(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (purpose_id) REFERENCES processing_purposes(id),
    FOREIGN KEY (notice_version_id) REFERENCES privacy_notice_versions(id)
);

CREATE INDEX IF NOT EXISTS idx_consent_events_user ON consent_events(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_events_time ON consent_events(timestamp);

-- 5. PRIVACY REQUESTS (DATA PRINCIPAL RIGHTS)
CREATE TABLE IF NOT EXISTS privacy_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_number TEXT NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    request_type TEXT NOT NULL, -- access, correction, completion, updating, erasure, consent_withdrawal, grievance, nomination
    status TEXT NOT NULL DEFAULT 'created', -- created, identity_verification, verified, under_review, processing, completed, rejected
    verification_status TEXT NOT NULL DEFAULT 'pending', -- pending, verified, failed
    verification_method TEXT,
    assigned_to INTEGER,
    reason TEXT,
    resolution TEXT,
    request_details TEXT, -- JSON blob with specific requested changes or context
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    resolved_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_priv_req_user ON privacy_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_priv_req_status ON privacy_requests(status);
CREATE INDEX IF NOT EXISTS idx_priv_req_type ON privacy_requests(request_type);

CREATE TABLE IF NOT EXISTS privacy_request_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER NOT NULL,
    from_status TEXT,
    to_status TEXT NOT NULL,
    actor_id INTEGER,
    actor_role TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (request_id) REFERENCES privacy_requests(id),
    FOREIGN KEY (actor_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_priv_events_req ON privacy_request_events(request_id);

-- 6. APPLICATION CORRECTIONS & VERSION HISTORY
CREATE TABLE IF NOT EXISTS application_corrections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id INTEGER NOT NULL,
    version_number INTEGER NOT NULL DEFAULT 1,
    field_changed TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    reason TEXT NOT NULL,
    changed_by INTEGER NOT NULL,
    changed_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (application_id) REFERENCES applications(id),
    FOREIGN KEY (changed_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_app_corrections ON application_corrections(application_id);

-- 7. NOMINATIONS
CREATE TABLE IF NOT EXISTS nominations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    nominee_name TEXT NOT NULL,
    nominee_relationship TEXT NOT NULL,
    nominee_phone TEXT NOT NULL,
    nominee_email TEXT,
    nominee_id_type TEXT,
    nominee_id_masked TEXT,
    status TEXT NOT NULL DEFAULT 'active', -- active, revoked
    verification_status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_nominations_user ON nominations(user_id);

-- 8. GRIEVANCES
CREATE TABLE IF NOT EXISTS grievances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grievance_number TEXT NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    category TEXT NOT NULL, -- data_access, data_correction, consent_withdrawal, unauthorized_processing, security_concern, other
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'submitted', -- submitted, under_review, action_required, resolved, closed
    assigned_to INTEGER,
    resolution TEXT,
    resolution_due_date TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    resolved_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_grievances_user ON grievances(user_id);
CREATE INDEX IF NOT EXISTS idx_grievances_status ON grievances(status);

CREATE TABLE IF NOT EXISTS grievance_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grievance_id INTEGER NOT NULL,
    from_status TEXT,
    to_status TEXT NOT NULL,
    actor_id INTEGER,
    actor_role TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (grievance_id) REFERENCES grievances(id),
    FOREIGN KEY (actor_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_grievance_events ON grievance_events(grievance_id);

-- 9. DATA PROCESSORS & CONTRACTS
CREATE TABLE IF NOT EXISTS data_processors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    vendor TEXT NOT NULL,
    service_type TEXT NOT NULL, -- cloud_hosting, database, object_storage, payment_gateway, sms_provider, email_provider, analytics
    country TEXT NOT NULL DEFAULT 'India',
    storage_location TEXT NOT NULL DEFAULT 'India (Mumbai/Hyderabad)',
    processor_status TEXT NOT NULL DEFAULT 'contracted', -- contracted, missing_contract, review_required, inactive
    contract_status TEXT NOT NULL DEFAULT 'active', -- active, expired, pending_review
    subprocessors TEXT,
    security_review_status TEXT NOT NULL DEFAULT 'approved', -- approved, pending, rejected
    deletion_capability INTEGER NOT NULL DEFAULT 1,
    incident_contact_email TEXT,
    incident_contact_phone TEXT,
    review_date TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS processor_contracts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    processor_id INTEGER NOT NULL,
    contract_reference TEXT NOT NULL,
    dpa_signed INTEGER NOT NULL DEFAULT 1,
    effective_from TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- active, expired, terminated
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (processor_id) REFERENCES data_processors(id)
);

CREATE TABLE IF NOT EXISTS processor_data_mappings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    processor_id INTEGER NOT NULL,
    data_category TEXT NOT NULL,
    purpose TEXT NOT NULL,
    transfer_basis TEXT NOT NULL DEFAULT 'contract',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (processor_id) REFERENCES data_processors(id)
);

-- 10. DATA SHARING REGISTRY (Third Party Disclosures)
CREATE TABLE IF NOT EXISTS data_sharing_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL DEFAULT 'Driving License Form Portal',
    recipient TEXT NOT NULL,
    recipient_type TEXT NOT NULL, -- government_rto, payment_gateway, sms_gateway, technical_infrastructure
    data_categories TEXT NOT NULL,
    purpose TEXT NOT NULL,
    legal_basis TEXT NOT NULL DEFAULT 'legal_requirement',
    application_id INTEGER,
    user_id INTEGER,
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (application_id) REFERENCES applications(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_sharing_user ON data_sharing_records(user_id);
CREATE INDEX IF NOT EXISTS idx_sharing_app ON data_sharing_records(application_id);

-- 11. DATA RETENTION POLICIES & DELETION ENGINE
CREATE TABLE IF NOT EXISTS retention_policies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    policy_name TEXT NOT NULL UNIQUE,
    data_category TEXT NOT NULL,
    purpose TEXT NOT NULL,
    retention_period INTEGER NOT NULL, -- number of units
    retention_unit TEXT NOT NULL DEFAULT 'days', -- days, months, years
    deletion_action TEXT NOT NULL DEFAULT 'anonymize', -- anonymize, purge, archive
    legal_basis TEXT NOT NULL DEFAULT 'legal_requirement',
    legal_hold_supported INTEGER NOT NULL DEFAULT 1,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS legal_holds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL, -- user, application, document
    entity_id TEXT NOT NULL,
    user_id INTEGER,
    reason TEXT NOT NULL,
    legal_reference TEXT,
    placed_by INTEGER NOT NULL,
    placed_at TEXT NOT NULL DEFAULT (datetime('now')),
    released_by INTEGER,
    released_at TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (placed_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_legal_holds ON legal_holds(entity_type, entity_id, is_active);

CREATE TABLE IF NOT EXISTS deletion_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER,
    user_id INTEGER NOT NULL,
    entity_type TEXT NOT NULL DEFAULT 'user_data',
    entity_id TEXT,
    status TEXT NOT NULL DEFAULT 'initiated', -- initiated, checks_passed, blocked_by_legal_hold, blocked_by_active_purpose, completed, failed
    legal_retention_check TEXT NOT NULL DEFAULT 'pending', -- pending, passed, failed
    active_purpose_check TEXT NOT NULL DEFAULT 'pending',
    legal_hold_check TEXT NOT NULL DEFAULT 'pending',
    processor_deletion_status TEXT NOT NULL DEFAULT 'pending',
    anonymized_at TEXT,
    audit_trail TEXT,
    error_message TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (request_id) REFERENCES privacy_requests(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_deletion_jobs_user ON deletion_jobs(user_id);

-- 12. SECURITY INCIDENTS & BREACH NOTIFICATIONS
CREATE TABLE IF NOT EXISTS security_incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    incident_number TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, critical
    status TEXT NOT NULL DEFAULT 'detected', -- detected, contained, investigating, impact_assessed, board_notified, users_notified, remediated, closed
    detected_at TEXT NOT NULL DEFAULT (datetime('now')),
    contained_at TEXT,
    impact_assessment TEXT,
    affected_data_categories TEXT,
    affected_user_count INTEGER NOT NULL DEFAULT 0,
    board_notification_due_at TEXT, -- mandatory timeline (e.g. 72 hours)
    board_notified_at TEXT,
    regulatory_reference TEXT,
    root_cause TEXT,
    remediation_notes TEXT,
    created_by INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_incidents_status ON security_incidents(status);

CREATE TABLE IF NOT EXISTS breach_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    incident_id INTEGER NOT NULL,
    user_id INTEGER,
    recipient_email TEXT,
    recipient_phone TEXT,
    channel TEXT NOT NULL DEFAULT 'in_app', -- email, sms, in_app, public_notice
    status TEXT NOT NULL DEFAULT 'pending', -- pending, sent, failed
    language TEXT NOT NULL DEFAULT 'en',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    sent_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (incident_id) REFERENCES security_incidents(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_breach_notes_inc ON breach_notifications(incident_id);

-- 13. PARENTAL CONSENTS & GUARDIAN VERIFICATIONS (CHILD WORKFLOW)
CREATE TABLE IF NOT EXISTS parental_consents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    application_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    guardian_name TEXT NOT NULL,
    guardian_relation TEXT NOT NULL,
    guardian_contact TEXT NOT NULL,
    guardian_id_type TEXT NOT NULL,
    guardian_id_masked TEXT NOT NULL,
    consent_status TEXT NOT NULL DEFAULT 'pending', -- pending, verified, rejected
    verification_method TEXT NOT NULL DEFAULT 'otp_and_id',
    verified_at TEXT,
    verified_by INTEGER,
    evidence_notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (application_id) REFERENCES applications(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (verified_by) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_parental_app ON parental_consents(application_id);

CREATE TABLE IF NOT EXISTS guardian_verifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parental_consent_id INTEGER NOT NULL,
    verification_type TEXT NOT NULL, -- sms_otp, aadhaar_otp, document_match
    status TEXT NOT NULL DEFAULT 'verified',
    verification_data TEXT,
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (parental_consent_id) REFERENCES parental_consents(id)
);

-- 14. DOCUMENT ACCESS LOGS
CREATE TABLE IF NOT EXISTS document_access_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    document_id INTEGER NOT NULL,
    application_id INTEGER NOT NULL,
    actor_id INTEGER NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL DEFAULT 'view', -- view, download, verify
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (document_id) REFERENCES application_documents(id),
    FOREIGN KEY (application_id) REFERENCES applications(id),
    FOREIGN KEY (actor_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_doc_access_doc ON document_access_logs(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_access_actor ON document_access_logs(actor_id);
