import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { getFormatConfig, formatDateValue } from "./format-config"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  const { locale, currency } = getFormatConfig();
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
}

export function formatDate(dateString: string) {
  return formatDateValue(dateString);
}
