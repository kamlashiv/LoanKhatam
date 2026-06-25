// Entry point for Hostinger Node.js Web App deployment
// This starts the compiled api-server which serves both the API and the static frontend.
import("./artifacts/api-server/dist/index.mjs").catch(err => {
  console.error("Failed to start api-server:", err);
  process.exit(1);
});
