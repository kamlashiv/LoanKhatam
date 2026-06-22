/**
 * @jest-environment jsdom
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import {
  writeOfflineSnapshot,
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
});
