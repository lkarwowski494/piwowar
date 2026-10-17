const fs = require('fs');
const path = require('path');

const sourceFile = path.resolve('lib/locales/_source.json');
const source = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
const sourceKeys = new Set(Object.keys(source));

function walk(dir) {
  let files = [];
  fs.readdirSync(dir, { withFileTypes: true }).forEach(d => {
    const full = path.join(dir, d.name);
    if (d.isDirectory() && !full.includes('node_modules') && !full.includes('.git') && !full.includes('locales')) {
      files = files.concat(walk(full));
    } else if (d.isFile() && (full.endsWith('.ts') || full.endsWith('.tsx') || full.endsWith('.js'))) {
      files.push(full);
    }
  });
  return files;
}

const allFiles = [...walk('app'), ...walk('components'), ...walk('lib')];
const foundCalls = new Set();
const regex = /\bt\(\s*['"]([^'"]+)['"]/g;

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = regex.exec(content)) !== null) {
    foundCalls.add(match[1]);
  }
});

console.log('Total unique t() calls found in code:', foundCalls.size);
console.log('Total keys in _source.json:', sourceKeys.size);

const missingInSource = [...foundCalls].filter(k => !sourceKeys.has(k));
console.log('Keys in code but missing in _source.json:', JSON.stringify(missingInSource));

const unusedInCode = [...sourceKeys].filter(k => !foundCalls.has(k));
console.log('Keys in _source.json not directly matched by static regex:', unusedInCode.length);
