import type { CapacitorConfig } from "@capacitor/cli";

// ┌──────────────────────────────────────────────────────────────────────┐
// │  STEP 1 — PASTE YOUR PUBLISHED URL HERE                                 │
// │                                                                        │
// │  After you click "Publish" in Replit you get a stable HTTPS URL that   │
// │  looks like:  https://your-app-name.replit.app                         │
// │                                                                        │
// │  Paste that exact URL below (no trailing slash). The Android app is a  │
// │  thin wrapper that loads this live site, so backend data + Clerk login │
// │  work exactly like they do on the web.                                 │
// │                                                                        │
// │  You can also set it without editing this file by exporting            │
// │  PUBLISHED_APP_URL before running `npx cap sync android`.               │
// └──────────────────────────────────────────────────────────────────────┘
const PUBLISHED_APP_URL = "https://REPLACE-ME.replit.app";

const APP_URL = process.env.PUBLISHED_APP_URL ?? PUBLISHED_APP_URL;

const config: CapacitorConfig = {
  appId: "app.replit.ledger",
  appName: "Loan Khatam",
  webDir: "dist/public",
  server: {
    // The app loads your live published site over HTTPS.
    url: APP_URL,
    cleartext: false,
    // Shown when the live site can't be reached (no internet, server down).
    // This is a static page bundled into the app (dist/public/offline.html);
    // Capacitor serves it locally under the live site's origin, so its Retry
    // button can simply navigate to "/" to re-attempt loading the live app.
    errorPath: "offline.html",
  },
};

export default config;
