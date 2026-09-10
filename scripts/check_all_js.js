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
    } else if (file.endsWith('.js')) {
      results.push(full);
    }
  });
  return results;
}

const files = walk('./src');
let failed = 0;
files.forEach(f => {
  try {
    execSync(`node --check "${f}"`, { stdio: 'pipe' });
  } catch (err) {
    failed++;
    console.error('FAILED:', path.relative('.', f));
    console.error(err.stderr ? err.stderr.toString() : err.message);
  }
});
console.log(`\nDone checking ${files.length} .js files. Failures: ${failed}`);
