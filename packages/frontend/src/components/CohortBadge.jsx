import { useEffect, useState } from 'react';
import { cohortEnrollmentCount, myEnrollments } from '../lib/subgraph';
import EnrollButton from './EnrollButton';

export default function CohortBadge({ address, cohortId = 1, cap = 100 }) {
  const [count, setCount] = useState(0);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const c = await cohortEnrollmentCount(cohortId);
        if (live) setCount(c);
      } catch {}
    })();
    return () => { live = false; };
  }, [cohortId]);

  useEffect(() => {
    if (!address) return;
    let live = true;
    (async () => {
      try {
        const mine = await myEnrollments(address);
        if (live) setEnrolled(mine.some(id => String(id) === String(cohortId)));
      } catch {}
    })();
    return () => { live = false; };
  }, [address, cohortId]);

  const spotsLeft = Math.max(0, cap - count);

  return (
    <div style={{ display:'inline-flex', gap:10, alignItems:'center', background:'#333', padding:'6px 10px', borderRadius:8 }}>
      <span>Cohort {cohortId}</span>
      <span>{enrolled ? '✅ Enrolled' : '🔒 Not enrolled'}</span>
      <span>Spots left: {spotsLeft}</span>
      {!enrolled && spotsLeft > 0 && (
        <EnrollButton cohortId={cohortId} onEnrolled={() => setEnrolled(true)} />
      )}
    </div>
  );
}
