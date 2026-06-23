import { Link } from "wouter";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export function PrivacyPolicyPage() {
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
            <ShieldCheck className="h-5 w-5 text-white" />
          </span>
          Privacy Policy
        </h1>
        <p className="mt-2 max-w-2xl font-medium text-slate-500 dark:text-slate-400">
          How Loan Tracker — Loan Khatam collects, uses and protects your information.
          Last updated June 2026.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Overview</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Your privacy matters to us. This policy explains what information Loan Tracker
          — Loan Khatam collects when you use the application, why we collect it, and the
          choices you have. We collect only what is needed to provide the planning
          features you use, and we never sell your personal data.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Information We Collect
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          <li>
            <span className="font-semibold text-slate-700 dark:text-slate-200">Account information</span>{" "}
            such as your name and email address, managed through our third-party
            authentication provider.
          </li>
          <li>
            <span className="font-semibold text-slate-700 dark:text-slate-200">Loan and financial data</span>{" "}
            you enter or import, including principal amounts, interest rates, dates and
            payment records used to power your planners.
          </li>
          <li>
            <span className="font-semibold text-slate-700 dark:text-slate-200">Limited technical data</span>{" "}
            needed to keep your session secure and the application running reliably.
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          How We Use Your Information
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          We use your information solely to provide and improve the application: to
          authenticate you, store your loans securely against your account, generate
          the calculations and projections you request, and respond to support
          enquiries. We do not use your financial data for advertising, and we do not
          sell or rent your personal data to anyone.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Data Storage &amp; Security
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Your data is stored securely and is scoped to your individual authenticated
          user account, so each user can only access their own information.
          Authentication is handled by a trusted third-party provider, which means we
          do not store your password. We apply reasonable technical and organisational
          measures to protect your data, although no method of transmission or storage
          can be guaranteed to be completely secure.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Your Rights &amp; Choices
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          You remain in control of your information. You can view and update your data
          at any time, export it for your own records, and permanently delete your data
          or your entire account. If you would like help exercising these rights, you
          can contact us at{" "}
          <a
            href="mailto:support@loantracker.app"
            className="font-semibold text-indigo-600 hover:underline dark:text-indigo-300"
          >
            support@loantracker.app
          </a>
          .
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Changes to This Policy
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          We may update this Privacy Policy from time to time to reflect changes to the
          application or legal requirements. When we do, we will revise the "last
          updated" date above, and significant changes will be communicated within the
          application.
        </p>
      </section>
    </div>
  );
}
