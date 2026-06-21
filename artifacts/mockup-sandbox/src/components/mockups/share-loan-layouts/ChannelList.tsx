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
  ChevronRight,
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

export function ChannelList() {
  const [copied, setCopied] = useState(false);

  const message = [
    "Loan reminder for Asha",
    "Outstanding: ₹50,000 of ₹2,00,000",
    "Due date: 12/01/2026",
    "Bank: HDFC Bank",
    "— sent via Loan Tracker",
  ];

  return (
    <div className="min-h-screen w-full bg-slate-50 p-8 font-['Inter'] dark:bg-slate-950 flex items-center justify-center">
      <div className="mx-auto flex max-h-[85vh] w-full max-w-[900px] flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-8 py-6 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
              <Share2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Share payment reminder
              </h1>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Choose any channel — the message is filled in for you
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
          {/* Left Pane: Message Preview Rail */}
          <div className="w-full overflow-y-auto border-b border-slate-100 bg-slate-50/50 p-8 md:w-[400px] md:border-b-0 md:border-r dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex flex-col gap-6">
              
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 text-base font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  A
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Asha</p>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Car Repair loan</p>
                </div>
              </div>

              <div className="rounded-2xl bg-[#dcf8c6] p-5 text-[15px] leading-relaxed text-slate-800 shadow-sm dark:bg-emerald-900/30 dark:text-emerald-100">
                {message.map((line, i) => (
                  <p key={i} className={i === 0 ? "font-bold" : i === message.length - 1 ? "mt-3 text-xs text-slate-500 dark:text-emerald-300/70" : ""}>
                    {line}
                  </p>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800/60 dark:ring-slate-700/50">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Outstanding</p>
                  <p className="mt-1 text-lg font-extrabold text-rose-600 dark:text-rose-400">₹50,000</p>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800/60 dark:ring-slate-700/50">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Due Date</p>
                  <p className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white">12 Jan</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1600);
                }}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied to clipboard" : "Copy message"}
              </button>
            </div>
          </div>

          {/* Right Pane: Channel List */}
          <div className="flex flex-1 flex-col overflow-y-auto">
            <div className="flex flex-col p-6">
              <h3 className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-slate-400">Primary Channels</h3>
              <div className="flex flex-col">
                {CHANNELS.map((c) => (
                  <button
                    key={c.key}
                    className="group flex w-full items-center justify-between rounded-2xl p-3 transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-[10px] text-white shadow-sm ${c.bg}`}>
                        <c.icon className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{c.label}</span>
                        <span className="text-xs font-medium text-slate-500">{c.hint}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-indigo-400">
                      Share <ChevronRight className="h-4 w-4" />
                    </div>
                  </button>
                ))}
              </div>

              <div className="my-5 mx-3 h-px bg-slate-100 dark:bg-slate-800" />

              <h3 className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-slate-400">Other Options</h3>
              <div className="flex flex-col">
                <button className="group flex w-full items-center justify-between rounded-2xl p-3 transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      <Link2 className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Copy link</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
                
                <button className="group flex w-full items-center justify-between rounded-2xl p-3 transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      <Share2 className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Device share sheet</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
                
                <button className="group flex w-full items-center justify-between rounded-2xl p-3 transition hover:bg-amber-50 dark:hover:bg-amber-950/30">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                      <Bell className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">In-app reminder</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              </div>
            </div>
            
            <div className="mt-auto bg-slate-50 px-8 py-5 dark:bg-slate-900/80">
              <p className="text-center text-[12px] font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                Each option opens the app with your reminder pre-filled — Loan Tracker never posts on your behalf.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
