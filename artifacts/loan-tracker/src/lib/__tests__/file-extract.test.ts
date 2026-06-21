import {
  parseAmount,
  parseRate,
  normalizeDate,
  fromJSON,
  fromCSV,
  fromText,
  extractFromFile,
  profileFromText,
  profileFromJSON,
  profileFromCSV,
  extractProfileFromFile,
} from "../file-extract";

function makeFile(content: string, name: string, type: string): File {
  return new File([content], name, { type });
}

describe("parseAmount", () => {
  it("returns finite numbers unchanged and rejects non-finite ones", () => {
    expect(parseAmount(50000)).toBe(50000);
    expect(parseAmount(0)).toBe(0);
    expect(parseAmount(NaN)).toBeNull();
    expect(parseAmount(Infinity)).toBeNull();
  });

  it("returns null for nullish or empty input", () => {
    expect(parseAmount(null)).toBeNull();
    expect(parseAmount(undefined)).toBeNull();
    expect(parseAmount("")).toBeNull();
    expect(parseAmount("   ")).toBeNull();
  });

  it("parses plain numeric strings with commas", () => {
    expect(parseAmount("50000")).toBe(50000);
    expect(parseAmount("1,00,000")).toBe(100000);
    expect(parseAmount("12,345.67")).toBe(12346);
  });

  it("strips ₹, Rs and INR prefixes", () => {
    expect(parseAmount("₹50000")).toBe(50000);
    expect(parseAmount("Rs. 75,000")).toBe(75000);
    expect(parseAmount("Rs 1,200")).toBe(1200);
    expect(parseAmount("INR 9999")).toBe(9999);
  });

  it("applies lakh multiplier", () => {
    expect(parseAmount("2 lakh")).toBe(200000);
    expect(parseAmount("1.5 lakh")).toBe(150000);
    expect(parseAmount("3 lac")).toBe(300000);
    expect(parseAmount("2 l")).toBe(200000);
  });

  it("applies crore multiplier", () => {
    expect(parseAmount("1 crore")).toBe(10000000);
    expect(parseAmount("2.5 crore")).toBe(25000000);
    expect(parseAmount("1 cr")).toBe(10000000);
  });

  it("combines currency prefix with multiplier", () => {
    expect(parseAmount("₹2 lakh")).toBe(200000);
    expect(parseAmount("Rs. 1.2 crore")).toBe(12000000);
  });

  it("returns null when the parsed number is zero", () => {
    expect(parseAmount("0")).toBeNull();
    expect(parseAmount("₹0")).toBeNull();
  });
});

describe("parseRate", () => {
  it("returns finite numbers unchanged within range", () => {
    expect(parseRate(12)).toBe(12);
    expect(parseRate(7.5)).toBe(7.5);
  });

  it("returns null for nullish input", () => {
    expect(parseRate(null)).toBeNull();
    expect(parseRate(undefined)).toBeNull();
  });

  it("parses numeric strings stripping the percent sign", () => {
    expect(parseRate("12%")).toBe(12);
    expect(parseRate("7.5%")).toBe(7.5);
    expect(parseRate("9 %")).toBe(9);
  });

  it("rejects string rates that are zero, negative, or over 100", () => {
    expect(parseRate("0%")).toBeNull();
    expect(parseRate("150%")).toBeNull();
  });

  it("returns null when a string has no usable digits", () => {
    // dots from "p.a." corrupt the number, yielding NaN -> null
    expect(parseRate("rate p.a.")).toBeNull();
  });

  it("passes finite numeric input through without range checks", () => {
    // The numeric branch returns finite numbers as-is; range limits only
    // apply to string parsing.
    expect(parseRate(0)).toBe(0);
    expect(parseRate(101)).toBe(101);
  });

  it("accepts the boundary value of exactly 100 from a string", () => {
    expect(parseRate("100%")).toBe(100);
  });
});

describe("normalizeDate", () => {
  it("returns null for nullish or empty input", () => {
    expect(normalizeDate(null)).toBeNull();
    expect(normalizeDate(undefined)).toBeNull();
    expect(normalizeDate("")).toBeNull();
  });

  it("parses ISO YYYY-MM-DD format", () => {
    expect(normalizeDate("2025-01-12")).toBe("2025-01-12");
    expect(normalizeDate("2025/3/5")).toBe("2025-03-05");
  });

  it("treats slash/dash numeric dates as day-first (DD/MM/YYYY)", () => {
    expect(normalizeDate("12/01/2025")).toBe("2025-01-12");
    expect(normalizeDate("05-03-2025")).toBe("2025-03-05");
  });

  it("expands two-digit years to 2000s", () => {
    expect(normalizeDate("12/01/25")).toBe("2025-01-12");
  });

  it("swaps to MM/DD when the first group cannot be a day", () => {
    // 13 cannot be a month, so 01/13 stays DD=13? first group 01 day, 13 month>12 -> swap
    expect(normalizeDate("01/13/2025")).toBe("2025-01-13");
  });

  it("swaps when the day group exceeds 31 but month group is valid", () => {
    // 2025 as first triggers ISO branch; use a swap case for the DD/MM branch
    expect(normalizeDate("31/05/2025")).toBe("2025-05-31");
  });

  it("parses textual month dates like '12 Jan 2025'", () => {
    expect(normalizeDate("12 Jan 2025")).toBe("2025-01-12");
    expect(normalizeDate("5 December 2024")).toBe("2024-12-05");
  });

  it("returns null for unparseable or out-of-range dates", () => {
    expect(normalizeDate("not a date")).toBeNull();
    expect(normalizeDate("2025-13-40")).toBeNull();
    expect(normalizeDate("99/99/2025")).toBeNull();
  });
});

describe("fromJSON", () => {
  it("maps canonical keys", () => {
    const json = JSON.stringify({
      borrowerName: "Asha",
      principalAmount: "₹2 lakh",
      interestRate: "12%",
      startDate: "12/01/2025",
      dueDate: "12/01/2026",
      description: "Home repair",
    });
    expect(fromJSON(json)).toEqual({
      borrowerName: "Asha",
      principalAmount: 200000,
      interestRate: 12,
      startDate: "2025-01-12",
      dueDate: "2026-01-12",
      description: "Home repair",
    });
  });

  it("maps key aliases case-insensitively", () => {
    const json = JSON.stringify({
      Borrower: "Ravi",
      "Loan Amount": "50,000",
      ROI: "8.5%",
      Disbursal_Date: "2025-02-01",
      Maturity: "2026-02-01",
      Remarks: "Bike loan",
    });
    expect(fromJSON(json)).toEqual({
      borrowerName: "Ravi",
      principalAmount: 50000,
      interestRate: 8.5,
      startDate: "2025-02-01",
      dueDate: "2026-02-01",
      description: "Bike loan",
    });
  });

  it("uses the first element when given an array", () => {
    const json = JSON.stringify([{ name: "Meera", amount: "1 lakh" }, { name: "Other" }]);
    const out = fromJSON(json);
    expect(out.borrowerName).toBe("Meera");
    expect(out.principalAmount).toBe(100000);
  });

  it("returns nulls for missing fields", () => {
    expect(fromJSON("{}")).toEqual({
      borrowerName: null,
      principalAmount: null,
      interestRate: null,
      startDate: null,
      dueDate: null,
      description: null,
    });
  });

  it("throws when there is no object", () => {
    expect(() => fromJSON("null")).toThrow();
    expect(() => fromJSON("42")).toThrow();
  });
});

describe("fromCSV", () => {
  it("maps the first data row using header aliases", () => {
    const csv = "Borrower,Amount,Rate,Start,Due,Purpose\nNeha,75000,9%,01/03/2025,01/03/2026,Education";
    expect(fromCSV(csv)).toEqual({
      borrowerName: "Neha",
      principalAmount: 75000,
      interestRate: 9,
      startDate: "2025-03-01",
      dueDate: "2026-03-01",
      description: "Education",
    });
  });

  it("handles quoted fields containing commas", () => {
    const csv = 'name,amount,description\n"Sharma, Vijay","1,50,000","Loan for ""shop"" setup"';
    const out = fromCSV(csv);
    expect(out.borrowerName).toBe("Sharma, Vijay");
    expect(out.principalAmount).toBe(150000);
    expect(out.description).toBe('Loan for "shop" setup');
  });

  it("throws when there is no data row", () => {
    expect(() => fromCSV("name,amount")).toThrow();
  });
});

describe("fromText", () => {
  it("extracts a labelled principal amount with multiplier", () => {
    const out = fromText("Principal: Rs. 2 lakh disbursed to the borrower.");
    expect(out.principalAmount).toBe(200000);
  });

  it("falls back to the first currency amount when unlabelled", () => {
    const out = fromText("The agreed sum is ₹45,000 only.");
    expect(out.principalAmount).toBe(45000);
  });

  it("annualises a monthly interest rate", () => {
    const out = fromText("Interest charged at 2% per month on the balance.");
    expect(out.interestRate).toBe(24);
  });

  it("keeps an annual interest rate as-is", () => {
    const out = fromText("Interest rate is 12% per annum.");
    expect(out.interestRate).toBe(12);
  });

  it("does not annualise a monthly rate when result would exceed 100", () => {
    const out = fromText("Rate of 9% per month applies.");
    expect(out.interestRate).toBe(9);
  });

  it("assigns dates by label proximity", () => {
    const out = fromText("Start date: 12/01/2025. Due date: 12/01/2026.");
    expect(out.startDate).toBe("2025-01-12");
    expect(out.dueDate).toBe("2026-01-12");
  });

  it("falls back to sorted dates when labels are absent", () => {
    const out = fromText("Agreement dated 01/01/2025 and 31/12/2025.");
    expect(out.startDate).toBe("2025-01-01");
    expect(out.dueDate).toBe("2025-12-31");
  });

  it("extracts the borrower name from a label", () => {
    const out = fromText("Borrower: Ramesh Kumar\nAmount due soon.");
    expect(out.borrowerName).toBe("Ramesh Kumar");
  });

  it("returns all-null when nothing matches", () => {
    const out = fromText("This document contains no loan details whatsoever.");
    expect(out.principalAmount).toBeNull();
    expect(out.interestRate).toBeNull();
    expect(out.startDate).toBeNull();
    expect(out.dueDate).toBeNull();
    expect(out.borrowerName).toBeNull();
  });

  it("ignores fee/GST percentages and picks the labelled interest rate", () => {
    expect(fromText("Processing fee of 2% and interest rate of 14% per annum.").interestRate).toBe(14);
    expect(fromText("GST 18% applies. Loan interest 11% p.a.").interestRate).toBe(11);
    expect(fromText("Late payment charge 5%. Rate of interest: 9%.").interestRate).toBe(9);
  });

  it("prefers a strong principal label over an earlier EMI/amount figure", () => {
    const out = fromText("EMI amount Rs. 5,000 monthly. Principal amount Rs. 2,00,000.");
    expect(out.principalAmount).toBe(200000);
  });

  it("reads a principal label sitting away from the figure", () => {
    expect(fromText("Loan Amount (Sanctioned): Rs. 5,00,000 /-").principalAmount).toBe(500000);
  });

  it("does not read a percentage figure as the principal amount", () => {
    expect(fromText("Amount charged at 5% interest.").principalAmount).toBeNull();
  });

  it("recognises extra borrower-name label variants", () => {
    expect(fromText("Name of Borrower: Sunita Devi\n").borrowerName).toBe("Sunita Devi");
    expect(fromText("Debtor: Mohan Lal\n").borrowerName).toBe("Mohan Lal");
  });

  it("trims trailing field labels that bleed into the name", () => {
    expect(fromText("Borrower: Ramesh Kumar Loan Amount Rs. 50000").borrowerName).toBe("Ramesh Kumar");
  });
});

describe("extractFromFile — confidence scoring & notes", () => {
  it("scores 4+ extracted fields as high and lists them in the notes", async () => {
    const json = JSON.stringify({
      borrowerName: "Asha",
      principalAmount: "₹2 lakh",
      interestRate: "12%",
      startDate: "12/01/2025",
      dueDate: "12/01/2026",
    });
    const out = await extractFromFile(makeFile(json, "loan.json", "application/json"));
    expect(out.confidence).toBe("high");
    expect(out.notes).toContain("Extracted from JSON");
    expect(out.notes).toContain("amount");
    expect(out.notes).toContain("name");
  });

  it("scores 2-3 extracted fields as medium", async () => {
    const json = JSON.stringify({ borrowerName: "Ravi", principalAmount: "50000" });
    const out = await extractFromFile(makeFile(json, "loan.json", "application/json"));
    expect(out.confidence).toBe("medium");
    expect(out.notes).toContain("Extracted from JSON");
  });

  it("scores 0-1 extracted fields as low", async () => {
    const json = JSON.stringify({ borrowerName: "Solo" });
    const out = await extractFromFile(makeFile(json, "loan.json", "application/json"));
    expect(out.confidence).toBe("low");
  });

  it("reports no details found when nothing is extracted", async () => {
    const json = JSON.stringify({ unrelated: "value" });
    const out = await extractFromFile(makeFile(json, "loan.json", "application/json"));
    expect(out.confidence).toBe("low");
    expect(out.notes).toContain("No loan details found");
  });

  it("scores CSV input and labels the source", async () => {
    const csv = "Borrower,Amount,Rate,Start,Due\nNeha,75000,9%,01/03/2025,01/03/2026";
    const out = await extractFromFile(makeFile(csv, "loan.csv", "text/csv"));
    expect(out.confidence).toBe("high");
    expect(out.notes).toContain("Extracted from CSV");
  });

  it("annualises a monthly text rate and reflects it in confidence/notes", async () => {
    const text = "Principal: Rs. 2 lakh at 2% per month.";
    const out = await extractFromFile(makeFile(text, "loan.txt", "text/plain"));
    expect(out.interestRate).toBe(24);
    expect(out.principalAmount).toBe(200000);
    expect(out.confidence).toBe("medium");
    expect(out.notes).toContain("Extracted from Text");
    expect(out.notes).toContain("rate");
  });

  it("rejects unsupported file types", async () => {
    await expect(
      extractFromFile(makeFile("data", "loan.xyz", "application/octet-stream"))
    ).rejects.toThrow("Unsupported file");
  });
});

describe("profileFromText", () => {
  it("prefers net pay over gross from a salary slip", () => {
    const text =
      "Employee Name: Anita Sharma\nGross Salary: Rs. 1,20,000\nNet Pay: Rs. 95,000";
    const out = profileFromText(text);
    expect(out.name).toBe("Anita Sharma");
    expect(out.monthlyIncome).toBe(95000);
  });

  it("falls back to gross when no net pay is present", () => {
    const out = profileFromText("Gross Salary Rs. 80,000 for the month");
    expect(out.monthlyIncome).toBe(80000);
  });

  it("extracts recurring expenses from a bank statement", () => {
    const text = [
      "House Rent: Rs. 25,000",
      "Electricity Bill: Rs. 2,400",
      "Broadband: Rs. 999",
      "Insurance Premium: Rs. 3,500",
      "Groceries: Rs. 8,000",
      "Petrol: Rs. 4,000",
    ].join("\n");
    const out = profileFromText(text);
    expect(out.rent).toBe(25000);
    expect(out.utilities).toBe(2400);
    expect(out.internet).toBe(999);
    expect(out.insurance).toBe(3500);
    expect(out.food).toBe(8000);
    expect(out.fuel).toBe(4000);
  });

  it("extracts the newer recurring-expense categories from a bank statement", () => {
    const text = [
      "School Fee: Rs. 12,000",
      "Netflix: Rs. 649",
      "Gym Membership: Rs. 1,500",
      "Apollo Pharmacy: Rs. 2,200",
    ].join("\n");
    const out = profileFromText(text);
    expect(out.schoolFees).toBe(12000);
    // Netflix + gym both fall under the subscriptions/entertainment bucket.
    expect(out.entertainment).toBe(2149);
    expect(out.medical).toBe(2200);
  });

  it("averages the newer categories across the months a statement spans", () => {
    const text = [
      "05/01/2025 Tuition Fee Rs. 10,000",
      "06/01/2025 Spotify Rs. 200",
      "07/01/2025 Hospital Rs. 4,000",
      "05/02/2025 Tuition Fee Rs. 10,000",
      "06/02/2025 Spotify Rs. 200",
      "07/02/2025 Hospital Rs. 2,000",
    ].join("\n");
    const out = profileFromText(text);
    expect(out.schoolFees).toBe(10000);
    expect(out.entertainment).toBe(200);
    expect(out.medical).toBe(3000);
  });

  it("returns all-null when nothing relevant is present", () => {
    const out = profileFromText("This document has no financial figures.");
    expect(out.monthlyIncome).toBeNull();
    expect(out.rent).toBeNull();
    expect(out.name).toBeNull();
    expect(out.schoolFees).toBeNull();
    expect(out.entertainment).toBeNull();
    expect(out.medical).toBeNull();
  });

  it("sums repeated category amounts within a single month", () => {
    // No dates -> treated as one month, so all groceries sum together.
    const text = [
      "Groceries Big Basket Rs. 3,000",
      "Groceries supermarket Rs. 2,500",
      "Swiggy Rs. 1,500",
    ].join("\n");
    expect(profileFromText(text).food).toBe(7000);
  });

  it("averages a category across the months a statement spans", () => {
    // Rent of 25,000 in Jan and 25,000 in Feb averages to 25,000;
    // groceries 8,000 (Jan) + 6,000 (Feb) averages to 7,000.
    const text = [
      "05/01/2025 House Rent Rs. 25,000",
      "10/01/2025 Groceries Rs. 8,000",
      "05/02/2025 House Rent Rs. 25,000",
      "11/02/2025 Groceries Rs. 6,000",
    ].join("\n");
    const out = profileFromText(text);
    expect(out.rent).toBe(25000);
    expect(out.food).toBe(7000);
  });

  it("does not divide a once-paid expense by the full statement span", () => {
    // Rent appears in only one month even though the statement spans two, so
    // it should not be diluted by the empty month.
    const text = [
      "05/01/2025 House Rent Rs. 30,000",
      "10/01/2025 Groceries Rs. 5,000",
      "11/02/2025 Groceries Rs. 7,000",
    ].join("\n");
    const out = profileFromText(text);
    expect(out.rent).toBe(30000);
    expect(out.food).toBe(6000);
  });
});

describe("profileFromJSON / profileFromCSV", () => {
  it("maps JSON keys via aliases", () => {
    const json = JSON.stringify({
      name: "Ravi",
      netPay: "70000",
      rent: "20000",
      otherIncome: "5000",
    });
    const out = profileFromJSON(json);
    expect(out.name).toBe("Ravi");
    expect(out.monthlyIncome).toBe(70000);
    expect(out.additionalIncome).toBe(5000);
    expect(out.rent).toBe(20000);
  });

  it("maps CSV header/value rows via aliases", () => {
    const csv = "Name,Salary,Rent,Groceries\nNeha,85000,22000,9000";
    const out = profileFromCSV(csv);
    expect(out.name).toBe("Neha");
    expect(out.monthlyIncome).toBe(85000);
    expect(out.rent).toBe(22000);
    expect(out.food).toBe(9000);
  });

  it("maps the newer expense categories via aliases", () => {
    const json = JSON.stringify({
      name: "Asha",
      tuition: "10000",
      subscriptions: "1200",
      healthcare: "3000",
    });
    const out = profileFromJSON(json);
    expect(out.schoolFees).toBe(10000);
    expect(out.entertainment).toBe(1200);
    expect(out.medical).toBe(3000);
  });
});

describe("extractProfileFromFile", () => {
  it("scores 4+ extracted fields as high and labels the source", async () => {
    const json = JSON.stringify({
      name: "Anita",
      netPay: "95000",
      rent: "25000",
      groceries: "8000",
    });
    const out = await extractProfileFromFile(makeFile(json, "p.json", "application/json"));
    expect(out.confidence).toBe("high");
    expect(out.notes).toContain("Extracted from JSON");
    expect(out.notes).toContain("Please review before saving");
  });

  it("scores 2-3 fields as medium", async () => {
    const csv = "Salary,Rent\n60000,18000";
    const out = await extractProfileFromFile(makeFile(csv, "p.csv", "text/csv"));
    expect(out.confidence).toBe("medium");
  });

  it("reports nothing found when no fields are extracted", async () => {
    const out = await extractProfileFromFile(
      makeFile("nothing useful here", "p.txt", "text/plain"),
    );
    expect(out.confidence).toBe("low");
    expect(out.notes).toContain("No income or expense details found");
  });

  it("notes when recurring expenses are averaged across multiple months", async () => {
    const text = [
      "05/01/2025 House Rent Rs. 25,000",
      "10/01/2025 Groceries Rs. 8,000",
      "05/02/2025 House Rent Rs. 25,000",
      "11/02/2025 Groceries Rs. 6,000",
    ].join("\n");
    const out = await extractProfileFromFile(makeFile(text, "stmt.txt", "text/plain"));
    expect(out.rent).toBe(25000);
    expect(out.food).toBe(7000);
    expect(out.notes).toContain("averaged across 2 months");
  });

  it("does not mention averaging for a single-month statement", async () => {
    const text = "House Rent: Rs. 25,000\nGroceries: Rs. 8,000";
    const out = await extractProfileFromFile(makeFile(text, "stmt.txt", "text/plain"));
    expect(out.notes).not.toContain("averaged across");
  });

  it("exposes a per-month breakdown for categories spanning months", async () => {
    const text = [
      "05/01/2025 House Rent Rs. 25,000",
      "10/01/2025 Groceries Rs. 8,000",
      "05/02/2025 House Rent Rs. 25,000",
      "11/02/2025 Groceries Rs. 6,000",
    ].join("\n");
    const out = await extractProfileFromFile(makeFile(text, "stmt.txt", "text/plain"));
    expect(out.breakdown.food).toEqual([
      { month: "2025-01", total: 8000 },
      { month: "2025-02", total: 6000 },
    ]);
    expect(out.breakdown.rent).toEqual([
      { month: "2025-01", total: 25000 },
      { month: "2025-02", total: 25000 },
    ]);
  });

  it("omits the breakdown for a single-month or dateless statement", async () => {
    const text = "House Rent: Rs. 25,000\nGroceries: Rs. 8,000";
    const out = await extractProfileFromFile(makeFile(text, "stmt.txt", "text/plain"));
    expect(out.breakdown.rent).toBeUndefined();
    expect(out.breakdown.food).toBeUndefined();
  });

  it("omits the breakdown for a category paid in only one month", async () => {
    const text = [
      "05/01/2025 House Rent Rs. 30,000",
      "10/01/2025 Groceries Rs. 5,000",
      "11/02/2025 Groceries Rs. 7,000",
    ].join("\n");
    const out = await extractProfileFromFile(makeFile(text, "stmt.txt", "text/plain"));
    expect(out.breakdown.rent).toBeUndefined();
    expect(out.breakdown.food).toEqual([
      { month: "2025-01", total: 5000 },
      { month: "2025-02", total: 7000 },
    ]);
  });

  it("returns an empty breakdown for JSON/CSV imports", async () => {
    const json = JSON.stringify({ netPay: "70000", rent: "20000" });
    const out = await extractProfileFromFile(makeFile(json, "p.json", "application/json"));
    expect(out.breakdown).toEqual({});
  });

  it("rejects unsupported file types", async () => {
    await expect(
      extractProfileFromFile(makeFile("data", "p.xyz", "application/octet-stream"))
    ).rejects.toThrow("Unsupported file");
  });
});
