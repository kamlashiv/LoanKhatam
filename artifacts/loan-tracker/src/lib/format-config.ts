/**
 * Runtime-configurable formatting. The PreferencesProvider pushes the user's
 * saved currency / locale / date-format into this module-level config, so the
 * pure `formatCurrency` / `formatDate` helpers used across the app respect the
 * user's preferences without threading context through every call site.
 */

export type DateFormat = "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";

export interface FormatConfig {
  currency: string;
  locale: string;
  dateFormat: DateFormat;
}

const DEFAULT_CONFIG: FormatConfig = {
  currency: "INR",
  locale: "en-IN",
  dateFormat: "DD/MM/YYYY",
};

let config: FormatConfig = { ...DEFAULT_CONFIG };

export function setFormatConfig(next: Partial<FormatConfig>): void {
  config = { ...config, ...next };
}

export function getFormatConfig(): FormatConfig {
  return config;
}

function parseDateInput(input: string): Date | null {
  if (!input) return null;
  const ymd = /^(\d{4})-(\d{2})-(\d{2})/.exec(input);
  if (ymd) {
    return new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]));
  }
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Formats a date string (YYYY-MM-DD or ISO) using the user's chosen format. */
export function formatDateValue(input: string | Date): string {
  if (!input) return "";
  const d = typeof input === "string" ? parseDateInput(input) : input;
  if (!d || Number.isNaN(d.getTime())) {
    return typeof input === "string" ? input : "";
  }
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = String(d.getFullYear());
  switch (config.dateFormat) {
    case "MM/DD/YYYY":
      return `${mm}/${dd}/${yyyy}`;
    case "YYYY-MM-DD":
      return `${yyyy}-${mm}-${dd}`;
    default:
      return `${dd}/${mm}/${yyyy}`;
  }
}
