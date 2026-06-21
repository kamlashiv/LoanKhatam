// Per-month review state for an averaged expense category in the statement
// import flow: the (editable) amount as a string and whether the user has
// excluded that month from the average.
export type MonthState = { value: string; excluded: boolean };

// The average of the months a user has kept. Excluded months are dropped and
// blank inputs are ignored; an explicit 0 counts as zero spend for that month.
// Negative or non-numeric values are ignored. Returns null when no usable month
// remains. Rounding matches the extractor's aggregateExpense so applied values
// stay consistent with the original average.
export function averageMonths(
  rec: Record<string, MonthState> | undefined,
): number | null {
  if (!rec) return null;
  const vals = Object.values(rec)
    .filter((s) => !s.excluded)
    .map((s) => s.value.trim())
    .filter((v) => v !== "")
    .map((v) => Number(v))
    .filter((n) => Number.isFinite(n) && n >= 0);
  if (!vals.length) return null;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}
