import { useMemo, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import { Search, Star, Clock, ChevronRight, SearchX } from "lucide-react";
import { MOCK_CATEGORIES, MOCK_SERVICES, formatRupees } from "@/lib/mock-data";
import { categoryImage } from "@/lib/images";
import { ScreenHeader } from "@/components/screen-header";
import { EmptyState } from "@/components/empty-state";

export default function Services() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const initialCat = new URLSearchParams(search).get("category") ?? "all";
  const [active, setActive] = useState(initialCat);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    return MOCK_SERVICES.filter((s) => {
      const catOk = active === "all" || s.categoryId === active;
      const q = query.trim().toLowerCase();
      const qOk = !q || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [active, query]);

  const iconFor = (categoryId: string) => {
    const cat = MOCK_CATEGORIES.find((c) => c.id === categoryId);
    return categoryImage(cat?.icon ?? "");
  };

  return (
    <div className="flex min-h-full flex-col bg-background">
      <ScreenHeader title="Browse services" subtitle="Find the right pro for the job" />

      <div className="px-5">
        <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-card px-4 py-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
          <Search size={18} className="text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[{ id: "all", name: "All" }, ...MOCK_CATEGORIES].map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActive(c.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              active === c.id
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted-foreground"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No services found"
          description="Try a different search or pick another category."
        />
      ) : (
        <div className="space-y-3 px-5 pb-6 pt-4">
          {results.map((s, i) => (
            <motion.button
              key={s.id}
              type="button"
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: Math.min(i * 0.04, 0.3) }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/service/${s.id}`)}
              className="flex w-full items-center gap-3 rounded-2xl border border-card-border bg-card p-3 text-left"
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-secondary">
                <img src={iconFor(s.categoryId)} alt="" className="h-11 w-11 object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{s.name}</p>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{s.description}</p>
                <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-0.5 font-semibold text-foreground">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    {s.rating}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Clock size={12} />
                    {s.timeEstimate}
                  </span>
                  <span className="font-bold text-primary">{formatRupees(s.price)}</span>
                </div>
              </div>
              <ChevronRight size={18} className="shrink-0 text-muted-foreground" />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
