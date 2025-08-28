const KEY = 'lythera_progress_v1';

export function readProgress() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || { completed: {}, unlocked: { department1: true } };
  } catch {
    return { completed: {}, unlocked: { department1: true } };
  }
}

export function writeProgress(p) {
  localStorage.setItem(KEY, JSON.stringify(p));
}

export function markDeptCompleted(deptId) {
  const p = readProgress();
  p.completed[deptId] = { at: Date.now() };
  // unlock next department
  const order = ['department1','department2','department3','department4'];
  const idx = order.indexOf(deptId);
  const next = order[idx + 1];
  if (next) p.unlocked[next] = true;
  writeProgress(p);
  return p;
}

export function isDeptUnlocked(deptId) {
  const p = readProgress();
  return !!p.unlocked[deptId];
}

export function isDeptCompleted(deptId) {
  const p = readProgress();
  return !!p.completed[deptId];
}
