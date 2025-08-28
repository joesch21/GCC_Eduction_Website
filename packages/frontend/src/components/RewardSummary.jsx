import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { rewarder } from '../lib/contracts';
import { totalClaimed } from '../lib/subgraph';

async function fetchClaim(address) {
  try {
    const res = await fetch(`/content/claims/${address.toLowerCase()}.json`);
    if (!res.ok) return null;
    return await res.json();
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
    if (!claim) return alert('No claim found for this address.');

    try {
      setBusy(true);
      const expectedChainId = Number(import.meta.env.VITE_CHAIN_ID || 56);
      const expectedContract = (import.meta.env.VITE_REWARDER_ADDRESS || '').toLowerCase();

      // Validate EIP-712 payload
      if (!claim.domain || !claim.value || !claim.signature) throw new Error('Malformed claim JSON');
      if (Number(claim.domain.chainId) !== expectedChainId) throw new Error('Wrong chainId in claim');
      if ((claim.domain.verifyingContract || '').toLowerCase() !== expectedContract) throw new Error('Wrong verifyingContract');
      if (claim.value.to.toLowerCase() !== address.toLowerCase()) throw new Error('Claim is not for this wallet');

      const now = Math.floor(Date.now() / 1000);
      if (Number(claim.value.deadline) <= now) throw new Error('Claim expired');

      // Check nonce on-chain equals payload.nonce
      const p = new ethers.BrowserProvider(window.ethereum);
      const signer = await p.getSigner();
      const net = await p.getNetwork();
      if (net.chainId !== BigInt(expectedChainId)) {
        await p.send('wallet_switchEthereumChain', [{ chainId: '0x' + expectedChainId.toString(16) }]);
      }
      const c = rewarder(signer);
      const currentNonce = await c.nonces(address);
      if (currentNonce.toString() !== String(claim.value.nonce)) {
        throw new Error(`Nonce mismatch (on-chain ${currentNonce} vs payload ${claim.value.nonce})`);
      }

      const tx = await c.claim(
        claim.value.to,
        claim.value.amount,
        claim.value.deadline,
        claim.value.nonce,
        claim.signature
      );
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
        We validate chain, contract, nonce and deadline before sending your claim.
      </small>
    </div>
  );
}
