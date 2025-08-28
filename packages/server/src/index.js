import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

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

// 404
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () => {
  console.log(`Helper server listening on http://localhost:${PORT}`);
});
