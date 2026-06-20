import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileSpreadsheet, FileText } from "lucide-react";
import type { BankStyleResult, RateChange } from "@/lib/amortization";
import { formatDate } from "@/lib/loan-utils";
import { exportBankCSV, exportBankPDF } from "@/lib/export";

interface Props {
  borrowerName: string;
  principalAmount: number;
  interestRate: number;
  startDate: string;
  dueDate: string;
  result: BankStyleResult;
  rateChanges?: RateChange[];
}

function fmt(n: number, decimals = 2): string {
  if (n === 0) return "—";
  return n.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtSigned(n: number): string {
  if (n === 0) return "—";
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function BankAmortizationTable({
  borrowerName,
  principalAmount,
  interestRate,
  startDate,
  dueDate,
  result,
  rateChanges,
}: Props) {
  const [showAll, setShowAll] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const { rows, initialEMI, tenureMonths } = result;

  const PREVIEW_COUNT = 24;
  const displayedRows = showAll ? rows : rows.slice(0, PREVIEW_COUNT);

  if (rows.length === 0) {
    return (
      <div className="py-10 text-center text-muted-foreground text-sm">
        Amortization schedule unavailable — check the start and due dates.
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Header block */}
      <div className="bg-slate-50 border border-border rounded-t-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
          <div>
            <span className="text-muted-foreground font-medium">LOAN AMOUNT:</span>{" "}
            <span className="font-bold text-foreground">
              ₹{principalAmount.toLocaleString("en-IN")}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground font-medium">ROI:</span>{" "}
            <span className="font-bold text-foreground">{interestRate}% p.a.</span>
          </div>
          <div>
            <span className="text-muted-foreground font-medium">CURRENT EMI:</span>{" "}
            <span className="font-bold text-foreground">
              ₹{initialEMI.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground font-medium">ORIGINAL SANCTION TERM:</span>{" "}
            <span className="font-bold text-foreground">{tenureMonths} Months</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground italic">
          (All Amounts in Rupees)
        </div>
      </div>

      {/* Export + Table wrapper */}
      <div className="border border-t-0 border-border rounded-b-lg overflow-hidden">
        {/* Export buttons */}
        <div className="flex items-center justify-end gap-2 px-4 py-2 bg-white border-b border-border">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs h-7"
            onClick={() =>
              exportBankCSV(borrowerName, principalAmount, interestRate, startDate, dueDate, result)
            }
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-700" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs h-7"
            disabled={pdfLoading}
            onClick={async () => {
              setPdfLoading(true);
              try {
                await exportBankPDF(borrowerName, principalAmount, interestRate, startDate, dueDate, result);
              } finally {
                setPdfLoading(false);
              }
            }}
          >
            <FileText className="h-3.5 w-3.5 text-red-600" />
            {pdfLoading ? "Generating…" : "PDF"}
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-orange-600 text-white">
                <th className="px-2 py-2 text-center font-semibold border border-orange-500 whitespace-nowrap">
                  Tran Type
                </th>
                <th className="px-2 py-2 text-center font-semibold border border-orange-500 whitespace-nowrap">
                  From Date
                </th>
                <th className="px-2 py-2 text-center font-semibold border border-orange-500 whitespace-nowrap">
                  To Date
                </th>
                <th className="px-2 py-2 text-right font-semibold border border-orange-500 whitespace-nowrap">
                  Opening Prin. Bal.
                </th>
                <th className="px-2 py-2 text-right font-semibold border border-orange-500 whitespace-nowrap">
                  Prep/Adj/Disb
                </th>
                <th className="px-2 py-2 text-right font-semibold border border-orange-500 whitespace-nowrap">
                  ROI
                </th>
                <th className="px-2 py-2 text-right font-semibold border border-orange-500 whitespace-nowrap">
                  EMI
                </th>
                <th className="px-2 py-2 text-center font-semibold border border-orange-500 whitespace-nowrap">
                  Months
                </th>
                <th className="px-2 py-2 text-right font-semibold border border-orange-500 whitespace-nowrap">
                  EMI Rcble
                </th>
                <th className="px-2 py-2 text-right font-semibold border border-orange-500 whitespace-nowrap">
                  Int. Comp.
                </th>
                <th className="px-2 py-2 text-right font-semibold border border-orange-500 whitespace-nowrap">
                  Prin Comp.
                </th>
                <th className="px-2 py-2 text-right font-semibold border border-orange-500 whitespace-nowrap">
                  Closing Prin.
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedRows.map((row, idx) => {
                const isPrepayment = row.rowType === "prepayment";
                const isRateChange = row.rowType === "rate_change";
                const rowCls = isPrepayment
                  ? "bg-amber-50 border-b border-amber-200"
                  : isRateChange
                  ? "bg-blue-50 border-b border-blue-200"
                  : row.isCurrent
                  ? "bg-emerald-50 border-b border-border font-semibold"
                  : row.isPast
                  ? "bg-white border-b border-border opacity-55"
                  : "bg-white border-b border-border hover:bg-slate-50";

                return (
                  <tr key={idx} className={`transition-opacity ${rowCls}`}>
                    <td className="px-2 py-1.5 text-center border-r border-border whitespace-nowrap">
                      {isPrepayment ? (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-300 border text-[10px] py-0 px-1.5">
                          Prepayment
                        </Badge>
                      ) : isRateChange ? (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-300 border text-[10px] py-0 px-1.5">
                          Rate Change
                        </Badge>
                      ) : (
                        <span className="text-primary font-medium">
                          {row.tranType}
                          {row.isCurrent && (
                            <Badge className="ml-1 bg-primary/10 text-primary border-primary/20 border text-[10px] py-0 px-1">
                              Today
                            </Badge>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-1.5 text-center border-r border-border whitespace-nowrap text-muted-foreground">
                      {formatDate(row.fromDate)}
                    </td>
                    <td className="px-2 py-1.5 text-center border-r border-border whitespace-nowrap text-muted-foreground">
                      {formatDate(row.toDate)}
                    </td>
                    <td className="px-2 py-1.5 text-right border-r border-border whitespace-nowrap">
                      {fmt(row.openingPrincipal)}
                    </td>
                    <td
                      className={`px-2 py-1.5 text-right border-r border-border whitespace-nowrap ${
                        isPrepayment ? "text-amber-700 font-semibold" : "text-muted-foreground"
                      }`}
                    >
                      {isPrepayment ? fmtSigned(row.prepAdjDisb) : "—"}
                    </td>
                    <td className="px-2 py-1.5 text-right border-r border-border whitespace-nowrap text-muted-foreground">
                      {row.roi > 0 ? `${row.roi}%` : "—"}
                    </td>
                    <td className="px-2 py-1.5 text-right border-r border-border whitespace-nowrap">
                      {row.emi > 0 ? fmt(row.emi) : "—"}
                    </td>
                    <td className="px-2 py-1.5 text-center border-r border-border whitespace-nowrap text-muted-foreground">
                      {row.months > 0 ? row.months : "—"}
                    </td>
                    <td className="px-2 py-1.5 text-right border-r border-border whitespace-nowrap">
                      {row.emiRcble > 0 ? fmt(row.emiRcble) : "—"}
                    </td>
                    <td className="px-2 py-1.5 text-right border-r border-border whitespace-nowrap text-amber-700">
                      {row.intComp > 0 ? fmt(row.intComp) : "—"}
                    </td>
                    <td className="px-2 py-1.5 text-right border-r border-border whitespace-nowrap text-primary">
                      {row.prinComp > 0 ? fmt(row.prinComp) : "—"}
                    </td>
                    <td className="px-2 py-1.5 text-right whitespace-nowrap font-medium">
                      {fmt(row.closingPrincipal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {rows.length > PREVIEW_COUNT && (
          <div className="px-4 py-3 border-t border-border text-center bg-white">
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-xs text-primary font-medium hover:underline"
            >
              {showAll ? "Show less ▲" : `View all ${rows.length} rows ▼`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
