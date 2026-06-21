import { Link } from "wouter";
import { ArrowLeft, ShieldAlert, AlertTriangle } from "lucide-react";

const DISCLAIMERS = [
  "This application is not a bank, NBFC, loan provider, financial institution, government agency, or licensed financial advisor.",
  "This application does not provide loans, approve loans, collect repayments, or offer financial advice.",
  "All calculations are estimates and are intended only for educational and personal financial planning purposes.",
  "Users should verify all financial decisions independently.",
];

export function DisclaimerPage() {
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
            <ShieldAlert className="h-5 w-5 text-white" />
          </span>
          Disclaimer
        </h1>
        <p className="mt-2 max-w-2xl font-medium text-slate-500 dark:text-slate-400">
          Please read the following carefully before relying on any information in
          this application.
        </p>
      </header>

      <section className="rounded-2xl border border-amber-300 bg-amber-50 p-6 shadow-sm dark:border-amber-800 dark:bg-amber-950/30">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
          <AlertTriangle className="h-5 w-5" />
          <h2 className="text-lg font-bold">Important Disclaimers</h2>
        </div>
        <ul className="mt-4 space-y-3">
          {DISCLAIMERS.map((d) => (
            <li
              key={d}
              className="flex gap-3 rounded-xl border border-amber-200 bg-white/60 p-4 text-sm font-semibold leading-relaxed text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>{d}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          No Professional Advice
        </h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          <p>
            Loan Tracker — Ledger is a self-service educational and planning tool. The
            content, calculators and projections it provides are general in nature and
            do not take into account your specific circumstances, objectives or needs.
            Nothing in this application constitutes financial, investment, legal, tax
            or lending advice.
          </p>
          <p>
            Before making any financial decision you should consider seeking advice
            from a qualified and licensed professional who can assess your individual
            situation.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Accuracy of Estimates
        </h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          <p>
            All figures, schedules and projections are estimates generated from the
            information you provide and from assumptions you can control, such as
            interest rates and expected returns. Real-world outcomes may differ due to
            changes in rates, fees, payment timing, rounding, and the specific terms of
            your actual loan agreements.
          </p>
          <p>
            You should always refer to your official statements and lender
            documentation for authoritative figures, and verify all financial decisions
            independently.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Limitation of Liability
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          To the maximum extent permitted by law, the developers of this application
          accept no responsibility for any loss or damage arising from reliance on the
          estimates, projections or information presented here. You use the application
          at your own discretion and risk.
        </p>
      </section>
    </div>
  );
}
