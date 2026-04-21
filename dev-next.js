#!/usr/bin/env node
// NGXGlass Next.js dev server
// Starts ngx-app on port 3000
// Usage: node dev-next.js
//        Then open http://localhost:3000

const { spawn } = require('child_process');
const path = require('path');

const PORT = 3000;
const appDir = path.join(__dirname, 'ngx-app');

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const child = spawn(
  npmCmd,
  ['run', 'dev', '--', '--port', String(PORT)],
  {
    cwd: appDir,
    stdio: 'inherit',
  }
);

child.on('error', err => {
  console.error('Failed to start Next.js dev server:', err.message);
  process.exit(1);
});

child.on('exit', code => {
  if (code !== 0) process.exit(code ?? 1);
});

process.on('SIGINT', () => {
  child.kill('SIGINT');
});
process.on('SIGTERM', () => {
  child.kill('SIGTERM');
});
