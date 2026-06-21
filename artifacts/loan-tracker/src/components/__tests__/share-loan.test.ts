import { buildShareMessage } from "../share-loan";

describe("buildShareMessage", () => {
  it("includes borrower, amounts, due date, and bank", () => {
    const msg = buildShareMessage({
      borrowerName: "Asha",
      principalAmount: 200000,
      remainingAmount: 50000,
      dueDate: "2026-01-12",
      bank: "HDFC Bank",
    });
    expect(msg).toContain("Loan reminder for Asha");
    expect(msg).toContain("Outstanding:");
    expect(msg).toContain("Due date: 12/01/2026");
    expect(msg).toContain("Bank: HDFC Bank");
    expect(msg).toContain("Loan Tracker");
  });

  it("omits the bank line when no bank is set", () => {
    const msg = buildShareMessage({
      borrowerName: "Ravi",
      principalAmount: 100000,
      remainingAmount: 100000,
      dueDate: "2026-03-01",
      bank: null,
    });
    expect(msg).not.toContain("Bank:");
  });

  it("omits the due-date line when no due date is set", () => {
    const msg = buildShareMessage({
      borrowerName: "Neha",
      principalAmount: 75000,
      remainingAmount: 25000,
      dueDate: "",
    });
    expect(msg).not.toContain("Due date:");
  });

  it("produces a value safe to URL-encode for share intents", () => {
    const msg = buildShareMessage({
      borrowerName: "A & B",
      principalAmount: 100000,
      remainingAmount: 100000,
      dueDate: "2026-03-01",
    });
    const encoded = encodeURIComponent(msg);
    expect(decodeURIComponent(encoded)).toBe(msg);
    expect(encoded).not.toContain(" ");
  });
});
