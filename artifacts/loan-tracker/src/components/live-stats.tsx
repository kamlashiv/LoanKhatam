import { useEffect, useRef, useState } from "react";
import {
  Eye,
  Users,
  Heart,
  Flame,
  CalendarDays,
  UserCheck,
  Activity,
  TrendingUp,
  Wallet,
  Receipt,
  Star,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { useLiveSiteStats } from "@/lib/site-stats";
import type { ActivityItem } from "@workspace/api-client-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function useCountUp(value: number, durationMs = 1200): number {
  const { reduceMotion } = useTheme();
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(value);
      fromRef.current = value;
      return;
    }
    const from = fromRef.current;
    const delta = value - from;
    if (delta === 0) return;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setDisplay(Math.round(from + delta * eased));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = value;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      fromRef.current = value;
    };
  }, [value, durationMs, reduceMotion]);

  return display;
}

function formatCount(n: number): string {
  return new Intl.NumberFormat("en-IN").format(n);
}

function formatINRCompact(n: number): string {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(2)} Cr`;
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(2)} L`;
  if (n >= 1_000) return `₹${(n / 1_000).toFixed(1)}K`;
  return `₹${formatCount(n)}`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.max(0, Math.floor(diff / 1000));
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ---------------------------------------------------------------------------
// Counter card
// ---------------------------------------------------------------------------

type CounterCardProps = {
  icon: LucideIcon;
  label: string;
  value: number;
  loading: boolean;
  accent: string;
  live?: boolean;
};

function CounterCard({ icon: Icon, label, value, loading, accent, live }: CounterCardProps) {
  const display = useCountUp(value);
  return (
    <div className="relative rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-6 overflow-hidden bento-hover">
      <div className={cn("absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-40", accent)} />
      <div className="relative flex items-start justify-between">
        <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center", accent.replace("bg-", "bg-").concat("/15"))}>
          <Icon className={cn("h-5 w-5", accent.replace("bg-", "text-"))} />
        </div>
        {live && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            LIVE
          </span>
        )}
      </div>
      <div className="relative mt-5">
        <div className="text-3xl lg:text-4xl font-bold font-mono tracking-tight text-foreground tabular-nums">
          {loading ? "—" : formatCount(display)}
        </div>
        <div className="text-sm text-muted-foreground mt-1">{label}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Activity feed
// ---------------------------------------------------------------------------

const ACTIVITY_META: Record<
  ActivityItem["kind"],
  { icon: LucideIcon; text: string; color: string }
> = {
  visit: { icon: Eye, text: "New visitor joined", color: "text-blue-500" },
  like: { icon: Heart, text: "New like received", color: "text-rose-500" },
  review: { icon: Star, text: "New review submitted", color: "text-amber-500" },
  account: { icon: UserCheck, text: "New account created", color: "text-emerald-500" },
};

function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <Activity className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-lg text-foreground">Live activity</h3>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          Waiting for live activity…
        </p>
      ) : (
        <ul className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {items.map((item) => {
            const meta = ACTIVITY_META[item.kind];
            const Icon = meta.icon;
            return (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-xl bg-muted/40 px-3 py-2.5"
              >
                <span className={cn("flex h-8 w-8 items-center justify-center rounded-full bg-background", meta.color)}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm text-foreground flex-1">{meta.text}</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {timeAgo(item.createdAt)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Trust metrics (real platform aggregates)
// ---------------------------------------------------------------------------

function TrustMetric({ icon: Icon, value, label }: { icon: LucideIcon; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-2 px-4">
      <Icon className="h-6 w-6 text-primary" />
      <div className="text-2xl font-bold font-mono text-foreground tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main section (single WebSocket connection for the whole page)
// ---------------------------------------------------------------------------

export function LiveStats() {
  const { stats, activity, connected, liked, like } = useLiveSiteStats();
  const loading = stats === null;

  const counters: Array<Omit<CounterCardProps, "loading">> = [
    { icon: Eye, label: "Active visitors online", value: stats?.activeVisitors ?? 0, accent: "bg-emerald-500", live: true },
    { icon: Users, label: "Total visitors", value: stats?.totalVisitors ?? 0, accent: "bg-indigo-500" },
    { icon: Flame, label: "Today's visitors", value: stats?.todayVisitors ?? 0, accent: "bg-orange-500" },
    { icon: CalendarDays, label: "Monthly visitors", value: stats?.monthlyVisitors ?? 0, accent: "bg-sky-500" },
    { icon: Heart, label: "Total likes", value: stats?.totalLikes ?? 0, accent: "bg-rose-500" },
    { icon: UserCheck, label: "Registered users", value: stats?.registeredUsers ?? 0, accent: "bg-violet-500" },
  ];

  return (
    <section className="py-20 px-6 border-y border-border bg-background relative overflow-hidden">
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 text-sm font-medium mb-4">
              <span className="relative flex h-2 w-2">
                <span className={cn("absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75", connected && "animate-ping")} />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {connected ? "Live — updating in real time" : "Connecting…"}
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              Real numbers, updated live
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg">
              Every figure below is read straight from our database and updates the
              moment something happens — no refresh needed.
            </p>
          </div>

          <Button
            onClick={like}
            disabled={liked}
            size="lg"
            variant={liked ? "secondary" : "default"}
            className="gap-2 font-semibold shrink-0"
            aria-label={liked ? "You liked Ledger" : "Like Ledger"}
          >
            <Heart className={cn("h-5 w-5", liked && "fill-current text-rose-500")} />
            {liked ? "Liked" : "Like Ledger"}
            <span className="font-mono tabular-nums">
              {formatCount(stats?.totalLikes ?? 0)}
            </span>
          </Button>
        </div>

        {/* Counter grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {counters.map((c) => (
            <CounterCard key={c.label} {...c} loading={loading} />
          ))}
        </div>

        {/* Trust metrics + activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-lg text-foreground">Trusted by our community</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-8 gap-x-2 divide-x divide-border/0">
              <TrustMetric icon={UserCheck} value={formatCount(stats?.registeredUsers ?? 0)} label="Members" />
              <TrustMetric icon={Wallet} value={formatCount(stats?.loansTracked ?? 0)} label="Loans tracked" />
              <TrustMetric icon={TrendingUp} value={formatINRCompact(stats?.amountTracked ?? 0)} label="Amount tracked" />
              <TrustMetric icon={Receipt} value={formatCount(stats?.paymentsRecorded ?? 0)} label="Payments logged" />
              <TrustMetric icon={Star} value={formatCount(stats?.totalReviews ?? 0)} label="Reviews" />
              <TrustMetric icon={Heart} value={formatCount(stats?.totalLikes ?? 0)} label="Likes" />
            </div>
          </div>
          <ActivityFeed items={activity} />
        </div>
      </div>
    </section>
  );
}
