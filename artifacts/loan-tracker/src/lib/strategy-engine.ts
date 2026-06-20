// ──────────────────────────────────────────────────────────────────────────
// Smart Financial Strategy engine
//
// Pure, deterministic calculations for the "Smart Financial Strategy" tab.
// No promises of investment returns are made anywhere — allocations are
// educational templates keyed off the user's stated risk profile.
// ──────────────────────────────────────────────────────────────────────────

export type RiskProfile = "conservative" | "moderate" | "aggressive";

export interface DebtItem {
  id: string;
  name: string;
  balance: number;
  /** Annual interest rate as a percentage, e.g. 18 for 18%. */
  rate: number;
  /** Minimum monthly payment. */
  minPayment: number;
}

export interface StrategyInputs {
  age: number;
  monthlyIncome: number;
  additionalIncome: number;
  // Fixed monthly expenses
  rent: number;
  emi: number;
  insurance: number;
  utilities: number;
  schoolFees: number;
  internet: number;
  otherFixed: number;
  // Variable monthly expenses
  food: number;
  fuel: number;
  travel: number;
  entertainment: number;
  shopping: number;
  medical: number;
  miscellaneous: number;
  // Assets & liabilities
  currentSavings: number;
  existingInvestments: number;
  creditCardDebt: number;
  loans: DebtItem[];
  // Profile
  goals: string[];
  riskProfile: RiskProfile;
}

export const GOAL_OPTIONS = [
  "Become debt free",
  "Build emergency fund",
  "Buy house",
  "Buy car",
  "Child education",
  "Retirement",
  "Business investment",
  "Wealth creation",
] as const;

export const EMPTY_INPUTS: StrategyInputs = {
  age: 30,
  monthlyIncome: 0,
  additionalIncome: 0,
  rent: 0,
  emi: 0,
  insurance: 0,
  utilities: 0,
  schoolFees: 0,
  internet: 0,
  otherFixed: 0,
  food: 0,
  fuel: 0,
  travel: 0,
  entertainment: 0,
  shopping: 0,
  medical: 0,
  miscellaneous: 0,
  currentSavings: 0,
  existingInvestments: 0,
  creditCardDebt: 0,
  loans: [],
  goals: [],
  riskProfile: "moderate",
};

export type HealthCategory = "Critical" | "Weak" | "Average" | "Good" | "Excellent";

export interface AllocationSlice {
  name: string;
  pct: number;
  amount: number;
  color: string;
}

export interface DebtPayoffResult {
  months: number;
  totalInterest: number;
  /** Names of debts in the order they get cleared. */
  order: string[];
  /** True if the budget could not clear the debt within the cap. */
  unbounded: boolean;
}

export interface Insight {
  kind: "warning" | "tip" | "positive";
  text: string;
}

export interface ExpenseCut {
  label: string;
  current: number;
  reducePct: number;
  monthlySaving: number;
}

export interface StrategyResult {
  // Cash flow
  totalIncome: number;
  totalFixed: number;
  totalVariable: number;
  totalExpenses: number;
  freeCashFlow: number;
  savingsRate: number; // 0..1
  // Debt
  totalDebt: number;
  totalMinPayments: number;
  dti: number; // debt-to-income, 0..1
  // Reserves
  emergencyFundRequirement: number;
  emergencyFundMonths: number; // months of expenses already covered
  netWorth: number;
  // Score
  healthScore: number; // 0..100
  healthCategory: HealthCategory;
  // Plans
  monthlySavingTarget: number;
  emergencyGap: number;
  emergencyMonthsToGoal: number | null;
  expenseCuts: ExpenseCut[];
  // Debt strategies
  hasDebt: boolean;
  baseline: DebtPayoffResult;
  snowball: DebtPayoffResult;
  avalanche: DebtPayoffResult;
  recommendedStrategy: "snowball" | "avalanche";
  debtExtraPayment: number;
  interestSavedVsBaseline: number;
  // Investing
  allocation: AllocationSlice[];
  // Narrative
  insights: Insight[];
}

const MONTH_CAP = 600; // 50 years — guards against unbounded loops

function sum(...vals: number[]): number {
  return vals.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

function categoryFor(score: number): HealthCategory {
  if (score <= 30) return "Critical";
  if (score <= 50) return "Weak";
  if (score <= 70) return "Average";
  if (score <= 85) return "Good";
  return "Excellent";
}

/** Combine all real debts (itemised loans + credit-card balance) into one list. */
function collectDebts(inputs: StrategyInputs): DebtItem[] {
  const debts = inputs.loans
    .filter((d) => d.balance > 0)
    .map((d) => ({ ...d }));
  if (inputs.creditCardDebt > 0) {
    // Credit cards typically carry ~36% APR and ~5% minimum payments.
    debts.push({
      id: "credit-card",
      name: "Credit Card Debt",
      balance: inputs.creditCardDebt,
      rate: 36,
      minPayment: Math.max(500, Math.round(inputs.creditCardDebt * 0.05)),
    });
  }
  return debts;
}

/**
 * Simulate paying down a set of debts. Interest accrues monthly before payment.
 *
 * When `rollover` is true (the snowball/avalanche strategies), a fixed
 * `monthlyBudget` is maintained: minimums are paid first and everything left
 * over — including minimums freed up by cleared debts — is thrown at the
 * highest-priority remaining debt (snowball = smallest balance first,
 * avalanche = highest rate first).
 *
 * When `rollover` is false (the baseline), only each debt's own minimum is paid
 * every month with no extra and no redirection of freed minimums — a true
 * "minimum payments only" scenario.
 */
function simulatePayoff(
  debts: DebtItem[],
  monthlyBudget: number,
  priority: (a: DebtItem, b: DebtItem) => number,
  rollover = true,
): DebtPayoffResult {
  const working = debts.map((d) => ({ ...d }));
  const order: string[] = [];
  let totalInterest = 0;
  let months = 0;

  if (working.length === 0) {
    return { months: 0, totalInterest: 0, order: [], unbounded: false };
  }

  while (months < MONTH_CAP) {
    const active = working.filter((d) => d.balance > 0.01);
    if (active.length === 0) break;
    months += 1;

    // Accrue one month of interest.
    for (const d of active) {
      const interest = (d.balance * d.rate) / 1200;
      d.balance += interest;
      totalInterest += interest;
    }

    const totalMin = sum(...active.map((d) => Math.min(d.minPayment, d.balance)));
    // Baseline pays only the active minimums; strategies hold the budget floor.
    let available = rollover ? Math.max(monthlyBudget, totalMin) : totalMin;

    // Pay every active debt its minimum first.
    for (const d of active) {
      const pay = Math.min(d.minPayment, d.balance);
      d.balance -= pay;
      available -= pay;
    }

    // Throw whatever is left at the highest-priority remaining debt (rollover only).
    if (rollover) {
      const ranked = [...active].filter((d) => d.balance > 0.01).sort(priority);
      for (const d of ranked) {
        if (available <= 0) break;
        const pay = Math.min(available, d.balance);
        d.balance -= pay;
        available -= pay;
      }
    }

    // Record any debts cleared this month.
    for (const d of active) {
      if (d.balance <= 0.01 && !order.includes(d.name)) order.push(d.name);
    }
  }

  const unbounded = working.some((d) => d.balance > 0.01);
  return { months, totalInterest, order, unbounded };
}

function buildAllocation(profile: RiskProfile, base: number): AllocationSlice[] {
  const COLORS = {
    emergency: "#6366f1",
    fixed: "#0ea5e9",
    equity: "#10b981",
    gold: "#f59e0b",
  };
  const tables: Record<RiskProfile, [number, number, number, number]> = {
    // [emergency, fixed income, diversified equity, gold]
    conservative: [40, 30, 20, 10],
    moderate: [20, 20, 50, 10],
    aggressive: [10, 10, 70, 10],
  };
  const [emergency, fixed, equity, gold] = tables[profile];
  return [
    { name: "Emergency Fund", pct: emergency, amount: (base * emergency) / 100, color: COLORS.emergency },
    { name: "Fixed Income", pct: fixed, amount: (base * fixed) / 100, color: COLORS.fixed },
    { name: "Diversified Equity Funds", pct: equity, amount: (base * equity) / 100, color: COLORS.equity },
    { name: "Gold", pct: gold, amount: (base * gold) / 100, color: COLORS.gold },
  ];
}

function buildExpenseCuts(inputs: StrategyInputs): ExpenseCut[] {
  const income = inputs.monthlyIncome + inputs.additionalIncome;
  const cuts: ExpenseCut[] = [];
  const consider = (label: string, current: number, reducePct: number, threshold: number) => {
    if (income > 0 && current > income * threshold) {
      cuts.push({ label, current, reducePct, monthlySaving: Math.round((current * reducePct) / 100) });
    }
  };
  consider("Food & groceries", inputs.food, 10, 0.15);
  consider("Entertainment", inputs.entertainment, 20, 0.05);
  consider("Shopping", inputs.shopping, 25, 0.07);
  consider("Travel", inputs.travel, 15, 0.06);
  consider("Miscellaneous", inputs.miscellaneous, 20, 0.05);
  return cuts;
}

function buildInsights(inputs: StrategyInputs, r: Omit<StrategyResult, "insights">): Insight[] {
  const out: Insight[] = [];
  const income = r.totalIncome;

  if (income > 0 && inputs.rent > income * 0.35) {
    out.push({ kind: "warning", text: `Your rent is ${Math.round((inputs.rent / income) * 100)}% of income — above the recommended 35% ceiling.` });
  }
  if (r.dti > 0.4) {
    out.push({ kind: "warning", text: `Your debt-to-income ratio is ${Math.round(r.dti * 100)}%. Lenders consider above 40% high-risk — prioritise paying down debt.` });
  }
  if (inputs.creditCardDebt > 0) {
    out.push({ kind: "warning", text: `Credit-card debt is the most expensive money you owe (~36% p.a.). Clear it before investing.` });
  }
  if (r.emergencyFundMonths < 3 && r.totalExpenses > 0) {
    out.push({ kind: "warning", text: `Your savings cover only ${r.emergencyFundMonths.toFixed(1)} months of expenses. Aim for at least 6 months before investing heavily.` });
  }
  if (r.savingsRate < 0.1 && income > 0) {
    out.push({ kind: "tip", text: `Your savings rate is ${Math.round(r.savingsRate * 100)}%. Trimming variable spending could lift it toward the healthy 20% mark.` });
  }
  if (r.savingsRate >= 0.2) {
    out.push({ kind: "positive", text: `Strong work — you're saving ${Math.round(r.savingsRate * 100)}% of your income, well above the 20% benchmark.` });
  }
  if (r.hasDebt && r.interestSavedVsBaseline > 0) {
    out.push({ kind: "tip", text: `Directing ${formatShort(r.debtExtraPayment)}/month extra at your debts could save roughly ${formatShort(r.interestSavedVsBaseline)} in interest.` });
  }
  if (inputs.existingInvestments > 0 && r.emergencyFundMonths >= 6) {
    out.push({ kind: "positive", text: `With a solid emergency buffer in place, investing for growth is a sensible next step.` });
  }
  if (inputs.age >= 45 && inputs.existingInvestments < income * 60) {
    out.push({ kind: "tip", text: `Retirement is approaching — consider increasing long-term contributions while you still have earning years ahead.` });
  }
  if (out.length === 0) {
    out.push({ kind: "positive", text: `Your finances look balanced. Keep tracking income and expenses to stay on course.` });
  }
  return out;
}

function formatShort(val: number): string {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
  return `₹${Math.round(val).toLocaleString("en-IN")}`;
}

export function computeStrategy(inputs: StrategyInputs): StrategyResult {
  const totalIncome = sum(inputs.monthlyIncome, inputs.additionalIncome);
  const totalFixed = sum(
    inputs.rent, inputs.emi, inputs.insurance, inputs.utilities,
    inputs.schoolFees, inputs.internet, inputs.otherFixed,
  );
  const totalVariable = sum(
    inputs.food, inputs.fuel, inputs.travel, inputs.entertainment,
    inputs.shopping, inputs.medical, inputs.miscellaneous,
  );
  const totalExpenses = totalFixed + totalVariable;
  const freeCashFlow = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? clamp(freeCashFlow / totalIncome, -1, 1) : 0;

  const debts = collectDebts(inputs);
  const totalDebt = sum(...debts.map((d) => d.balance));
  const totalMinPayments = sum(...debts.map((d) => d.minPayment));
  const dti = totalIncome > 0 ? clamp(totalMinPayments / totalIncome, 0, 2) : 0;

  const emergencyFundRequirement = totalExpenses * 6;
  const emergencyFundMonths = totalExpenses > 0 ? inputs.currentSavings / totalExpenses : 0;
  const netWorth = sum(inputs.currentSavings, inputs.existingInvestments) - totalDebt;

  // Health score (0..100) — weighted blend of four pillars.
  const savingsScore = clamp(savingsRate / 0.3, 0, 1) * 30;
  const dtiScore = clamp(1 - dti / 0.5, 0, 1) * 25;
  const emergencyScore = clamp(emergencyFundMonths / 6, 0, 1) * 25;
  const debtPenaltyBase = totalIncome > 0 ? clamp(1 - inputs.creditCardDebt / (totalIncome * 3), 0, 1) : 1;
  const debtScore = debtPenaltyBase * 20;
  const healthScore = Math.round(savingsScore + dtiScore + emergencyScore + debtScore);

  const monthlySavingTarget = Math.max(0, Math.round(freeCashFlow));
  const emergencyGap = Math.max(0, emergencyFundRequirement - inputs.currentSavings);
  const emergencyMonthsToGoal =
    emergencyGap > 0 && monthlySavingTarget > 0 ? Math.ceil(emergencyGap / monthlySavingTarget) : emergencyGap > 0 ? null : 0;

  // Debt strategies. Extra payment = half of free cash flow (kept for savings too),
  // falling back to a token amount so the comparison is always meaningful.
  const debtExtraPayment = Math.max(0, Math.round(freeCashFlow * 0.5));
  const budget = totalMinPayments + debtExtraPayment;
  const byBalance = (a: DebtItem, b: DebtItem) => a.balance - b.balance;
  const byRate = (a: DebtItem, b: DebtItem) => b.rate - a.rate;

  const baseline = simulatePayoff(debts, totalMinPayments, byRate, false);
  const snowball = simulatePayoff(debts, budget, byBalance);
  const avalanche = simulatePayoff(debts, budget, byRate);
  const interestSavedVsBaseline = Math.max(0, baseline.totalInterest - avalanche.totalInterest);
  // Avalanche always minimises interest; snowball wins only when balances are
  // tightly clustered, where the motivational quick-wins outweigh tiny cost.
  const recommendedStrategy =
    avalanche.totalInterest <= snowball.totalInterest * 0.98 ? "avalanche" : "snowball";

  // Investable base: free cash flow available to deploy each month.
  const allocation = buildAllocation(inputs.riskProfile, Math.max(0, monthlySavingTarget));

  const partial: Omit<StrategyResult, "insights"> = {
    totalIncome, totalFixed, totalVariable, totalExpenses, freeCashFlow, savingsRate,
    totalDebt, totalMinPayments, dti,
    emergencyFundRequirement, emergencyFundMonths, netWorth,
    healthScore, healthCategory: categoryFor(healthScore),
    monthlySavingTarget, emergencyGap, emergencyMonthsToGoal,
    expenseCuts: buildExpenseCuts(inputs),
    hasDebt: debts.length > 0,
    baseline, snowball, avalanche, recommendedStrategy,
    debtExtraPayment, interestSavedVsBaseline,
    allocation,
  };

  return { ...partial, insights: buildInsights(inputs, partial) };
}

/** "37 months" → "3 Yr 1 Mo". */
export function monthsToLabel(months: number): string {
  if (months <= 0) return "0 Mo";
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts: string[] = [];
  if (y > 0) parts.push(`${y} Yr`);
  if (m > 0) parts.push(`${m} Mo`);
  return parts.join(" ");
}

export { formatShort as compactRupees };
