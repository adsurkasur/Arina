#!/usr/bin/env node
// install-all.js (ESM version)
// Installs dependencies in root, client, and server folders

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function runInstall(dir) {
  console.log(`\nInstalling dependencies in: ${dir}`);
  execSync('npm install', { stdio: 'inherit', cwd: path.resolve(__dirname, dir) });
}

try {
  runInstall('.');
  runInstall('client');
  runInstall('server');
  console.log('\nAll dependencies installed successfully.');
} catch (err) {
  console.error('\nDependency installation failed:', err.message);
  process.exit(1);
}
