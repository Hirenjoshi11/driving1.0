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
let fixedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const isClient = content.includes("'use client'") || content.includes('"use client"');
  if (isClient) {
    if (content.includes('export default async function')) {
      content = content.replace(/export\s+default\s+async\s+function/g, 'export default function');
      fs.writeFileSync(file, content, 'utf8');
      fixedCount++;
      console.log(`Reverted client component to sync: ${path.relative('.', file)}`);
    }
  }
});

console.log(`Fixed ${fixedCount} client components.`);
