import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Share2, MessageCircle, Send, Mail, Link2, Check, Share } from "lucide-react";
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

export function ShareLoan(props: ShareLoanProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const message = buildShareMessage(props);
  const appUrl = typeof window !== "undefined" ? window.location.href : "";
  const encMsg = encodeURIComponent(message);
  const encUrl = encodeURIComponent(appUrl);

  const openShare = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      toast({ title: "Reminder copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Couldn't copy", description: "Please copy manually." });
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Share reminder via</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => openShare(`https://wa.me/?text=${encMsg}`)}>
          <MessageCircle className="h-4 w-4 text-emerald-600" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => openShare(`https://t.me/share/url?url=${encUrl}&text=${encMsg}`)}
        >
          <Send className="h-4 w-4 text-sky-500" />
          Telegram
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openShare(`https://twitter.com/intent/tweet?text=${encMsg}`)}>
          <Share2 className="h-4 w-4 text-foreground" />
          X (Twitter)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => openShare(`https://www.facebook.com/sharer/sharer.php?u=${encUrl}`)}
        >
          <Share2 className="h-4 w-4 text-blue-600" />
          Facebook
        </DropdownMenuItem>
        <p className="px-2 py-1.5 text-[11px] leading-snug text-muted-foreground">
          Facebook only shares the app link, not the full reminder text.
        </p>
        <DropdownMenuItem
          onClick={() =>
            openShare(
              `mailto:?subject=${encodeURIComponent(
                `Loan reminder for ${props.borrowerName}`
              )}&body=${encMsg}`
            )
          }
        >
          <Mail className="h-4 w-4 text-amber-600" />
          Email
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopy}>
          {copied ? (
            <Check className="h-4 w-4 text-emerald-600" />
          ) : (
            <Link2 className="h-4 w-4" />
          )}
          {copied ? "Copied" : "Copy message"}
        </DropdownMenuItem>
        {canNativeShare && (
          <DropdownMenuItem onClick={handleNativeShare}>
            <Share className="h-4 w-4" />
            More…
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
