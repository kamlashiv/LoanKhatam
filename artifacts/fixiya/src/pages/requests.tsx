import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ChevronRight, ClipboardList, Calendar } from "lucide-react";
import {
  MOCK_REQUESTS,
  RequestStatus,
  getProvider,
  formatRupees,
} from "@/lib/mock-data";
import { categoryImage } from "@/lib/images";
import { getCategory } from "@/lib/mock-data";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";

const TABS = ["All", "Active", "Completed", "Cancelled"] as const;
type Tab = (typeof TABS)[number];

const ACTIVE: RequestStatus[] = ["Pending", "Assigned", "In Progress"];

export default function Requests() {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<Tab>("All");

  const filtered = useMemo(() => {
    return MOCK_REQUESTS.filter((r) => {
      if (tab === "All") return true;
      if (tab === "Active") return ACTIVE.includes(r.status);
      return r.status === tab;
    });
  }, [tab]);

  return (
    <div className="flex min-h-full flex-col bg-background">
      <div className="sticky top-0 z-30 bg-background/85 px-5 pb-2 pt-6 backdrop-blur-md">
        <h1 className="text-2xl font-extrabold tracking-tight">My Requests</h1>
        <p className="text-sm text-muted-foreground">Track and manage your bookings</p>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                tab === t
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Nothing here yet"
          description={`You have no ${tab.toLowerCase()} requests right now.`}
        />
      ) : (
        <div className="space-y-3 px-5 pb-6 pt-3">
          {filtered.map((r, i) => {
            const provider = getProvider(r.providerId);
            const cat = getCategory(r.categoryId);
            return (
              <motion.button
                key={r.id}
                type="button"
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: Math.min(i * 0.05, 0.3) }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/request/${r.id}`)}
                className="w-full rounded-2xl border border-card-border bg-card p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary">
                    <img src={categoryImage(cat?.icon ?? "")} alt="" className="h-8 w-8 object-contain" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{r.serviceName}</p>
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar size={12} />
                      {r.date}, {r.time}
                    </div>
                  </div>
                  <ChevronRight size={18} className="shrink-0 text-muted-foreground" />
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <StatusBadge status={r.status} />
                  <div className="flex items-center gap-3">
                    {provider && (
                      <span className="text-xs text-muted-foreground">{provider.name}</span>
                    )}
                    <span className="text-sm font-bold text-primary">{formatRupees(r.amount)}</span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
