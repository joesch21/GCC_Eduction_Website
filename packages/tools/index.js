#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function walk(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir)) {
    const p = path.join(dir, entry);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) results = results.concat(walk(p));
    else results.push(p);
  }
  return results;
}

function merkle(hashes) {
  if (hashes.length === 0) return '';
  let nodes = hashes.slice();
  while (nodes.length > 1) {
    const next = [];
    for (let i = 0; i < nodes.length; i += 2) {
      const left = nodes[i];
      const right = nodes[i + 1] || left;
      const h = crypto.createHash('sha256').update(left + right, 'hex').digest('hex');
      next.push(h);
    }
    nodes = next;
  }
  return nodes[0];
}

const idx = process.argv.indexOf('--path');
const target = idx > -1 ? process.argv[idx + 1] : process.cwd();
const files = walk(target);
const items = files.map(f => {
  const data = fs.readFileSync(f);
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  return { file: path.relative(target, f), hash };
});
const root = merkle(items.map(i => i.hash));
console.log(JSON.stringify({ root, files: items }, null, 2));
console.log('TODO: upload files to IPFS/Arweave');