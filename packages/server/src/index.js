import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import fetch from 'node-fetch';

const app = express();

const PORT = process.env.PORT || 4000;
const ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(morgan('dev'));
app.use(cors({ origin: ORIGIN }));
app.use(express.json());

// Health & meta (purely informational)
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    note: 'Stateless helper server for local dev. No DB, no custody.'
  });
});

// Example: static config endpoint (frontend can fetch if you want)
app.get('/config', (_req, res) => {
  res.json({
    chainId: 56,
    rpcUrl: process.env.VITE_RPC_URL || 'https://bsc-dataseed.binance.org',
    explorer: process.env.VITE_EXPLORER_URL || 'https://bscscan.com'
  });
});

app.get('/config/health', async (_req, res) => {
  const rpc = process.env.VITE_RPC_URL || 'https://bsc-dataseed.binance.org';
  const subgraph = process.env.VITE_SUBGRAPH_URL;
  let rpcOk = false, sgOk = false, sgMs = null;

  try {
    const r = await fetch(rpc, { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ jsonrpc:'2.0', id:1, method:'eth_chainId', params:[] }) });
    const j = await r.json();
    rpcOk = !!j.result;
  } catch {}

  try {
    const t0 = Date.now();
    const g = await fetch(subgraph, { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ query: '{ _meta { block { number } } }' }) });
    const j = await g.json();
    sgOk = !j.errors;
    sgMs = Date.now() - t0;
  } catch {}

  const status = rpcOk && sgOk ? 'green' : (rpcOk || sgOk) ? 'yellow' : 'red';
  res.json({ status, rpcOk, sgOk, sgMs });
});

// 404
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () => {
  console.log(`Helper server listening on http://localhost:${PORT}`);
});
