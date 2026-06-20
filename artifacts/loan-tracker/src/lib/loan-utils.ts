export function formatRupees(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

export function getLoanStatusConfig(status: string) {
  switch (status) {
    case "active":
      return {
        label: "Active",
        bg: "bg-indigo-50",
        text: "text-indigo-700",
        border: "border-indigo-200",
      };
    case "overdue":
      return {
        label: "Overdue",
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
      };
    case "paid":
      return {
        label: "Paid",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
      };
    default:
      return {
        label: status,
        bg: "bg-muted",
        text: "text-muted-foreground",
        border: "border-border",
      };
  }
}
