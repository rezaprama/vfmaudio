import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const target = new URL(process.argv[2] ?? 'https://vfmaudio.rezaprama.workers.dev');
if (target.origin !== 'https://vfmaudio.rezaprama.workers.dev') throw new Error('Script operator ini hanya untuk https://vfmaudio.rezaprama.workers.dev.');
const token = randomBytes(32).toString('hex');
const wrangler = resolve('node_modules/wrangler/bin/wrangler.js');
async function runWithSecret(command: string, args: string[]): Promise<void> {
  return new Promise<void>((resolveRun, reject) => {
    const child = spawn(command, args, { stdio: ['pipe', 'pipe', 'pipe'], env: { ...process.env, CI: 'true' } });
    let output = '';
    child.stdout.on('data', chunk => { output += String(chunk); });
    child.stderr.on('data', chunk => { output += String(chunk); });
    child.on('error', reject);
    child.on('close', code => code === 0 ? resolveRun() : reject(new Error(`Penyimpanan secret gagal (exit ${code}). ${output.replaceAll(token, '[REDACTED]')}`)));
    child.stdin.end(token + '\n');
  });
}
await runWithSecret(process.execPath, [wrangler, 'secret', 'put', 'SYNC_TOKEN']);
await runWithSecret('gh', ['secret', 'set', 'VFMAUDIO_SYNC_TOKEN', '--repo', 'rezaprama/vfmaudio']);
const response = await fetch(new URL('/api/admin/sync', target), { method: 'POST', headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(180_000) });
const result: unknown = await response.json();
console.log(JSON.stringify({ httpStatus: response.status, result }));
if (!response.ok) process.exitCode = 1;
