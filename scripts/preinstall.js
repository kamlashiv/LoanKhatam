import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Remove package-lock.json and yarn.lock if they exist
const rootDir = path.resolve(__dirname, '..');
['package-lock.json', 'yarn.lock'].forEach(file => {
  const filePath = path.join(rootDir, file);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`Removed ${file} to prevent conflicts.`);
    } catch (err) {
      console.error(`Failed to remove ${file}:`, err);
    }
  }
});

// 2. Enforce the use of pnpm
const userAgent = process.env.npm_config_user_agent || '';
if (!userAgent.startsWith('pnpm/')) {
  console.error('\x1b[31mError: Use pnpm instead of npm or yarn.\x1b[0m');
  process.exit(1);
}
