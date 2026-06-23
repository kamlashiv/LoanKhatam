import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Check, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MOCK_USER } from "@/lib/mock-data";

export default function BookingConfirmed() {
  const [, navigate] = useLocation();

  return (
    <div className="flex h-full flex-col items-center justify-center bg-background px-6 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
        className="relative flex h-28 w-28 items-center justify-center rounded-full bg-emerald-100"
      >
        <motion.span
          className="absolute inset-0 rounded-full bg-emerald-400/30"
          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.25, type: "spring", stiffness: 240, damping: 12 }}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white"
        >
          <Check size={34} strokeWidth={3} />
        </motion.div>
      </motion.div>

      <motion.h1
        initial={{ y: 14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mt-7 text-2xl font-extrabold"
      >
        Booking confirmed
      </motion.h1>
      <motion.p
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="mt-2 max-w-[18rem] text-sm text-muted-foreground"
      >
        We are finding the best professional for you. You will get an update shortly.
      </motion.p>

      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="mt-7 w-full space-y-3 rounded-2xl border border-card-border bg-card p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Calendar size={17} />
          </span>
          <div>
            <p className="text-xs text-muted-foreground">Scheduled</p>
            <p className="text-sm font-semibold">Today, 11:00 AM</p>
          </div>
        </div>
        <div className="h-px bg-border" />
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MapPin size={17} />
          </span>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{MOCK_USER.addresses[0].label}</p>
            <p className="truncate text-sm font-semibold">{MOCK_USER.addresses[0].text}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-8 w-full space-y-3"
      >
        <Button
          className="h-13 w-full rounded-2xl py-6 text-base font-semibold shadow-lg shadow-primary/20"
          onClick={() => navigate("/requests")}
        >
          View My Requests
        </Button>
        <Button
          variant="ghost"
          className="h-12 w-full rounded-2xl text-sm font-semibold text-muted-foreground"
          onClick={() => navigate("/home")}
        >
          Back to Home
        </Button>
      </motion.div>
    </div>
  );
}
