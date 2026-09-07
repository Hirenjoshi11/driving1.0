const { getDb } = require('../database/db');
const db = getDb();

console.log('Seeding operational test data for admin console...');

// 1. Ensure realistic operators exist
const existingOps = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'operator'").get().c;
if (existingOps === 0) {
  const insertUser = db.prepare(`
    INSERT INTO users (name, phone, email, role, password_hash, is_active, phone_verified)
    VALUES (?, ?, ?, 'operator', '$2b$10$sXfXF9jU9kK9bZ8RkYk7qu3G3mJ/2F7G8qC1.6l0Xj2UuYIqZzP9y', 1, 1)
  `);

  const op1 = insertUser.run('Priya Sharma (Gujarat RTO)', '9825012345', 'priya.sharma@rto.gov.in').lastInsertRowid;
  const op2 = insertUser.run('Amit Verma (UP Licensing Desk)', '9415098765', 'amit.verma@rto.gov.in').lastInsertRowid;
  const op3 = insertUser.run('Ramesh Patel (Ahmedabad RTO)', '9898011223', 'ramesh.patel@rto.gov.in').lastInsertRowid;

  // Add operator assignments
  const insertAssign = db.prepare(`
    INSERT INTO operator_assignments (operator_id, state_id, service_id, rto_id, is_active)
    VALUES (?, ?, ?, ?, 1)
  `);

  const gjRto = db.prepare('SELECT id FROM rto_offices WHERE state_id = 1 LIMIT 1').get()?.id;
  const upRto = db.prepare('SELECT id FROM rto_offices WHERE state_id = 3 LIMIT 1').get()?.id;

  if (gjRto) {
    insertAssign.run(op1, 1, 1, gjRto);
    insertAssign.run(op3, 1, 2, gjRto);
  }
  if (upRto) {
    insertAssign.run(op2, 3, 1, upRto);
  }
  console.log('✓ Seeded 3 realistic operators with state & RTO jurisdiction assignments.');
}

// 2. Add realistic applications across statuses if count is low
const appCount = db.prepare('SELECT COUNT(*) as c FROM applications').get().c;
if (appCount < 12) {
  const insertApp = db.prepare(`
    INSERT INTO applications (
      application_number, user_id, state_id, service_id, rto_id, status,
      first_name, last_name, mobile, email,
      government_fee, service_fee, total_payable, payment_status,
      created_at, submitted_at, sla_due_at
    ) VALUES (
      ?, 2, ?, ?, ?, ?,
      ?, ?, ?, ?,
      150, 299, 449, ?,
      datetime('now', ?), datetime('now', ?), datetime('now', ?)
    )
  `);

  const gjRto = db.prepare('SELECT id FROM rto_offices WHERE state_id = 1 LIMIT 1').get()?.id || 1;
  const rjRto = db.prepare('SELECT id FROM rto_offices WHERE state_id = 2 LIMIT 1').get()?.id || 2;
  const upRto = db.prepare('SELECT id FROM rto_offices WHERE state_id = 3 LIMIT 1').get()?.id || 3;

  insertApp.run('DLF-GJ-202609-10021', 1, 1, gjRto, 'under_review', 'Aarav', 'Patel', '9825000001', 'aarav.patel@gmail.com', 'completed', '-4 days', '-3 days', '+2 days');
  insertApp.run('DLF-GJ-202609-10022', 1, 2, gjRto, 'documents_verified', 'Neha', 'Shah', '9825000002', 'neha.shah@gmail.com', 'completed', '-5 days', '-4 days', '+3 days');
  insertApp.run('DLF-UP-202609-30011', 3, 1, upRto, 'under_review', 'Vikram', 'Singh', '9415000001', 'vikram.singh@gmail.com', 'completed', '-2 days', '-1 days', '+1 days');
  insertApp.run('DLF-RJ-202609-20015', 2, 3, rjRto, 'submitted', 'Pooja', 'Chauhan', '9414000002', 'pooja.c@gmail.com', 'completed', '-1 days', '-1 days', '+4 days');
  insertApp.run('DLF-GJ-202609-10025', 1, 1, gjRto, 'completed', 'Devang', 'Trivedi', '9898000003', 'devang.t@gmail.com', 'completed', '-10 days', '-9 days', '-5 days');
  insertApp.run('DLF-UP-202609-30019', 3, 2, upRto, 'resubmitted', 'Ananya', 'Gupta', '9415000005', 'ananya.g@gmail.com', 'completed', '-6 days', '-2 days', '-1 days'); // Overdue SLA
  insertApp.run('DLF-RJ-202609-20019', 2, 1, rjRto, 'correction_required', 'Karan', 'Meena', '9414000006', 'karan.m@gmail.com', 'completed', '-8 days', '-7 days', '+1 days');

  console.log('✓ Seeded diverse realistic applications across Gujarat, Rajasthan, and UP.');
}

// 3. Add privacy requests if zero
const privCount = db.prepare('SELECT COUNT(*) as c FROM privacy_requests').get().c;
if (privCount === 0) {
  const insertPriv = db.prepare(`
    INSERT INTO privacy_requests (
      request_number, user_id, request_type, status, request_details, created_at, updated_at
    ) VALUES (?, 2, ?, ?, ?, datetime('now', ?), datetime('now', ?))
  `);
  insertPriv.run('PR-202609-001', 'access', 'in_progress', 'Citizen requested summary of personal licensing data and Aadhaar tokenization log.', '-3 days', '-1 days');
  insertPriv.run('PR-202609-002', 'correction', 'submitted', 'Request to update misspelled middle name in licensing registry records.', '-1 days', '-1 days');
  console.log('✓ Seeded sample privacy requests for DPDP governance tracking.');
}

console.log('All admin console sample datasets seeded successfully.');
