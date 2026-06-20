export interface AmortizationRow {
  month: number;
  date: string;
  openingBalance: number;
  emi: number;
  interestComponent: number;
  principalComponent: number;
  closingBalance: number;
}

export interface AmortizationResult {
  emi: number;
  schedule: AmortizationRow[];
  totalInterest: number;
  totalPayment: number;
  tenureMonths: number;
}

export interface InterestSavings {
  scheduledTotalInterest: number;
  projectedRemainingInterest: number;
  estimatedInterestPaid: number;
  interestSaved: number;
  principalRepaid: number;
  remainingPrincipal: number;
}

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
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split("T")[0];
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

export function calculateAmortization(
  principal: number,
  annualRate: number,
  startDate: string,
  dueDate: string
): AmortizationResult {
  const tenureMonths = monthsBetween(startDate, dueDate);
  if (tenureMonths <= 0 || principal <= 0) {
    return { emi: 0, schedule: [], totalInterest: 0, totalPayment: 0, tenureMonths: 0 };
  }

  const monthlyRate = annualRate / 12 / 100;
  const emi = calcEMI(principal, annualRate, tenureMonths);

  const schedule: AmortizationRow[] = [];
  let balance = principal;

  for (let i = 1; i <= tenureMonths; i++) {
    const openingBalance = balance;
    const interestComponent = openingBalance * monthlyRate;
    let principalComponent = emi - interestComponent;
    if (i === tenureMonths) principalComponent = openingBalance;
    const closingBalance = Math.max(0, openingBalance - principalComponent);

    schedule.push({
      month: i,
      date: addMonths(startDate, i),
      openingBalance: r2(openingBalance),
      emi: r2(emi),
      interestComponent: r2(interestComponent),
      principalComponent: r2(principalComponent),
      closingBalance: r2(closingBalance),
    });

    balance = closingBalance;
  }

  const totalPayment = schedule.reduce((s, r) => s + r.emi, 0);
  const totalInterest = schedule.reduce((s, r) => s + r.interestComponent, 0);

  return {
    emi: r2(emi),
    schedule,
    totalInterest: r2(totalInterest),
    totalPayment: r2(totalPayment),
    tenureMonths,
  };
}

export function calculateSavings(
  principalAmount: number,
  annualRate: number,
  startDate: string,
  dueDate: string,
  totalPaid: number,
  remainingAmount: number
): InterestSavings {
  const today = new Date().toISOString().split("T")[0];

  const full = calculateAmortization(principalAmount, annualRate, startDate, dueDate);
  const scheduledTotalInterest = full.totalInterest;
  const principalRepaid = principalAmount - remainingAmount;
  const remaining = calculateAmortization(remainingAmount, annualRate, today, dueDate);
  const projectedRemainingInterest = remaining.totalInterest;
  const estimatedInterestPaid = Math.max(0, totalPaid - principalRepaid);
  const interestSaved = Math.max(
    0,
    scheduledTotalInterest - estimatedInterestPaid - projectedRemainingInterest
  );

  return {
    scheduledTotalInterest: r2(scheduledTotalInterest),
    projectedRemainingInterest: r2(projectedRemainingInterest),
    estimatedInterestPaid: r2(estimatedInterestPaid),
    interestSaved: r2(interestSaved),
    principalRepaid: r2(principalRepaid),
    remainingPrincipal: r2(remainingAmount),
  };
}

export function currentScheduleMonth(startDate: string): number {
  return monthsBetween(startDate, new Date().toISOString().split("T")[0]) + 1;
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
    return { initialEMI: 0, tenureMonths: 0, rows: [], totalInterest: 0, totalPrincipal: 0 };
  }

  const today = new Date().toISOString().split("T")[0];
  const initialEMI = r2(calcEMI(principal, annualRate, tenureMonths));

  const sortedPayments = [...payments].sort((a, b) =>
    a.paymentDate.localeCompare(b.paymentDate)
  );

  // Sort rate changes chronologically; filter those outside the loan range.
  // A rate change is applied from the START of the first monthly period whose
  // periodStart >= rc.effectiveDate (i.e. the month that begins on or after the
  // effective date).  That way ANY date — mid-month, first-of-month, etc. —
  // is handled consistently: the new rate kicks in from the next full period.
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

    // Apply all rate changes whose effectiveDate <= periodStart (they have
    // already taken effect by the beginning of this period).  Multiple events
    // between the previous periodStart and this one are applied in order.
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
