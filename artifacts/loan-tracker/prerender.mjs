// Post-build prerender step. After `vite build` produces the static SPA, this
// script SSR-compiles the landing subtree and injects its real HTML into the
// built index.html's #root container, so the public `/` route returns crawlable
// marketing content in its initial HTML response instead of an empty shell.
//
// The browser still mounts the full app via createRoot(), which replaces this
// prerendered markup — there is no hydration, so no mismatch concerns. The
// prerendered HTML exists purely for crawlers and faster first paint.
//
// This step is intentionally non-fatal: any failure logs a warning and exits 0
// so a prerender problem can never break a production deploy (worst case the
// app falls back to the standard SPA shell).
import { build } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const root = path.dirname(fileURLToPath(import.meta.url));
const basePath = process.env.BASE_PATH || "/";
const outHtml = path.resolve(root, "dist/public/index.html");
const ssrDir = path.resolve(root, "dist/ssr");
const ROOT_MARKER = '<div id="root"></div>';

async function main() {
  if (!fs.existsSync(outHtml)) {
    console.warn(`[prerender] ${outHtml} not found; skipping.`);
    return;
  }

  let html = fs.readFileSync(outHtml, "utf8");
  if (!html.includes(ROOT_MARKER)) {
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

  const mod = await import(path.resolve(ssrDir, "entry-prerender.js"));
  const appHtml = mod.render(basePath);

  if (!appHtml || appHtml.trim().length === 0) {
    console.warn("[prerender] Empty render output; skipping injection.");
    return;
  }

  html = html.replace(ROOT_MARKER, `<div id="root">${appHtml}</div>`);
  fs.writeFileSync(outHtml, html);
  fs.rmSync(ssrDir, { recursive: true, force: true });
  console.log("[prerender] Injected landing HTML into dist/public/index.html");
}

main().catch((err) => {
  console.warn("[prerender] Skipped (non-fatal):", err?.message || err);
  // Exit 0 so a prerender failure never breaks the production build.
});
