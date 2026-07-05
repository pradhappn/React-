import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, '..', 'Loan Application');
const port = process.env.PORT || 3000;

const child = spawn(
  'npm',
  ['run', 'preview', '--', '--host', '0.0.0.0', '--port', String(port), '--strictPort'],
  {
    cwd: frontendDir,
    stdio: 'inherit',
    shell: true,
  }
);

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  }
  process.exit(code ?? 1);
});
