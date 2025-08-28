import { gql } from './net';

export async function cohortEnrollmentCount(cohortId) {
  const q = `query($cohortId: BigInt!) { enrolleds(first: 1000, where: { cohortId: $cohortId }) { id } }`;
  const { data } = await gql(q, { cohortId: String(cohortId) });
  return data.enrolleds.length;
}

export async function myEnrollments(addr) {
  const q = `query($addr: Bytes!) { enrolleds(first: 1000, where: { learner: $addr }) { cohortId } }`;
  const { data } = await gql(q, { addr: addr.toLowerCase() });
  return data.enrolleds.map(e => e.cohortId);
}

export async function totalClaimed(addr) {
  const q = `query($addr: Bytes!) { claimeds(first: 1000, where: { to: $addr }) { amount } }`;
  const { data } = await gql(q, { addr: addr.toLowerCase() });
  return data.claimeds.reduce((sum, c) => sum + Number(c.amount), 0);
}

export async function completedByDept(addr) {
  const q = `query($addr: Bytes!) { completeds(first: 1000, where: { learner: $addr }) { deptId } }`;
  const { data } = await gql(q, { addr: addr.toLowerCase() });
  return data.completeds.map(c => Number(c.deptId));
}

export async function listCompletions({ first = 100, skip = 0, learner }) {
  const q = `
    query($first: Int!, $skip: Int!, $learner: Bytes) {
      completeds(first: $first, skip: $skip, orderBy: id, orderDirection: desc,
        where: { learner: $learner }) { id learner deptId }
    }`;
  const { data } = await gql(q, { first, skip, learner: learner ? learner.toLowerCase() : null });
  return data.completeds.map(c => ({ id: c.id, learner: c.learner, deptId: Number(c.deptId) }));
}

export async function completionsByLearner(learner) {
  return listCompletions({ learner, first: 1000, skip: 0 });
}
