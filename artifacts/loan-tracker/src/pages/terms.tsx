import { Link } from "wouter";
import { ArrowLeft, FileText, AlertTriangle } from "lucide-react";

export function TermsPage() {
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
            <FileText className="h-5 w-5 text-white" />
          </span>
          Terms &amp; Conditions
        </h1>
        <p className="mt-2 max-w-2xl font-medium text-slate-500 dark:text-slate-400">
          The terms that govern your use of Loan Tracker — Ledger. Last updated June
          2026.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Acceptance of Terms
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          By accessing or using Loan Tracker — Ledger, you agree to be bound by these
          Terms &amp; Conditions. If you do not agree with any part of these terms,
          please do not use the application. We may update these terms from time to
          time, and your continued use after changes constitutes acceptance of the
          revised terms.
        </p>
      </section>

      <section className="rounded-2xl border border-amber-300 bg-amber-50 p-6 shadow-sm dark:border-amber-800 dark:bg-amber-950/30">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
          <AlertTriangle className="h-5 w-5" />
          <h2 className="text-lg font-bold">Nature of the Service</h2>
        </div>
        <ul className="mt-3 space-y-2 text-sm font-semibold leading-relaxed text-amber-900 dark:text-amber-200">
          <li>
            This application is not a bank, NBFC, loan provider, financial institution,
            government agency, or licensed financial advisor.
          </li>
          <li>
            This application does not provide loans, approve loans, collect repayments,
            or offer financial advice.
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Your Account
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Access to the application requires an account created through our third-party
          authentication provider. You are responsible for maintaining the security of
          your login credentials and for all activity that occurs under your account.
          Please notify us promptly of any unauthorised use.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Acceptable Use
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          <li>Use the application only for lawful, personal financial planning purposes.</li>
          <li>Do not attempt to disrupt, reverse engineer or compromise the service.</li>
          <li>Do not misrepresent the application's output as professional advice.</li>
          <li>Provide accurate information so your planning results are meaningful to you.</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Estimates &amp; No Advice
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          All calculations are estimates and are intended only for educational and
          personal financial planning purposes. The application does not provide
          financial, investment, legal or tax advice, and users should verify all
          financial decisions independently before acting on them.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Limitation of Liability
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          The application is provided "as is" without warranties of any kind. To the
          maximum extent permitted by law, the developers shall not be liable for any
          direct, indirect or consequential loss arising from your use of, or reliance
          on, the application or its estimates.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Termination &amp; Contact
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          You may stop using the application and delete your account at any time. We may
          suspend or terminate access where these terms are breached. For any questions
          about these terms, contact us at{" "}
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
