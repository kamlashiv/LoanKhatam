import { Link } from "wouter";
import { ArrowLeft, Database, Download, Trash2, Lock } from "lucide-react";

export function DataUsagePage() {
  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <header>
        <h1 className="flex items-center gap-3 text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 md:text-3xl">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/20">
            <Database className="h-5 w-5 text-white" />
          </span>
          Data Usage Policy
        </h1>
        <p className="mt-2 max-w-2xl font-medium text-slate-500 dark:text-slate-400">
          A clear explanation of what data Loan Tracker — Loan Khatam stores and how it is
          used. Last updated June 2026.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          What Data We Store
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Loan Khatam stores the loan and financial planning information you choose to add —
          such as loan principals, interest rates, tenures, payment records and your
          financial profile — together with the basic account details needed to sign
          you in. All of this data is stored securely and is tied to your individual
          authenticated user account.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100">
          <Lock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          How Your Data Is Protected
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          <li>Data is scoped per user account, so you only ever see your own information.</li>
          <li>Authentication is handled by a trusted third-party provider — we never store your password.</li>
          <li>Reasonable technical and organisational safeguards protect data in storage and transit.</li>
          <li>We do not sell, rent or share your personal data for marketing purposes.</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          How We Use Your Data
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Your data is used only to deliver the features you ask for: storing your
          loans, generating EMI schedules and projections, comparing payoff strategies,
          and keeping your dashboard current. Calculations are performed to support your
          personal financial planning and are not used for advertising or sold to third
          parties.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
            <Download className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Export Your Data</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            You can export your loan and planning data at any time to keep a copy for
            your own records.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300">
            <Trash2 className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-100">Delete Your Data</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            You can permanently delete individual records, or your entire account and
            its data, whenever you choose.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Data Retention
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          We retain your data only for as long as your account remains active or as
          needed to provide the service. When you delete your data or close your
          account, the associated information is removed from active systems. For any
          questions about how your data is handled, contact us at{" "}
          <a
            href="mailto:support@loantracker.app"
            className="font-semibold text-indigo-600 hover:underline dark:text-indigo-300"
          >
            support@loantracker.app
          </a>
          .
        </p>
      </section>
    </div>
  );
}
