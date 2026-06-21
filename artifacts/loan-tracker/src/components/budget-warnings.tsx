import { AlertTriangle } from "lucide-react";
import { formatRupees } from "@/lib/loan-utils";

/**
 * Gentle, non-blocking caution shown when a planned monthly contribution
 * (extra EMI, SIP, prepayment, etc.) is larger than the user's estimated
 * monthly surplus from their global financial profile.
 *
 * Renders nothing when the profile isn't set up yet (`active` is false) or
 * when the plan comfortably fits the surplus — so it never nags by default.
 */
export function SurplusCaution({
  planned,
  surplus,
  active,
  noun = "extra payment",
  className = "",
  onUseSafeAmount,
}: {
  planned: number;
  surplus: number;
  /** Whether the profile has enough income/expense data to be meaningful. */
  active: boolean;
  noun?: string;
  className?: string;
  /**
   * Optional handler that, when provided, surfaces a one-tap action to set the
   * contribution to the available monthly surplus (rounded down to whole
   * rupees). Hidden automatically when the surplus is zero or negative.
   */
  onUseSafeAmount?: (amount: number) => void;
}) {
  if (!active || planned <= 0 || planned <= surplus) return null;

  // Round DOWN so the suggested amount never nudges back over the surplus.
  const safeAmount = Math.floor(surplus);
  const showSafeAmount = surplus > 0 && safeAmount > 0 && !!onUseSafeAmount;

  const message =
    surplus > 0 ? (
      <>
        This {noun} of <b>{formatRupees(Math.round(planned))}</b> is about{" "}
        <b>{formatRupees(Math.round(planned - surplus))}</b> more than your estimated monthly
        surplus of <b>{formatRupees(Math.round(surplus))}</b>. Double-check it still fits your
        budget before committing.
      </>
    ) : (
      <>
        Your expenses already meet or exceed your income, so there may be no room for this{" "}
        {noun} of <b>{formatRupees(Math.round(planned))}</b> right now. Consider trimming costs
        first.
      </>
    );

  return (
    <div
      className={`flex items-start gap-2 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 p-3 ${className}`}
    >
      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
      <div className="space-y-2">
        <p className="text-[11px] leading-relaxed text-amber-700/90 dark:text-amber-300/80">
          {message}
        </p>
        {showSafeAmount && (
          <button
            type="button"
            onClick={() => onUseSafeAmount(safeAmount)}
            className="rounded-md bg-amber-100 dark:bg-amber-900/40 px-2.5 py-1.5 text-[11px] font-semibold text-amber-800 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors"
          >
            Use a safe amount ({formatRupees(safeAmount)})
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Friendly alert shown when monthly expenses exceed monthly income (a negative
 * surplus). Renders nothing while the budget is balanced or in surplus.
 */
export function OverspendAlert({
  income,
  expenses,
  active = true,
  className = "",
}: {
  income: number;
  expenses: number;
  /** Whether the profile has enough income/expense data to be meaningful. */
  active?: boolean;
  className?: string;
}) {
  if (!active || expenses <= income) return null;
  const shortfall = expenses - income;

  return (
    <div
      className={`flex items-start gap-4 rounded-[1.5rem] border border-rose-100 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 p-5 ${className}`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-900/40">
        <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
      </div>
      <div>
        <p className="font-bold text-rose-900 dark:text-rose-200">You're spending more than you earn</p>
        <p className="mt-0.5 text-sm font-medium text-rose-700/80 dark:text-rose-300/80">
          Your monthly expenses ({formatRupees(Math.round(expenses))}) are higher than your income (
          {formatRupees(Math.round(income))}) — a shortfall of{" "}
          <b>{formatRupees(Math.round(shortfall))}</b>. Trim a few variable costs or add income to get
          back in the green.
        </p>
      </div>
    </div>
  );
}
