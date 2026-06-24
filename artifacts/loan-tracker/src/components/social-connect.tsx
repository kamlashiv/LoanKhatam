import {
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
    handle: "@loankhatam.app",
    followers: "48.2K",
    href: "https://instagram.com/loankhatam.app",
    icon: Instagram,
    tint: "bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600",
    iconColor: "text-white",
  },
  {
    name: "X (Twitter)",
    handle: "@loankhatam",
    followers: "31.6K",
    href: "https://x.com/loankhatam",
    icon: Twitter,
    tint: "bg-black dark:bg-slate-800",
    iconColor: "text-white",
  },
  {
    name: "LinkedIn",
    handle: "Loan Khatam Finance",
    followers: "22.9K",
    href: "https://linkedin.com/company/loankhatam",
    icon: Linkedin,
    tint: "bg-[#0a66c2]",
    iconColor: "text-white",
  },
  {
    name: "YouTube",
    handle: "@loankhatamapp",
    followers: "15.3K",
    href: "https://youtube.com/@loankhatamapp",
    icon: Youtube,
    tint: "bg-[#ff0000]",
    iconColor: "text-white",
  },
  {
    name: "Facebook",
    handle: "/loankhatamapp",
    followers: "27.1K",
    href: "https://facebook.com/loankhatamapp",
    icon: Facebook,
    tint: "bg-[#1877f2]",
    iconColor: "text-white",
  },
];

export function SocialConnect() {
  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-5xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
            Connect with us
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Follow Loan Khatam for money tips, product updates, and stories from
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
                aria-label={`Follow Loan Khatam on ${c.name}`}
                className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${c.tint}`}
                >
                  <Icon className={`h-6 w-6 ${c.iconColor}`} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    {c.name}
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground/50 transition-colors group-hover:text-primary" />
                  </span>
                  <span className="block truncate text-sm text-muted-foreground">
                    {c.handle}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-sm font-semibold text-foreground">
                    {c.followers}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    followers
                  </span>
                </span>
              </a>
            );
          })}

          <div className="flex flex-col justify-center gap-3 rounded-2xl bg-primary p-6 text-primary-foreground shadow-sm">
            <p className="text-lg font-semibold leading-snug">
              Join 145K+ people managing loans the smart way
            </p>
            <p className="text-sm text-primary-foreground/80">
              New tips every week across all our channels.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
