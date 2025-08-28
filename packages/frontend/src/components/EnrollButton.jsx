import { useState } from 'react';
import { ethers } from 'ethers';
import { getSigner, learnerRegistry } from '../lib/contracts';

export default function EnrollButton({ cohortId = 1, onEnrolled }) {
  const [busy, setBusy] = useState(false);

  async function enroll() {
    try {
      setBusy(true);
      const signer = await getSigner();
      // Ensure BSC 56
      const net = await signer.provider.getNetwork();
      if (net.chainId !== 56n) {
        await signer.provider.send('wallet_switchEthereumChain', [{ chainId: '0x38' }]);
      }
      const reg = learnerRegistry(signer);
      const tx = await reg.enroll(ethers.toBigInt(cohortId));
      const receipt = await tx.wait();
      onEnrolled?.(receipt);
      alert('Enrolled!');
    } catch (e) {
      console.error(e);
      alert(e?.reason || e?.message || 'Enroll failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <button onClick={enroll} disabled={busy}>
      {busy ? 'Enrolling…' : `Enroll (cohort ${cohortId})`}
    </button>
  );
}
