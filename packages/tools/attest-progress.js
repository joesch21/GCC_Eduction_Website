#!/usr/bin/env node
// Admin sends on-chain progress: markCompleted or attestProgress
// Examples:
//   node attest-progress.js mark-completed --learner 0x.. --deptId 1 --registry 0xLearnerRegistry --rpc https://bsc-dataseed.binance.org
//   node attest-progress.js attest-root  --learner 0x.. --root 0x... --registry 0xLearnerRegistry --rpc ...
import { ethers } from 'ethers';

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

const cmd = process.argv[2];
const learner = arg('learner');
const deptId = BigInt(arg('deptId') || 0);
const root = arg('root');
const registry = arg('registry');
const rpc = arg('rpc') || 'https://bsc-dataseed.binance.org';
const pk = process.env.SIGNER_PRIVATE_KEY;
if (!cmd || !registry || !pk) { console.error('usage error'); process.exit(1); }

const ABI = [
  'function markCompleted(address learner,uint256 deptId) external',
  'function attestProgress(address learner,bytes32 stateRoot) external'
];

const provider = new ethers.JsonRpcProvider(rpc);
const wallet = new ethers.Wallet(pk, provider);
const reg = new ethers.Contract(registry, ABI, wallet);

if (cmd === 'mark-completed') {
  if (!learner) throw new Error('missing --learner');
  console.log('markCompleted', learner, deptId.toString());
  const tx = await reg.markCompleted(learner, deptId);
  console.log('tx', tx.hash);
  await tx.wait();
  console.log('done');
} else if (cmd === 'attest-root') {
  if (!learner || !root) throw new Error('missing --learner or --root');
  const tx = await reg.attestProgress(learner, root);
  console.log('tx', tx.hash);
  await tx.wait();
  console.log('done');
} else {
  throw new Error('unknown command');
}
