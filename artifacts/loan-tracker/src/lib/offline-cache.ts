/**
 * Offline snapshot cache.
 *
 * The Android app is a thin Capacitor WebView that loads the live published
 * site. When the device is offline the live site can't load at all, so
 * Capacitor serves `offline.html` (a bundled static page) *under the live
 * site's origin* — which means it shares `localStorage` with the running app.
 *
 * To give the user something useful offline, the running app persists a small,
 * read-only snapshot of the last-seen dashboard summary and loans here, and
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

export interface OfflineSnapshot {
  userId: string;
  savedAt: string;
  summary: OfflineSnapshotSummary | null;
  loans: OfflineSnapshotLoan[];
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

function readSnapshot(userId: string): OfflineSnapshot | null {
  const raw = safeGet(snapshotKey(userId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as OfflineSnapshot;
    if (parsed && parsed.userId === userId) return parsed;
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
