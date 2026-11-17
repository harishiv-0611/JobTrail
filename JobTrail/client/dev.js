import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const clientDirectory = dirname(fileURLToPath(import.meta.url));
const processes = [];
let stopping = false;

function stopProcesses(signal = 'SIGTERM') {
  if (stopping) return;
  stopping = true;

  for (const child of processes) {
    if (child.exitCode === null && child.signalCode === null) {
      child.kill(signal);
    }
  }
}

function startProcess(label, entryPoint, args) {
  const child = spawn(
    process.execPath,
    [resolve(clientDirectory, entryPoint), ...args],
    {
      cwd: clientDirectory,
      stdio: 'inherit',
    }
  );
  processes.push(child);

  child.on('error', (error) => {
    console.error(`Could not start ${label}: ${error.message}`);
    process.exitCode = 1;
    stopProcesses();
  });

  child.on('exit', (code, signal) => {
    if (stopping) return;

    if (code !== 0) {
      console.error(`${label} stopped unexpectedly (code ${code ?? signal}).`);
      process.exitCode = code || 1;
    }
    stopProcesses();
  });
}

process.on('SIGINT', () => {
  process.exitCode = 130;
  stopProcesses('SIGINT');
});
process.on('SIGTERM', () => {
  process.exitCode = 143;
  stopProcesses();
});


startProcess('Vite', 'node_modules/vite/bin/vite.js', []);
