import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to load .env from current working directory or absolute locations
const pathsToTry = [
  path.resolve(process.cwd(), '.env'),         // Root workspace .env (CWD)
  path.resolve(__dirname, '../../../.env'),    // Root workspace .env (Relative to dist)
  path.resolve(__dirname, '../.env'),          // api-server/.env
];

for (const envPath of pathsToTry) {
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const firstEqual = trimmed.indexOf('=');
          if (firstEqual !== -1) {
            const key = trimmed.slice(0, firstEqual).trim();
            let val = trimmed.slice(firstEqual + 1).trim();
            // Remove wrapping quotes if present
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1);
            }
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      });
      break; // Stop at first found .env file
    } catch (err) {
      // Ignore errors loading env
    }
  }
}

process.env.NODE_ENV = process.env.NODE_ENV || "development";
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || "dummy-openai-key";
process.env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "dummy-anthropic-key";
