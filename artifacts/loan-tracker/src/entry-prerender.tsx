// Build-time prerender entry. Renders each public route to a static HTML string
// so the served HTML for every crawlable public URL contains real, route-specific
// content (headings, copy, internal links) plus its own <head> metadata in the
// initial response — instead of every URL returning the empty landing shell with
// the home canonical. This module is loaded only by the prerender build step
// (prerender.mjs) and is never shipped to the browser.
//
// We deliberately render only each page's subtree wrapped in the contexts it
// actually uses (ThemeProvider is SSR-safe via typeof-window guards; wouter
// Router supplies link context). The full <App /> is NOT rendered here because it
// reads window.location at module load and gates content behind Clerk's <Show>,
// which resolves only on the client.
import type { ComponentType } from "react";
import { renderToString } from "react-dom/server";
import { Router as WouterRouter } from "wouter";
import { ThemeProvider } from "@/lib/theme";
import { LandingPage } from "@/pages/landing";
import { AboutPage } from "@/pages/about";
import { HelpPage } from "@/pages/help";
import { PrivacyPolicyPage } from "@/pages/privacy-policy";
import { TermsPage } from "@/pages/terms";
import { DisclaimerPage } from "@/pages/disclaimer";
import { CookiePolicyPage } from "@/pages/cookie-policy";
import { DataUsagePage } from "@/pages/data-usage";
import { LicensePage } from "@/pages/license";
import { ToolsPage } from "@/pages/tools";
import { EmiCalculatorPage } from "@/pages/emi-calculator";
import { LoanCalculatorPage } from "@/pages/loan-calculator";
import { AiAssistantPage } from "@/pages/ai-assistant";
import { LoanClosureChecklistPage } from "@/pages/loan-closure-checklist";
import { BlogsPage } from "@/pages/blogs";

const DESC =
  "Loan Khatam is a free personal loan and udhaar tracker — record money you lend to friends and family, track repayments and EMIs, and watch outstanding balances settle. Amounts shown in ₹.";

export interface RouteMeta {
  /** Router path (also the canonical URL path). */
  path: string;
  /** Output filename inside dist/public. */
  file: string;
  /** <title> and og/twitter title. */
  title: string;
  /** meta description and og/twitter description. */
  description: string;
  /** When false, the route gets a `noindex, follow` robots tag. */
  indexable: boolean;
  /** Component to SSR into #root; null leaves the empty SPA shell (auth pages). */
  component: ComponentType | null;
}

// Single source of truth for the public, crawlable surface. Keep this list in
// sync with public/sitemap.xml and public/llms.txt (indexable routes only).
export const ROUTES: RouteMeta[] = [
  {
    path: "/",
    file: "index.html",
    title: "Loan Khatam — Personal Loan & Udhaar Tracker",
    description: DESC,
    indexable: true,
    component: LandingPage,
  },
  {
    path: "/about",
    file: "about.html",
    title: "About — Loan Khatam",
    description:
      "Learn about Loan Khatam, a free educational tool to track personal loans and udhaar, calculate EMIs, compare payoff strategies, model prepayments, and plan loan closure. Amounts in ₹.",
    indexable: true,
    component: AboutPage,
  },
  {
    path: "/help",
    file: "help.html",
    title: "Help & Support — Loan Khatam",
    description:
      "Answers to common Loan Khatam questions — how EMIs are calculated, how prepayments work, importing loans, data privacy, and the avalanche vs snowball payoff strategies.",
    indexable: true,
    component: HelpPage,
  },
  {
    path: "/privacy-policy",
    file: "privacy-policy.html",
    title: "Privacy Policy — Loan Khatam",
    description:
      "How Loan Khatam collects, uses and protects your information. We collect only what is needed to power the planner and never sell your personal data.",
    indexable: true,
    component: PrivacyPolicyPage,
  },
  {
    path: "/terms",
    file: "terms.html",
    title: "Terms & Conditions — Loan Khatam",
    description:
      "The terms that govern your use of Loan Khatam, an educational personal loan and udhaar planning tool.",
    indexable: true,
    component: TermsPage,
  },
  {
    path: "/disclaimer",
    file: "disclaimer.html",
    title: "Disclaimer — Loan Khatam",
    description:
      "Loan Khatam is an educational and personal financial planning tool. It is not a bank, lender, or financial advisor, and all calculations are estimates to verify independently.",
    indexable: true,
    component: DisclaimerPage,
  },
  {
    path: "/cookie-policy",
    file: "cookie-policy.html",
    title: "Cookie Policy — Loan Khatam",
    description:
      "How and why Loan Khatam uses cookies and similar technologies to keep you signed in and the application running reliably.",
    indexable: true,
    component: CookiePolicyPage,
  },
  {
    path: "/data-usage",
    file: "data-usage.html",
    title: "Data Usage Policy — Loan Khatam",
    description:
      "A clear explanation of what data Loan Khatam stores, how it is used, and how you can export or delete your information at any time.",
    indexable: true,
    component: DataUsagePage,
  },
  {
    path: "/license",
    file: "license.html",
    title: "License — Loan Khatam",
    description:
      "The terms under which Loan Khatam is made available to you, including usage limitations for this educational planning tool.",
    indexable: true,
    component: LicensePage,
  },
  {
    path: "/tools",
    file: "tools.html",
    title: "Financial Planning Tools — Loan Khatam",
    description: "Free online calculators for personal loans and debt tracking. Try our EMI Calculator, Loan Prepayment Saver, and AI Assistant.",
    indexable: true,
    component: ToolsPage,
  },
  {
    path: "/tools/emi-calculator",
    file: "emi-calculator.html",
    title: "EMI Calculator — Loan Khatam",
    description: "Calculate equated monthly instalments (EMIs), see total interest outgo, and export your monthly amortization schedule.",
    indexable: true,
    component: EmiCalculatorPage,
  },
  {
    path: "/tools/sbi-emi-calculator",
    file: "sbi-emi-calculator.html",
    title: "SBI Loan EMI Calculator — Loan Khatam",
    description: "Calculate your State Bank of India (SBI) loan monthly payments, interest rates, and amortization schedule online.",
    indexable: true,
    component: EmiCalculatorPage,
  },
  {
    path: "/tools/hdfc-emi-calculator",
    file: "hdfc-emi-calculator.html",
    title: "HDFC Bank Loan EMI Calculator — Loan Khatam",
    description: "Calculate your HDFC Bank monthly EMI instalments, interest components, and check repayment plans online.",
    indexable: true,
    component: EmiCalculatorPage,
  },
  {
    path: "/tools/icici-emi-calculator",
    file: "icici-emi-calculator.html",
    title: "ICICI Bank Loan EMI Calculator — Loan Khatam",
    description: "Estimate your ICICI Bank home, car, or personal loan instalments and check total interest payable.",
    indexable: true,
    component: EmiCalculatorPage,
  },
  {
    path: "/tools/home-loan-emi-calculator",
    file: "home-loan-emi-calculator.html",
    title: "Home Loan EMI Calculator — Loan Khatam",
    description: "Plan your house purchase with our interactive housing loan EMI calculator. Calculate interest and monthly payments.",
    indexable: true,
    component: EmiCalculatorPage,
  },
  {
    path: "/tools/car-loan-emi-calculator",
    file: "car-loan-emi-calculator.html",
    title: "Car Loan EMI Calculator — Loan Khatam",
    description: "Calculate monthly payments for your new vehicle. Interactive sliders for auto loan EMI calculations.",
    indexable: true,
    component: EmiCalculatorPage,
  },
  {
    path: "/tools/personal-loan-emi-calculator",
    file: "personal-loan-emi-calculator.html",
    title: "Personal Loan EMI Calculator — Loan Khatam",
    description: "Calculate monthly instalments for unsecured personal loans. See total interest outgo easily.",
    indexable: true,
    component: EmiCalculatorPage,
  },
  {
    path: "/tools/loan-calculator",
    file: "loan-calculator.html",
    title: "Loan Prepayment & Payoff Saver — Loan Khatam",
    description: "Compare your payoff plan with extra payments. Estimate how much interest and months you will save by prepaying your loan.",
    indexable: true,
    component: LoanCalculatorPage,
  },
  {
    path: "/tools/ai-assistant",
    file: "ai-assistant.html",
    title: "AI Financial Guide & Assistant — Loan Khatam",
    description: "Talk to our virtual helper to understand the snowball vs avalanche methods and get custom debt-free advice.",
    indexable: true,
    component: AiAssistantPage,
  },
  {
    path: "/tools/loan-closure-checklist",
    file: "loan-closure-checklist.html",
    title: "Loan Closure Document Checklist & NOC Guide — Loan Khatam",
    description: "An interactive checklist of documents to collect when closing a home, car, or personal loan. Verify NOC, CIBIL updates, and hypothecation removal.",
    indexable: true,
    component: LoanClosureChecklistPage,
  },
  {
    path: "/blogs",
    file: "blogs.html",
    title: "Educational Blogs & Financial Guides — Loan Khatam",
    description: "Read expert articles on debt management, loan prepayment strategies, and understanding EMI calculation cycles.",
    indexable: true,
    component: BlogsPage,
  },
  {
    path: "/blogs/5-ways-to-pay-off-loans-faster",
    file: "blogs/5-ways-to-pay-off-loans-faster.html",
    title: "5 Smart Ways to Pay Off Your Personal Loan Faster — Loan Khatam",
    description: "Tired of monthly EMIs? Here are 5 practical, mathematical strategies to prepay and close your personal loans early.",
    indexable: true,
    component: BlogsPage,
  },
  {
    path: "/blogs/snowball-vs-avalanche-debt-payoff",
    file: "blogs/snowball-vs-avalanche-debt-payoff.html",
    title: "Snowball vs. Avalanche: Which Debt Payoff Strategy is Best? — Loan Khatam",
    description: "Compare the two most popular debt payoff strategies: the behavior-focused Debt Snowball and the interest-minimizing Debt Avalanche.",
    indexable: true,
    component: BlogsPage,
  },
  {
    path: "/blogs/understanding-emi-calculations",
    file: "blogs/understanding-emi-calculations.html",
    title: "Understanding EMI: How Your Monthly Loan Payment is Calculated — Loan Khatam",
    description: "Demystifying Equated Monthly Instalments (EMIs). Learn the math behind your payments and how interest vs principal changes over time.",
    indexable: true,
    component: BlogsPage,
  },
  // Auth utility pages: route-specific metadata + noindex, no SSR body (Clerk
  // renders client-side). Intentionally excluded from sitemap.xml and llms.txt.
  {
    path: "/sign-in",
    file: "sign-in.html",
    title: "Sign In — Loan Khatam",
    description: "Sign in to your Loan Khatam account to manage your loans and repayments.",
    indexable: false,
    component: null,
  },
  {
    path: "/sign-up",
    file: "sign-up.html",
    title: "Sign Up — Loan Khatam",
    description: "Create a free Loan Khatam account to start tracking loans, udhaar, and EMIs.",
    indexable: false,
    component: null,
  },
];

export function renderRoute(routePath: string, basePath: string): string {
  const route = ROUTES.find((r) => r.path === routePath);
  if (!route || !route.component) return "";
  const Component = route.component;
  const base = (basePath || "/").replace(/\/$/, "");
  return renderToString(
    <ThemeProvider>
      <WouterRouter base={base} ssrPath={routePath}>
        <Component />
      </WouterRouter>
    </ThemeProvider>,
  );
}
