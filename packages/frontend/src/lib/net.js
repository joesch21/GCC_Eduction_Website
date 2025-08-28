// Resilient networking for RPC + Subgraph

// ---- RPC fallbacks (read-only) ----
const RPCS = [
  import.meta.env.VITE_RPC_URL,                           // primary
  'https://bsc-dataseed.binance.org',                     // fallback 1
  'https://bsc-rpc.publicnode.com'                        // fallback 2
].filter(Boolean);

export function getRpcList() { return RPCS.slice(); }

// ---- Subgraph fetch with retry/backoff ----
const SUBGRAPH = import.meta.env.VITE_SUBGRAPH_URL;

export async function gql(query, variables = {}, { tries = 3 } = {}) {
  if (!SUBGRAPH) throw new Error('VITE_SUBGRAPH_URL missing');
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const t0 = performance.now();
      const res = await fetch(SUBGRAPH, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query, variables })
      });
      const json = await res.json();
      if (json.errors) throw new Error(json.errors.map(e => e.message).join('; '));
      const dur = Math.round(performance.now() - t0);
      return { data: json.data, durationMs: dur };
    } catch (e) {
      lastErr = e;
      await new Promise(r => setTimeout(r, 300 * Math.pow(2, i))); // 300ms, 600ms, 1200ms
    }
  }
  throw lastErr;
}

// Small probe helpers for /debug
export async function probeSubgraph() {
  const q = `query { _meta { block { number } } }`;
  try {
    const { data, durationMs } = await gql(q, {});
    return { ok: true, durationMs, block: data?._meta?.block?.number ?? null };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

