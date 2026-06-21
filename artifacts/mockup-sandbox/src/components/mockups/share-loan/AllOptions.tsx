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

export function AllOptions() {
  const [copied, setCopied] = useState(false);

  const message = [
    "Loan reminder for Asha",
    "Outstanding: ₹50,000 of ₹2,00,000",
    "Due date: 12/01/2026",
    "Bank: HDFC Bank",
    "— sent via Loan Tracker",
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-100 via-indigo-50 to-slate-100 p-8 font-['Inter'] dark:from-slate-950 dark:via-indigo-950/40 dark:to-slate-950">
      <div className="mx-auto flex h-full max-w-[1700px] flex-col">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
              <Share2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Share payment reminder
              </h1>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Choose any channel — the message is filled in for you
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-800">
            <Share2 className="h-4 w-4" />
            More apps…
          </button>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-8 lg:grid-cols-[420px_1fr]">
          {/* Message preview */}
          <div className="flex flex-col gap-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 text-base font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                A
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Asha</p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Car Repair loan</p>
              </div>
            </div>

            <div className="rounded-2xl bg-[#dcf8c6] p-4 text-[15px] leading-relaxed text-slate-800 shadow-sm dark:bg-emerald-900/30 dark:text-emerald-100">
              {message.map((line, i) => (
                <p key={i} className={i === 0 ? "font-bold" : i === message.length - 1 ? "mt-2 text-xs text-slate-500 dark:text-emerald-300/70" : ""}>
                  {line}
                </p>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Outstanding</p>
                <p className="mt-1 text-xl font-extrabold text-rose-600 dark:text-rose-400">₹50,000</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Due</p>
                <p className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white">12 Jan</p>
              </div>
            </div>

            <button
              onClick={() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1600);
              }}
              className="mt-auto flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied to clipboard" : "Copy message"}
            </button>
          </div>

          {/* Channels grid */}
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {CHANNELS.map((c) => (
                <button
                  key={c.key}
                  className={`group flex flex-col items-start gap-4 rounded-3xl bg-white p-6 text-left shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl hover:ring-2 ${c.ring} dark:bg-slate-900 dark:ring-slate-800`}
                >
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-md ${c.bg}`}>
                    <c.icon className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-900 dark:text-white">{c.label}</p>
                    <p className="text-xs font-medium text-slate-400">{c.hint}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Secondary row */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <button className="flex items-center gap-3 rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg dark:bg-slate-900 dark:ring-slate-800">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <Link2 className="h-5 w-5" />
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-100">Copy link</span>
              </button>
              <button className="flex items-center gap-3 rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg dark:bg-slate-900 dark:ring-slate-800">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <Share2 className="h-5 w-5" />
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-100">Device share sheet</span>
              </button>
              <button className="flex items-center gap-3 rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg dark:bg-slate-900 dark:ring-slate-800">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  <Bell className="h-5 w-5" />
                </div>
                <span className="font-semibold text-slate-800 dark:text-slate-100">In-app reminder</span>
              </button>
            </div>

            <p className="mt-auto rounded-2xl bg-white/60 p-4 text-center text-xs font-medium text-slate-500 ring-1 ring-slate-200/70 dark:bg-slate-900/40 dark:text-slate-400 dark:ring-slate-800">
              Each option opens the app with your reminder pre-filled — Loan Tracker never posts on your behalf.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
