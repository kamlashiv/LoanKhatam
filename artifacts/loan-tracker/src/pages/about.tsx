import { Link } from "wouter";
import {
  ArrowLeft, Info, Wallet, Target, TrendingUp, PiggyBank, Scale,
  CalendarClock, Mail, Globe, Tag, CalendarDays, Users, BookOpen,
} from "lucide-react";

const META = [
  { icon: Wallet, label: "App Name", value: "Loan Khatam" },
  { icon: Tag, label: "Version", value: "1.0.0" },
  { icon: CalendarDays, label: "Release Date", value: "June 2026" },
  { icon: Users, label: "Developer", value: "Loan Tracker Team" },
];

const HOW_IT_WORKS = [
  {
    icon: Wallet,
    title: "EMI Calculation",
    text: "Enter a loan's principal, interest rate and tenure and Loan Khatam computes the equated monthly instalment along with a full amortization schedule of principal and interest for every month.",
  },
  {
    icon: Target,
    title: "Payoff Strategies",
    text: "Compare repayment approaches such as the avalanche (highest interest first) and snowball (smallest balance first) methods to see which clears your debt faster or cheaper.",
  },
  {
    icon: PiggyBank,
    title: "Prepayments",
    text: "Model one-time or recurring extra payments to visualise how they shorten your tenure and reduce the total interest you pay over the life of a loan.",
  },
  {
    icon: TrendingUp,
    title: "Interest Savings",
    text: "Instantly see the interest you could avoid by paying more than the minimum, helping you weigh the trade-off between faster freedom and monthly cash flow.",
  },
  {
    icon: Scale,
    title: "Investment Comparison",
    text: "Explore whether a surplus is better used to prepay a loan or to invest, using transparent, side-by-side estimates based on assumed returns you control.",
  },
  {
    icon: CalendarClock,
    title: "Loan Closure Planning",
    text: "Set a target closure date or budget and Loan Khatam maps out a clear, month-by-month plan so you always know where you stand on the road to being debt-free.",
  },
];

export function AboutPage() {
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
            <Info className="h-5 w-5 text-white" />
          </span>
          About Loan Tracker
        </h1>
        <p className="mt-2 max-w-2xl font-medium text-slate-500 dark:text-slate-400">
          A calm, private workspace for understanding your loans and planning your
          journey to becoming debt-free.
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          Application Details
        </h2>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {META.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  {label}
                </dt>
                <dd className="truncate font-bold text-slate-800 dark:text-slate-100">
                  {value}
                </dd>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
              <Globe className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Website
              </dt>
              <dd className="truncate font-bold text-slate-800 dark:text-slate-100">
                This application
              </dd>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
              <Mail className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Support
              </dt>
              <dd className="truncate font-bold">
                <a
                  href="mailto:support@loantracker.app"
                  className="text-indigo-600 hover:underline dark:text-indigo-300"
                >
                  support@loantracker.app
                </a>
              </dd>
            </div>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100">
          <BookOpen className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Purpose of Application
        </h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          <p>
            Loan Khatam exists to give individuals a clear, jargon-free
            picture of their borrowing. Loan statements are often dense and hard to
            reason about, which makes it difficult to know whether you are on track,
            how much interest you are really paying, or what a small change to your
            payments would actually achieve.
          </p>
          <p>
            Loan Khatam turns those numbers into something you can explore and understand.
            It is built purely as an{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              educational and personal financial planning
            </span>{" "}
            tool — a private sandbox for asking "what if" questions about your own
            loans. It does not lend money, process payments, or replace professional
            advice; it simply helps you make more informed decisions with confidence.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          How it works
        </h2>
        <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
          Every feature is designed for educational and personal financial planning
          only.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          {HOW_IT_WORKS.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-xl border border-slate-100 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/40"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
