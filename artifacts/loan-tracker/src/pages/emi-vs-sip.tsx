import { useState, useMemo } from "react";
import { Link } from "wouter";
import { ArrowLeft, TrendingUp, Sparkles, HelpCircle, BadgeInfo, Scale, ArrowRight, Percent, Landmark, PiggyBank, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/useTranslation";
import { formatRupees } from "@/lib/loan-utils";

export function EmiVsSipPage() {
  const { t } = useTranslation();

  // Input states
  const [loanBalance, setLoanBalance] = useState<number>(1000000); // 10 Lakhs
  const [loanRate, setLoanRate] = useState<number>(8.5); // 8.5% p.a.
  const [loanTenure, setLoanTenure] = useState<number>(120); // 10 years / 120 months
  const [monthlySurplus, setMonthlySurplus] = useState<number>(10000); // 10k extra monthly
  const [expectedSipReturn, setExpectedSipReturn] = useState<number>(12); // 12% p.a.

  // Calculations
  const results = useMemo(() => {
    const P = loanBalance;
    const r = loanRate / 12 / 100;
    const months = loanTenure;
    const extra = monthlySurplus;
    const sipR = expectedSipReturn / 12 / 100;

    if (P <= 0 || r <= 0 || months <= 0 || extra <= 0 || sipR <= 0) {
      return {
        emi: 0,
        originalTotalInterest: 0,
        prepaidMonths: 0,
        prepaidTotalInterest: 0,
        interestSaved: 0,
        optionAWealth: 0,
        optionBWealth: 0,
        netDifference: 0,
        betterOption: "none" as const,
      };
    }

    // 1. Calculate standard EMI
    const emi = (P * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    const originalTotalInterest = emi * months - P;

    // 2. Option A: Prepay Loan, then invest all into SIP
    // Simulate month-by-month prepayment
    let balance = P;
    let prepayMonths = 0;
    let prepaidTotalInterest = 0;

    while (balance > 0 && prepayMonths < 600) {
      prepayMonths++;
      const interestThisMonth = balance * r;
      prepaidTotalInterest += interestThisMonth;

      const maxPayment = balance + interestThisMonth;
      const basePayment = Math.min(emi, maxPayment);
      const remainingAfterBase = Math.max(0, balance + interestThisMonth - basePayment);
      const actualExtra = Math.min(extra, remainingAfterBase);

      balance = remainingAfterBase - actualExtra;
    }

    const interestSaved = Math.max(0, originalTotalInterest - prepaidTotalInterest);

    // After loan is paid off (prepayMonths), we invest (emi + extra) into SIP for the remaining months (months - prepayMonths)
    let optionAWealth = 0;
    const remainingMonths = Math.max(0, months - prepayMonths);
    const optionAMonthlyInvestment = emi + extra;

    for (let m = 0; m < remainingMonths; m++) {
      optionAWealth = (optionAWealth + optionAMonthlyInvestment) * (1 + sipR);
    }

    // 3. Option B: Pay standard EMI, invest surplus in SIP from day 1
    let optionBWealth = 0;
    for (let m = 0; m < months; m++) {
      optionBWealth = (optionBWealth + extra) * (1 + sipR);
    }

    // Compare
    const betterOption = optionAWealth >= optionBWealth ? ("prepay" as const) : ("sip" as const);
    const netDifference = Math.abs(optionAWealth - optionBWealth);

    return {
      emi,
      originalTotalInterest,
      prepaidMonths: prepayMonths,
      prepaidTotalInterest,
      interestSaved,
      optionAWealth,
      optionBWealth,
      netDifference,
      betterOption,
    };
  }, [loanBalance, loanRate, loanTenure, monthlySurplus, expectedSipReturn]);

  return (
    <div className="space-y-8 py-4">
      {/* Back Link */}
      <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 cursor-pointer">
        <ArrowLeft className="h-4 w-4" />
        Back to Tools
      </Link>

      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
            <Scale className="h-5 w-5" />
          </span>
          {t("emiVsSip")}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          {t("emiVsSipDesc")}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Input Panel */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">
              Calculator Inputs
            </h3>

            {/* Principal */}
            <div className="space-y-1.5">
              <Label htmlFor="loanBalance">Loan Principal (₹)</Label>
              <Input
                id="loanBalance"
                type="number"
                value={loanBalance}
                onChange={(e) => setLoanBalance(Number(e.target.value))}
                min="0"
                step="any"
              />
            </div>

            {/* Loan Rate */}
            <div className="space-y-1.5">
              <Label htmlFor="loanRate">Loan Interest Rate (% p.a.)</Label>
              <Input
                id="loanRate"
                type="number"
                value={loanRate}
                onChange={(e) => setLoanRate(Number(e.target.value))}
                min="0"
                step="any"
              />
            </div>

            {/* Loan Tenure */}
            <div className="space-y-1.5">
              <Label htmlFor="loanTenure">Tenure (months)</Label>
              <Input
                id="loanTenure"
                type="number"
                value={loanTenure}
                onChange={(e) => setLoanTenure(Number(e.target.value))}
                min="1"
                step="1"
              />
            </div>

            {/* Monthly Surplus */}
            <div className="space-y-1.5">
              <Label htmlFor="monthlySurplus">Monthly Surplus (Extra Budget) (₹)</Label>
              <Input
                id="monthlySurplus"
                type="number"
                value={monthlySurplus}
                onChange={(e) => setMonthlySurplus(Number(e.target.value))}
                min="0"
                step="any"
              />
            </div>

            {/* Expected SIP Return */}
            <div className="space-y-1.5">
              <Label htmlFor="expectedSipReturn">{t("expectedSipReturn")}</Label>
              <Input
                id="expectedSipReturn"
                type="number"
                value={expectedSipReturn}
                onChange={(e) => setExpectedSipReturn(Number(e.target.value))}
                min="0"
                step="any"
              />
            </div>
          </div>
        </div>

        {/* Right: Results Dashboard */}
        <div className="lg:col-span-2 space-y-6">
          {/* Smart Recommendation Card */}
          {results.betterOption !== "none" && (
            <div className="rounded-3xl border border-indigo-100 bg-indigo-50/60 p-6 dark:border-indigo-950 dark:bg-indigo-950/20 flex gap-4 items-start">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg">
                  Smart Financial Recommendation
                </h4>
                <p className="text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                  {results.betterOption === "sip" ? (
                    <>
                      Since your expected investment returns (<strong>{expectedSipReturn}%</strong>) are higher than your loan interest rate (<strong>{loanRate}%</strong>), it is mathematically wiser to <strong>invest your surplus in a SIP</strong> from day 1. Doing so will make you wealthier by approximately <strong>{formatRupees(results.netDifference)}</strong> over the tenure.
                    </>
                  ) : (
                    <>
                      Prepaying your loan saves you <strong>{formatRupees(results.interestSaved)}</strong> in interest fees. After clearing the loan in <strong>{results.prepaidMonths} months</strong>, rolling your entire monthly payment (EMI + surplus) into mutual funds will result in a net wealth advantage of <strong>{formatRupees(results.netDifference)}</strong> over standard repayment.
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Detailed Side-by-Side Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Option A Card */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold mb-1">
                  <Landmark className="h-4 w-4" /> Option A
                </div>
                <h3 className="font-black text-slate-800 dark:text-slate-100 text-xl">
                  Prepay & Roll Over
                </h3>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1">
                  Clear debt aggressively, then invest the whole budget.
                </p>

                <div className="space-y-3 mt-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Loan Repaid in</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      {results.prepaidMonths} months
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Interest Saved</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatRupees(results.interestSaved)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Monthly EMI</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {formatRupees(results.emi)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4 mt-4 bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-2xl">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                  End Balance Accumulated
                </span>
                <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                  {formatRupees(results.optionAWealth)}
                </div>
              </div>
            </div>

            {/* Option B Card */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold mb-1">
                  <PiggyBank className="h-4 w-4" /> Option B
                </div>
                <h3 className="font-black text-slate-800 dark:text-slate-100 text-xl">
                  SIP Investment Only
                </h3>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1">
                  Pay loan normally, invest surplus in equity mutual funds.
                </p>

                <div className="space-y-3 mt-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Loan Repaid in</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {loanTenure} months
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">SIP Monthly Investment</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      {formatRupees(monthlySurplus)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Total Interest Paid</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {formatRupees(results.originalTotalInterest)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4 mt-4 bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-2xl">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                  End Balance Accumulated
                </span>
                <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1">
                  {formatRupees(results.optionBWealth)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
