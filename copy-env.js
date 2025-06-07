// copy-env.js
// Cross-platform script to copy .env to client/.env and server/.env using ES module syntax
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootEnv = path.resolve(__dirname, '.env');
const clientEnv = path.resolve(__dirname, 'client/.env');
const serverEnv = path.resolve(__dirname, 'server/.env');

function copyEnv(target) {
  if (fs.existsSync(rootEnv)) {
    fs.copyFileSync(rootEnv, target);
    console.log(`Copied .env to ${target}`);
  } else {
    console.warn('.env not found in root. Skipping copy.');
  }
}

copyEnv(clientEnv);
copyEnv(serverEnv);
