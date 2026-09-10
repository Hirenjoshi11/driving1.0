const fs = require('fs');
const path = require('path');

const targetFiles = [
  'src/lib/dpdp/retention.js',
  'src/lib/dpdp/consent.js',
  'src/app/api/staff/documents/[docId]/verify/route.js',
  'src/app/api/staff/applications/[id]/transition/route.js',
  'src/app/api/staff/applications/[id]/otp-request/route.js',
  'src/app/api/staff/applications/[id]/assign/route.js',
  'src/app/api/privacy/requests/route.js',
  'src/app/api/privacy/grievances/route.js',
  'src/app/api/privacy/nomination/route.js',
  'src/app/api/applications/[id]/route.js',
  'src/app/api/admin/operators/route.js',
  'src/app/api/admin/privacy/requests/route.js',
  'src/app/api/admin/privacy/processors/route.js',
  'src/app/api/admin/privacy/incidents/route.js',
  'src/app/api/admin/privacy/policy/route.js'
];

targetFiles.forEach(relPath => {
  const fullPath = path.resolve(relPath);
  if (!fs.existsSync(fullPath)) return;

  let content = fs.readFileSync(fullPath, 'utf8');

  // Change db.transaction(() => { to db.transaction(async () => {
  content = content.replace(/db\.transaction\(\s*\(\s*\)\s*=>/g, 'db.transaction(async () =>');
  content = content.replace(/db\.transaction\(\s*function\s*\(\s*\)/g, 'db.transaction(async function()');

  // Change const tx = db.transaction(...); tx(); -> await tx();
  const txNames = ['tx', 'createOp', 'updateOp', 'updateDoc', 'executeTransition', 'open', 'executeAssign', 'updateTx', 'runTransaction', 'updateTransaction'];
  txNames.forEach(name => {
    // If name() is called without await
    const re = new RegExp(`(?<!await\\s+)${name}\\(`, 'g');
    content = content.replace(re, `await ${name}(`);
  });

  // Clean up any double await
  content = content.replace(/await\s+await\s+/g, 'await ');

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Updated transaction in: ${relPath}`);
});

console.log('All transaction definitions and calls updated to async/await!');
