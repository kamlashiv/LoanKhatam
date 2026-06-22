import { Link } from "wouter";
import { ArrowLeft, Cookie } from "lucide-react";

export function CookiePolicyPage() {
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
            <Cookie className="h-5 w-5 text-white" />
          </span>
          Cookie Policy
        </h1>
        <p className="mt-2 max-w-2xl font-medium text-slate-500 dark:text-slate-400">
          How and why Loan Tracker — Loan Khatam uses cookies and similar technologies.
          Last updated June 2026.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          What Are Cookies?
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Cookies are small text files stored on your device by your browser. They help
          applications remember information about your visit, such as keeping you signed
          in. Similar technologies like local storage may also be used to keep the
          application working smoothly.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          How We Use Cookies
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Loan Tracker — Loan Khatam uses cookies only for essential session and
          authentication purposes. They allow us to keep you securely signed in as you
          move between pages and to protect your account. We do not use cookies for
          advertising, cross-site tracking, or selling your data.
        </p>
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60">
              <tr className="text-slate-700 dark:text-slate-200">
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-500 dark:text-slate-400">
              <tr>
                <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">
                  Authentication
                </td>
                <td className="px-4 py-3">
                  Keeps you securely signed in via our third-party authentication
                  provider.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">
                  Session
                </td>
                <td className="px-4 py-3">
                  Maintains your session state so the application functions correctly.
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">
                  Preferences
                </td>
                <td className="px-4 py-3">
                  Remembers basic choices such as your light or dark theme.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Third-Party Cookies
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Authentication is handled by a trusted third-party provider, which may set its
          own cookies strictly to sign you in and keep your account secure. These are
          used only for authentication and are governed by that provider's own privacy
          and cookie policies.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Managing Cookies
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          You can control or delete cookies through your browser settings. Please note
          that because the cookies we use are essential for signing in and securing your
          session, disabling them may prevent the application from working correctly. If
          you have questions, contact us at{" "}
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
