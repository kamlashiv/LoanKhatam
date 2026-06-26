import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileSpreadsheet, FileText, Edit, Trash2, Plus } from "lucide-react";
import type { BankStyleResult, RateChange } from "@/lib/amortization";
import { formatDate, cleanFloat } from "@/lib/loan-utils";
import { exportBankCSV, exportBankPDF } from "@/lib/export";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  borrowerName: string;
  principalAmount: number;
  interestRate: number;
  startDate: string;
  dueDate: string;
  result: BankStyleResult;
  rateChanges?: RateChange[];
  onAddPayment?: (amount: number, paymentDate: string, notes?: string) => Promise<any> | void;
  onEditPayment?: (paymentId: number, amount: number, paymentDate: string, notes?: string) => Promise<any> | void;
  onDeletePayment?: (paymentId: number) => void;
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
  onAddPayment,
  onEditPayment,
  onDeletePayment,
}: Props) {
  const [showAll, setShowAll] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const [activeModal, setActiveModal] = useState<{
    type: "add" | "edit";
    id?: number;
    defaultDate: string;
  } | null>(null);

  const [editAmount, setEditAmount] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { rows, initialEMI, tenureMonths } = result;

  const handleStartEdit = (row: any) => {
    if (!row.paymentId) return;
    setActiveModal({
      type: "edit",
      id: row.paymentId,
      defaultDate: row.fromDate,
    });
    setEditAmount(Math.abs(row.prepAdjDisb).toString());
    setEditDate(row.fromDate);
    setEditNotes(row.notes || "");
  };

  const handleStartAdd = (row: any) => {
    setActiveModal({
      type: "add",
      defaultDate: row.fromDate,
    });
    setEditAmount("");
    setEditDate(row.fromDate);
    setEditNotes("");
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModal) return;
    const amount = cleanFloat(editAmount);
    if (isNaN(amount) || amount <= 0) return;
    setIsSaving(true);
    try {
      if (activeModal.type === "edit" && activeModal.id && onEditPayment) {
        await onEditPayment(activeModal.id, amount, editDate, editNotes || undefined);
      } else if (activeModal.type === "add" && onAddPayment) {
        await onAddPayment(amount, editDate, editNotes || undefined);
      }
      setActiveModal(null);
    } catch (err) {
      // Handled in mutation
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = () => {
    if (!activeModal || activeModal.type !== "edit" || !activeModal.id || !onDeletePayment) return;
    if (confirm("Are you sure you want to delete this prepayment?")) {
      onDeletePayment(activeModal.id);
      setActiveModal(null);
    }
  };

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
      <div className="bg-muted/50 border border-border rounded-t-lg px-4 py-3 flex flex-wrap items-center justify-between gap-3">
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
        <div className="flex items-center justify-end gap-2 px-4 py-2 bg-card border-b border-border">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs h-7"
            onClick={() =>
              exportBankCSV(borrowerName, principalAmount, interestRate, startDate, dueDate, result)
            }
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
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
            <FileText className="h-3.5 w-3.5 text-red-500" />
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
                  ? "bg-amber-500/10 border-b border-amber-500/20 text-amber-700 dark:text-amber-300"
                  : isRateChange
                  ? "bg-blue-500/10 border-b border-blue-500/20 text-blue-700 dark:text-blue-300"
                  : row.isCurrent
                  ? "bg-emerald-500/10 border-b border-emerald-500/20 font-semibold"
                  : row.isPast
                  ? "bg-card border-b border-border opacity-55"
                  : "bg-card border-b border-border hover:bg-muted/50";

                return (
                  <tr key={idx} className={`transition-opacity ${rowCls}`}>
                    <td className="px-2 py-1.5 text-center border-r border-border whitespace-nowrap">
                      {isPrepayment ? (
                        <Badge className="bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 border text-[10px] py-0 px-1.5">
                          Prepayment
                        </Badge>
                      ) : isRateChange ? (
                        <Badge className="bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800 border text-[10px] py-0 px-1.5">
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
                        isPrepayment ? "text-amber-700 dark:text-amber-300 font-semibold" : "text-muted-foreground"
                      }`}
                    >
                      {isPrepayment ? (
                        <div className="flex items-center justify-end gap-1.5 group/edit-cell">
                          <span>{fmtSigned(row.prepAdjDisb)}</span>
                          {row.paymentId && onEditPayment && (
                            <button
                              onClick={() => handleStartEdit(row)}
                              className="p-0.5 rounded hover:bg-amber-100 dark:hover:bg-amber-950/60 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors"
                              title="Edit prepayment"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5 group/add-cell min-h-[24px]">
                          <span>—</span>
                          {!isRateChange && onAddPayment && (
                            <button
                              onClick={() => handleStartAdd(row)}
                              className="opacity-0 group-hover/add-cell:opacity-100 p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                              title="Add prepayment for this month"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      )}
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
                    <td className="px-2 py-1.5 text-right border-r border-border whitespace-nowrap text-amber-600 dark:text-amber-400">
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
          <div className="px-4 py-3 border-t border-border text-center bg-card">
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-xs text-primary font-medium hover:underline"
            >
              {showAll ? "Show less ▲" : `View all ${rows.length} rows ▼`}
            </button>
          </div>
        )}
      </div>

      <Dialog open={activeModal !== null} onOpenChange={(open) => { if (!open) setActiveModal(null); }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {activeModal?.type === "edit" ? "Edit Prepayment" : "Add Prepayment"}
            </DialogTitle>
            <DialogDescription>
              {activeModal?.type === "edit"
                ? "Modify the prepayment details. This will recalculate the amortization schedule."
                : "Enter prepayment details for this period. This will recalculate the amortization schedule."}
            </DialogDescription>
          </DialogHeader>
          {activeModal && (
            <form onSubmit={handleSaveModal} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit-amount">Amount (₹)</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  min="1"
                  required
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-date">Payment Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  required
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-notes">Note (optional)</Label>
                <Textarea
                  id="edit-notes"
                  rows={3}
                  placeholder="Prepayment note..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                />
              </div>
              <DialogFooter className="flex items-center justify-between sm:justify-between gap-2 pt-2">
                {activeModal.type === "edit" && onDeletePayment && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="gap-1.5 animate-in fade-in"
                    disabled={isSaving}
                    onClick={handleDeleteClick}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                )}
                <div className="flex gap-2 ml-auto">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveModal(null)}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={isSaving}>
                    {isSaving ? "Saving..." : activeModal.type === "edit" ? "Save Changes" : "Add Prepayment"}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
