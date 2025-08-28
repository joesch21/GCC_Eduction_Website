const KEY = 'lythera_progress_v1';

export function readProgress() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
  catch { return {}; }
}

export function writeProgress(next) {
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function markPassed(deptId, data = {}) {
  const cur = readProgress();
  cur[deptId] = { ...(cur[deptId] || {}), passed: true, ...data };
  writeProgress(cur);
}

export function hasPassed(deptId) {
  const cur = readProgress();
  return !!cur?.[deptId]?.passed;
}

export function attemptsFor(deptId) {
  const cur = readProgress();
  return cur?.[deptId]?.attempts || 0;
}

export function incAttempt(deptId) {
  const cur = readProgress();
  const prev = cur?.[deptId]?.attempts || 0;
  const next = { ...(cur[deptId] || {}), attempts: prev + 1 };
  cur[deptId] = next;
  writeProgress(cur);
  return next.attempts;
}
