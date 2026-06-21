// Build-time prerender entry. Renders the public marketing landing page to a
// static HTML string so the served `index.html` contains real, crawlable
// content (headings, copy, internal links) in the initial response instead of
// an empty SPA shell. This is loaded only by the prerender build step
// (prerender.mjs) and is never shipped to the browser.
//
// We deliberately render only the LandingPage subtree wrapped in the contexts
// it actually uses (ThemeProvider is SSR-safe via typeof-window guards; wouter
// Router supplies link context). The full <App /> is NOT rendered here because
// it reads window.location at module load and gates content behind Clerk's
// <Show>, which resolves only on the client.
import { renderToString } from "react-dom/server";
import { Router as WouterRouter } from "wouter";
import { ThemeProvider } from "@/lib/theme";
import { LandingPage } from "@/pages/landing";

export function render(basePath: string): string {
  const base = (basePath || "/").replace(/\/$/, "");
  return renderToString(
    <ThemeProvider>
      <WouterRouter base={base} ssrPath="/">
        <LandingPage />
      </WouterRouter>
    </ThemeProvider>,
  );
}
