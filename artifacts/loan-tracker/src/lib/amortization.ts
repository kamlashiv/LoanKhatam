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

export interface BankStyleRow {
  rowType: "amrt" | "prepayment";
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
  payments: Array<{ paymentDate: string; amount: number }>
): BankStyleResult {
  const tenureMonths = monthsBetween(startDate, dueDate);
  if (tenureMonths <= 0 || principal <= 0) {
    return { initialEMI: 0, tenureMonths: 0, rows: [], totalInterest: 0, totalPrincipal: 0 };
  }

  const today = new Date().toISOString().split("T")[0];
  const monthlyRate = annualRate / 12 / 100;
  const initialEMI = r2(calcEMI(principal, annualRate, tenureMonths));

  const sortedPayments = [...payments].sort((a, b) =>
    a.paymentDate.localeCompare(b.paymentDate)
  );

  const rows: BankStyleRow[] = [];
  let balance = principal;
  let currentEMI = initialEMI;
  let paymentIdx = 0;
  let totalInterest = 0;

  for (let month = 1; month <= tenureMonths; month++) {
    const periodStart = firstOfMonth(addMonths(startDate, month - 1));
    const periodEnd = lastOfMonth(periodStart);

    const remainingMonthsIncludingThis = tenureMonths - month + 1;
    currentEMI = r2(calcEMI(balance, annualRate, remainingMonthsIncludingThis));

    const isPast = periodEnd < today;
    const isCurrent = periodStart <= today && today <= periodEnd;

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
      currentEMI = r2(calcEMI(balance, annualRate, moLeft));
      paymentIdx++;
    }

    if (balance <= 0) break;

    const intComp = r2(balance * monthlyRate);
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
      roi: annualRate,
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
