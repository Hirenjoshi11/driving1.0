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
const chainedMatches = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    // Check for .get(...). or .run(...). or .all(...).
    if (/\.(get|run|all)\([^)]*\)\s*(\.|\?\.|\w)/.test(line)) {
      chainedMatches.push({ file, line: idx + 1, text: line.trim() });
    }
  });
});

console.log('Chained accesses found:', chainedMatches.length);
chainedMatches.forEach(m => console.log(`${path.relative('.', m.file)}:${m.line}: ${m.text}`));
