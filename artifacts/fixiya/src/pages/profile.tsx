import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  MapPin,
  CreditCard,
  Bell,
  ShieldCheck,
  HelpCircle,
  Star,
  ChevronRight,
  LogOut,
  Pencil,
} from "lucide-react";
import { MOCK_USER, MOCK_REQUESTS } from "@/lib/mock-data";

const MENU = [
  { icon: MapPin, label: "Saved addresses", sub: `${MOCK_USER.addresses.length} saved` },
  { icon: CreditCard, label: "Payment methods", sub: "UPI, Cards" },
  { icon: Bell, label: "Notifications", sub: "Manage alerts" },
  { icon: ShieldCheck, label: "Privacy & security", sub: "" },
  { icon: HelpCircle, label: "Help & support", sub: "" },
];

export default function Profile() {
  const [, navigate] = useLocation();
  const completed = MOCK_REQUESTS.filter((r) => r.status === "Completed").length;
  const active = MOCK_REQUESTS.filter((r) =>
    ["Pending", "Assigned", "In Progress"].includes(r.status),
  ).length;

  return (
    <div className="flex min-h-full flex-col bg-background pb-6">
      <div className="rounded-b-[2rem] bg-primary px-5 pb-7 pt-7 text-primary-foreground">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-xl font-bold">
            {MOCK_USER.name.split(" ").map((w) => w[0]).join("")}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold">{MOCK_USER.name}</p>
            <p className="text-sm text-primary-foreground/75">{MOCK_USER.phone}</p>
          </div>
          <button
            type="button"
            aria-label="Edit profile"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15"
          >
            <Pencil size={16} />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { label: "Completed", value: completed },
            { label: "Active", value: active },
            { label: "Rating", value: "4.9" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-white/10 px-3 py-2.5 text-center">
              <p className="text-lg font-extrabold">{s.value}</p>
              <p className="text-xs text-primary-foreground/75">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 pt-5">
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-3 rounded-2xl bg-accent/10 p-4"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <Star size={20} className="fill-accent-foreground" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">Fixiya Plus</p>
            <p className="text-xs text-muted-foreground">Save up to 15% on every booking</p>
          </div>
          <ChevronRight size={18} className="text-muted-foreground" />
        </motion.div>
      </div>

      <div className="px-5 pt-5">
        <div className="overflow-hidden rounded-2xl border border-card-border bg-card">
          {MENU.map((item, i) => (
            <button
              key={item.label}
              type="button"
              onClick={() => navigate("/notifications")}
              className={`flex w-full items-center gap-3 px-4 py-3.5 text-left ${
                i !== MENU.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-primary">
                <item.icon size={17} />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold">{item.label}</span>
                {item.sub && <span className="block text-xs text-muted-foreground">{item.sub}</span>}
              </span>
              <ChevronRight size={17} className="text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pt-5">
        <button
          type="button"
          onClick={() => navigate("/welcome")}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 bg-card py-3.5 text-sm font-semibold text-destructive"
        >
          <LogOut size={17} />
          Log out
        </button>
        <p className="mt-4 text-center text-xs text-muted-foreground">Fixiya v1.0.0</p>
      </div>
    </div>
  );
}
