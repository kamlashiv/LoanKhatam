import { useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { IMAGES } from "@/lib/images";

export default function Splash() {
  const [, navigate] = useLocation();

  useEffect(() => {
    const t = setTimeout(() => navigate("/welcome"), 2400);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-primary text-primary-foreground">
      <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />

      <motion.div
        initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 14 }}
        className="flex h-28 w-28 items-center justify-center rounded-[2rem] bg-white shadow-2xl"
      >
        <img src={IMAGES.logo} alt="Fixiya" className="h-20 w-20 object-contain" />
      </motion.div>

      <motion.h1
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mt-7 text-4xl font-extrabold tracking-tight"
      >
        Fixiya
      </motion.h1>
      <motion.p
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="mt-2 text-sm font-medium text-primary-foreground/80"
      >
        Home repairs, sorted.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-12 flex gap-1.5"
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-white/70"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>
    </div>
  );
}
