const SUBGRAPH = import.meta.env.VITE_SUBGRAPH_URL;

export async function gql(query, variables = {}) {
  if (!SUBGRAPH) throw new Error('VITE_SUBGRAPH_URL missing');
  const res = await fetch(SUBGRAPH, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables })
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors.map(e => e.message).join('; '));
  return json.data;
}

/** Count enrollments in a cohort (first 1000) */
export async function cohortEnrollmentCount(cohortId) {
  const q = `
    query($cohortId: BigInt!) {
      enrolleds(first: 1000, where: { cohortId: $cohortId }) { id }
    }
  `;
  const data = await gql(q, { cohortId: String(cohortId) });
  return data.enrolleds.length;
}

/** Is this address enrolled (any cohort)? */
export async function myEnrollments(addr) {
  const q = `
    query($addr: Bytes!) {
      enrolleds(first: 1000, where: { learner: $addr }) { cohortId }
    }
  `;
  const data = await gql(q, { addr: addr.toLowerCase() });
  return data.enrolleds.map(e => e.cohortId);
}

/** Total claimed by address */
export async function totalClaimed(addr) {
  const q = `
    query($addr: Bytes!) {
      claimeds(first: 1000, where: { to: $addr }) { amount }
    }
  `;
  const data = await gql(q, { addr: addr.toLowerCase() });
  return data.claimeds.reduce((sum, c) => sum + Number(c.amount), 0);
}

export async function completedByDept(addr) {
  const q = `
    query($addr: Bytes!) {
      completeds(first: 1000, where: { learner: $addr }) { deptId }
    }
  `;
  const d = await gql(q, { addr: addr.toLowerCase() });
  return d.completeds.map(c => Number(c.deptId));
}
