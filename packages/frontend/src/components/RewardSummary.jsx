import { useEffect, useState } from 'react';
import { rewarder } from '../lib/contracts';
import { totalClaimed } from '../lib/subgraph';

// claims are published per-address in /content/claims/<address>.json
async function fetchClaim(address) {
  try {
    const res = await fetch(`/content/claims/${address.toLowerCase()}.json`);
    if (!res.ok) return null;
    return await res.json(); // { domain, types, value, signature }
  } catch { return null; }
}

export default function RewardSummary({ address }) {
  const [claimed, setClaimed] = useState(0);
  const [claim, setClaim] = useState(null);
  const [busy, setBusy] = useState(false);
  const [txh, setTxh] = useState('');

  useEffect(() => {
    if (!address) return;
    let live = true;
    (async () => {
      const total = await totalClaimed(address);
      const c = await fetchClaim(address);
      if (live) { setClaimed(total); setClaim(c); }
    })();
    return () => { live = false; };
  }, [address]);

  async function doClaim() {
    if (!claim) return alert('No claim found for this address yet.');
    try {
      setBusy(true);
      const p = new (await import('ethers')).ethers.BrowserProvider(window.ethereum);
      const signer = await p.getSigner();
      const c = rewarder(p).connect(signer);
      const { to, amount, deadline, nonce } = claim.value;
      const tx = await c.claim(to, amount, deadline, nonce, claim.signature);
      setTxh(tx.hash);
      await tx.wait();
      alert('Claim successful!');
    } catch (e) {
      console.error(e);
      alert(e?.reason || e?.message || 'Claim failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h3>Rewards</h3>
      <div>Claimed on-chain: <b>{claimed} GCC</b></div>
      <div style={{ marginTop: 8 }}>
        <button onClick={doClaim} disabled={!claim || busy}>
          {busy ? 'Claiming…' : (claim ? 'Claim GCC' : 'No claim yet')}
        </button>
        {txh && <div style={{ marginTop: 6 }}>Tx: {txh}</div>}
      </div>
      <small style={{ color:'#aaa' }}>
        Claims are signed by the Rewarder admin (EIP-712). The contract verifies
        the signature and prevents nonce replay.
      </small>
    </div>
  );
}
