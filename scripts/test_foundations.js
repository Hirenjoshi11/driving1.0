const assert = require('assert');
const path = require('path');
const Database = require('better-sqlite3');

// 1. Test Application Status State Machine
async function testStateMachine() {
  console.log('Testing Application Status State Machine...');
  const { canTransition, requiredFieldsFor, getAvailableTransitions } = await import('../src/lib/applicationStatus.js');

  // Test 1: submitted -> assigned
  const res1 = canTransition('operator', 'submitted', 'assigned', { operator_id: 10, currentUserId: 10 });
  assert.strictEqual(res1.allowed, true, 'Operator self-claim should be allowed');

  const res1b = canTransition('operator', 'submitted', 'assigned', { operator_id: 15, currentUserId: 10 });
  assert.strictEqual(res1b.allowed, false, 'Operator claiming for another operator should be rejected');

  // Test 2: submitted -> completed (illegal)
  const res2 = canTransition('operator', 'submitted', 'completed', {});
  assert.strictEqual(res2.allowed, false, 'Direct jump to completed must be rejected');

  // Test 3: under_review -> correction_required
  const res3a = canTransition('operator', 'under_review', 'correction_required', {});
  assert.strictEqual(res3a.allowed, false, 'Correction required without reason must fail');

  const res3b = canTransition('operator', 'under_review', 'correction_required', { correction_reason: 'Photo is blurry' });
  assert.strictEqual(res3b.allowed, true, 'Correction with valid reason should pass');

  // Test 4: under_review -> government_processing preconditions
  const res4a = canTransition('operator', 'under_review', 'government_processing', {
    payment_status: 'pending',
    unverifiedDocumentCount: 0
  });
  assert.strictEqual(res4a.allowed, false, 'Gov processing must fail if payment pending');

  const res4b = canTransition('operator', 'under_review', 'government_processing', {
    payment_status: 'completed',
    unverifiedDocumentCount: 2
  });
  assert.strictEqual(res4b.allowed, false, 'Gov processing must fail if unverified docs remain');

  const res4c = canTransition('operator', 'under_review', 'government_processing', {
    payment_status: 'completed',
    unverifiedDocumentCount: 0
  });
  assert.strictEqual(res4c.allowed, true, 'Gov processing must pass if paid and all docs verified');

  // Test 5: government_processing -> completed
  const res5a = canTransition('operator', 'government_processing', 'completed', {});
  assert.strictEqual(res5a.allowed, false, 'Completed requires government application number');

  const res5b = canTransition('operator', 'government_processing', 'completed', {
    government_application_number: 'PARIVAHAN/GJ/2026/09988'
  });
  assert.strictEqual(res5b.allowed, true, 'Completed passes with government application number');

  // Test 6: Admin override
  const res6a = canTransition('admin', 'submitted', 'completed', { isOverride: true });
  assert.strictEqual(res6a.allowed, false, 'Admin override requires typed reason');

  const res6b = canTransition('admin', 'submitted', 'completed', { isOverride: true, override_reason: 'Court order #123' });
  assert.strictEqual(res6b.allowed, true, 'Admin override with reason succeeds');

  console.log('✓ All state machine assertions passed.');
}

// 2. Test Jurisdiction Scoping
async function testJurisdictionScope() {
  console.log('Testing Jurisdiction Scoping...');
  const { scopeClause, isApplicationInScope } = await import('../src/lib/scope.js');
  const db = new Database(path.join(__dirname, '..', 'database', 'driving_license.db'));

  // Admin session
  const adminScope = scopeClause(db, { role: 'admin', userId: 1 });
  assert.strictEqual(adminScope.sql, '1=1', 'Admin must have unrestricted 1=1 scope');

  // Operator with no assignments
  const noAssignScope = scopeClause(db, { role: 'operator', userId: 99999 });
  assert.strictEqual(noAssignScope.sql, '1=0', 'Operator with no assignments must have 1=0 scope');

  // Check state isolation: setup a temporary test operator user and assignment
  db.prepare('DELETE FROM operator_assignments WHERE operator_id = 88888').run();
  db.prepare('DELETE FROM users WHERE id = 88888').run();
  db.prepare("INSERT INTO users (id, phone, role, name, password_hash) VALUES (88888, '8888888888', 'operator', 'Test Operator', 'dummy_hash')").run();
  db.prepare(`
    INSERT INTO operator_assignments (operator_id, state_id, service_id, rto_id, is_active)
    VALUES (88888, 1, NULL, NULL, 1)
  `).run();

  const opScope = scopeClause(db, { role: 'operator', userId: 88888 });
  assert.ok(opScope.sql.includes('state_id = ?'), 'Operator scope clause should check state_id');
  assert.deepStrictEqual(opScope.params, [1], 'Params should contain state_id 1 (GJ)');

  // Clean up test assignment and user
  db.prepare('DELETE FROM operator_assignments WHERE operator_id = 88888').run();
  db.prepare('DELETE FROM users WHERE id = 88888').run();

  console.log('✓ All scoping assertions passed.');
}

// 3. Test Audit & PII Sanitization
async function testAudit() {
  console.log('Testing Audit Logging & PII Sanitization...');
  const { sanitizeAuditMetadata, maskAadhaar, maskMobile, logAudit } = await import('../src/lib/audit.js');
  const db = new Database(path.join(__dirname, '..', 'database', 'driving_license.db'));

  // Masking
  assert.strictEqual(maskAadhaar('123456789012'), 'XXXX XXXX 9012');
  assert.strictEqual(maskMobile('9876543210'), 'XXXXX 43210');

  // Sanitization
  const rawMetadata = {
    action: 'view',
    identity_number: '1234-5678-9012',
    applicant_name: 'Test Applicant',
    mobile: '9876543210',
    fee_amount: 500
  };
  const sanitized = sanitizeAuditMetadata(rawMetadata);
  assert.strictEqual(sanitized.identity_number, '[REDACTED_PII]');
  assert.strictEqual(sanitized.mobile, '[REDACTED_PII]');
  assert.strictEqual(sanitized.fee_amount, 500);

  // Write audit row
  logAudit(db, {
    actorId: 1,
    actorRole: 'admin',
    action: 'test.verification',
    entityType: 'test',
    entityId: 'TEST-001',
    summary: 'Testing audit row writing',
    metadata: rawMetadata
  });

  const row = db.prepare('SELECT * FROM audit_log WHERE entity_id = ?').get('TEST-001');
  assert.ok(row, 'Audit row should exist in database');
  assert.ok(!row.metadata.includes('1234-5678-9012'), 'PII must NOT be in audit_log metadata');

  // Clean up test row
  db.prepare('DELETE FROM audit_log WHERE entity_id = ?').run('TEST-001');

  console.log('✓ All audit and PII assertions passed.');
}

async function run() {
  await testStateMachine();
  await testJurisdictionScope();
  await testAudit();
  console.log('\n======================================');
  console.log('ALL PHASE 1 FOUNDATION TESTS PASSED!');
  console.log('======================================');
}

run().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
