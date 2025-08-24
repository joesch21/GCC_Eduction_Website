import { useState } from 'react';

async function sha256(data) {
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function buildMerkle(hashes) {
  let nodes = hashes.slice();
  if (nodes.length === 0) return '';
  while (nodes.length > 1) {
    const next = [];
    for (let i = 0; i < nodes.length; i += 2) {
      const left = nodes[i];
      const right = nodes[i + 1] || left;
      const data = new TextEncoder().encode(left + right);
      const digest = crypto.subtle.digest('SHA-256', data);
      next.push(digest.then(b => Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, '0')).join('')));
    }
    nodes = await Promise.all(next);
  }
  return nodes[0];
}

export default function AdminPublisher() {
  const [root, setRoot] = useState('');
  const [uri, setUri] = useState('');

  async function handleFiles(e) {
    const files = Array.from(e.target.files);
    const hashes = [];
    for (const file of files) {
      const buffer = await file.arrayBuffer();
      hashes.push(await sha256(buffer));
    }
    hashes.sort();
    const r = await buildMerkle(hashes);
    setRoot(r);
    setUri('ipfs://TODO');
  }

  return (
    <div>
      <input type="file" webkitdirectory="true" multiple onChange={handleFiles} />
      {root && <p>root: {root}</p>}
      {uri && <p>uri: {uri}</p>}
    </div>
  );
}