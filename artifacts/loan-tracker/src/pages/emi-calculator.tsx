import { useState, useMemo } from "react";
import { Link } from "wouter";
import { ArrowLeft, Calculator, Table, PieChart, Info, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function EmiCalculatorPage() {
  // Input states
  const [principal, setPrincipal] = useState<number>(500000);
  const [interestRate, setInterestRate] = useState<number>(10.5);
  const [tenure, setTenure] = useState<number>(5);
  const [tenureUnit, setTenureUnit] = useState<"years" | "months">("years");

  // Calculate values
  const { emi, totalInterest, totalPayment, principalPct, interestPct, schedule } = useMemo(() => {
    const P = principal;
    const annualR = interestRate;
    const N = tenureUnit === "years" ? tenure * 12 : tenure;

    // Monthly interest rate
    const r = annualR / 12 / 100;

    let monthlyEmi = 0;
    if (r === 0) {
      monthlyEmi = P / N;
    } else {
      monthlyEmi = (P * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1);
    }

    const tPayment = monthlyEmi * N;
    const tInterest = tPayment - P;

    const pPct = tPayment > 0 ? (P / tPayment) * 100 : 0;
    const iPct = tPayment > 0 ? (tInterest / tPayment) * 100 : 0;

    // Generate schedule
    const monthlySchedule = [];
    let balance = P;
    for (let i = 1; i <= N; i++) {
      const interest = balance * r;
      const principalPaid = monthlyEmi - interest;
      const endingBalance = Math.max(0, balance - principalPaid);
      
      monthlySchedule.push({
        month: i,
        beginningBalance: balance,
        payment: monthlyEmi,
        interest: interest,
        principalPaid: principalPaid,
        endingBalance: endingBalance,
      });

      balance = endingBalance;
    }

    return {
      emi: isNaN(monthlyEmi) ? 0 : monthlyEmi,
      totalInterest: isNaN(tInterest) ? 0 : tInterest,
      totalPayment: isNaN(tPayment) ? 0 : tPayment,
      principalPct: pPct,
      interestPct: iPct,
      schedule: monthlySchedule,
    };
  }, [principal, interestRate, tenure, tenureUnit]);

  // Utility to format currency
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
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
            <Calculator className="h-5 w-5" />
          </span>
          EMI Calculator
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          Calculate your Equated Monthly Instalments (EMI) and view a full amortization schedule for your loan.
        </p>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Loan Details</h2>

            {/* Principal Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Loan Amount</label>
                <div className="relative max-w-[150px]">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-bold">₹</span>
                  <Input
                    type="number"
                    value={principal}
                    onChange={(e) => setPrincipal(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="pl-7 font-bold text-right"
                  />
                </div>
              </div>
              <input
                type="range"
                min="10000"
                max="10000000"
                step="10000"
                value={principal}
                onChange={(e) => setPrincipal(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                <span>₹10,000</span>
                <span>₹1 Crore</span>
              </div>
            </div>

            {/* Interest Rate Input */}
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
                max="30"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                <span>1%</span>
                <span>30%</span>
              </div>
            </div>

            {/* Tenure Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Tenure</label>
                <div className="flex items-center gap-2">
                  <div className="relative max-w-[80px]">
                    <Input
                      type="number"
                      value={tenure}
                      onChange={(e) => setTenure(Math.max(1, parseInt(e.target.value) || 1))}
                      className="font-bold text-right"
                    />
                  </div>
                  <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200/50 dark:border-slate-700">
                    <button
                      onClick={() => {
                        setTenureUnit("years");
                        setTenure(Math.max(1, Math.round(tenure / 12) || 1));
                      }}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                        tenureUnit === "years"
                          ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-slate-100 shadow-sm"
                          : "text-slate-500"
                      }`}
                    >
                      Yr
                    </button>
                    <button
                      onClick={() => {
                        setTenureUnit("months");
                        setTenure(tenure * 12);
                      }}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                        tenureUnit === "months"
                          ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-slate-100 shadow-sm"
                          : "text-slate-500"
                      }`}
                    >
                      Mo
                    </button>
                  </div>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max={tenureUnit === "years" ? 30 : 360}
                value={tenure}
                onChange={(e) => setTenure(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                <span>1 {tenureUnit}</span>
                <span>{tenureUnit === "years" ? 30 : 360} {tenureUnit}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Outputs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Calculation summary */}
            <div className="space-y-6 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Summary</h2>
                
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-950/30">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">
                      Monthly EMI
                    </span>
                    <span className="text-3xl font-black tracking-tight text-indigo-700 dark:text-indigo-300">
                      {formatCurrency(emi)}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Principal Amount</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">{formatCurrency(principal)}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Interest Payable</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">{formatCurrency(totalInterest)}</span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Payment</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">{formatCurrency(totalPayment)}</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Action */}
              <Link href="/sign-up">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl mt-4 cursor-pointer">
                  Track Your Loans Now
                </Button>
              </Link>
            </div>

            {/* Visual Donut Chart */}
            <div className="flex flex-col items-center justify-center p-4">
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1.5">
                <PieChart className="h-4 w-4 text-indigo-500" />
                Payment Breakdown
              </h3>

              <div className="relative h-44 w-44 flex items-center justify-center">
                {/* SVG Donut */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background track (Total Interest) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="rgb(129, 140, 248)" /* Indigo-400 */
                    strokeWidth="10"
                  />
                  {/* Foreground overlay (Principal) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="rgb(79, 70, 229)" /* Indigo-600 */
                    strokeWidth="10"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * principalPct) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                
                {/* Inner label */}
                <div className="absolute text-center">
                  <span className="block text-xl font-black text-slate-800 dark:text-slate-100">
                    {Math.round(principalPct)}%
                  </span>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Principal
                  </span>
                </div>
              </div>

              {/* Chart Legend */}
              <div className="flex gap-4 mt-6 text-xs font-bold text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-indigo-600 inline-block" />
                  <span>Principal ({Math.round(principalPct)}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-indigo-400 inline-block" />
                  <span>Interest ({Math.round(interestPct)}%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Amortization Schedule Table */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Table className="h-5 w-5 text-indigo-500" />
            Amortization Schedule
          </h2>
          <Button
            variant="outline"
            onClick={() => {
              // Simple CSV download
              const headers = ["Month", "Beginning Balance", "EMI Payment", "Interest Charged", "Principal Repaid", "Ending Balance"];
              const rows = schedule.map(r => [
                r.month,
                r.beginningBalance.toFixed(2),
                r.payment.toFixed(2),
                r.interest.toFixed(2),
                r.principalPaid.toFixed(2),
                r.endingBalance.toFixed(2)
              ]);
              const content = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
              const blob = new Blob([content], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `amortization-schedule.csv`;
              a.click();
            }}
            className="rounded-xl font-bold gap-2 text-xs border-slate-200 dark:border-slate-800 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Export Schedule (CSV)
          </Button>
        </div>

        <div className="overflow-x-auto max-h-[400px] border border-slate-100 dark:border-slate-800 rounded-2xl">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-4 font-bold text-slate-600 dark:text-slate-400">Month</th>
                <th className="p-4 font-bold text-slate-600 dark:text-slate-400 text-right">Beginning Balance</th>
                <th className="p-4 font-bold text-slate-600 dark:text-slate-400 text-right">EMI Payment</th>
                <th className="p-4 font-bold text-slate-600 dark:text-slate-400 text-right text-amber-600 dark:text-amber-400">Interest Charged</th>
                <th className="p-4 font-bold text-slate-600 dark:text-slate-400 text-right text-indigo-600 dark:text-indigo-400">Principal Repaid</th>
                <th className="p-4 font-bold text-slate-600 dark:text-slate-400 text-right">Ending Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 font-medium">
              {schedule.map((row) => (
                <tr key={row.month} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                  <td className="p-4 text-slate-500 dark:text-slate-400 font-bold">{row.month}</td>
                  <td className="p-4 text-right">{formatCurrency(row.beginningBalance)}</td>
                  <td className="p-4 text-right font-bold text-slate-800 dark:text-slate-200">{formatCurrency(row.payment)}</td>
                  <td className="p-4 text-right text-amber-600 dark:text-amber-400">{formatCurrency(row.interest)}</td>
                  <td className="p-4 text-right text-indigo-600 dark:text-indigo-400">{formatCurrency(row.principalPaid)}</td>
                  <td className="p-4 text-right font-bold text-slate-800 dark:text-slate-200">{formatCurrency(row.endingBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
