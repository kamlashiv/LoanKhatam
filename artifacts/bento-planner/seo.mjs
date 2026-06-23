// Post-build SEO finalizer. Rewrites the placeholder canonical site URL into
// the built SEO assets using the real deployment domain (REPLIT_DOMAINS), so
// canonical tags, Open Graph/Twitter URLs, robots.txt, and sitemap.xml all
// point at the live published address with no manual URL editing.
//
// Non-fatal: any failure logs a warning and exits 0 so an SEO problem never
// breaks a production deploy.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(root, "dist/public");
const PLACEHOLDER = "https://loan-khatam.replit.app";

function normalizeHost(value) {
  return String(value || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "")
    .trim();
}

function resolveBaseUrl() {
  const domains = (process.env.REPLIT_DOMAINS || "")
    .split(",")
    .map(normalizeHost)
    .filter(Boolean)
    .filter((d) => !/\.replit\.dev$|\.repl\.co$/i.test(d));
  if (domains.length > 0) return `https://${domains[0]}`;
  return PLACEHOLDER;
}

function replaceInFile(file, from, to) {
  if (from === to || !fs.existsSync(file)) return;
  const src = fs.readFileSync(file, "utf8");
  const out = src.split(from).join(to);
  if (out !== src) fs.writeFileSync(file, out);
}

function main() {
  const baseUrl = resolveBaseUrl();
  const robotsFile = path.join(distDir, "robots.txt");
  const sitemapFile = path.join(distDir, "sitemap.xml");

  const htmlFiles = fs.existsSync(distDir)
    ? fs
        .readdirSync(distDir)
        .filter((f) => f.endsWith(".html"))
        .map((f) => path.join(distDir, f))
    : [];

  for (const file of htmlFiles) replaceInFile(file, PLACEHOLDER, baseUrl);
  replaceInFile(robotsFile, PLACEHOLDER, baseUrl);
  replaceInFile(sitemapFile, PLACEHOLDER, baseUrl);

  console.log(`[seo] Finalized SEO assets with base URL ${baseUrl}`);
}

try {
  main();
} catch (err) {
  console.warn("[seo] Skipped (non-fatal):", err?.message || err);
}
