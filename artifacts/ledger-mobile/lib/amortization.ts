export interface RateChange {
  effectiveDate: string;
  newRate: number;
}

export interface BankStyleRow {
  rowType: "amrt" | "prepayment" | "rate_change";
  tranType: string;
  fromDate: string;
  toDate: string;
  openingPrincipal: number;
  prepAdjDisb: number;
  roi: number;
  emi: number;
  months: number;
  emiRcble: number;
  intComp: number;
  prinComp: number;
  closingPrincipal: number;
  isPast: boolean;
  isCurrent: boolean;
}

export interface BankStyleResult {
  initialEMI: number;
  tenureMonths: number;
  rows: BankStyleRow[];
  totalInterest: number;
  totalPrincipal: number;
}

function monthsBetween(from: string, to: string): number {
  const a = new Date(from);
  const b = new Date(to);
  return Math.max(
    0,
    (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth())
  );
}

function addMonths(dateStr: string, n: number): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + n);
  return d.toISOString().split("T")[0];
}

function firstOfMonth(dateStr: string): string {
  const d = new Date(dateStr);
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
}

function lastOfMonth(dateStr: string): string {
  const d = new Date(dateStr);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];
}

function calcEMI(principal: number, annualRate: number, months: number): number {
  if (months <= 0 || principal <= 0) return 0;
  if (annualRate === 0) return principal / months;
  const r = annualRate / 12 / 100;
  const factor = Math.pow(1 + r, months);
  return (principal * r * factor) / (factor - 1);
}

function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calculateBankStyleSchedule(
  principal: number,
  annualRate: number,
  startDate: string,
  dueDate: string,
  payments: Array<{ paymentDate: string; amount: number }>,
  rateChanges: RateChange[] = []
): BankStyleResult {
  const tenureMonths = monthsBetween(startDate, dueDate);
  if (tenureMonths <= 0 || principal <= 0) {
    return {
      initialEMI: 0,
      tenureMonths: 0,
      rows: [],
      totalInterest: 0,
      totalPrincipal: 0,
    };
  }

  const today = new Date().toISOString().split("T")[0];
  const initialEMI = r2(calcEMI(principal, annualRate, tenureMonths));

  const sortedPayments = [...payments].sort((a, b) =>
    a.paymentDate.localeCompare(b.paymentDate)
  );

  const sortedRateChanges = [...rateChanges]
    .filter((rc) => rc.effectiveDate > startDate && rc.effectiveDate < dueDate)
    .sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate));

  const rows: BankStyleRow[] = [];
  let balance = principal;
  let currentEMI = initialEMI;
  let paymentIdx = 0;
  let rateChangeIdx = 0;
  let totalInterest = 0;
  let activeRate = annualRate;

  for (let month = 1; month <= tenureMonths; month++) {
    const periodStart = firstOfMonth(addMonths(startDate, month - 1));
    const periodEnd = lastOfMonth(periodStart);

    const isPast = periodEnd < today;
    const isCurrent = periodStart <= today && today <= periodEnd;

    while (
      rateChangeIdx < sortedRateChanges.length &&
      sortedRateChanges[rateChangeIdx].effectiveDate <= periodStart
    ) {
      const rc = sortedRateChanges[rateChangeIdx];
      activeRate = rc.newRate;
      const isRcPast = rc.effectiveDate < today;
      const isRcCurrent = rc.effectiveDate === today;
      const moLeft = tenureMonths - month + 1;
      const newEMI = moLeft > 0 ? r2(calcEMI(balance, activeRate, moLeft)) : 0;
      rows.push({
        rowType: "rate_change",
        tranType: "Rate Change",
        fromDate: rc.effectiveDate,
        toDate: rc.effectiveDate,
        openingPrincipal: r2(balance),
        prepAdjDisb: 0,
        roi: activeRate,
        emi: newEMI,
        months: 0,
        emiRcble: 0,
        intComp: 0,
        prinComp: 0,
        closingPrincipal: r2(balance),
        isPast: isRcPast,
        isCurrent: isRcCurrent,
      });
      rateChangeIdx++;
    }

    const remainingMonthsIncludingThis = tenureMonths - month + 1;
    currentEMI = r2(calcEMI(balance, activeRate, remainingMonthsIncludingThis));

    while (
      paymentIdx < sortedPayments.length &&
      sortedPayments[paymentIdx].paymentDate <= periodEnd
    ) {
      const pmt = sortedPayments[paymentIdx];
      const pmtOpening = balance;
      const pmtClosing = r2(balance - pmt.amount);
      rows.push({
        rowType: "prepayment",
        tranType: "",
        fromDate: pmt.paymentDate,
        toDate: pmt.paymentDate,
        openingPrincipal: r2(pmtOpening),
        prepAdjDisb: r2(-pmt.amount),
        roi: 0,
        emi: 0,
        months: 0,
        emiRcble: 0,
        intComp: 0,
        prinComp: 0,
        closingPrincipal: pmtClosing,
        isPast,
        isCurrent,
      });
      balance = Math.max(0, pmtClosing);
      const moLeft = tenureMonths - month + 1;
      currentEMI = r2(calcEMI(balance, activeRate, moLeft));
      paymentIdx++;
    }

    if (balance <= 0) break;

    const intComp = r2(balance * (activeRate / 12 / 100));
    let prinComp = r2(currentEMI - intComp);
    if (month === tenureMonths || prinComp >= balance) {
      prinComp = r2(balance);
    }
    const closingPrincipal = r2(Math.max(0, balance - prinComp));

    rows.push({
      rowType: "amrt",
      tranType: "Amrt",
      fromDate: periodStart,
      toDate: periodEnd,
      openingPrincipal: r2(balance),
      prepAdjDisb: 0,
      roi: activeRate,
      emi: currentEMI,
      months: 1,
      emiRcble: currentEMI,
      intComp,
      prinComp,
      closingPrincipal,
      isPast,
      isCurrent,
    });

    totalInterest += intComp;
    balance = closingPrincipal;
    if (balance <= 0) break;
  }

  return {
    initialEMI,
    tenureMonths,
    rows,
    totalInterest: r2(totalInterest),
    totalPrincipal: r2(principal),
  };
}
