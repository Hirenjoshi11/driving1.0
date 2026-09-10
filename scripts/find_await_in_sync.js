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
const issues = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  // Match `function <name>(...) {` that does not have `async` before it
  // and check if its body has `await `
  // Simple check: split into lines and track function blocks
  const lines = content.split('\n');
  let currentFn = null;
  let isAsync = false;
  let braceDepth = 0;
  let fnBraceDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fnMatch = line.match(/(async\s+)?function\s*(\w*)\s*\(/);
    if (fnMatch) {
      currentFn = fnMatch[2] || 'anonymous';
      isAsync = !!fnMatch[1];
      fnBraceDepth = braceDepth;
    }

    if (!isAsync && currentFn) {
      if (/\bawait\s+/.test(line)) {
        issues.push({ file, line: i + 1, fn: currentFn, text: line.trim() });
      }
    }

    const openCount = (line.match(/\{/g) || []).length;
    const closeCount = (line.match(/\}/g) || []).length;
    braceDepth += openCount - closeCount;

    if (currentFn && braceDepth <= fnBraceDepth) {
      currentFn = null;
      isAsync = false;
    }
  }
});

console.log('Functions with await in non-async functions:', issues.length);
issues.forEach(iss => console.log(`${path.relative('.', iss.file)}:${iss.line} in function ${iss.fn}: ${iss.text}`));
