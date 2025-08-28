import { useEffect, useState } from 'react';
import { getRpcList, probeSubgraph } from '../lib/net';

export default function DebugPage() {
  const [sg, setSg] = useState({ ok:false });
  const [cfg, setCfg] = useState({
    chainId: Number(import.meta.env.VITE_CHAIN_ID || 56),
    rewarder: import.meta.env.VITE_REWARDER_ADDRESS,
    learner: import.meta.env.VITE_LEARNER_REGISTRY_ADDRESS,
    subgraph: import.meta.env.VITE_SUBGRAPH_URL
  });

  useEffect(() => {
    let live = true;
    (async () => {
      const res = await probeSubgraph();
      if (live) setSg(res);
    })();
    return () => { live = false; };
  }, []);

  return (
    <div style={{ padding:16 }}>
      <h2>Debug</h2>
      <div><b>RPCs:</b> {getRpcList().join(' , ')}</div>
      <div><b>Subgraph:</b> {cfg.subgraph}</div>
      <div><b>Contracts:</b> Rewarder {cfg.rewarder} — Learner {cfg.learner}</div>
      <div style={{ marginTop:8 }}>
        <b>Subgraph status:</b> {sg.ok ? `OK (${sg.durationMs} ms)` : `FAIL (${sg.error})`}
        {sg.block ? <div>Indexed block: {sg.block}</div> : null}
      </div>
    </div>
  );
}
