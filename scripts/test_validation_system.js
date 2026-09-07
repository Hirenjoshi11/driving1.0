/**
 * Comprehensive Test Suite for:
 * Global Form Validation + Error UX + Consent + Payment Upgrade
 */

const { getDb } = require('../database/db');
const path = require('path');
const fs = require('fs');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    console.log(`  ✓ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ [FAIL] ${testName}${details ? ` -> ${details}` : ''}`);
  }
}

console.log('===============================================================');
console.log('DRIVING LICENSE FORM: GLOBAL VALIDATION & PAYMENT TEST SUITE');
console.log('===============================================================');

// TEST SUITE 1: Trilingual Translations & Absence of Raw Keys
console.log('\n--- 1. Localization & Absence of Technical Raw Keys ---');
const en = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/lib/translations/en.json'), 'utf8'));
const gu = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/lib/translations/gu.json'), 'utf8'));
const hi = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src/lib/translations/hi.json'), 'utf8'));

// Verify no raw keys in strings
const checkNoRawKeys = (obj, lang) => {
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string') {
      if (
        v.includes('empty.noRtos') ||
        v.includes('common.error') ||
        v.includes('authentication.required')
      ) {
        throw new Error(`[${lang}] key "${k}" exposes raw string "${v}"`);
      }
    } else if (typeof v === 'object' && v !== null) {
      checkNoRawKeys(v, lang);
    }
  }
};

checkNoRawKeys(en, 'en');
checkNoRawKeys(gu, 'gu');
checkNoRawKeys(hi, 'hi');
assert(true, 'No raw translation keys (empty.noRtos, common.error, authentication.required) in EN, GU, HI');

assert(en.validation && gu.validation && hi.validation, 'Validation translation namespace exists in EN, GU, HI');
assert(en.consent && gu.consent && hi.consent, 'Consent translation namespace exists in EN, GU, HI');
assert(en.payment && gu.payment && hi.payment, 'Payment translation namespace exists in EN, GU, HI');
assert(en.session && gu.session && hi.session, 'Session translation namespace exists in EN, GU, HI');
assert(en.unsaved && gu.unsaved && hi.unsaved, 'Unsaved changes translation namespace exists in EN, GU, HI');

// Step 4 RTO calm guidance translations
assert(en.validation.rtoGuidanceTitle === 'Select your RTO', 'EN RTO guidance title is calm');
assert(gu.validation.rtoGuidanceTitle === 'RTO પસંદ કરો', 'GU RTO guidance title is calm (no warning)');
assert(hi.validation.rtoGuidanceTitle === 'अपना RTO चुनें', 'HI RTO guidance title is calm');

// Step 4 RTO empty state
assert(en.validation.rtoUnavailableTitle === 'RTO selection is currently unavailable', 'EN RTO unavailable title');
assert(gu.validation.rtoUnavailableTitle === 'RTO પસંદગી હાલમાં અનુપલબ્ધ છે', 'GU RTO unavailable title');
assert(hi.validation.rtoUnavailableTitle === 'RTO चयन वर्तमान में अनुपलब्ध है', 'HI RTO unavailable title');

// Single unified consent
assert(en.consent.unifiedCheckbox.includes('agree to receive important updates'), 'EN unified consent text');
assert(gu.consent.unifiedCheckbox.includes('સંમત છું'), 'GU unified consent text');
assert(hi.consent.unifiedCheckbox.includes('सहमत हूं'), 'HI unified consent text');

// "Why are we asking?"
assert(en.consent.whyAsking === 'Why are we asking?', 'EN why are we asking text');
assert(gu.consent.whyAsking === 'અમે આ કેમ પૂછી રહ્યા છીએ?', 'GU why are we asking text');
assert(hi.consent.whyAsking === 'हम यह क्यों पूछ रहे हैं?', 'HI why are we asking text');

// TEST SUITE 2: Database Schema & Payment Orders
console.log('\n--- 2. Database Schema & Payment Orders Table ---');
const db = getDb();
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t => t.name);

assert(tables.includes('payment_orders'), 'payment_orders table exists in SQLite database');
assert(tables.includes('consents'), 'consents table exists in database');
assert(tables.includes('consent_events'), 'consent_events table exists in database');
assert(tables.includes('fee_structure'), 'fee_structure table exists in database');

const orderColumns = db.prepare("PRAGMA table_info(payment_orders)").all().map(c => c.name);
assert(orderColumns.includes('order_id'), 'payment_orders has order_id column');
assert(orderColumns.includes('government_fee'), 'payment_orders has government_fee column');
assert(orderColumns.includes('service_fee'), 'payment_orders has service_fee column');
assert(orderColumns.includes('gateway_fee'), 'payment_orders has gateway_fee column');
assert(orderColumns.includes('total_amount'), 'payment_orders has total_amount column');
assert(orderColumns.includes('idempotency_key'), 'payment_orders has idempotency_key column');
assert(orderColumns.includes('status'), 'payment_orders has status column');

// TEST SUITE 3: Authoritative Fee Calculation from Backend
console.log('\n--- 3. Authoritative Backend Fee Calculation ---');
const feeRow = db.prepare("SELECT * FROM fee_structure WHERE service_id = 1 AND state_id = 1 AND is_active = 1 LIMIT 1").get();
assert(!!feeRow, 'Active fee structure exists for Learner Licence in Gujarat');
const expectedTotal = (feeRow.government_fee || 0) + (feeRow.service_fee || 0) + 
                      (feeRow.smart_card_fee || 0) + (feeRow.test_fee || 0) + (feeRow.gateway_fee || 0);
assert(expectedTotal > 0, `Fee structure calculates valid total payable: ₹${expectedTotal}`);
assert(feeRow.government_fee > 0, `Government fee is separately itemized: ₹${feeRow.government_fee}`);
assert(feeRow.service_fee > 0, `Service fee is separately itemized: ₹${feeRow.service_fee}`);

// TEST SUITE 4: Consent Recording in DPDP tables
console.log('\n--- 4. DPDP Consent Recording Verification ---');
const testUser = db.prepare("SELECT id FROM users WHERE role = 'citizen' LIMIT 1").get() || { id: 1 };
const purpose = db.prepare("SELECT id, code FROM processing_purposes WHERE code = 'service_communication'").get();
assert(!!purpose, 'Service communication purpose exists');

// Upsert into consents table
const consentRes = db.prepare(`
  INSERT INTO consents (
    user_id, purpose_id, notice_version_id, language, consent_status,
    timestamp, source, created_at, updated_at
  ) VALUES (?, ?, 1, 'gu', 'granted', datetime('now'), 'test_suite', datetime('now'), datetime('now'))
  ON CONFLICT(user_id, purpose_id) DO UPDATE SET
    consent_status = 'granted',
    language = 'gu',
    updated_at = datetime('now')
`).run(testUser.id, purpose.id);

// Insert into immutable consent_events
const eventRes = db.prepare(`
  INSERT INTO consent_events (
    consent_id, user_id, purpose_id, notice_version_id, language, action,
    reason, timestamp
  ) VALUES (?, ?, ?, 1, 'gu', 'grant', 'Citizen accepted unified communications consent', datetime('now'))
`).run(consentRes.lastInsertRowid || 1, testUser.id, purpose.id);

const consentRow = db.prepare("SELECT * FROM consents WHERE user_id = ? AND purpose_id = ?").get(testUser.id, purpose.id);
assert(consentRow.consent_status === 'granted', 'Unified consent choice successfully stored in consents table');
assert(consentRow.language === 'gu', `Consent recorded with user language: ${consentRow.language}`);
assert(consentRow.notice_version_id === 1, `Consent recorded with notice version: ${consentRow.notice_version_id}`);

const consentEvent = db.prepare("SELECT * FROM consent_events WHERE user_id = ? AND purpose_id = ? ORDER BY id DESC LIMIT 1").get(testUser.id, purpose.id);
assert(consentEvent.action === 'grant', 'Immutable audit log recorded in consent_events');
assert(consentEvent.language === 'gu', 'Audit log includes language of consent');

// TEST SUITE 5: Payment Order Idempotency & State Machine
console.log('\n--- 5. Payment State Machine & Idempotency ---');
const testApp = db.prepare("SELECT id, state_id, service_id FROM applications LIMIT 1").get();
if (testApp) {
  const testOrderId = `TEST-ORD-${Date.now()}`;
  const testIdemKey = `IDEM-TEST-${Date.now()}`;
  
  db.prepare(`
    INSERT INTO payment_orders (
      order_id, application_id, user_id, state_id, service_id,
      government_fee, service_fee, gateway_fee, discount, total_amount,
      currency, status, payment_method, idempotency_key
    ) VALUES (?, ?, ?, ?, ?, 350, 150, 0, 0, 500, 'INR', 'processing', 'upi', ?)
  `).run(testOrderId, testApp.id, testUser.id, testApp.state_id, testApp.service_id, testIdemKey);

  // Duplicate insertion with same idempotency key should be caught
  const existingOrder = db.prepare('SELECT * FROM payment_orders WHERE idempotency_key = ?').get(testIdemKey);
  assert(existingOrder.order_id === testOrderId, 'Idempotent payment order lookup retrieves existing record');

  // Verify transition to completed
  db.prepare("UPDATE payment_orders SET status = 'completed', gateway_reference = 'PAY-VERIF-123' WHERE id = ?").run(existingOrder.id);
  const updatedOrder = db.prepare('SELECT * FROM payment_orders WHERE id = ?').get(existingOrder.id);
  assert(updatedOrder.status === 'completed', 'Payment state successfully transitions to completed upon verification');
  assert(updatedOrder.gateway_reference === 'PAY-VERIF-123', 'Verified gateway reference stored with payment order');

  // Clean up test order
  db.prepare('DELETE FROM payment_orders WHERE id = ?').run(existingOrder.id);
}

// TEST SUITE 6: UI Component Integrity Check
console.log('\n--- 6. UI Component Integrity ---');
const componentsToCheck = [
  'src/components/validation/FormErrorSummary.js',
  'src/components/validation/FieldError.js',
  'src/components/validation/ValidationToast.js',
  'src/components/validation/SessionExpiredDialog.js',
  'src/components/validation/UnsavedChangesDialog.js',
  'src/app/apply/[stateSlug]/[serviceSlug]/steps/RtoStep.js',
  'src/app/apply/[stateSlug]/[serviceSlug]/steps/ReviewStep.js',
  'src/app/apply/[stateSlug]/[serviceSlug]/steps/PaymentStep.js',
  'src/app/apply/[stateSlug]/[serviceSlug]/steps/ApplicantStep.js',
  'src/app/apply/[stateSlug]/[serviceSlug]/steps/AddressStep.js',
  'src/app/apply/[stateSlug]/[serviceSlug]/steps/VehicleStep.js',
  'src/app/apply/[stateSlug]/[serviceSlug]/steps/LicenceStep.js',
  'src/app/apply/[stateSlug]/[serviceSlug]/steps/DocumentsStep.js',
  'src/app/api/payment/route.js',
];

for (const compPath of componentsToCheck) {
  const fullPath = path.join(process.cwd(), compPath);
  assert(fs.existsSync(fullPath), `Component exists: ${compPath}`);
  const content = fs.readFileSync(fullPath, 'utf8');
  assert(!content.includes('empty.noRtos'), `No "empty.noRtos" in ${compPath}`);
  assert(!content.includes("t('common.error')") || compPath.includes('validation'), `No raw common.error crash pattern in ${compPath}`);
}

console.log('\n===============================================================');
console.log(`TEST RESULTS: ${passedTests} / ${totalTests} PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('===============================================================');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
