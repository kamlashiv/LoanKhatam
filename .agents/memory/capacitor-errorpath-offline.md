---
name: Capacitor errorPath offline screen
description: How the Android WebView offline fallback works when using server.url to a remote site.
---

# Capacitor offline fallback with `server.url`

The loan-tracker Android app is a thin Capacitor WebView that loads the live
published site via `server.url`. A branded offline screen is wired through
`server.errorPath: "offline.html"` (a static page in `public/`, bundled to
`dist/public` then synced to `android/.../assets/public/`).

**Why the Retry button just navigates to `/` (no URL templating needed):**
When `server.url` is a remote URL, Capacitor Android sets the WebView's local
origin (`localUrl`) to the **remote** protocol+authority. On a main-frame load
error, `BridgeWebViewClient` loads `getErrorUrl()` = `<remoteOrigin>/offline.html`.
`WebViewLocalServer.shouldInterceptRequest` special-cases `isErrorUrl(...)` and
serves it from **bundled assets** even though the origin is the remote host.
So the offline page runs under `https://<remote>/`, and `location.replace("/")`
re-attempts a real network load of the live app. Online requests are unaffected
(only the exact errorUrl is served locally; everything else proxies to network).

**How to apply:** Keep the offline page fully self-contained (inline CSS/SVG —
no external requests, since the device is offline). Don't hardcode the published
URL into it. After editing, rebuild (`BASE_PATH=/ PORT=5000 pnpm build`) and
`npx cap sync android` so both the asset and `capacitor.config.json` update.
Verified against @capacitor/android v8.
