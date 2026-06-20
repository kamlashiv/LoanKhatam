import { Check, Loader2, CloudOff, Cloud } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SaveStatus } from "@/lib/profile";

function formatUpdated(iso: string | null): string {
  if (!iso) return "Not saved yet";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Not saved yet";
  const time = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const date = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  return `Last updated ${date}, ${time}`;
}

export function SaveIndicator({
  status,
  updatedAt,
  className,
}: {
  status: SaveStatus;
  updatedAt: string | null;
  className?: string;
}) {
  let icon: React.ReactNode;
  let text: string;
  let tone = "text-slate-500 dark:text-slate-400";

  if (status === "saving") {
    icon = <Loader2 className="h-3.5 w-3.5 animate-spin" />;
    text = "Saving…";
  } else if (status === "error") {
    icon = <CloudOff className="h-3.5 w-3.5" />;
    text = "Couldn't save";
    tone = "text-rose-600 dark:text-rose-400";
  } else if (status === "saved") {
    icon = <Check className="h-3.5 w-3.5" />;
    text = formatUpdated(updatedAt);
    tone = "text-emerald-600 dark:text-emerald-400";
  } else {
    icon = <Cloud className="h-3.5 w-3.5" />;
    text = formatUpdated(updatedAt);
  }

  return (
    <div
      className={cn("flex items-center gap-1.5 text-xs font-medium", tone, className)}
      aria-live="polite"
    >
      {icon}
      <span>{text}</span>
    </div>
  );
}
