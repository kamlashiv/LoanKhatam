import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Share2,
  MessageCircle,
  Send,
  Mail,
  Link2,
  Check,
  Copy,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  MessageSquare,
  ChevronRight,
  Wallet,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const APP_NAME = "Loan Tracker";
const APP_TAGLINE =
  "Keep a trusted record of every loan you give — log loans, record payments, and never lose sight of what's owed.";

// Builds a plain-text invite suitable for any messaging app, with the app link
// appended so recipients can open it directly.
export function buildAppShareMessage(url: string): string {
  return [
    `Check out ${APP_NAME} — ${APP_TAGLINE}`,
    url,
  ].join("\n");
}

type Channel = {
  key: string;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  bg: string;
  ring: string;
  onClick: () => void;
};

interface ShareAppProps {
  trigger?: React.ReactNode;
}

export function ShareApp({ trigger }: ShareAppProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Share the app's home, not the current page the user happens to be on.
  const appUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${import.meta.env.BASE_URL}`
      : "";
  const message = buildAppShareMessage(appUrl);
  const encMsg = encodeURIComponent(message);
  const encUrl = encodeURIComponent(appUrl);
  const encSubject = encodeURIComponent(`Try ${APP_NAME}`);

  const openShare = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const copyText = async (text: string, successTitle: string, description?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: successTitle, description });
      return true;
    } catch {
      toast({ title: "Couldn't copy", description: "Please copy manually." });
      return false;
    }
  };

  const handleCopyMessage = async () => {
    const ok = await copyText(message, "Invite copied to clipboard");
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const canNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title: APP_NAME, text: APP_TAGLINE, url: appUrl });
    } catch {
      // User dismissed the share sheet — no action needed.
    }
  };

  const channels: Channel[] = [
    {
      key: "whatsapp",
      label: "WhatsApp",
      hint: "Most used",
      icon: MessageCircle,
      bg: "bg-[#25D366]",
      ring: "hover:ring-[#25D366]/30",
      onClick: () => openShare(`https://wa.me/?text=${encMsg}`),
    },
    {
      key: "telegram",
      label: "Telegram",
      hint: "Instant",
      icon: Send,
      bg: "bg-[#229ED9]",
      ring: "hover:ring-[#229ED9]/30",
      onClick: () => openShare(`https://t.me/share/url?url=${encUrl}&text=${encMsg}`),
    },
    {
      key: "sms",
      label: "SMS",
      hint: "Text message",
      icon: MessageSquare,
      bg: "bg-emerald-500",
      ring: "hover:ring-emerald-500/30",
      onClick: () => openShare(`sms:?body=${encMsg}`),
    },
    {
      key: "email",
      label: "Email",
      hint: "Full details",
      icon: Mail,
      bg: "bg-rose-500",
      ring: "hover:ring-rose-500/30",
      onClick: () => openShare(`mailto:?subject=${encSubject}&body=${encMsg}`),
    },
    {
      key: "twitter",
      label: "X (Twitter)",
      hint: "Post",
      icon: Twitter,
      bg: "bg-black",
      ring: "hover:ring-black/20",
      onClick: () => openShare(`https://twitter.com/intent/tweet?text=${encMsg}`),
    },
    {
      key: "facebook",
      label: "Facebook",
      hint: "Shares link",
      icon: Facebook,
      bg: "bg-[#1877F2]",
      ring: "hover:ring-[#1877F2]/30",
      onClick: () => openShare(`https://www.facebook.com/sharer/sharer.php?u=${encUrl}`),
    },
    {
      key: "instagram",
      label: "Instagram",
      hint: "Copy & paste",
      icon: Instagram,
      bg: "bg-gradient-to-tr from-[#feda75] via-[#d62976] to-[#4f5bd5]",
      ring: "hover:ring-[#d62976]/30",
      onClick: () =>
        copyText(
          message,
          "Invite copied",
          "Instagram has no share link — paste it into a story or DM.",
        ),
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      hint: "Shares link",
      icon: Linkedin,
      bg: "bg-[#0A66C2]",
      ring: "hover:ring-[#0A66C2]/30",
      onClick: () =>
        openShare(`https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}`),
    },
  ];

  const featured = channels.slice(0, 2);
  const secondary = channels.slice(2);

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share app
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0 sm:max-w-2xl">
        {/* Header block */}
        <DialogHeader className="flex-row items-center gap-4 space-y-0 border-b border-border px-6 py-5 text-left">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
            <Share2 className="h-6 w-6" />
          </div>
          <div>
            <DialogTitle className="text-xl font-extrabold tracking-tight">
              Share {APP_NAME}
            </DialogTitle>
            <DialogDescription className="text-sm">
              Invite friends — the message and link are filled in for you
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Slim invite preview */}
        <div className="border-b border-indigo-200/60 bg-indigo-50 px-6 py-4 dark:border-indigo-900/40 dark:bg-indigo-950/20">
          <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md">
                <Wallet className="h-5 w-5" />
              </div>
              <div className="text-sm leading-snug text-slate-700 dark:text-indigo-100/90">
                <span className="font-bold text-slate-900 dark:text-indigo-50">
                  {APP_NAME}
                </span>
                <br />
                <span className="text-xs text-slate-500 dark:text-indigo-300/70">
                  {appUrl}
                </span>
              </div>
            </div>

            <Button
              onClick={handleCopyMessage}
              variant="outline"
              size="sm"
              className="gap-2 border-indigo-200 bg-white/80 text-indigo-800 hover:bg-white sm:shrink-0 dark:border-indigo-800/50 dark:bg-indigo-900/40 dark:text-indigo-200 dark:hover:bg-indigo-800/60"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied" : "Copy invite"}
            </Button>
          </div>
        </div>

        {/* Channels */}
        <div className="bg-muted/30 p-6">
          {/* Spotlight tier — primary channels */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {featured.map((c) => (
              <button
                key={c.key}
                onClick={c.onClick}
                aria-label={`Share via ${c.label}`}
                className={`group flex items-center justify-between rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border transition hover:-translate-y-0.5 hover:shadow-xl hover:ring-2 ${c.ring}`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-md ${c.bg}`}
                  >
                    <c.icon className="h-7 w-7" />
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-bold leading-tight">{c.label}</p>
                    <p className="text-sm text-muted-foreground">{c.hint}</p>
                  </div>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors group-hover:bg-indigo-100 group-hover:text-indigo-600 dark:group-hover:bg-indigo-900/30 dark:group-hover:text-indigo-400">
                  <ChevronRight className="h-5 w-5" />
                </div>
              </button>
            ))}
          </div>

          {/* Other channels */}
          <h3 className="mb-3 px-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Other channels
          </h3>
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {secondary.map((c) => (
              <button
                key={c.key}
                onClick={c.onClick}
                aria-label={`Share via ${c.label}`}
                className="group flex items-center gap-3 rounded-2xl bg-card p-3.5 text-left shadow-sm ring-1 ring-border transition hover:-translate-y-0.5 hover:shadow-md hover:ring-2 hover:ring-border"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm ${c.bg}`}
                >
                  <c.icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-bold leading-tight">{c.label}</p>
              </button>
            ))}
          </div>

          {/* Tertiary actions */}
          <div className="grid grid-cols-1 gap-3 border-t border-border pt-6 sm:grid-cols-2">
            <button
              onClick={() => copyText(appUrl, "Link copied to clipboard")}
              aria-label="Copy app link"
              className="flex items-center justify-center gap-2 rounded-xl bg-card px-4 py-3 text-sm font-semibold text-foreground shadow-sm ring-1 ring-border transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <Link2 className="h-4 w-4 text-muted-foreground" />
              Copy link
            </button>
            {canNativeShare && (
              <button
                onClick={handleNativeShare}
                aria-label="Open device share sheet"
                className="flex items-center justify-center gap-2 rounded-xl bg-card px-4 py-3 text-sm font-semibold text-foreground shadow-sm ring-1 ring-border transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <Share2 className="h-4 w-4 text-muted-foreground" />
                Device share sheet
              </button>
            )}
          </div>

          <p className="mt-5 text-center text-[11px] font-medium text-muted-foreground">
            Each option opens the app with your invite pre-filled — {APP_NAME} never
            posts on your behalf.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
