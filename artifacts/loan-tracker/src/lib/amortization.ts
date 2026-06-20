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
  let emi: number;

  if (monthlyRate === 0) {
    emi = principal / tenureMonths;
  } else {
    const factor = Math.pow(1 + monthlyRate, tenureMonths);
    emi = (principal * monthlyRate * factor) / (factor - 1);
  }

  const schedule: AmortizationRow[] = [];
  let balance = principal;

  for (let i = 1; i <= tenureMonths; i++) {
    const openingBalance = balance;
    const interestComponent = openingBalance * monthlyRate;
    let principalComponent = emi - interestComponent;

    if (i === tenureMonths) {
      principalComponent = openingBalance;
    }

    const closingBalance = Math.max(0, openingBalance - principalComponent);

    schedule.push({
      month: i,
      date: addMonths(startDate, i),
      openingBalance: Math.round(openingBalance * 100) / 100,
      emi: Math.round(emi * 100) / 100,
      interestComponent: Math.round(interestComponent * 100) / 100,
      principalComponent: Math.round(principalComponent * 100) / 100,
      closingBalance: Math.round(closingBalance * 100) / 100,
    });

    balance = closingBalance;
  }

  const totalPayment = schedule.reduce((s, r) => s + r.emi, 0);
  const totalInterest = schedule.reduce((s, r) => s + r.interestComponent, 0);

  return {
    emi: Math.round(emi * 100) / 100,
    schedule,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalPayment: Math.round(totalPayment * 100) / 100,
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
    scheduledTotalInterest: Math.round(scheduledTotalInterest * 100) / 100,
    projectedRemainingInterest: Math.round(projectedRemainingInterest * 100) / 100,
    estimatedInterestPaid: Math.round(estimatedInterestPaid * 100) / 100,
    interestSaved: Math.round(interestSaved * 100) / 100,
    principalRepaid: Math.round(principalRepaid * 100) / 100,
    remainingPrincipal: Math.round(remainingAmount * 100) / 100,
  };
}

export function currentScheduleMonth(startDate: string): number {
  return monthsBetween(startDate, new Date().toISOString().split("T")[0]) + 1;
}
