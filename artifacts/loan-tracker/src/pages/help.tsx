import { Link } from "wouter";
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from "@/components/ui/accordion";
import {
  ArrowLeft, LifeBuoy, Mail, Bug, Lightbulb, ListChecks, HelpCircle,
} from "lucide-react";

const FAQS = [
  {
    q: "What is an EMI and how does Ledger calculate it?",
    a: "An EMI (Equated Monthly Instalment) is the fixed amount you pay each month towards a loan. Ledger calculates it from the principal, annual interest rate and tenure using the standard reducing-balance formula, then breaks every instalment down into its principal and interest components.",
  },
  {
    q: "How do prepayments affect my loan?",
    a: "A prepayment is any amount you pay above your scheduled EMI. Because it goes straight towards your principal, it reduces the balance on which future interest is charged. In Ledger you can model one-time or recurring prepayments and immediately see how much tenure and interest you would save.",
  },
  {
    q: "How do I add a new loan?",
    a: "Use the \"Add Loan\" button in the sidebar, or import a statement from the dashboard. Enter the borrower, principal, interest rate and dates — Ledger handles the rest and builds the full amortization schedule for you.",
  },
  {
    q: "Can I import a loan from a document?",
    a: "Yes. From the dashboard choose \"Import Data\" and upload an amortization PDF, screenshot, CSV or JSON file. Ledger reads the details and pre-fills the Add Loan form so you can review and confirm before saving.",
  },
  {
    q: "Is my financial data private?",
    a: "Your loan data is stored securely against your own authenticated account and is never sold or shared for marketing. You remain in control and can export or delete your data at any time. See our Privacy Policy and Data Usage Policy for full details.",
  },
  {
    q: "Which currency does Ledger use?",
    a: "Amounts are displayed in Indian Rupees (₹) using standard Indian number formatting. Ledger is a planning tool, so all figures are estimates intended for personal financial planning rather than official statements.",
  },
  {
    q: "What is the difference between the avalanche and snowball strategies?",
    a: "The avalanche method targets the loan with the highest interest rate first to minimise total interest paid, while the snowball method clears the smallest balance first for quicker psychological wins. Ledger lets you compare both side by side.",
  },
  {
    q: "Should I prepay my loan or invest the surplus?",
    a: "It depends on your loan's interest rate versus your expected investment return. Ledger's investment comparison shows transparent, side-by-side estimates, but the figures are illustrative only — please verify any financial decision independently.",
  },
];

const GUIDE = [
  "Set up your Financial Profile so planners can auto-fill your income, expenses and surplus.",
  "Add your loans manually, or import them from a statement on the dashboard.",
  "Open any loan to view its full amortization schedule and current balance.",
  "Use the Smart Strategy planner to compare payoff approaches and prepayment scenarios.",
  "Review the interest savings and closure timeline, then adjust the numbers to explore options.",
  "Record payments to keep your dashboard and progress up to date.",
];

export function HelpPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/settings"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Settings
      </Link>

      <header>
        <h1 className="flex items-center gap-3 text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 md:text-3xl">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/20">
            <LifeBuoy className="h-5 w-5 text-white" />
          </span>
          Help &amp; Support
        </h1>
        <p className="mt-2 max-w-2xl font-medium text-slate-500 dark:text-slate-400">
          Answers to common questions, a quick start guide, and ways to reach the
          team when you need a hand.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100">
          <HelpCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Frequently Asked Questions
        </h2>
        <Accordion type="single" collapsible className="mt-3">
          {FAQS.map((faq, i) => (
            <AccordionItem
              key={faq.q}
              value={`item-${i}`}
              className="border-slate-200 dark:border-slate-800"
            >
              <AccordionTrigger className="text-left font-semibold text-slate-800 hover:no-underline dark:text-slate-100">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <a
          href="mailto:support@loantracker.app"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
            <Mail className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Contact Support</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Have a question? Email our team and we'll be happy to help.
          </p>
        </a>

        <a
          href="mailto:support@loantracker.app?subject=Bug%20Report"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300">
            <Bug className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Report a Bug</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Spotted something off? Let us know what happened so we can fix it.
          </p>
        </a>

        <Link
          href="/settings#feedback"
          className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300">
            <Lightbulb className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Request a Feature</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Share an idea — your feedback shapes where Ledger goes next.
          </p>
        </Link>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100">
          <ListChecks className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          User Guide
        </h2>
        <ol className="mt-4 space-y-3">
          {GUIDE.map((step, i) => (
            <li key={step} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
                {i + 1}
              </span>
              <span className="pt-0.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {step}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
