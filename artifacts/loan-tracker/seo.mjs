// Post-build SEO finalizer. Rewrites the canonical site URL into the built SEO
// assets using the real deployment domain (REPLIT_DOMAINS), so canonical tags,
// Open Graph/Twitter URLs, robots.txt and sitemap.xml automatically point at the
// live published address with no manual URL editing. Also injects JSON-LD
// structured data into the built landing page.
//
// Non-fatal: any failure logs a warning and exits 0 so an SEO problem can never
// break a production deploy.
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
    // Ignore ephemeral dev/preview domains. During the autoscale BUILD phase,
    // REPLIT_DOMAINS is set to the build container's *.replit.dev (and *.repl.co)
    // host, NOT the published *.replit.app domain. Baking that into canonical/
    // sitemap/robots/OG would make Google index the wrong, throwaway domain.
    .filter((d) => !/\.replit\.dev$|\.repl\.co$/i.test(d));
  if (domains.length > 0) return `https://${domains[0]}`;
  // Nothing usable from REPLIT_DOMAINS (build phase, or only a dev host present)
  // — fall back to the production placeholder, which already equals the real
  // published domain.
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
  const indexFile = path.join(distDir, "index.html");
  const robotsFile = path.join(distDir, "robots.txt");
  const sitemapFile = path.join(distDir, "sitemap.xml");

  // 1) Point all absolute SEO URLs at the real published domain.
  replaceInFile(indexFile, PLACEHOLDER, baseUrl);
  replaceInFile(robotsFile, PLACEHOLDER, baseUrl);
  replaceInFile(sitemapFile, PLACEHOLDER, baseUrl);

  // 2) Inject WebApplication JSON-LD into the built index.html <head> (once).
  // Guard on the WebApplication type specifically — the prerendered landing page
  // already emits its own FAQPage JSON-LD, so a generic "application/ld+json"
  // check would wrongly suppress this block. Both schemas must coexist.
  if (fs.existsSync(indexFile)) {
    let html = fs.readFileSync(indexFile, "utf8");
    if (!html.includes('"WebApplication"') && html.includes("</head>")) {
      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Loan Khatam",
        url: `${baseUrl}/`,
        description:
          "Loan Khatam is a free personal loan and udhaar tracker — record money you lend to friends and family, track repayments and EMIs, and watch outstanding balances settle. Amounts shown in ₹.",
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web, Android",
        offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
      };
      const tag = `<script type="application/ld+json">${JSON.stringify(
        jsonLd,
      )}</script>`;
      html = html.replace("</head>", `    ${tag}\n  </head>`);
      fs.writeFileSync(indexFile, html);
    }
  }

  console.log(`[seo] Finalized SEO assets with base URL ${baseUrl}`);
}

try {
  main();
} catch (err) {
  console.warn("[seo] Skipped (non-fatal):", err?.message || err);
}
