import { Link } from "wouter";
import { ArrowLeft, ScrollText, AlertTriangle } from "lucide-react";

export function LicensePage() {
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
            <ScrollText className="h-5 w-5 text-white" />
          </span>
          License
        </h1>
        <p className="mt-2 max-w-2xl font-medium text-slate-500 dark:text-slate-400">
          The terms under which Loan Tracker — Ledger is made available to you.
        </p>
      </header>

      <section
        className="rounded-2xl border border-amber-300 bg-amber-50 p-6 shadow-sm dark:border-amber-800 dark:bg-amber-950/30"
        aria-label="Important notice"
      >
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
          <AlertTriangle className="h-5 w-5" />
          <h2 className="text-lg font-extrabold tracking-tight">IMPORTANT NOTICE</h2>
        </div>
        <div className="mt-3 space-y-2 text-sm font-semibold leading-relaxed text-amber-900 dark:text-amber-200">
          <p>
            This software is NOT licensed by any bank, NBFC, RBI, financial
            institution, or government authority.
          </p>
          <p>
            This software is intended solely for personal financial planning,
            educational use, and loan analysis.
          </p>
          <p>
            This application should not be interpreted as financial, investment,
            legal, tax, or lending advice.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Grant of License
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Subject to your acceptance of these terms, you are granted a personal,
          non-exclusive, non-transferable and revocable license to access and use Loan
          Tracker — Ledger for your own lawful, personal financial planning and
          educational purposes. This license does not transfer any ownership of the
          software or its underlying intellectual property to you.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Permitted Use
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          <li>Tracking and analysing your own loans for personal planning.</li>
          <li>Modelling EMIs, prepayments, payoff strategies and closure timelines.</li>
          <li>Exporting your own data for personal record-keeping.</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Restrictions
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          <li>
            You may not present the application or its output as official financial,
            lending or regulatory advice.
          </li>
          <li>
            You may not resell, sublicense, or commercially redistribute the software
            without written permission.
          </li>
          <li>
            You may not reverse engineer, tamper with, or attempt to bypass the
            security of the application.
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Warranty &amp; Liability
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          The software is provided "as is", without warranties of any kind, express or
          implied. All calculations are estimates and are intended only for educational
          and personal financial planning purposes, and users should verify all
          financial decisions independently. To the maximum extent permitted by law,
          the developers shall not be liable for any damages arising from the use of,
          or inability to use, the application.
        </p>
      </section>
    </div>
  );
}
