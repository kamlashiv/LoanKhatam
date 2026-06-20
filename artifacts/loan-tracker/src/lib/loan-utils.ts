export function formatRupees(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const WORD_ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const WORD_TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];

function twoDigitWords(n: number): string {
  if (n < 20) return WORD_ONES[n];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return WORD_TENS[tens] + (ones ? ` ${WORD_ONES[ones]}` : "");
}

function threeDigitWords(n: number): string {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  let out = "";
  if (hundreds) out += `${WORD_ONES[hundreds]} Hundred`;
  if (rest) out += `${out ? " " : ""}${twoDigitWords(rest)}`;
  return out;
}

/** Converts a rupee amount into Indian-system words, e.g. 2500000 → "Twenty Five Lakh Rupees". */
export function rupeesToWords(amount: number): string {
  const n = Math.round(Math.abs(amount));
  if (n === 0) return "Zero Rupees";

  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const hundred = n % 1000;

  const seg = (value: number, label: string) =>
    value ? `${threeDigitWords(value)} ${label} ` : "";

  const words =
    seg(crore, "Crore") +
    seg(lakh, "Lakh") +
    seg(thousand, "Thousand") +
    (hundred ? threeDigitWords(hundred) : "");

  return `${words.trim().replace(/\s+/g, " ")} Rupees`;
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
