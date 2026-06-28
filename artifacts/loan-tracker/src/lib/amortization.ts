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
  effect?: "tenure" | "emi";
}

export interface BankStyleRow {
  rowType: "amrt" | "prepayment" | "rate_change";
  paymentId?: number;
  notes?: string | null;
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

export function monthsBetween(from: string, to: string): number {
  const a = new Date(from);
  const b = new Date(to);
  if (isNaN(a.getTime()) || isNaN(b.getTime())) return 0;
  return Math.max(
    0,
    (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth())
  );
}

function addMonths(dateStr: string, n: number): string {
  const d = new Date(dateStr);
  d.setUTCMonth(d.getUTCMonth() + n);
  return d.toISOString().split("T")[0];
}

export function firstOfMonth(dateStr: string): string {
  const d = new Date(dateStr);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString().split("T")[0];
}

export function lastOfMonth(dateStr: string): string {
  const d = new Date(dateStr);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).toISOString().split("T")[0];
}

/**
 * Resolve an effective start/due date pair for schedule math when the user did
 * not supply dates. Falls back to the loan's creation date (or today) for the
 * start, and derives the due date from tenureMonths when only the tenure is
 * known. Returns an empty dueDate when there is no way to bound the schedule.
 */
export function resolveScheduleDates(
  startDate?: string | null,
  dueDate?: string | null,
  tenureMonths?: number | null,
  createdAt?: string | null,
): { startDate: string; dueDate: string } {
  const start =
    startDate ||
    (createdAt ? createdAt.split("T")[0] : new Date().toISOString().split("T")[0]);
  let due = dueDate || "";
  if (!due && tenureMonths && tenureMonths > 0) {
    due = addMonths(start, tenureMonths);
  }
  return { startDate: start, dueDate: due };
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
  dueDate: string,
  rateChanges: RateChange[] = [],
  interestType?: string
): AmortizationResult {
  const tenureMonths = monthsBetween(startDate, dueDate);
  if (tenureMonths <= 0 || principal <= 0) {
    return { emi: 0, schedule: [], totalInterest: 0, totalPayment: 0, tenureMonths: 0 };
  }

  // Apply a rate change from the start of the first monthly period whose
  // periodStart is on or after the effective date — identical semantics to
  // calculateBankStyleSchedule, so blended-rate math stays consistent.
  const sortedRateChanges = [...rateChanges]
    .filter((rc) => rc.effectiveDate > startDate && rc.effectiveDate < dueDate)
    .sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate));

  let initialEMI = 0;
  if (interestType?.startsWith("fixed_emi:")) {
    const customVal = parseFloat(interestType.split(":")[1]);
    if (!isNaN(customVal) && customVal > 0) {
      initialEMI = r2(customVal);
    }
  }
  if (initialEMI <= 0) {
    initialEMI = calcEMI(principal, annualRate, tenureMonths);
  }

  const schedule: AmortizationRow[] = [];
  let balance = principal;
  let activeRate = annualRate;
  let currentEMI = initialEMI;
  let rateChangeIdx = 0;

  for (let i = 1; i <= tenureMonths; i++) {
    const periodStart = firstOfMonth(addMonths(startDate, i - 1));

    let rateChanged = false;
    while (
      rateChangeIdx < sortedRateChanges.length &&
      sortedRateChanges[rateChangeIdx].effectiveDate <= periodStart
    ) {
      activeRate = sortedRateChanges[rateChangeIdx].newRate;
      rateChanged = true;
      rateChangeIdx++;
    }

    const remainingMonths = tenureMonths - i + 1;
    if (rateChanged) {
      currentEMI = calcEMI(balance, activeRate, remainingMonths);
    }

    const monthlyRate = activeRate / 12 / 100;
    const openingBalance = balance;
    const interestComponent = openingBalance * monthlyRate;
    let principalComponent = currentEMI - interestComponent;
    if (i === tenureMonths) principalComponent = openingBalance;
    const closingBalance = Math.max(0, openingBalance - principalComponent);

    schedule.push({
      month: i,
      date: addMonths(startDate, i),
      openingBalance: r2(openingBalance),
      emi: r2(currentEMI),
      interestComponent: r2(interestComponent),
      principalComponent: r2(principalComponent),
      closingBalance: r2(closingBalance),
    });

    balance = closingBalance;
  }

  const totalPayment = schedule.reduce((s, r) => s + r.emi, 0);
  const totalInterest = schedule.reduce((s, r) => s + r.interestComponent, 0);

  return {
    emi: r2(initialEMI),
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
  remainingAmount: number,
  rateChanges: RateChange[] = []
): InterestSavings {
  const today = new Date().toISOString().split("T")[0];

  const full = calculateAmortization(
    principalAmount,
    annualRate,
    startDate,
    dueDate,
    rateChanges
  );
  const scheduledTotalInterest = full.totalInterest;
  const principalRepaid = principalAmount - remainingAmount;

  // The remaining projection is anchored to the start of the current monthly
  // period (not the raw calendar date) so its rate-change semantics match the
  // schedule, which applies a change from the first period whose periodStart is
  // on/after the effective date. The base rate is the rate already in effect at
  // that period start; only changes after it (effectiveDate > periodStart) still
  // apply within the remaining projection.
  const remainingPeriodStart = firstOfMonth(today);
  const remainingBaseRate = currentEffectiveRate(
    annualRate,
    rateChanges,
    remainingPeriodStart
  );
  const remaining = calculateAmortization(
    remainingAmount,
    remainingBaseRate,
    remainingPeriodStart,
    dueDate,
    rateChanges
  );
  
  const estimatedInterestPaid = Math.max(0, totalPaid - principalRepaid);

  // Find scheduled balance for the start of the current month (i.e. the previous month's closing balance)
  const currentMonth = currentScheduleMonth(startDate);
  const prevMonthIdx = currentMonth - 2;
  const scheduledBalance =
    prevMonthIdx >= 0 && prevMonthIdx < full.schedule.length
      ? full.schedule[prevMonthIdx].closingBalance
      : principalAmount;

  let interestSaved = 0;
  let projectedRemainingInterest = remaining.totalInterest;

  if (remainingAmount < scheduledBalance - 1) {
    interestSaved = Math.max(
      0,
      scheduledTotalInterest - estimatedInterestPaid - projectedRemainingInterest
    );
  } else {
    // If we are not ahead of schedule, remaining projected interest is simply scheduled interest minus estimated interest paid
    projectedRemainingInterest = Math.max(0, scheduledTotalInterest - estimatedInterestPaid);
  }

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

/**
 * Resolve the interest rate currently in effect for a loan: the most recent
 * rate change whose effectiveDate has already passed (<= asOf), or the original
 * rate if no rate changes have taken effect yet.
 */
export function currentEffectiveRate(
  originalRate: number,
  rateChanges: RateChange[] = [],
  asOf: string = new Date().toISOString().split("T")[0]
): number {
  const applied = rateChanges
    .filter((rc) => rc.effectiveDate <= asOf)
    .sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate));
  return applied.length > 0 ? applied[applied.length - 1].newRate : originalRate;
}

export function calculateBankStyleSchedule(
  principal: number,
  annualRate: number,
  startDate: string,
  dueDate: string,
  payments: Array<{ id?: number; paymentDate: string; amount: number; notes?: string | null }>,
  rateChanges: RateChange[] = [],
  interestType?: string
): BankStyleResult {
  const tenureMonths = monthsBetween(startDate, dueDate);
  if (tenureMonths <= 0 || principal <= 0) {
    return { initialEMI: 0, tenureMonths: 0, rows: [], totalInterest: 0, totalPrincipal: 0 };
  }

  const today = new Date().toISOString().split("T")[0];
  let initialEMI = 0;
  if (interestType?.startsWith("fixed_emi:")) {
    const customVal = parseFloat(interestType.split(":")[1]);
    if (!isNaN(customVal) && customVal > 0) {
      initialEMI = r2(customVal);
    }
  }
  if (initialEMI <= 0) {
    initialEMI = r2(calcEMI(principal, annualRate, tenureMonths));
  }

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
    let rateChangedInThisMonth = false;
    let rateChangeEffect: "tenure" | "emi" = "emi";
    while (
      rateChangeIdx < sortedRateChanges.length &&
      sortedRateChanges[rateChangeIdx].effectiveDate <= periodStart
    ) {
      const rc = sortedRateChanges[rateChangeIdx];
      activeRate = rc.newRate;
      rateChangedInThisMonth = true;
      rateChangeEffect = rc.effect || "emi";
      const isRcPast = rc.effectiveDate < today;
      const isRcCurrent = rc.effectiveDate === today;
      const moLeft = tenureMonths - month + 1;
      const tempEMI = rateChangeEffect === "tenure" ? currentEMI : (moLeft > 0 ? r2(calcEMI(balance, activeRate, moLeft)) : 0);
      rows.push({
        rowType: "rate_change",
        tranType: "Rate Change",
        fromDate: rc.effectiveDate,
        toDate: rc.effectiveDate,
        openingPrincipal: r2(balance),
        prepAdjDisb: 0,
        roi: activeRate,
        emi: tempEMI,
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

    if (rateChangedInThisMonth) {
      if (rateChangeEffect !== "tenure") {
        const remainingMonthsIncludingThis = tenureMonths - month + 1;
        currentEMI = r2(calcEMI(balance, activeRate, remainingMonthsIncludingThis));
      }
    }

    while (
      paymentIdx < sortedPayments.length &&
      sortedPayments[paymentIdx].paymentDate <= periodEnd
    ) {
      const pmt = sortedPayments[paymentIdx];
      const pmtOpening = balance;
      const pmtClosing = r2(balance - pmt.amount);
      rows.push({
        rowType: "prepayment",
        paymentId: pmt.id,
        notes: pmt.notes ?? null,
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
      const isReduceTenure = pmt.notes?.includes("[Reduce Tenure]");
      if (!isReduceTenure) {
        const moLeft = tenureMonths - month + 1;
        currentEMI = r2(calcEMI(balance, activeRate, moLeft));
      }
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
