const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(full));
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      results.push(full);
    }
  });
  return results;
}

const files = walk('./src');
let modifiedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // 1. Fix chained property access specifically first
  content = content.replace(/db\.prepare\(([\s\S]*?)\)\.get\(\)\.count/g, '(await db.prepare($1).get())?.count || 0');
  content = content.replace(/db\.prepare\(([\s\S]*?)\)\.get\(\)\?\.count/g, '(await db.prepare($1).get())?.count');
  content = content.replace(/db\.prepare\(([\s\S]*?)\)\.get\(\)\?\.total/g, '(await db.prepare($1).get())?.total');

  // 2. Fix stmt.run(...) if not awaited
  content = content.replace(/([^a-zA-Z0-9_$]|^)stmt\.run\(/g, '$1await stmt.run(');
  content = content.replace(/await\s+await\s+stmt\.run\(/g, 'await stmt.run(');

  // 3. Fix db.prepare(...) if not preceded by await
  // Match `db.prepare(` when NOT preceded by `await `
  // We can use a regex replacement with a negative lookbehind or check token
  content = content.replace(/(?<!await\s+)(?<!await\s+)db\.prepare\(/g, 'await db.prepare(');

  // 4. Fix db.exec(...) if not preceded by await
  content = content.replace(/(?<!await\s+)db\.exec\(/g, 'await db.exec(');

  // 5. Clean up any accidental `await await`
  content = content.replace(/await\s+await\s+/g, 'await ');

  // 6. Ensure Server Components and helper functions that contain await are marked async
  content = content.replace(/export\s+default\s+function\s+([A-Z]\w*)/g, 'export default async function $1');
  content = content.replace(/function\s+checkScope\s*\(/g, 'async function checkScope(');
  content = content.replace(/export\s+function\s+logAudit\s*\(/g, 'export async function logAudit(');
  content = content.replace(/export\s+function\s+logDocumentAccess\s*\(/g, 'export async function logDocumentAccess(');
  content = content.replace(/export\s+function\s+logApplicationAccess\s*\(/g, 'export async function logApplicationAccess(');
  content = content.replace(/export\s+function\s+getOperatorAssignments\s*\(/g, 'export async function getOperatorAssignments(');
  content = content.replace(/export\s+function\s+scopeClause\s*\(/g, 'export async function scopeClause(');
  content = content.replace(/export\s+function\s+verifyApplicationInScope\s*\(/g, 'export async function verifyApplicationInScope(');
  content = content.replace(/export\s+function\s+getUserConsents\s*\(/g, 'export async function getUserConsents(');
  content = content.replace(/export\s+function\s+recordConsentChoice\s*\(/g, 'export async function recordConsentChoice(');
  content = content.replace(/export\s+function\s+hasValidConsent\s*\(/g, 'export async function hasValidConsent(');
  content = content.replace(/export\s+function\s+reportSecurityIncident\s*\(/g, 'export async function reportSecurityIncident(');
  content = content.replace(/export\s+function\s+updateIncidentStatus\s*\(/g, 'export async function updateIncidentStatus(');
  content = content.replace(/export\s+function\s+checkOverdueIncidents\s*\(/g, 'export async function checkOverdueIncidents(');
  content = content.replace(/export\s+function\s+exportUserData\s*\(/g, 'export async function exportUserData(');
  content = content.replace(/function\s+createNotification\s*\(/g, 'async function createNotification(');
  content = content.replace(/function\s+listForUser\s*\(/g, 'async function listForUser(');
  content = content.replace(/function\s+unreadCount\s*\(/g, 'async function unreadCount(');
  content = content.replace(/function\s+markRead\s*\(/g, 'async function markRead(');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
    try {
      execSync(`node --check "${file}"`);
      console.log(`✓ Updated & validated: ${path.relative('.', file)}`);
    } catch (err) {
      console.error(`✗ Syntax error in ${path.relative('.', file)}:`, err.message);
    }
  }
});

console.log(`\nCompleted! Modified and validated ${modifiedCount} files.`);
