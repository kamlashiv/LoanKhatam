import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BellOff, CheckCircle2, Tag, Clock, Wrench, Info } from "lucide-react";
import { MOCK_NOTIFICATIONS, NotificationType } from "@/lib/mock-data";
import { ScreenHeader } from "@/components/screen-header";
import { EmptyState } from "@/components/empty-state";

const ICONS: Record<NotificationType, typeof Info> = {
  booking: CheckCircle2,
  offer: Tag,
  reminder: Clock,
  update: Wrench,
  info: Info,
};

const ICON_BG: Record<NotificationType, string> = {
  booking: "bg-emerald-100 text-emerald-600",
  offer: "bg-accent/15 text-accent",
  reminder: "bg-amber-100 text-amber-600",
  update: "bg-primary/10 text-primary",
  info: "bg-secondary text-primary",
};

export default function Notifications() {
  const [items, setItems] = useState(MOCK_NOTIFICATIONS);

  return (
    <div className="flex min-h-full flex-col bg-background">
      <ScreenHeader
        title="Notifications"
        action={
          items.length > 0 ? (
            <button
              type="button"
              onClick={() => setItems([])}
              className="text-xs font-semibold text-primary"
            >
              Clear all
            </button>
          ) : undefined
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title="You're all caught up"
          description="No new notifications right now. We'll let you know when something happens."
        />
      ) : (
        <div className="space-y-3 px-5 pb-6">
          <AnimatePresence initial={false}>
            {items.map((n, i) => {
              const Icon = ICONS[n.type];
              return (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: Math.min(i * 0.04, 0.25) }}
                  className={`flex gap-3 rounded-2xl border p-4 ${
                    n.read ? "border-card-border bg-card" : "border-primary/20 bg-primary/5"
                  }`}
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${ICON_BG[n.type]}`}>
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold">{n.title}</p>
                      {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground/70">{n.time}</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
