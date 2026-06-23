import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { MOCK_USER } from "@/lib/mock-data";

export default function Otp() {
  const [, navigate] = useLocation();
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [seconds, setSeconds] = useState(28);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const complete = digits.every((d) => d !== "");

  const setDigit = (i: number, v: string) => {
    const clean = v.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = clean;
    setDigits(next);
    if (clean && i < 3) refs.current[i + 1]?.focus();
  };

  const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  return (
    <div className="flex h-full flex-col bg-background px-6 pb-8 pt-14">
      <motion.h1
        initial={{ y: 14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-2xl font-extrabold tracking-tight"
      >
        Verify your number
      </motion.h1>
      <motion.p
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.08 }}
        className="mt-1.5 text-sm text-muted-foreground"
      >
        Enter the 4-digit code sent to{" "}
        <span className="font-semibold text-foreground">{MOCK_USER.phone}</span>
      </motion.p>

      <div className="mt-10 flex justify-between gap-3">
        {digits.map((d, i) => (
          <motion.input
            key={i}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15 + i * 0.06 }}
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={d}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => onKey(i, e)}
            inputMode="numeric"
            aria-label={`Digit ${i + 1}`}
            className={`h-16 w-16 rounded-2xl border-2 bg-card text-center text-2xl font-bold outline-none transition-all ${
              d
                ? "border-primary text-primary"
                : "border-border text-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
            }`}
          />
        ))}
      </div>

      <div className="mt-7 text-center text-sm text-muted-foreground">
        {seconds > 0 ? (
          <>
            Resend code in{" "}
            <span className="font-semibold text-foreground">0:{String(seconds).padStart(2, "0")}</span>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setSeconds(28)}
            className="font-semibold text-primary"
          >
            Resend code
          </button>
        )}
      </div>

      <div className="flex-1" />

      <Button
        disabled={!complete}
        className="h-13 w-full rounded-2xl py-6 text-base font-semibold shadow-lg shadow-primary/20 disabled:opacity-40"
        onClick={() => navigate("/home")}
      >
        Verify & Continue
      </Button>
      <button
        type="button"
        onClick={() => navigate("/login")}
        className="mt-5 text-center text-sm font-medium text-muted-foreground"
      >
        Change number
      </button>
    </div>
  );
}
