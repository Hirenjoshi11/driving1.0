const fs = require('fs');
const path = require('path');

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
let updatedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // Ensure calls to logAudit, createNotification, markRead, scopeClause, verifyApplicationInScope are awaited
  content = content.replace(/(?<!await\s+)logAudit\(/g, 'await logAudit(');
  content = content.replace(/(?<!await\s+)logDocumentAccess\(/g, 'await logDocumentAccess(');
  content = content.replace(/(?<!await\s+)logApplicationAccess\(/g, 'await logApplicationAccess(');
  content = content.replace(/(?<!await\s+)createNotification\(/g, 'await createNotification(');
  content = content.replace(/(?<!await\s+)markRead\(/g, 'await markRead(');
  content = content.replace(/(?<!await\s+)listForUser\(/g, 'await listForUser(');
  content = content.replace(/(?<!await\s+)unreadCount\(/g, 'await unreadCount(');
  content = content.replace(/(?<!await\s+)scopeClause\(/g, 'await scopeClause(');
  content = content.replace(/(?<!await\s+)verifyApplicationInScope\(/g, 'await verifyApplicationInScope(');
  content = content.replace(/(?<!await\s+)getOperatorAssignments\(/g, 'await getOperatorAssignments(');

  content = content.replace(/await\s+await\s+/g, 'await ');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    updatedCount++;
    console.log(`Updated helper calls with await: ${path.relative('.', file)}`);
  }
});

console.log(`Updated ${updatedCount} files.`);
