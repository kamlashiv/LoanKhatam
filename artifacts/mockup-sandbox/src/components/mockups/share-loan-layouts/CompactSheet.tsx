import {
  MessageCircle,
  Send,
  Mail,
  Link2,
  Share2,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  MessageSquare,
  Check,
  Copy,
  Bell,
  X
} from "lucide-react";
import { useState } from "react";

type Channel = {
  key: string;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  bg: string;
  ring: string;
};

const CHANNELS: Channel[] = [
  { key: "whatsapp", label: "WhatsApp", hint: "Most used", icon: MessageCircle, bg: "bg-[#25D366]", ring: "ring-[#25D366]/30" },
  { key: "telegram", label: "Telegram", hint: "Instant", icon: Send, bg: "bg-[#229ED9]", ring: "ring-[#229ED9]/30" },
  { key: "sms", label: "SMS", hint: "Text message", icon: MessageSquare, bg: "bg-emerald-500", ring: "ring-emerald-500/30" },
  { key: "email", label: "Email", hint: "Full details", icon: Mail, bg: "bg-rose-500", ring: "ring-rose-500/30" },
  { key: "twitter", label: "X (Twitter)", hint: "Post", icon: Twitter, bg: "bg-black", ring: "ring-black/20" },
  { key: "facebook", label: "Facebook", hint: "Share link", icon: Facebook, bg: "bg-[#1877F2]", ring: "ring-[#1877F2]/30" },
  { key: "instagram", label: "Instagram", hint: "Story / DM", icon: Instagram, bg: "bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5]", ring: "ring-[#d62976]/30" },
  { key: "linkedin", label: "LinkedIn", hint: "Professional", icon: Linkedin, bg: "bg-[#0A66C2]", ring: "ring-[#0A66C2]/30" },
];

export function CompactSheet() {
  const [copied, setCopied] = useState(false);

  const message = [
    "Loan reminder for Asha",
    "Outstanding: ₹50,000 of ₹2,00,000",
    "Due date: 12/01/2026",
    "Bank: HDFC Bank",
    "— sent via Loan Tracker",
  ];

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-900/40 p-4 font-sans backdrop-blur-sm sm:p-8">
      <div className="flex w-full max-w-[440px] flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl dark:bg-slate-950">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Share payment reminder
              </h1>
              <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">
                Choose any channel — the message is filled in for you
              </p>
            </div>
          </div>
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-6 p-6">
          {/* Message Preview (Slim & Compact) */}
          <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/60 dark:bg-slate-900/50 dark:ring-slate-800">
            <div className="mb-3 flex items-center justify-between gap-4 border-b border-slate-200/60 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  A
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Asha</p>
                </div>
              </div>
              <div className="flex flex-col items-end text-right">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Due 12 Jan</p>
                <p className="text-sm font-bold text-rose-600 dark:text-rose-400">₹50,000 left</p>
              </div>
            </div>

            <div className="relative mb-3 rounded-xl bg-[#dcf8c6] p-3 text-[13px] leading-relaxed text-slate-800 shadow-sm dark:bg-emerald-900/30 dark:text-emerald-100">
              {message.map((line, i) => (
                <p key={i} className={i === 0 ? "font-bold" : i === message.length - 1 ? "mt-1.5 text-[11px] text-slate-500 dark:text-emerald-300/70" : ""}>
                  {line}
                </p>
              ))}
            </div>

            <button
              onClick={() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1600);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-700/70"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy message"}
            </button>
          </div>

          {/* Channels Grid (Tight) */}
          <div className="grid grid-cols-4 gap-x-2 gap-y-4">
            {CHANNELS.map((c) => (
              <button
                key={c.key}
                className="group flex flex-col items-center gap-2 text-center"
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-[18px] text-white shadow-sm ring-1 ring-black/5 transition-transform group-hover:scale-105 group-active:scale-95 ${c.bg}`}>
                  <c.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{c.label}</p>
                  <p className="text-[9px] font-medium text-slate-500 opacity-80">{c.hint}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Secondary Actions (Compact Tile Row) */}
          <div className="grid grid-cols-3 gap-2">
            <button className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-slate-50 px-2 py-3 text-center text-[11px] font-bold text-slate-700 transition hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
              <Link2 className="h-4 w-4" />
              Copy link
            </button>
            <button className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-slate-50 px-2 py-3 text-center text-[11px] font-bold text-slate-700 transition hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
              <Share2 className="h-4 w-4" />
              Device share sheet
            </button>
            <button className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-amber-50 px-2 py-3 text-center text-[11px] font-bold text-amber-700 transition hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400">
              <Bell className="h-4 w-4" />
              In-app reminder
            </button>
          </div>

          {/* Footer Note */}
          <p className="text-center text-[11px] font-medium leading-relaxed text-slate-400">
            Each option opens the app with your reminder pre-filled — Loan Tracker never posts on your behalf.
          </p>
        </div>
      </div>
    </div>
  );
}
