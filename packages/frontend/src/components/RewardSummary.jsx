import { useEffect, useState } from 'react';
import { totalClaimed } from '../lib/subgraph';
import { readProgress } from '../store/progress';

async function fetchRewardsTable() {
  try {
    const res = await fetch('/content/rewards.json');
    return await res.json(); // { "Beginner": 5, ... }
  } catch { return {}; }
}

export default function RewardSummary({ address }) {
  const [claimed, setClaimed] = useState(0);
  const [eligible, setEligible] = useState(0);

  useEffect(() => {
    let live = true;
    (async () => {
      const table = await fetchRewardsTable();
      const p = readProgress();
      const sum =
        (p.completed.department1 ? (table['Beginner'] || 0) : 0) +
        (p.completed.department2 ? (table['Intermediate'] || 0) : 0) +
        (p.completed.department3 ? (table['Advanced'] || 0) : 0) +
        (p.completed.department4 ? (table['GCC Spotlight'] || 0) : 0);
      if (live) setEligible(sum);
    })();
    return () => { live = false; };
  }, []);

  useEffect(() => {
    if (!address) return;
    let live = true;
    (async () => {
      try {
        const total = await totalClaimed(address);
        if (live) setClaimed(total);
      } catch {}
    })();
    return () => { live = false; };
  }, [address]);

  return (
    <div style={{ padding: 16 }}>
      <h3>Rewards</h3>
      <div>Eligible (based on your completed departments): <b>{eligible} GCC</b></div>
      <div>Claimed on-chain: <b>{claimed} GCC</b></div>
      <small style={{ color:'#aaa' }}>Eligibility currently computed client-side; claim history from subgraph.</small>
    </div>
  );
}
