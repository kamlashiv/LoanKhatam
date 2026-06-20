import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown } from "lucide-react";
import {
  calculateAmortization,
  calculateSavings,
  calculateBankStyleSchedule,
  type RateChange,
} from "@/lib/amortization";
import { formatRupees, formatDate } from "@/lib/loan-utils";
import { BankAmortizationTable } from "@/components/bank-amortization-table";

interface Payment {
  paymentDate: string;
  amount: number;
}

interface Props {
  borrowerName: string;
  principalAmount: number;
  interestRate: number;
  startDate: string;
  dueDate: string;
  totalPaid: number;
  remainingAmount: number;
  payments?: Payment[];
  rateChanges?: RateChange[];
}

const COLORS = {
  principalPaid: "#1d5c42",
  interestPaid: "#f59e0b",
  remainingPrincipal: "#94a3b8",
  remainingInterest: "#f87171",
  interestSaved: "#34d399",
};

function rupeeLabel(value: number) {
  return formatRupees(value);
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0];
  return (
    <div className="bg-card border border-border rounded-lg shadow-md px-4 py-2 text-sm">
      <p className="font-semibold text-foreground">{item.name}</p>
      <p className="text-muted-foreground">{formatRupees(item.value)}</p>
    </div>
  );
}

export function AmortizationSection({
  borrowerName,
  principalAmount,
  interestRate,
  startDate,
  dueDate,
  totalPaid,
  remainingAmount,
  payments = [],
  rateChanges = [],
}: Props) {
  const amort = useMemo(
    () =>
      calculateAmortization(
        principalAmount,
        interestRate,
        startDate,
        dueDate,
        rateChanges
      ),
    [principalAmount, interestRate, startDate, dueDate, rateChanges]
  );

  const savings = useMemo(
    () =>
      calculateSavings(
        principalAmount,
        interestRate,
        startDate,
        dueDate,
        totalPaid,
        remainingAmount,
        rateChanges
      ),
    [
      principalAmount,
      interestRate,
      startDate,
      dueDate,
      totalPaid,
      remainingAmount,
      rateChanges,
    ]
  );

  const bankResult = useMemo(
    () => calculateBankStyleSchedule(principalAmount, interestRate, startDate, dueDate, payments, rateChanges),
    [principalAmount, interestRate, startDate, dueDate, payments, rateChanges]
  );

  const pieData = useMemo(() => {
    const data = [
      { name: "Principal Repaid", value: savings.principalRepaid, color: COLORS.principalPaid },
      { name: "Interest Paid", value: savings.estimatedInterestPaid, color: COLORS.interestPaid },
      { name: "Remaining Principal", value: savings.remainingPrincipal, color: COLORS.remainingPrincipal },
      { name: "Remaining Interest", value: savings.projectedRemainingInterest, color: COLORS.remainingInterest },
    ];
    if (savings.interestSaved > 0) {
      data.push({ name: "Interest Saved", value: savings.interestSaved, color: COLORS.interestSaved });
    }
    return data.filter((d) => d.value > 0);
  }, [savings]);

  const scheduledPieData = useMemo(
    () => [
      { name: "Principal", value: principalAmount, color: COLORS.principalPaid },
      { name: "Total Interest", value: amort.totalInterest, color: COLORS.interestPaid },
    ],
    [principalAmount, amort.totalInterest]
  );

  if (amort.tenureMonths === 0) {
    return (
      <Card className="border-border shadow-sm">
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">Amortization schedule unavailable — check the start and due dates.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Interest Savings Banner */}
      {savings.interestSaved > 0 && (
        <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4">
          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <TrendingDown className="h-5 w-5 text-emerald-700" />
          </div>
          <div>
            <p className="font-bold text-emerald-800 text-lg">
              {formatRupees(savings.interestSaved)} interest saved!
            </p>
            <p className="text-sm text-emerald-700">
              Paying early means you'll owe less than the scheduled interest.
            </p>
          </div>
          <Badge className="ml-auto bg-emerald-100 text-emerald-800 border-emerald-300 border font-semibold text-sm shrink-0">
            Savings!
          </Badge>
        </div>
      )}

      {/* Key Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border shadow-sm">
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground mb-1">Monthly Installment (EMI)</p>
            <p className="text-lg font-bold text-primary">{formatRupees(amort.emi)}</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground mb-1">Total Interest (Scheduled)</p>
            <p className="text-lg font-bold text-amber-700">{formatRupees(amort.totalInterest)}</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground mb-1">Remaining Interest (Projected)</p>
            <p className="text-lg font-bold text-red-600">{formatRupees(savings.projectedRemainingInterest)}</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground mb-1">Interest Savings</p>
            <p className={`text-lg font-bold ${savings.interestSaved > 0 ? "text-emerald-700" : "text-muted-foreground"}`}>
              {savings.interestSaved > 0 ? formatRupees(savings.interestSaved) : "₹0"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scheduled breakdown */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Loan Breakdown (Scheduled)</CardTitle>
            <p className="text-xs text-muted-foreground">How much interest you'll pay if every EMI is paid on time</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={scheduledPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {scheduledPieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => (
                    <span className="text-xs text-foreground">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center mt-1">
              <p className="text-xs text-muted-foreground">
                Total Payable:{" "}
                <span className="font-bold text-foreground">{formatRupees(amort.totalPayment)}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actual vs Savings */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Actual Progress + Savings</CardTitle>
            <p className="text-xs text-muted-foreground">
              {savings.interestSaved > 0
                ? "Green section = interest saved by paying early"
                : "Status so far"}
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => (
                    <span className="text-xs text-foreground">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center mt-1">
              <p className="text-xs text-muted-foreground">
                Total Paid:{" "}
                <span className="font-bold text-foreground">{formatRupees(totalPaid)}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bank-Style Amortization Schedule */}
      <div>
        <div className="mb-3">
          <h3 className="text-base font-bold">Amortization Schedule</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Bank statement format — {amort.tenureMonths}-month plan
            {payments.length > 0 && `, ${payments.length} prepayment${payments.length > 1 ? "s" : ""} inline`}
          </p>
        </div>
        <BankAmortizationTable
          borrowerName={borrowerName}
          principalAmount={principalAmount}
          interestRate={interestRate}
          startDate={startDate}
          dueDate={dueDate}
          result={bankResult}
          rateChanges={rateChanges}
        />
      </div>
    </div>
  );
}
