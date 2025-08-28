import { useEffect, useState } from 'react';
import { isAdmin } from '../lib/admin';
import { listCompletions, completionsByLearner } from '../lib/subgraph';
import { markCompletedTx } from '../lib/contracts';
import { buildClaimJson, computeEligibleFromRewards } from '../lib/claims';

function Row({ c }) {
  return (
    <tr>
      <td style={{ padding: 6 }}>{c.learner}</td>
      <td style={{ padding: 6, textAlign: 'center' }}>{c.deptId}</td>
      <td style={{ padding: 6, fontSize: 12, color: '#aaa' }}>{c.id}</td>
    </tr>
  );
}

export default function AdminPanel({ address }) {
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  const [filterAddr, setFilterAddr] = useState('');
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);

  // mark-completed form
  const [mcAddr, setMcAddr] = useState('');
  const [mcDept, setMcDept] = useState('1');

  // claim builder form
  const [claimAddr, setClaimAddr] = useState('');
  const [claimNonce, setClaimNonce] = useState('0');
  const [claimHours, setClaimHours] = useState('72');
  const [claimAmount, setClaimAmount] = useState(''); // human GCC

  useEffect(() => { setOk(isAdmin(address)); }, [address]);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        setBusy(true);
        const pageSize = 100;
        const res = await listCompletions({
          learner: filterAddr || undefined,
          first: pageSize,
          skip: page * pageSize
        });
        if (live) setItems(res);
      } finally { if (live) setBusy(false); }
    })();
    return () => { live = false; };
  }, [filterAddr, page]);

  async function markCompleted() {
    try {
      setBusy(true);
      const tx = await markCompletedTx(mcAddr, Number(mcDept));
      alert(`tx sent: ${tx.hash}`);
      await tx.wait();
      alert('Completed recorded on-chain');
    } catch (e) {
      console.error(e);
      alert(e?.reason || e?.message || 'markCompleted failed');
    } finally { setBusy(false); }
  }

  async function autoAmountFromCompletions() {
    if (!claimAddr) return;
    const cs = await completionsByLearner(claimAddr);
    const depts = cs.map(c => c.deptId);
    const sum = await computeEligibleFromRewards(depts);
    setClaimAmount(String(sum));
  }

  function downloadClaimJson() {
    try {
      const deadlineSec = Math.floor(Date.now() / 1000) + Number(claimHours || '72') * 3600;
      // convert human GCC -> token units if needed (leave as human if GCC has 18 decimals; adapt later)
      const payload = buildClaimJson({
        to: claimAddr,
        amount: claimAmount,   // NOTE: if token has 18 decimals, multiply by 1e18 before using on-chain
        nonce: claimNonce,
        deadlineSec
      });
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${claimAddr.toLowerCase()}-claim.json`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(a.href);
      a.remove();
    } catch (e) {
      console.error(e);
      alert('Failed to build claim JSON');
    }
  }

  if (!ok) {
    return <div style={{ padding: 16 }}>
      <h2>Admin Panel</h2>
      <p>Your address is not in <code>VITE_ADMIN_ADDRESSES</code>.</p>
    </div>;
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Admin Panel</h2>

      {/* Filter / pager */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', margin: '8px 0' }}>
        <input value={filterAddr} onChange={e => setFilterAddr(e.target.value)}
          placeholder="Filter by learner (0x...)" style={{ width: 360, padding: 6 }} />
        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Prev</button>
        <span>Page {page + 1}</span>
        <button onClick={() => setPage(p => p + 1)}>Next</button>
        {busy && <span style={{ color: '#aaa' }}>Loading…</span>}
      </div>

      {/* Completions table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: 6 }}>Learner</th>
            <th style={{ textAlign: 'center', padding: 6 }}>Dept</th>
            <th style={{ textAlign: 'left', padding: 6 }}>Event ID</th>
          </tr>
        </thead>
        <tbody>{items.map(c => <Row key={c.id} c={c} />)}</tbody>
      </table>

      {/* Mark Completed */}
      <div style={{ margin: '16px 0', padding: 12, border: '1px solid #444', borderRadius: 8 }}>
        <h3>Mark Completed (on-chain)</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input placeholder="0xLearner" value={mcAddr} onChange={e => setMcAddr(e.target.value)} style={{ width: 360, padding: 6 }} />
          <select value={mcDept} onChange={e => setMcDept(e.target.value)}>
            <option value="1">Dept 1</option><option value="2">Dept 2</option>
            <option value="3">Dept 3</option><option value="4">Dept 4</option>
          </select>
          <button onClick={markCompleted} disabled={busy}>Mark Completed</button>
        </div>
        <small style={{ color: '#aaa' }}>Requires the connected wallet to have ADMIN_ROLE on LearnerRegistry.</small>
      </div>

      {/* Generate Claim JSON */}
      <div style={{ margin: '16px 0', padding: 12, border: '1px solid #444', borderRadius: 8 }}>
        <h3>Generate Claim JSON (offline sign later)</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input placeholder="0xLearner" value={claimAddr} onChange={e => setClaimAddr(e.target.value)} style={{ width: 360, padding: 6 }} />
          <input placeholder="Amount (GCC, human)" value={claimAmount} onChange={e => setClaimAmount(e.target.value)} style={{ width: 180, padding: 6 }} />
          <input placeholder="Nonce" value={claimNonce} onChange={e => setClaimNonce(e.target.value)} style={{ width: 90, padding: 6 }} />
          <input placeholder="Deadline (hours)" value={claimHours} onChange={e => setClaimHours(e.target.value)} style={{ width: 120, padding: 6 }} />
          <button onClick={autoAmountFromCompletions}>Auto amount from completions</button>
          <button onClick={downloadClaimJson}>Download JSON</button>
        </div>
        <small style={{ color: '#aaa' }}>
          This JSON includes EIP-712 domain/types/value; signature is blank. Sign it offline with the ops key
          using <code>packages/tools/claim-signer.js</code> or a Safe module, then place the signed file under
          <code>/public/content/claims/&lt;address&gt;.json</code>.
        </small>
      </div>
    </div>
  );
}

