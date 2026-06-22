/**
 * Offline snapshot cache.
 *
 * The Android app is a thin Capacitor WebView that loads the live published
 * site. When the device is offline the live site can't load at all, so
 * Capacitor serves `offline.html` (a bundled static page) *under the live
 * site's origin* — which means it shares `localStorage` with the running app.
 *
 * To give the user something useful offline, the running app persists a small,
 * read-only snapshot of the last-seen dashboard summary, loans list, and the
 * detail (including payment history) of recently-viewed loans here, and
 * `public/offline.html` reads it back to render a cached view.
 *
 * Privacy: the snapshot is scoped per Clerk user id and a pointer to the
 * current user is kept separately. On sign-out / account switch the snapshot is
 * cleared (see `clearOfflineSnapshots`), so one user's financial data never
 * renders for the next account on a shared device.
 */

const SNAPSHOT_PREFIX = "ledger:offline:snapshot:";
const CURRENT_KEY = "ledger:offline:current";

export interface OfflineSnapshotLoan {
  id: number;
  borrowerName: string;
  bank: string | null;
  description: string | null;
  principalAmount: number;
  totalPaid: number;
  remainingAmount: number;
  status: string;
  dueDate: string;
}

export interface OfflineSnapshotSummary {
  totalLoans: number;
  activeLoans: number;
  overdueLoans: number;
  paidLoans: number;
  totalLent: number;
  totalCollected: number;
  totalOutstanding: number;
}

export interface OfflineSnapshotRateChange {
  effectiveDate: string;
  newRate: number;
}

export interface OfflineSnapshotPayment {
  id: number;
  amount: number;
  paymentDate: string;
  notes: string | null;
}

export interface OfflineSnapshotLoanDetail {
  id: number;
  borrowerName: string;
  bank: string | null;
  description: string | null;
  principalAmount: number;
  interestRate: number;
  tenureMonths: number | null;
  startDate: string;
  dueDate: string;
  status: string;
  totalPaid: number;
  remainingAmount: number;
  createdAt: string;
  rateChanges: OfflineSnapshotRateChange[];
  payments: OfflineSnapshotPayment[];
  cachedAt: string;
}

export interface OfflineSnapshot {
  userId: string;
  savedAt: string;
  summary: OfflineSnapshotSummary | null;
  loans: OfflineSnapshotLoan[];
  details: OfflineSnapshotLoanDetail[];
}

interface LoanLike {
  id: number;
  borrowerName: string;
  bank?: string | null;
  description?: string | null;
  principalAmount: number;
  totalPaid: number;
  remainingAmount: number;
  status: string;
  dueDate: string;
}

interface RateChangeLike {
  effectiveDate: string;
  newRate: number;
}

interface PaymentLike {
  id: number;
  amount: number;
  paymentDate: string;
  notes?: string | null;
}

interface LoanDetailLike {
  id: number;
  borrowerName: string;
  bank?: string | null;
  description?: string | null;
  principalAmount: number;
  interestRate: number;
  tenureMonths?: number | null;
  startDate: string;
  dueDate: string;
  status: string;
  totalPaid: number;
  remainingAmount: number;
  createdAt: string;
  rateChanges?: RateChangeLike[] | null;
}

/** Cap on how many recently-viewed loan details are retained per user. */
const MAX_CACHED_DETAILS = 20;

function snapshotKey(userId: string): string {
  return `${SNAPSHOT_PREFIX}${userId}`;
}

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage full / unavailable — caching is best-effort */
  }
}

function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function trimLoan(loan: LoanLike): OfflineSnapshotLoan {
  return {
    id: loan.id,
    borrowerName: loan.borrowerName,
    bank: loan.bank ?? null,
    description: loan.description ?? null,
    principalAmount: loan.principalAmount,
    totalPaid: loan.totalPaid,
    remainingAmount: loan.remainingAmount,
    status: loan.status,
    dueDate: loan.dueDate,
  };
}

function trimPayment(payment: PaymentLike): OfflineSnapshotPayment {
  return {
    id: payment.id,
    amount: payment.amount,
    paymentDate: payment.paymentDate,
    notes: payment.notes ?? null,
  };
}

function trimLoanDetail(
  loan: LoanDetailLike,
  payments: PaymentLike[] | null | undefined,
): OfflineSnapshotLoanDetail {
  return {
    id: loan.id,
    borrowerName: loan.borrowerName,
    bank: loan.bank ?? null,
    description: loan.description ?? null,
    principalAmount: loan.principalAmount,
    interestRate: loan.interestRate,
    tenureMonths: loan.tenureMonths ?? null,
    startDate: loan.startDate,
    dueDate: loan.dueDate,
    status: loan.status,
    totalPaid: loan.totalPaid,
    remainingAmount: loan.remainingAmount,
    createdAt: loan.createdAt,
    rateChanges: (loan.rateChanges ?? []).map((rc) => ({
      effectiveDate: rc.effectiveDate,
      newRate: rc.newRate,
    })),
    payments: (payments ?? []).map(trimPayment),
    cachedAt: new Date().toISOString(),
  };
}

function readSnapshot(userId: string): OfflineSnapshot | null {
  const raw = safeGet(snapshotKey(userId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as OfflineSnapshot;
    if (parsed && parsed.userId === userId) {
      if (!Array.isArray(parsed.details)) parsed.details = [];
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Merge the given parts into the current user's snapshot. Only the fields that
 * are provided overwrite the stored snapshot, so persisting the dashboard
 * summary doesn't wipe a previously cached loans list (and vice versa).
 */
export function writeOfflineSnapshot(
  userId: string | null | undefined,
  parts: {
    summary?: OfflineSnapshotSummary | null;
    loans?: LoanLike[] | null;
  },
): void {
  if (!userId) return;
  if (parts.summary == null && (parts.loans == null || parts.loans.length === 0)) {
    return;
  }

  const existing = readSnapshot(userId);
  const next: OfflineSnapshot = {
    userId,
    savedAt: new Date().toISOString(),
    summary: parts.summary ?? existing?.summary ?? null,
    loans:
      parts.loans != null && parts.loans.length > 0
        ? parts.loans.map(trimLoan)
        : existing?.loans ?? [],
    details: existing?.details ?? [],
  };

  safeSet(snapshotKey(userId), JSON.stringify(next));
  safeSet(CURRENT_KEY, userId);
}

/**
 * Cache the detail (including payment history) of a single recently-viewed loan
 * into the current user's snapshot. The most-recently-viewed loans are kept at
 * the front and the list is bounded to `MAX_CACHED_DETAILS`, so opening many
 * loans never grows storage without limit. Leaves the summary and loans list
 * untouched.
 */
export function writeOfflineLoanDetail(
  userId: string | null | undefined,
  loan: LoanDetailLike | null | undefined,
  payments: PaymentLike[] | null | undefined,
): void {
  if (!userId || !loan) return;

  const existing = readSnapshot(userId);
  const detail = trimLoanDetail(loan, payments);
  const prior = (existing?.details ?? []).filter((d) => d.id !== detail.id);
  const nextDetails = [detail, ...prior].slice(0, MAX_CACHED_DETAILS);

  const next: OfflineSnapshot = {
    userId,
    savedAt: existing?.savedAt ?? new Date().toISOString(),
    summary: existing?.summary ?? null,
    loans: existing?.loans ?? [],
    details: nextDetails,
  };

  safeSet(snapshotKey(userId), JSON.stringify(next));
  safeSet(CURRENT_KEY, userId);
}

/**
 * Remove every cached offline snapshot and the current-user pointer. Called on
 * sign-out and account switch so cached financial data never leaks to the next
 * session on a shared device.
 */
export function clearOfflineSnapshots(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key && key.startsWith(SNAPSHOT_PREFIX)) keys.push(key);
    }
    keys.forEach(safeRemove);
  } catch {
    /* ignore */
  }
  safeRemove(CURRENT_KEY);
}
