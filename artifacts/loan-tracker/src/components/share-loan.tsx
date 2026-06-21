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
} from "lucide-react";
import { formatRupees, formatDate } from "@/lib/loan-utils";
import { useToast } from "@/hooks/use-toast";

interface ShareLoanProps {
  borrowerName: string;
  principalAmount: number;
  remainingAmount: number;
  dueDate: string;
  bank?: string | null;
}

// Builds a plain-text payment reminder / loan summary suitable for any
// messaging app. Kept short so it reads well on WhatsApp, SMS, etc.
export function buildShareMessage({
  borrowerName,
  principalAmount,
  remainingAmount,
  dueDate,
  bank,
}: ShareLoanProps): string {
  const lines = [
    `Loan reminder for ${borrowerName}`,
    `Outstanding: ${formatRupees(remainingAmount)} of ${formatRupees(principalAmount)}`,
  ];
  const due = dueDate ? formatDate(dueDate) : "";
  if (due) lines.push(`Due date: ${due}`);
  if (bank) lines.push(`Bank: ${bank}`);
  lines.push("— sent via Loan Tracker");
  return lines.join("\n");
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

export function ShareLoan(props: ShareLoanProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const message = buildShareMessage(props);
  const appUrl = typeof window !== "undefined" ? window.location.href : "";
  const encMsg = encodeURIComponent(message);
  const encUrl = encodeURIComponent(appUrl);
  const encSubject = encodeURIComponent(`Loan reminder for ${props.borrowerName}`);

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
    const ok = await copyText(message, "Reminder copied to clipboard");
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const canNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title: `Loan: ${props.borrowerName}`, text: message });
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
          "Reminder copied",
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl gap-0 overflow-hidden p-0 sm:max-w-3xl">
        <div className="bg-gradient-to-br from-slate-50 via-indigo-50/60 to-slate-50 p-6 dark:from-slate-950 dark:via-indigo-950/30 dark:to-slate-950">
          <DialogHeader className="mb-5 flex-row items-center gap-3 space-y-0 text-left">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold tracking-tight">
                Share payment reminder
              </DialogTitle>
              <DialogDescription className="text-sm">
                Choose any channel — the message is filled in for you
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
            {/* Message preview */}
            <div className="flex flex-col gap-4 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {props.borrowerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold leading-tight">{props.borrowerName}</p>
                  <p className="text-xs text-muted-foreground">Payment reminder</p>
                </div>
              </div>

              <div className="rounded-xl bg-[#dcf8c6] p-3 text-[13px] leading-relaxed text-slate-800 shadow-sm dark:bg-emerald-900/30 dark:text-emerald-100">
                {message.split("\n").map((line, i, arr) => (
                  <p
                    key={i}
                    className={
                      i === 0
                        ? "font-bold"
                        : i === arr.length - 1
                          ? "mt-1.5 text-[11px] text-slate-500 dark:text-emerald-300/70"
                          : ""
                    }
                  >
                    {line}
                  </p>
                ))}
              </div>

              <Button
                onClick={handleCopyMessage}
                className="mt-auto w-full gap-2"
                variant="default"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy message"}
              </Button>
            </div>

            {/* Channels grid */}
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {channels.map((c) => (
                  <button
                    key={c.key}
                    onClick={c.onClick}
                    aria-label={`Share via ${c.label}`}
                    className={`group flex flex-col items-start gap-2.5 rounded-2xl bg-card p-3.5 text-left shadow-sm ring-1 ring-border transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-2 ${c.ring}`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md ${c.bg}`}
                    >
                      <c.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-tight">{c.label}</p>
                      <p className="text-[11px] text-muted-foreground">{c.hint}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Secondary row */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  onClick={() => copyText(appUrl, "Link copied to clipboard")}
                  aria-label="Copy link to this loan"
                  className="flex items-center gap-3 rounded-xl bg-card p-3 text-left shadow-sm ring-1 ring-border transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground">
                    <Link2 className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold">Copy link</span>
                </button>
                {canNativeShare && (
                  <button
                    onClick={handleNativeShare}
                    aria-label="Open device share sheet"
                    className="flex items-center gap-3 rounded-xl bg-card p-3 text-left shadow-sm ring-1 ring-border transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground">
                      <Share2 className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold">Device share sheet</span>
                  </button>
                )}
              </div>

              <p className="mt-auto rounded-xl bg-muted/50 p-3 text-center text-[11px] font-medium text-muted-foreground ring-1 ring-border/60">
                Each option opens the app with your reminder pre-filled — Loan Tracker
                never posts on your behalf.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
