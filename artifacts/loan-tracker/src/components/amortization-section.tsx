import { useMemo, useState } from "react";
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
import { TrendingDown, IndianRupee } from "lucide-react";
import {
  calculateAmortization,
  calculateSavings,
  currentScheduleMonth,
} from "@/lib/amortization";
import { formatRupees, formatDate } from "@/lib/loan-utils";

interface Props {
  principalAmount: number;
  interestRate: number;
  startDate: string;
  dueDate: string;
  totalPaid: number;
  remainingAmount: number;
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
  principalAmount,
  interestRate,
  startDate,
  dueDate,
  totalPaid,
  remainingAmount,
}: Props) {
  const [showAll, setShowAll] = useState(false);

  const amort = useMemo(
    () => calculateAmortization(principalAmount, interestRate, startDate, dueDate),
    [principalAmount, interestRate, startDate, dueDate]
  );

  const savings = useMemo(
    () =>
      calculateSavings(
        principalAmount,
        interestRate,
        startDate,
        dueDate,
        totalPaid,
        remainingAmount
      ),
    [principalAmount, interestRate, startDate, dueDate, totalPaid, remainingAmount]
  );

  const currentMonth = useMemo(() => currentScheduleMonth(startDate), [startDate]);

  const pieData = useMemo(() => {
    const data = [
      { name: "मूलधन चुकाया", value: savings.principalRepaid, color: COLORS.principalPaid },
      { name: "ब्याज चुकाया", value: savings.estimatedInterestPaid, color: COLORS.interestPaid },
      { name: "बाकी मूलधन", value: savings.remainingPrincipal, color: COLORS.remainingPrincipal },
      { name: "बाकी ब्याज", value: savings.projectedRemainingInterest, color: COLORS.remainingInterest },
    ];
    if (savings.interestSaved > 0) {
      data.push({ name: "बचाया गया ब्याज", value: savings.interestSaved, color: COLORS.interestSaved });
    }
    return data.filter((d) => d.value > 0);
  }, [savings]);

  const scheduledPieData = useMemo(
    () => [
      { name: "मूलधन (Principal)", value: principalAmount, color: COLORS.principalPaid },
      { name: "कुल ब्याज (Interest)", value: amort.totalInterest, color: COLORS.interestPaid },
    ],
    [principalAmount, amort.totalInterest]
  );

  const displayedRows = showAll ? amort.schedule : amort.schedule.slice(0, 12);

  if (amort.tenureMonths === 0) {
    return (
      <Card className="border-border shadow-sm">
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">Amortization schedule उपलब्ध नहीं — start और due date जांचें।</p>
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
              {formatRupees(savings.interestSaved)} ब्याज बचेगा!
            </p>
            <p className="text-sm text-emerald-700">
              जल्दी भुगतान की वजह से scheduled ब्याज से कम देना पड़ेगा।
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
            <p className="text-xs text-muted-foreground mb-1">मासिक किस्त (EMI)</p>
            <p className="text-lg font-bold text-primary">{formatRupees(amort.emi)}</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground mb-1">कुल ब्याज (Scheduled)</p>
            <p className="text-lg font-bold text-amber-700">{formatRupees(amort.totalInterest)}</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground mb-1">बाकी ब्याज (Projected)</p>
            <p className="text-lg font-bold text-red-600">{formatRupees(savings.projectedRemainingInterest)}</p>
          </CardContent>
        </Card>
        <Card className="border-border shadow-sm">
          <CardContent className="pt-5">
            <p className="text-xs text-muted-foreground mb-1">ब्याज बचत</p>
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
            <p className="text-xs text-muted-foreground">अगर सभी EMI समय पर दें तो कितना ब्याज लगेगा</p>
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
                कुल देय राशि:{" "}
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
                ? "हरा भाग = जल्दी भुगतान से बचाया गया ब्याज"
                : "अभी तक की स्थिति"}
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
                कुल चुकाया:{" "}
                <span className="font-bold text-foreground">{formatRupees(totalPaid)}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Amortization Schedule Table */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold">Amortization Schedule</CardTitle>
          <p className="text-xs text-muted-foreground">
            हर महीने कितना मूलधन और कितना ब्याज कटेगा — {amort.tenureMonths} महीने की योजना
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">माह</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">तारीख</th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground">शुरू बैलेंस</th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground">EMI</th>
                  <th className="text-right px-4 py-3 font-semibold text-amber-700">ब्याज</th>
                  <th className="text-right px-4 py-3 font-semibold text-primary">मूलधन</th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground">बाकी</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {displayedRows.map((row) => {
                  const isCurrent = row.month === currentMonth;
                  const isPast = row.month < currentMonth;
                  return (
                    <tr
                      key={row.month}
                      className={`transition-colors ${
                        isCurrent
                          ? "bg-primary/5 font-semibold"
                          : isPast
                          ? "opacity-50"
                          : "hover:bg-muted/30"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span>{row.month}</span>
                          {isCurrent && (
                            <Badge className="bg-primary/10 text-primary border-primary/20 border text-xs py-0">
                              आज
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(row.date)}</td>
                      <td className="px-4 py-3 text-right">{formatRupees(row.openingBalance)}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatRupees(row.emi)}</td>
                      <td className="px-4 py-3 text-right text-amber-700">{formatRupees(row.interestComponent)}</td>
                      <td className="px-4 py-3 text-right text-primary">{formatRupees(row.principalComponent)}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{formatRupees(row.closingBalance)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {amort.schedule.length > 12 && (
            <div className="px-4 py-4 border-t border-border text-center">
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-sm text-primary font-medium hover:underline"
              >
                {showAll
                  ? "कम दिखाएं ▲"
                  : `सभी ${amort.schedule.length} महीने देखें ▼`}
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
