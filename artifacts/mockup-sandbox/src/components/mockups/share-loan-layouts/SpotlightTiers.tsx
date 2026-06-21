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
  ChevronRight
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

const FEATURED_CHANNELS: Channel[] = [
  { key: "whatsapp", label: "WhatsApp", hint: "Most used", icon: MessageCircle, bg: "bg-[#25D366]", ring: "ring-[#25D366]/30" },
  { key: "telegram", label: "Telegram", hint: "Instant", icon: Send, bg: "bg-[#229ED9]", ring: "ring-[#229ED9]/30" },
];

const SECONDARY_CHANNELS: Channel[] = [
  { key: "sms", label: "SMS", hint: "Text message", icon: MessageSquare, bg: "bg-emerald-500", ring: "ring-emerald-500/30" },
  { key: "email", label: "Email", hint: "Full details", icon: Mail, bg: "bg-rose-500", ring: "ring-rose-500/30" },
  { key: "twitter", label: "X (Twitter)", hint: "Post", icon: Twitter, bg: "bg-black", ring: "ring-black/20" },
  { key: "facebook", label: "Facebook", hint: "Share link", icon: Facebook, bg: "bg-[#1877F2]", ring: "ring-[#1877F2]/30" },
  { key: "instagram", label: "Instagram", hint: "Story / DM", icon: Instagram, bg: "bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5]", ring: "ring-[#d62976]/30" },
  { key: "linkedin", label: "LinkedIn", hint: "Professional", icon: Linkedin, bg: "bg-[#0A66C2]", ring: "ring-[#0A66C2]/30" },
];

export function SpotlightTiers() {
  const [copied, setCopied] = useState(false);

  const message = [
    "Loan reminder for Asha",
    "Outstanding: ₹50,000 of ₹2,00,000",
    "Due date: 12/01/2026",
    "Bank: HDFC Bank",
    "— sent via Loan Tracker",
  ];

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 md:p-8 font-['Inter'] dark:bg-slate-950">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden flex flex-col">
        
        {/* Header Block */}
        <div className="p-8 pb-6 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
                <Share2 className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Share payment reminder
                </h1>
                <p className="text-base mt-1 font-medium text-slate-500 dark:text-slate-400">
                  Choose any channel — the message is filled in for you
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Slim Banner Message Preview */}
        <div className="bg-[#f0fdf4] dark:bg-emerald-950/20 border-b border-[#dcf8c6] dark:border-emerald-900/30 p-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold dark:bg-emerald-900/50 dark:text-emerald-300">
                A
              </div>
              <div className="flex-1 text-sm text-slate-700 dark:text-emerald-100/90 leading-snug">
                <span className="font-bold text-slate-900 dark:text-emerald-50">Loan reminder for Asha</span><br/>
                Outstanding: ₹50,000 of ₹2,00,000 • Due date: 12/01/2026 • Bank: HDFC Bank <span className="text-xs text-slate-500 dark:text-emerald-400/60">— sent via Loan Tracker</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 shrink-0 border-l border-emerald-200/50 dark:border-emerald-800/50 pl-4 md:pl-6">
               <div className="text-right hidden sm:block">
                 <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600/70 dark:text-emerald-400/60">Outstanding</p>
                 <p className="font-extrabold text-emerald-700 dark:text-emerald-300">₹50,000</p>
               </div>
               <div className="text-right hidden sm:block">
                 <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600/70 dark:text-emerald-400/60">Due</p>
                 <p className="font-extrabold text-emerald-700 dark:text-emerald-300">12 Jan</p>
               </div>
               <button
                 onClick={() => {
                   setCopied(true);
                   setTimeout(() => setCopied(false), 1600);
                 }}
                 className="flex items-center justify-center gap-2 rounded-xl bg-white/80 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800/50 px-4 py-2 text-sm font-bold text-emerald-800 dark:text-emerald-200 transition hover:bg-white dark:hover:bg-emerald-800/60"
               >
                 {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                 {copied ? "Copied" : "Copy"}
               </button>
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50/50 dark:bg-slate-900/50">
          
          {/* Spotlight Tier */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {FEATURED_CHANNELS.map((c) => (
              <button
                key={c.key}
                className={`group flex items-center justify-between rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl hover:ring-2 ${c.ring} dark:bg-slate-900 dark:ring-slate-800`}
              >
                <div className="flex items-center gap-5">
                  <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-white shadow-md ${c.bg}`}>
                    <c.icon className="h-8 w-8" />
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{c.label}</p>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">{c.hint}</p>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                </div>
              </button>
            ))}
          </div>

          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 px-2">Other Channels</h3>
          
          {/* Secondary Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            {SECONDARY_CHANNELS.map((c) => (
              <button
                key={c.key}
                className="group flex items-center gap-3 rounded-2xl bg-white p-3.5 text-left ring-1 ring-slate-200 transition hover:ring-2 hover:bg-slate-50 dark:bg-slate-900 dark:ring-slate-800 dark:hover:bg-slate-800/80"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white ${c.bg}`}>
                  <c.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{c.label}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Tertiary Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-slate-200 dark:border-slate-800 pt-8 mb-6">
            <button className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800">
              <Link2 className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              Copy link
            </button>
            <button className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800">
              <Share2 className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              Device share sheet
            </button>
            <button className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-amber-700 ring-1 ring-slate-200 transition hover:bg-amber-50 dark:bg-slate-900 dark:text-amber-400 dark:ring-slate-800 dark:hover:bg-amber-950/30">
              <Bell className="h-4 w-4 text-amber-500" />
              In-app reminder
            </button>
          </div>

          <p className="text-center text-xs font-medium text-slate-500 dark:text-slate-500">
            Each option opens the app with your reminder pre-filled — Loan Tracker never posts on your behalf.
          </p>

        </div>
      </div>
    </div>
  );
}
