import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ShieldCheck, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IMAGES } from "@/lib/images";

const PERKS = [
  { icon: ShieldCheck, title: "Verified pros", text: "Background-checked & trained experts" },
  { icon: Clock, title: "On-time arrival", text: "Same-day slots, live tracking" },
  { icon: Star, title: "Quality assured", text: "30-day warranty on every job" },
];

export default function Welcome() {
  const [, navigate] = useLocation();

  return (
    <div className="flex h-full flex-col bg-background px-6 pb-8 pt-12">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 14 }}
          className="relative flex h-44 w-44 items-center justify-center rounded-[2.5rem] bg-secondary"
        >
          <div className="absolute inset-0 rounded-[2.5rem] bg-primary/5" />
          <img src={IMAGES.splash} alt="" className="h-32 w-32 object-contain" />
        </motion.div>

        <motion.h1
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-9 text-3xl font-extrabold leading-tight tracking-tight"
        >
          Trusted help for
          <br />
          every home fix
        </motion.h1>
        <motion.p
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.32 }}
          className="mt-3 max-w-[18rem] text-sm leading-relaxed text-muted-foreground"
        >
          Book plumbers, electricians, AC experts and more — at your door, when you need them.
        </motion.p>

        <div className="mt-9 w-full space-y-3">
          {PERKS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ x: -16, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.45 + i * 0.1 }}
              className="flex items-center gap-3 rounded-2xl border border-card-border bg-card p-3.5 text-left"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <p.icon size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold">{p.title}</p>
                <p className="text-xs text-muted-foreground">{p.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8"
      >
        <Button
          className="h-13 w-full rounded-2xl py-6 text-base font-semibold shadow-lg shadow-primary/20"
          onClick={() => navigate("/login")}
        >
          Get Started
        </Button>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          By continuing you agree to our Terms & Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}
