// Simple cross-platform launcher using Node built-ins.
// Runs: yarn workspace server dev  AND  yarn workspace frontend dev -- --host --port 5173
import { spawn } from 'node:child_process';

function run(name, cmd, args) {
  const p = spawn(cmd, args, { stdio: 'inherit', shell: true });
  p.on('exit', code => {
    console.log(`[${name}] exited with code ${code}`);
    // If either process exits, kill the other (best-effort)
    try { server?.kill(); } catch {}
    try { frontend?.kill(); } catch {}
    process.exit(code ?? 0);
  });
  return p;
}

const server = run('server', 'yarn', ['workspace', 'server', 'dev']);
const frontend = run('frontend', 'yarn', ['workspace', 'frontend', 'dev', '--', '--host', '--port', '5173']);

