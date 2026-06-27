import { useState, useMemo } from "react";
import { Link } from "wouter";
import { ArrowLeft, TrendingUp, Sparkles, HelpCircle, BadgeInfo, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoanCalculatorPage() {
  // Input states
  const [balance, setBalance] = useState<number>(1000000);
  const [interestRate, setInterestRate] = useState<number>(9.5);
  const [tenureYears, setTenureYears] = useState<number>(15);
  const [extraPayment, setExtraPayment] = useState<number>(5000);

  // Perform prepayment comparison
  const stats = useMemo(() => {
    const P = balance;
    const annualR = interestRate;
    const months = tenureYears * 12;
    const r = annualR / 12 / 100;
    const monthlyExtra = extraPayment;

    if (P <= 0 || r <= 0 || months <= 0) {
      return {
        originalEmi: 0,
        originalInterest: 0,
        newDuration: 0,
        newInterest: 0,
        interestSaved: 0,
        monthsSaved: 0,
      };
    }

    // 1) Original Loan calculation
    const originalEmi = (P * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    const originalInterest = originalEmi * months - P;

    // 2) Prepayment schedule calculation
    let currentBalance = P;
    let newMonths = 0;
    let newInterest = 0;

    // Simulate month by month
    while (currentBalance > 0 && newMonths < 600) { // Limit to 50 years max to prevent infinite loops
      newMonths++;
      const interestForMonth = currentBalance * r;
      newInterest += interestForMonth;

      // Base payment is original EMI, but cannot exceed balance + interest
      const maxPaymentThisMonth = currentBalance + interestForMonth;
      const basePayment = Math.min(originalEmi, maxPaymentThisMonth);

      // Prepayment is extra payment, but cannot exceed remaining balance
      const remainingBalanceAfterBase = Math.max(0, currentBalance + interestForMonth - basePayment);
      const actualExtra = Math.min(monthlyExtra, remainingBalanceAfterBase);

      currentBalance = remainingBalanceAfterBase - actualExtra;
    }

    const interestSaved = Math.max(0, originalInterest - newInterest);
    const monthsSaved = Math.max(0, months - newMonths);

    return {
      originalEmi,
      originalInterest,
      newDuration: newMonths,
      newInterest,
      interestSaved,
      monthsSaved,
    };
  }, [balance, interestRate, tenureYears, extraPayment]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-8 py-4">
      {/* Back link */}
      <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 cursor-pointer">
        <ArrowLeft className="h-4 w-4" />
        Back to Tools
      </Link>

      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
            <TrendingUp className="h-5 w-5" />
          </span>
          Loan Prepayment Saver
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Calculate the impact of making extra monthly payments. Find out how much interest you will save and how much faster you can close your loan.
        </p>
      </header>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Prepayment Scenario</h2>

            {/* Balance */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Current Outstanding Balance</label>
                <div className="relative max-w-[150px]">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-bold">₹</span>
                  <Input
                    type="number"
                    value={balance}
                    onChange={(e) => setBalance(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="pl-7 font-bold text-right"
                  />
                </div>
              </div>
              <input
                type="range"
                min="50000"
                max="20000000"
                step="50000"
                value={balance}
                onChange={(e) => setBalance(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            {/* Interest */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Interest Rate (% p.a.)</label>
                <div className="relative max-w-[100px]">
                  <Input
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="pr-6 font-bold text-right"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-bold">%</span>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            {/* Tenure */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Remaining Tenure (Years)</label>
                <div className="relative max-w-[100px]">
                  <Input
                    type="number"
                    value={tenureYears}
                    onChange={(e) => setTenureYears(Math.max(1, parseInt(e.target.value) || 1))}
                    className="font-bold text-right pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">Yrs</span>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={tenureYears}
                onChange={(e) => setTenureYears(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            {/* Prepayment Amount */}
            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  Extra Monthly Payment
                </label>
                <div className="relative max-w-[150px]">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-bold">₹</span>
                  <Input
                    type="number"
                    value={extraPayment}
                    onChange={(e) => setExtraPayment(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="pl-7 font-bold text-right border-emerald-300 dark:border-emerald-800"
                  />
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100000"
                step="1000"
                value={extraPayment}
                onChange={(e) => setExtraPayment(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                <span>No extra</span>
                <span>₹1 Lakh / mo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Results columns */}
        <div className="lg:col-span-7 space-y-6">
          {/* Key savings statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-3xl border border-emerald-100 bg-emerald-50/50 p-6 shadow-sm dark:border-emerald-950/40 dark:bg-emerald-950/20 text-center">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                Total Interest Saved
              </span>
              <span className="text-3xl font-black text-emerald-700 dark:text-emerald-300">
                {formatCurrency(stats.interestSaved)}
              </span>
            </div>

            <div className="rounded-3xl border border-emerald-100 bg-emerald-50/50 p-6 shadow-sm dark:border-emerald-950/40 dark:bg-emerald-950/20 text-center">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                Tenure Reduced By
              </span>
              <span className="text-3xl font-black text-emerald-700 dark:text-emerald-300">
                {stats.monthsSaved} Months
              </span>
              <span className="block text-[11px] text-emerald-600/80 font-bold mt-1">
                ({(stats.monthsSaved / 12).toFixed(1)} Years sooner!)
              </span>
            </div>
          </div>

          {/* Comparison table card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Comparison Table</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original Plan */}
              <div className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Original Plan</span>
                <div className="space-y-2 text-sm font-medium">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Monthly EMI</span>
                    <span className="font-bold">{formatCurrency(stats.originalEmi)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Loan Duration</span>
                    <span className="font-bold">{tenureYears * 12} months ({tenureYears} yrs)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Interest</span>
                    <span className="font-bold">{formatCurrency(stats.originalInterest)}</span>
                  </div>
                </div>
              </div>

              {/* Prepayment Plan */}
              <div className="p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/10 dark:bg-emerald-950/10">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-3">
                  Prepayment Plan
                </span>
                <div className="space-y-2 text-sm font-medium">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Actual Outgo/Mo</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(stats.originalEmi + extraPayment)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">New Duration</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {stats.newDuration} months ({(stats.newDuration / 12).toFixed(1)} yrs)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">New Interest</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(stats.newInterest)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
              <BadgeInfo className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>Calculations assume that interest rates remain constant throughout the remaining tenure of the loan.</span>
            </div>
          </div>

          {/* CTA Banner */}
          <div className="rounded-3xl border border-indigo-100 bg-indigo-50/50 p-6 shadow-sm dark:border-indigo-900/30 dark:bg-indigo-950/20 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-bold text-slate-800 dark:text-slate-100">Want to track this live?</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Log in to build an interactive prepayment timeline, log actual payments, and compare different strategies.
              </p>
            </div>
            <Link href="/sign-up">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl whitespace-nowrap cursor-pointer">
                Track My Loan
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
