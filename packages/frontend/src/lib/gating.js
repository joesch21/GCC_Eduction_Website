import { completedByDept } from './subgraph';

const ORDER = ['department1','department2','department3','department4'];

export async function gatingFor(address) {
  if (!address) return { unlocked: { department1: true }, completed: {} };
  const depts = await completedByDept(address);
  const completed = {};
  for (const d of depts) {
    const key = ORDER[d - 1];
    if (key) completed[key] = true;
  }
  const unlocked = { department1: true };
  for (let i = 0; i < ORDER.length; i++) {
    if (completed[ORDER[i]]) unlocked[ORDER[i + 1]] = true;
  }
  return { unlocked, completed };
}
