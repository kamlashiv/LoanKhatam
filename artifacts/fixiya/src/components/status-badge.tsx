import { RequestStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const STYLES: Record<RequestStatus, string> = {
  Pending: "bg-amber-100 text-amber-700",
  Assigned: "bg-blue-100 text-blue-700",
  "In Progress": "bg-primary/10 text-primary",
  Completed: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-rose-100 text-rose-700",
};

export function StatusBadge({
  status,
  className,
}: {
  status: RequestStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        STYLES[status],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
