import { averageMonths, type MonthState } from "../month-breakdown";

const m = (value: string, excluded = false): MonthState => ({ value, excluded });

describe("averageMonths", () => {
  it("returns null for undefined or empty record", () => {
    expect(averageMonths(undefined)).toBeNull();
    expect(averageMonths({})).toBeNull();
  });

  it("averages all kept months and rounds", () => {
    expect(
      averageMonths({ "2026-01": m("8000"), "2026-02": m("6000") }),
    ).toBe(7000);
    // rounds 7001/3 ≈ 2333.67 -> 2334
    expect(
      averageMonths({ a: m("2000"), b: m("2000"), c: m("3001") }),
    ).toBe(2334);
  });

  it("drops excluded months from the average", () => {
    expect(
      averageMonths({
        "2026-01": m("8000"),
        "2026-02": m("6000", true),
      }),
    ).toBe(8000);
  });

  it("excluding all but one behaves like that single month", () => {
    expect(
      averageMonths({
        a: m("9000"),
        b: m("6000", true),
        c: m("3000", true),
      }),
    ).toBe(9000);
  });

  it("ignores blank, negative, and non-numeric inputs", () => {
    expect(
      averageMonths({
        a: m("8000"),
        b: m(""),
        c: m("  "),
        d: m("-500"),
        e: m("abc"),
      }),
    ).toBe(8000);
  });

  it("treats an explicit 0 as zero spend (not ignored)", () => {
    expect(averageMonths({ a: m("4000"), b: m("0") })).toBe(2000);
    expect(averageMonths({ a: m("0") })).toBe(0);
  });

  it("returns null when every kept month is blank or invalid", () => {
    expect(averageMonths({ a: m(""), b: m("-1"), c: m("x") })).toBeNull();
    expect(averageMonths({ a: m("5000", true) })).toBeNull();
  });
});
