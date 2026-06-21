import {
  Wallet,
  Plus,
  Mail,
  Smartphone,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Building2,
  CreditCard,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Lock,
  ChevronRight,
} from "lucide-react";

const font = "'Plus Jakarta Sans', sans-serif";

const inr = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

const banks = [
  { name: "HDFC Bank", short: "HDFC", color: "#004C8F", detected: true },
  { name: "ICICI Bank", short: "ICICI", color: "#AE282E", detected: true },
  { name: "State Bank of India", short: "SBI", color: "#22409A", detected: true },
  { name: "Axis Bank", short: "Axis", color: "#97144D", detected: false },
];

const cards = [
  {
    bank: "HDFC Bank",
    name: "Millennia Credit Card",
    last4: "4821",
    network: "VISA",
    balance: 38450,
    limit: 150000,
    due: "18/07/2026",
    gradient: "linear-gradient(135deg, #1e3a8a 0%, #4f46e5 100%)",
  },
  {
    bank: "ICICI Bank",
    name: "Amazon Pay Card",
    last4: "7390",
    network: "VISA",
    balance: 12100,
    limit: 90000,
    due: "05/07/2026",
    gradient: "linear-gradient(135deg, #7c2d12 0%, #b45309 100%)",
  },
  {
    bank: "SBI Card",
    name: "SimplyCLICK Card",
    last4: "1567",
    network: "MasterCard",
    balance: 5400,
    limit: 60000,
    due: "27/07/2026",
    gradient: "linear-gradient(135deg, #111827 0%, #374151 100%)",
  },
];

const importedLoans = [
  {
    lender: "Bajaj Finserv",
    type: "Personal Loan",
    amount: 250000,
    emi: 8420,
    source: "Gmail",
    confidence: 96,
  },
  {
    lender: "HDFC Bank",
    type: "Car Loan",
    amount: 620000,
    emi: 11150,
    source: "SMS",
    confidence: 91,
  },
];

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-extrabold text-slate-900">{value}</p>
      {sub && <p className="mt-1 text-xs font-medium text-slate-500">{sub}</p>}
    </div>
  );
}

export function CardsAndSync() {
  const totalLimit = cards.reduce((s, c) => s + c.limit, 0);
  const totalBalance = cards.reduce((s, c) => s + c.balance, 0);

  return (
    <div
      style={{ fontFamily: font, background: "#F0F2F5" }}
      className="min-h-screen text-slate-900"
    >
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/25">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xl font-extrabold tracking-tight">Ledger</p>
              <p className="-mt-0.5 text-xs font-medium text-slate-400">
                Cards &amp; Accounts
              </p>
            </div>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-700">
            <Plus className="h-4 w-4" />
            Add card
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-6 py-8">
        {/* Page intro */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Your cards &amp; accounts
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Add credit cards manually, or let Ledger auto-import them from your
            email and SMS.
          </p>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Cards" value={String(cards.length)} sub="2 banks" />
          <Stat label="Total limit" value={inr(totalLimit)} />
          <Stat
            label="Outstanding"
            value={inr(totalBalance)}
            sub={`${Math.round((totalBalance / totalLimit) * 100)}% utilised`}
          />
          <Stat label="Next due" value="05/07/2026" sub="ICICI · Amazon Pay" />
        </div>

        {/* Auto-Sync hero */}
        <section className="overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white shadow-xl shadow-indigo-600/20 sm:p-8">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-100">
              Auto-Sync
            </span>
          </div>
          <h2 className="mt-3 max-w-xl text-2xl font-extrabold leading-tight sm:text-3xl">
            Auto-import every card &amp; loan
          </h2>
          <p className="mt-2 max-w-xl text-sm font-medium text-indigo-100">
            Connect once and Ledger&apos;s AI reads your bank statements and
            transaction alerts to detect your cards, loans and EMIs — then asks
            you to confirm before adding anything.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {/* Gmail connect */}
            <div className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/20 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                  <Mail className="h-5 w-5 text-rose-500" />
                </div>
                <div>
                  <p className="font-bold">Connect Gmail</p>
                  <p className="text-xs text-indigo-100">
                    Reads statement &amp; e-bill emails
                  </p>
                </div>
              </div>
              <button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50">
                Connect Gmail
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile verify */}
            <div className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/20 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                  <Smartphone className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-bold">Verify mobile number</p>
                  <p className="text-xs text-indigo-100">
                    Scans bank SMS alerts via OTP
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 rounded-xl bg-white/15 px-3 py-2.5 text-sm font-medium text-white ring-1 ring-white/25">
                  +91 98••• ••210
                </div>
                <button className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50">
                  Send OTP
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2 text-xs font-medium text-indigo-100">
            <Lock className="h-3.5 w-3.5" />
            Read-only access · bank-grade encryption · revoke anytime
          </div>
        </section>

        {/* AI bank detection */}
        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                <Sparkles className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold">AI detected your banks</h3>
                <p className="text-xs font-medium text-slate-500">
                  Identified from 142 emails &amp; 67 SMS alerts
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Scan complete
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {banks.map((b) => (
              <div
                key={b.short}
                className={`flex items-center gap-3 rounded-2xl border p-4 transition ${
                  b.detected
                    ? "border-indigo-200 bg-indigo-50/40"
                    : "border-dashed border-slate-200 bg-slate-50"
                }`}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
                  style={{ background: b.color }}
                >
                  {b.short.slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-800">
                    {b.short}
                  </p>
                  {b.detected ? (
                    <p className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                      <CheckCircle2 className="h-3 w-3" /> Detected
                    </p>
                  ) : (
                    <p className="flex items-center gap-1 text-xs font-medium text-slate-400">
                      <RefreshCw className="h-3 w-3" /> Scanning
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Credit cards wallet */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-extrabold">Credit cards</h3>
            <span className="text-sm font-semibold text-slate-400">
              {cards.length} cards
            </span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => {
              const util = Math.round((c.balance / c.limit) * 100);
              return (
                <div
                  key={c.last4}
                  className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
                >
                  {/* card visual */}
                  <div
                    style={{ background: c.gradient }}
                    className="relative p-5 text-white"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 opacity-90" />
                        <span className="text-sm font-semibold">{c.bank}</span>
                      </div>
                      <CreditCard className="h-5 w-5 opacity-80" />
                    </div>
                    <p className="mt-6 font-mono text-lg tracking-widest">
                      •••• {c.last4}
                    </p>
                    <div className="mt-3 flex items-end justify-between">
                      <span className="text-xs uppercase tracking-wide opacity-80">
                        {c.name}
                      </span>
                      <span className="text-sm font-bold italic">
                        {c.network}
                      </span>
                    </div>
                  </div>

                  {/* card details */}
                  <div className="space-y-3 p-5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-medium text-slate-500">
                        Outstanding
                      </span>
                      <span className="text-lg font-extrabold text-slate-900">
                        {inr(c.balance)}
                      </span>
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-500">
                        <span>Utilised {util}%</span>
                        <span>{inr(c.limit)} limit</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${
                            util > 50 ? "bg-amber-500" : "bg-indigo-600"
                          }`}
                          style={{ width: `${util}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                        Due {c.due}
                      </span>
                      <button className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                        Details <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* add card manually */}
            <button className="flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-white/50 p-5 text-slate-500 transition hover:border-indigo-400 hover:bg-indigo-50/40 hover:text-indigo-600">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                <Plus className="h-6 w-6" />
              </div>
              <span className="text-sm font-semibold">Add card manually</span>
              <span className="max-w-[180px] text-center text-xs text-slate-400">
                Enter card details yourself if you prefer not to connect
              </span>
            </button>
          </div>
        </section>

        {/* Auto-imported loans to confirm */}
        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-extrabold">Loans found — confirm to add</h3>
              <p className="text-xs font-medium text-slate-500">
                Detected from your connected accounts. Nothing is added until you
                approve.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
              <Sparkles className="h-3.5 w-3.5" />
              {importedLoans.length} pending
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {importedLoans.map((l) => (
              <div
                key={l.lender + l.type}
                className="flex flex-wrap items-center justify-between gap-4 py-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                    <Building2 className="h-5 w-5 text-slate-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-800">{l.lender}</p>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          l.source === "Gmail"
                            ? "bg-rose-50 text-rose-600"
                            : "bg-sky-50 text-sky-600"
                        }`}
                      >
                        {l.source === "Gmail" ? (
                          <Mail className="h-3 w-3" />
                        ) : (
                          <Smartphone className="h-3 w-3" />
                        )}
                        via {l.source}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-500">
                      {l.type} · {inr(l.amount)} · EMI {inr(l.emi)}/mo ·{" "}
                      <span className="text-emerald-600">
                        {l.confidence}% match
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100">
                    Dismiss
                  </button>
                  <button className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Confirm
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Trust footer */}
        <div className="flex items-center justify-center gap-2 pb-4 text-center text-xs font-medium text-slate-400">
          <ShieldCheck className="h-4 w-4 text-indigo-500" />
          Ledger uses read-only, RBI-aligned access. We never store your bank
          passwords and you can disconnect any source anytime.
        </div>
      </main>
    </div>
  );
}
