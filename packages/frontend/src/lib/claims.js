// Build an EIP-712 claim payload JSON (unsigned). Ops can sign with tools/claim-signer.js
// amount: number (GCC smallest units? keep as raw token units for now)
// nonce: uint256 as string/number; deadlineSec: UNIX seconds
export function buildClaimJson({ to, amount, nonce, deadlineSec }) {
  const chainId = Number(import.meta.env.VITE_CHAIN_ID || 56);
  const verifyingContract = import.meta.env.VITE_REWARDER_ADDRESS;
  const domain = { name: 'LearnToEarnRewarder', version: '1', chainId, verifyingContract };
  const types = {
    Claim: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
      { name: 'nonce', type: 'uint256' }
    ]
  };
  const value = { to, amount: String(amount), deadline: String(deadlineSec), nonce: String(nonce) };
  return { domain, types, value, signature: '' }; // signature left blank; fill after offline sign
}

// Optional helper: compute eligible GCC from completed depts
export async function computeEligibleFromRewards(completedDepts) {
  try {
    const res = await fetch('/content/rewards.json');
    const table = await res.json();
    let sum = 0;
    for (const d of completedDepts) {
      if (d === 1) sum += Number(table['Beginner'] || 0);
      if (d === 2) sum += Number(table['Intermediate'] || 0);
      if (d === 3) sum += Number(table['Advanced'] || 0);
      if (d === 4) sum += Number(table['GCC Spotlight'] || 0);
    }
    return sum; // GCC (human units) — convert to token units outside if needed
  } catch { return 0; }
}
