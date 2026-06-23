import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Search, MapPin, Star, ChevronRight, Bell, Clock } from "lucide-react";
import {
  MOCK_CATEGORIES,
  MOCK_SERVICES,
  MOCK_USER,
  MOCK_NOTIFICATIONS,
  getCategory,
  formatRupees,
} from "@/lib/mock-data";
import { categoryImage } from "@/lib/images";

export default function Home() {
  const [, navigate] = useLocation();
  const popular = MOCK_SERVICES.filter((s) => s.tags.includes("Bestseller"));
  const unread = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <div className="flex flex-col bg-background">
      <div className="rounded-b-[2rem] bg-primary px-5 pb-8 pt-6 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1 text-xs text-primary-foreground/70">
              <MapPin size={13} />
              <span>{MOCK_USER.addresses[0].label}</span>
            </div>
            <p className="mt-0.5 text-lg font-bold">Hi, {MOCK_USER.name.split(" ")[0]}</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/notifications")}
            aria-label="Notifications"
            className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/15"
          >
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-accent ring-2 ring-primary" />
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() => navigate("/services")}
          className="mt-5 flex w-full items-center gap-2.5 rounded-2xl bg-white px-4 py-3.5 text-left text-muted-foreground shadow-lg"
        >
          <Search size={19} className="text-primary" />
          <span className="text-sm">Search for a service or pro</span>
        </button>
      </div>

      <div className="px-5 pt-6">
        <motion.div
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative overflow-hidden rounded-2xl bg-accent px-5 py-4 text-accent-foreground"
        >
          <div className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/15" />
          <p className="text-xs font-semibold uppercase tracking-wide text-accent-foreground/80">
            Monsoon offer
          </p>
          <p className="mt-1 text-lg font-extrabold leading-tight">Flat 20% off</p>
          <p className="text-sm text-accent-foreground/90">on all plumbing services</p>
        </motion.div>
      </div>

      <div className="px-5 pt-7">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold">Categories</h2>
          <button
            type="button"
            onClick={() => navigate("/services")}
            className="flex items-center text-xs font-semibold text-primary"
          >
            See all <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {MOCK_CATEGORIES.map((cat, i) => (
            <motion.button
              key={cat.id}
              type="button"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/services?category=${cat.id}`)}
              className="flex flex-col items-center gap-2 rounded-2xl border border-card-border bg-card p-3"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary">
                <img src={categoryImage(cat.icon)} alt="" className="h-10 w-10 object-contain" />
              </div>
              <span className="text-center text-xs font-semibold leading-tight">{cat.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="px-5 pb-6 pt-7">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold">Most booked</h2>
          <button
            type="button"
            onClick={() => navigate("/services")}
            className="flex items-center text-xs font-semibold text-primary"
          >
            See all <ChevronRight size={14} />
          </button>
        </div>
        <div className="space-y-3">
          {popular.map((s, i) => (
            <motion.button
              key={s.id}
              type="button"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.06 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/service/${s.id}`)}
              className="flex w-full items-center gap-3 rounded-2xl border border-card-border bg-card p-3 text-left"
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-secondary">
                <img src={categoryImage(getCategory(s.categoryId)?.icon ?? "")} alt="" className="h-11 w-11 object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{s.name}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-0.5 font-semibold text-foreground">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    {s.rating}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Clock size={12} />
                    {s.timeEstimate}
                  </span>
                </div>
                <p className="mt-1 text-sm font-bold text-primary">{formatRupees(s.price)}</p>
              </div>
              <ChevronRight size={18} className="text-muted-foreground" />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
