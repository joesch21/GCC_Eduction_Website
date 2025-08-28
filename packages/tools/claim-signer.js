#!/usr/bin/env node
// Sign EIP-712 claim for LearnToEarnRewarder.
// Usage:
//   node claim-signer.js --to 0xLearner --amount 50 --deadlineHours 72 --nonce 0 --chainId 56 --rewarder 0xRewarder --out ./claims/0xlearner.json
import fs from 'node:fs';
import path from 'node:path';
import { Wallet, TypedDataEncoder } from 'ethers';

function arg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : def;
}

const to = arg('to');
const amount = BigInt(arg('amount'));
const chainId = Number(arg('chainId') || 56);
const rewarder = arg('rewarder');
const nonce = BigInt(arg('nonce'));
const hours = Number(arg('deadlineHours') || 72);
const out = arg('out', `./claims/${to}.json`);
const pk = process.env.SIGNER_PRIVATE_KEY;

if (!to || !amount || !rewarder || !pk) {
  console.error('Missing required args: --to --amount --rewarder and SIGNER_PRIVATE_KEY env'); process.exit(1);
}
const deadline = BigInt(Math.floor(Date.now() / 1000) + hours * 3600);

const domain = { name: 'LearnToEarnRewarder', version: '1', chainId, verifyingContract: rewarder };
const types = { Claim: [
  { name: 'to', type: 'address' },
  { name: 'amount', type: 'uint256' },
  { name: 'deadline', type: 'uint256' },
  { name: 'nonce', type: 'uint256' }
]};
const value = { to, amount, deadline, nonce };

const wallet = new Wallet(pk);
const signature = await wallet.signTypedData(domain, types, value);

const payload = { domain, types, value, signature };
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(payload, null, 2));
console.log('Wrote', out);
