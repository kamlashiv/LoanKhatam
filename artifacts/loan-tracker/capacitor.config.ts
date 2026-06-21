import type { CapacitorConfig } from "@capacitor/cli";

// ⚠️ IMPORTANT: Replace `APP_URL` below with your PUBLISHED app URL.
// After you click "Publish" in Replit, you get a stable URL like
// https://your-app.replit.app — paste it here so the mobile app loads
// your live site (with working data + Clerk login).
//
// The value below is your current DEVELOPMENT URL. It only works while
// this Replit workspace is running, so it's fine for a quick test but
// you MUST swap it to your .replit.app URL before sharing the APK.
const APP_URL =
  "https://565b9a5a-8ca2-48b1-b4f6-f2d8372690be-00-3izdei6vqa6uj.sisko.replit.dev";

const config: CapacitorConfig = {
  appId: "app.replit.ledger",
  appName: "Ledger",
  webDir: "dist/public",
  server: {
    url: APP_URL,
    cleartext: false,
  },
};

export default config;
