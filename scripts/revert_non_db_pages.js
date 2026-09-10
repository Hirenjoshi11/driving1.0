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

const files = walk('./src/app');
const allowedAsyncPages = new Set([
  path.resolve('./src/app/page.js'),
  path.resolve('./src/app/documents/page.js'),
  path.resolve('./src/app/apply/page.js'),
  path.resolve('./src/app/apply/[stateSlug]/page.js'),
]);

let count = 0;
files.forEach(file => {
  const resolved = path.resolve(file);
  if (!allowedAsyncPages.has(resolved) && !file.includes('/api/') && !file.includes('\\api\\')) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('export default async function')) {
      content = content.replace(/export\s+default\s+async\s+function/g, 'export default function');
      fs.writeFileSync(file, content, 'utf8');
      count++;
      console.log(`Reverted to sync export default: ${path.relative('.', file)}`);
    }
  }
});

console.log(`Reverted ${count} non-DB pages back to sync export default.`);
