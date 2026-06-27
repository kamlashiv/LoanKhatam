// Post-build prerender step. After `vite build` produces the static SPA, this
// script emits one HTML file per public route, each with its own crawlable body
// (SSR-compiled) and its own <head> metadata — title, description, canonical, and
// Open Graph/Twitter URLs — so every public URL returns route-specific content in
// its initial HTML response instead of the empty landing shell + home canonical.
//
// The browser still mounts the full app via createRoot(), which replaces this
// prerendered markup — there is no hydration, so no mismatch concerns. The
// prerendered HTML exists purely for crawlers and faster first paint.
//
// Route inventory + metadata live in src/entry-prerender.tsx (ROUTES). Auth pages
// (sign-in/sign-up) get route metadata + a noindex tag but no SSR body (Clerk is
// client-only). Each route's clean URL is wired to its file in artifact.toml.
//
// The absolute SEO URLs below use the production placeholder domain; seo.mjs runs
// afterwards and swaps it for the real published domain across every HTML file.
//
// This step is intentionally non-fatal: any failure logs a warning and exits 0 so
// a prerender problem can never break a production deploy (worst case the app
// falls back to the standard SPA shell).
import { build } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import fs from "node:fs";

const root = path.dirname(fileURLToPath(import.meta.url));
const basePath = process.env.BASE_PATH || "/";
const distDir = path.resolve(root, "dist/public");
const indexHtml = path.join(distDir, "index.html");
const ssrDir = path.resolve(root, "dist/ssr");
const ROOT_MARKER = '<div id="root"></div>';
const PLACEHOLDER = "https://loan-khatam.replit.app";

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Replace only the value inside known <head> tags. Values are escaped so they
// never contain a literal double quote, keeping the [^"]* captures safe.
function applyHead(html, route) {
  const url = `${PLACEHOLDER}${route.path}`;
  const title = esc(route.title);
  const desc = esc(route.description);
  const swaps = [
    [/<title>[^<]*<\/title>/, `<title>${title}</title>`],
    [/(<meta name="description" content=")[^"]*"/, `$1${desc}"`],
    [/(<link rel="canonical" href=")[^"]*"/, `$1${url}"`],
    [/(<meta property="og:title" content=")[^"]*"/, `$1${title}"`],
    [/(<meta property="og:description" content=")[^"]*"/, `$1${desc}"`],
    [/(<meta property="og:url" content=")[^"]*"/, `$1${url}"`],
    [/(<meta name="twitter:title" content=")[^"]*"/, `$1${title}"`],
    [/(<meta name="twitter:description" content=")[^"]*"/, `$1${desc}"`],
  ];
  let out = html;
  for (const [pattern, replacement] of swaps) out = out.replace(pattern, replacement);
  if (!route.indexable) {
    out = out.replace(/(<meta name="robots" content=")[^"]*"/, `$1noindex, follow"`);
  }
  return out;
}

async function main() {
  if (!fs.existsSync(indexHtml)) {
    console.warn(`[prerender] ${indexHtml} not found; skipping.`);
    return;
  }

  const template = fs.readFileSync(indexHtml, "utf8");
  if (!template.includes(ROOT_MARKER)) {
    console.warn(
      "[prerender] Could not find empty #root container; skipping injection.",
    );
    return;
  }

  // SSR-compile the prerender entry in isolation (configFile: false avoids the
  // app's vite.config which requires PORT and pulls in client-only plugins).
  await build({
    configFile: false,
    root,
    logLevel: "warn",
    resolve: {
      alias: {
        "@": path.resolve(root, "src"),
        "@assets": path.resolve(root, "..", "..", "attached_assets"),
      },
      dedupe: ["react", "react-dom"],
    },
    plugins: [react()],
    build: {
      ssr: path.resolve(root, "src/entry-prerender.tsx"),
      outDir: ssrDir,
      emptyOutDir: true,
      reportCompressedSize: false,
    },
  });

  const ssrPath = pathToFileURL(path.resolve(ssrDir, "entry-prerender.js")).href;
  const mod = await import(ssrPath);
  const { ROUTES, renderRoute } = mod;

  if (!Array.isArray(ROUTES) || ROUTES.length === 0) {
    console.warn("[prerender] No routes exported; skipping.");
    return;
  }

  for (const route of ROUTES) {
    try {
      let html = applyHead(template, route);
      if (route.component) {
        const body = renderRoute(route.path, basePath);
        if (body && body.trim().length > 0) {
          html = html.replace(ROOT_MARKER, `<div id="root">${body}</div>`);
        } else {
          console.warn(`[prerender] Empty render for ${route.path}; shell only.`);
        }
      }
      const destPath = path.join(distDir, route.file);
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      fs.writeFileSync(destPath, html);
      console.log(`[prerender] Wrote ${route.file} (${route.path})`);
    } catch (err) {
      console.warn(
        `[prerender] Route ${route.path} skipped (non-fatal):`,
        err?.message || err,
      );
    }
  }

  fs.rmSync(ssrDir, { recursive: true, force: true });
  console.log("[prerender] Done.");
}

main().catch((err) => {
  console.warn("[prerender] Skipped (non-fatal):", err?.message || err);
  // Exit 0 so a prerender failure never breaks the production build.
});
