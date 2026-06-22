/**
 * @jest-environment jsdom
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import {
  writeOfflineSnapshot,
  writeOfflineLoanDetail,
  clearOfflineSnapshots,
  type OfflineSnapshot,
} from "@/lib/offline-cache";

const CURRENT_KEY = "ledger:offline:current";
const SNAPSHOT_PREFIX = "ledger:offline:snapshot:";

const summary = {
  totalLoans: 3,
  activeLoans: 1,
  overdueLoans: 1,
  paidLoans: 1,
  totalLent: 425000,
  totalCollected: 85000,
  totalOutstanding: 340000,
};

const loans = [
  {
    id: 1,
    borrowerName: "Mohan Kumar",
    bank: "HDFC",
    description: "Car repair",
    principalAmount: 120000,
    totalPaid: 0,
    remainingAmount: 120000,
    status: "overdue",
    dueDate: "2026-06-17",
  },
  {
    id: 2,
    borrowerName: "Sneha Joshi",
    bank: null,
    description: "Rent share",
    principalAmount: 85000,
    totalPaid: 85000,
    remainingAmount: 0,
    status: "paid",
    dueDate: "2026-06-21",
  },
];

const loanDetail = {
  id: 1,
  userId: "user_a",
  borrowerName: "Mohan Kumar",
  bank: "HDFC",
  description: "Car repair",
  principalAmount: 120000,
  interestRate: 12,
  tenureMonths: 24,
  startDate: "2025-06-17",
  dueDate: "2026-06-17",
  status: "overdue",
  totalPaid: 30000,
  remainingAmount: 90000,
  createdAt: "2025-06-17T00:00:00.000Z",
  rateChanges: [{ effectiveDate: "2025-12-01", newRate: 13 }],
};

const detailPayments = [
  { id: 11, loanId: 1, amount: 20000, paymentDate: "2025-07-17", notes: "First EMI", createdAt: "x" },
  { id: 12, loanId: 1, amount: 10000, paymentDate: "2025-08-17", notes: null, createdAt: "x" },
];

function readSnapshot(userId: string): OfflineSnapshot | null {
  const raw = localStorage.getItem(SNAPSHOT_PREFIX + userId);
  return raw ? (JSON.parse(raw) as OfflineSnapshot) : null;
}

beforeEach(() => {
  localStorage.clear();
});

describe("offline-cache write/clear", () => {
  it("persists a per-user snapshot and a current-user pointer", () => {
    writeOfflineSnapshot("user_a", { summary, loans });

    expect(localStorage.getItem(CURRENT_KEY)).toBe("user_a");
    const snap = readSnapshot("user_a");
    expect(snap?.userId).toBe("user_a");
    expect(snap?.summary?.totalLent).toBe(425000);
    expect(snap?.loans).toHaveLength(2);
    expect(snap?.loans[0].borrowerName).toBe("Mohan Kumar");
    expect(typeof snap?.savedAt).toBe("string");
  });

  it("trims loans to only the fields the offline view needs", () => {
    writeOfflineSnapshot("user_a", {
      summary: null,
      loans: [{ ...loans[0], userId: "user_a", interestRate: 12, secret: "x" } as never],
    });
    const snap = readSnapshot("user_a");
    expect(snap?.loans[0]).not.toHaveProperty("userId");
    expect(snap?.loans[0]).not.toHaveProperty("interestRate");
    expect(snap?.loans[0]).not.toHaveProperty("secret");
  });

  it("merges parts so a summary-only write keeps cached loans (and vice versa)", () => {
    writeOfflineSnapshot("user_a", { loans });
    writeOfflineSnapshot("user_a", { summary });
    const snap = readSnapshot("user_a");
    expect(snap?.summary?.totalLent).toBe(425000);
    expect(snap?.loans).toHaveLength(2);
  });

  it("ignores empty writes and missing user ids", () => {
    writeOfflineSnapshot(null, { summary, loans });
    writeOfflineSnapshot("user_a", { summary: null, loans: [] });
    expect(localStorage.getItem(CURRENT_KEY)).toBeNull();
  });

  it("clears every snapshot and the pointer on sign-out / account switch", () => {
    writeOfflineSnapshot("user_a", { summary, loans });
    writeOfflineSnapshot("user_b", { summary, loans });
    clearOfflineSnapshots();
    expect(localStorage.getItem(CURRENT_KEY)).toBeNull();
    expect(readSnapshot("user_a")).toBeNull();
    expect(readSnapshot("user_b")).toBeNull();
  });
});

describe("offline-cache loan detail", () => {
  it("caches a loan detail with its payment history and trims server-only fields", () => {
    writeOfflineLoanDetail("user_a", loanDetail, detailPayments);
    const snap = readSnapshot("user_a");
    expect(snap?.details).toHaveLength(1);
    const d = snap!.details[0];
    expect(d.id).toBe(1);
    expect(d.interestRate).toBe(12);
    expect(d.tenureMonths).toBe(24);
    expect(d).not.toHaveProperty("userId");
    expect(d.rateChanges).toEqual([{ effectiveDate: "2025-12-01", newRate: 13 }]);
    expect(d.payments).toHaveLength(2);
    expect(d.payments[0].notes).toBe("First EMI");
    expect(d.payments[1].notes).toBeNull();
    expect(typeof d.cachedAt).toBe("string");
  });

  it("does not wipe the summary / loans list when caching a detail (and vice versa)", () => {
    writeOfflineSnapshot("user_a", { summary, loans });
    writeOfflineLoanDetail("user_a", loanDetail, detailPayments);
    const snap = readSnapshot("user_a");
    expect(snap?.summary?.totalLent).toBe(425000);
    expect(snap?.loans).toHaveLength(2);
    expect(snap?.details).toHaveLength(1);

    writeOfflineSnapshot("user_a", { summary });
    expect(readSnapshot("user_a")?.details).toHaveLength(1);
  });

  it("keeps the most-recently-viewed detail at the front and dedupes by id", () => {
    writeOfflineLoanDetail("user_a", loanDetail, detailPayments);
    writeOfflineLoanDetail("user_a", { ...loanDetail, id: 2, borrowerName: "Sneha" }, []);
    writeOfflineLoanDetail("user_a", { ...loanDetail, totalPaid: 50000 }, detailPayments);

    const snap = readSnapshot("user_a");
    expect(snap?.details).toHaveLength(2);
    expect(snap?.details[0].id).toBe(1);
    expect(snap?.details[0].totalPaid).toBe(50000);
    expect(snap?.details[1].id).toBe(2);
  });

  it("bounds the cached-detail list to 20 entries", () => {
    for (let i = 1; i <= 25; i += 1) {
      writeOfflineLoanDetail("user_a", { ...loanDetail, id: i }, []);
    }
    const snap = readSnapshot("user_a");
    expect(snap?.details).toHaveLength(20);
    // newest (id 25) is first; oldest retained is id 6.
    expect(snap?.details[0].id).toBe(25);
    expect(snap?.details[snap!.details.length - 1].id).toBe(6);
  });

  it("ignores missing user id or loan", () => {
    writeOfflineLoanDetail(null, loanDetail, detailPayments);
    writeOfflineLoanDetail("user_a", null, detailPayments);
    expect(localStorage.getItem(CURRENT_KEY)).toBeNull();
  });

  it("drops cached details on sign-out", () => {
    writeOfflineLoanDetail("user_a", loanDetail, detailPayments);
    clearOfflineSnapshots();
    expect(readSnapshot("user_a")).toBeNull();
  });
});

describe("offline.html rendering", () => {
  const html = readFileSync(
    resolve(__dirname, "../../../public/offline.html"),
    "utf8",
  );
  const bodyInner = /<body>([\s\S]*?)<\/body>/.exec(html)![1];
  const script = /<script>([\s\S]*?)<\/script>/.exec(bodyInner)![1];
  const markup = bodyInner.replace(/<script>[\s\S]*?<\/script>/, "");

  function runOffline() {
    document.body.innerHTML = markup;
    // eslint-disable-next-line no-new-func
    new Function(script)();
  }

  it("renders the cached snapshot view with stats and loans when data exists", () => {
    writeOfflineSnapshot("user_a", { summary, loans });
    localStorage.setItem(CURRENT_KEY, "user_a");
    runOffline();

    expect(document.getElementById("cachedView")!.hidden).toBe(false);
    expect(document.getElementById("emptyView")!.hidden).toBe(true);

    const text = document.getElementById("cachedView")!.textContent ?? "";
    expect(text).toContain("Offline — viewing cached data");
    expect(text).toContain("Mohan Kumar");
    expect(text).toContain("Sneha Joshi");
    // Indian-rupee formatting of the total lent.
    expect(text).toContain("4,25,000");
    // Status pills.
    expect(text).toContain("Overdue");
    expect(text).toContain("Paid");
  });

  it("escapes borrower-supplied text to prevent HTML injection", () => {
    writeOfflineSnapshot("user_a", {
      summary,
      loans: [{ ...loans[0], borrowerName: "<img src=x onerror=alert(1)>" }],
    });
    localStorage.setItem(CURRENT_KEY, "user_a");
    runOffline();

    expect(document.querySelector("#cachedView img")).toBeNull();
    expect(document.getElementById("cachedView")!.textContent).toContain(
      "<img src=x onerror=alert(1)>",
    );
  });

  it("falls back to the plain offline screen when there is no cached data", () => {
    runOffline();
    expect(document.getElementById("emptyView")!.hidden).toBe(false);
    expect(document.getElementById("cachedView")!.hidden).toBe(true);
  });

  it("does not show cached data after sign-out clears the snapshot", () => {
    writeOfflineSnapshot("user_a", { summary, loans });
    clearOfflineSnapshots();
    runOffline();
    expect(document.getElementById("emptyView")!.hidden).toBe(false);
    expect(document.getElementById("cachedView")!.hidden).toBe(true);
  });

  it("opens a cached loan's detail with payment history on tap, then returns to the list", () => {
    writeOfflineSnapshot("user_a", { summary, loans });
    writeOfflineLoanDetail("user_a", loanDetail, detailPayments);
    localStorage.setItem(CURRENT_KEY, "user_a");
    runOffline();

    const row = document.querySelector<HTMLElement>(".loan.tappable[data-loan-id='1']");
    expect(row).not.toBeNull();
    row!.click();

    expect(document.getElementById("detailView")!.hidden).toBe(false);
    expect(document.getElementById("cachedView")!.hidden).toBe(true);
    const detailText = document.getElementById("detailView")!.textContent ?? "";
    expect(detailText).toContain("Mohan Kumar");
    expect(detailText).toContain("Payment History");
    expect(detailText).toContain("First EMI");
    // current effective rate from rate change (13%) is shown
    expect(detailText).toContain("13% p.a.");

    document.getElementById("detailBack")!.click();
    expect(document.getElementById("detailView")!.hidden).toBe(true);
    expect(document.getElementById("cachedView")!.hidden).toBe(false);
  });

  it("marks loans without a cached detail as non-tappable", () => {
    writeOfflineSnapshot("user_a", { summary, loans });
    localStorage.setItem(CURRENT_KEY, "user_a");
    runOffline();

    expect(document.querySelector(".loan.tappable")).toBeNull();
    expect(document.getElementById("cachedView")!.textContent).toContain(
      "Open this loan online to cache its details",
    );
  });

  it("escapes payment notes in the cached detail view", () => {
    writeOfflineSnapshot("user_a", { summary, loans });
    writeOfflineLoanDetail("user_a", loanDetail, [
      { id: 99, loanId: 1, amount: 5000, paymentDate: "2025-09-01", notes: "<img src=x onerror=alert(1)>", createdAt: "x" },
    ]);
    localStorage.setItem(CURRENT_KEY, "user_a");
    runOffline();

    document.querySelector<HTMLElement>(".loan.tappable[data-loan-id='1']")!.click();
    expect(document.querySelector("#detailView img")).toBeNull();
    expect(document.getElementById("detailView")!.textContent).toContain(
      "<img src=x onerror=alert(1)>",
    );
  });
});
