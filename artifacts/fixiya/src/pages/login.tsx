import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IMAGES } from "@/lib/images";

export default function Login() {
  const [, navigate] = useLocation();
  const [phone, setPhone] = useState("");
  const valid = phone.replace(/\D/g, "").length === 10;

  return (
    <div className="flex h-full flex-col bg-background px-6 pb-8 pt-14">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 14 }}
        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary"
      >
        <img src={IMAGES.logo} alt="Fixiya" className="h-11 w-11 object-contain" />
      </motion.div>

      <motion.h1
        initial={{ y: 14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mt-7 text-2xl font-extrabold tracking-tight"
      >
        Welcome back
      </motion.h1>
      <motion.p
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.18 }}
        className="mt-1.5 text-sm text-muted-foreground"
      >
        Enter your mobile number to continue
      </motion.p>

      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.28 }}
        className="mt-9"
      >
        <label className="mb-2 block text-xs font-semibold text-muted-foreground">
          Mobile number
        </label>
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3.5 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
          <Phone size={18} className="text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">+91</span>
          <div className="h-5 w-px bg-border" />
          <input
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            inputMode="numeric"
            placeholder="98765 43210"
            className="flex-1 bg-transparent text-base font-medium tracking-wide outline-none placeholder:text-muted-foreground/60"
          />
        </div>
        <p className="mt-2.5 text-xs text-muted-foreground">
          We will send a 4-digit code to verify this number.
        </p>
      </motion.div>

      <div className="flex-1" />

      <Button
        disabled={!valid}
        className="h-13 w-full rounded-2xl py-6 text-base font-semibold shadow-lg shadow-primary/20 disabled:opacity-40"
        onClick={() => navigate("/otp")}
      >
        Send OTP
      </Button>
      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <Button
        variant="outline"
        className="mt-6 h-13 w-full rounded-2xl border-border py-6 text-sm font-semibold"
        onClick={() => navigate("/home")}
      >
        Skip for now
      </Button>
    </div>
  );
}
