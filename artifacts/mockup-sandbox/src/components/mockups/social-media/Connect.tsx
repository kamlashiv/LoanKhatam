import {
  Wallet,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Youtube,
  ArrowUpRight,
} from "lucide-react";

type Channel = {
  name: string;
  handle: string;
  followers: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  tint: string;
  iconColor: string;
};

const channels: Channel[] = [
  {
    name: "Instagram",
    handle: "@ledger.app",
    followers: "48.2K",
    href: "https://instagram.com/ledger.app",
    icon: Instagram,
    tint: "bg-pink-50 group-hover:bg-pink-100",
    iconColor: "text-pink-600",
  },
  {
    name: "X (Twitter)",
    handle: "@ledger",
    followers: "31.6K",
    href: "https://x.com/ledger",
    icon: Twitter,
    tint: "bg-slate-100 group-hover:bg-slate-200",
    iconColor: "text-slate-900",
  },
  {
    name: "LinkedIn",
    handle: "Ledger Finance",
    followers: "22.9K",
    href: "https://linkedin.com/company/ledger",
    icon: Linkedin,
    tint: "bg-sky-50 group-hover:bg-sky-100",
    iconColor: "text-sky-700",
  },
  {
    name: "YouTube",
    handle: "@ledgerapp",
    followers: "15.3K",
    href: "https://youtube.com/@ledgerapp",
    icon: Youtube,
    tint: "bg-red-50 group-hover:bg-red-100",
    iconColor: "text-red-600",
  },
  {
    name: "Facebook",
    handle: "/ledgerapp",
    followers: "27.1K",
    href: "https://facebook.com/ledgerapp",
    icon: Facebook,
    tint: "bg-blue-50 group-hover:bg-blue-100",
    iconColor: "text-blue-600",
  },
];

export function Connect() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-indigo-50/60 font-['Inter'] flex items-center justify-center px-6 py-16">
      <section className="w-full max-w-5xl">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-1.5 text-sm font-medium text-indigo-600 shadow-sm">
            <Wallet className="h-4 w-4" />
            Ledger
          </div>
          <h2 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Connect with us
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-500">
            Follow Ledger for money tips, product updates, and stories from
            people getting their loans paid off — faster.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {channels.map((c) => {
            const Icon = c.icon;
            return (
              <a
                key={c.name}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Follow Ledger on ${c.name}`}
                className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
              >
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${c.tint}`}
                >
                  <Icon className={`h-6 w-6 ${c.iconColor}`} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1 font-semibold text-slate-900">
                    {c.name}
                    <ArrowUpRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-indigo-500" />
                  </span>
                  <span className="block truncate text-sm text-slate-500">
                    {c.handle}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-sm font-semibold text-slate-900">
                    {c.followers}
                  </span>
                  <span className="block text-xs text-slate-400">followers</span>
                </span>
              </a>
            );
          })}

          <div className="flex flex-col justify-center gap-3 rounded-2xl bg-indigo-600 p-6 text-white shadow-sm">
            <p className="text-lg font-semibold leading-snug">
              Join 145K+ people managing loans the smart way
            </p>
            <p className="text-sm text-indigo-100">
              New tips every week across all our channels.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
