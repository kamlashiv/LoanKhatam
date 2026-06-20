import type { AmortizationResult } from "./amortization";
import type { InterestSavings } from "./amortization";
import type { BankStyleResult } from "./amortization";
import { formatDate } from "./loan-utils";

export function exportToCSV(
  borrowerName: string,
  amort: AmortizationResult,
  savings: InterestSavings,
  principalAmount: number,
  interestRate: number,
  startDate: string,
  dueDate: string
) {
  const rows: string[][] = [];
  rows.push(["LOAN AMORTIZATION SCHEDULE - LEDGER"]);
  rows.push([]);
  rows.push(["Borrower", borrowerName]);
  rows.push(["Principal Amount", `Rs ${principalAmount}`]);
  rows.push(["Annual Interest Rate", `${interestRate}%`]);
  rows.push(["Start Date", formatDate(startDate)]);
  rows.push(["Due Date", formatDate(dueDate)]);
  rows.push(["Tenure (Months)", amort.tenureMonths.toString()]);
  rows.push(["Monthly EMI", `Rs ${amort.emi.toFixed(2)}`]);
  rows.push(["Total Payment", `Rs ${amort.totalPayment.toFixed(2)}`]);
  rows.push(["Total Interest", `Rs ${amort.totalInterest.toFixed(2)}`]);
  rows.push(["Interest Saved (Early Payments)", `Rs ${savings.interestSaved.toFixed(2)}`]);
  rows.push([]);
  rows.push([
    "Month", "Date", "Opening Balance (Rs)", "EMI (Rs)",
    "Interest Component (Rs)", "Principal Component (Rs)", "Closing Balance (Rs)",
  ]);
  for (const row of amort.schedule) {
    rows.push([
      row.month.toString(), formatDate(row.date),
      row.openingBalance.toFixed(2), row.emi.toFixed(2),
      row.interestComponent.toFixed(2), row.principalComponent.toFixed(2),
      row.closingBalance.toFixed(2),
    ]);
  }
  triggerCSVDownload(rows, `amortization_${borrowerName.replace(/\s+/g, "_")}.csv`);
}

export function exportBankCSV(
  borrowerName: string,
  principalAmount: number,
  interestRate: number,
  startDate: string,
  dueDate: string,
  result: BankStyleResult
) {
  const rows: string[][] = [];
  rows.push(["BANK-STYLE LOAN AMORTIZATION SCHEDULE - LEDGER"]);
  rows.push([]);
  rows.push(["Borrower", borrowerName]);
  rows.push(["Loan Amount", `Rs ${principalAmount}`]);
  rows.push(["ROI", `${interestRate}% p.a.`]);
  rows.push(["Current EMI", `Rs ${result.initialEMI.toFixed(2)}`]);
  rows.push(["Original Sanction Term", `${result.tenureMonths} Months`]);
  rows.push(["Start Date", formatDate(startDate)]);
  rows.push(["Due Date", formatDate(dueDate)]);
  rows.push([]);
  rows.push([
    "Tran Type", "From Date", "To Date",
    "Opening Prin. Bal.", "Prep/Adj/Disb", "ROI",
    "EMI", "Months", "EMI Rcble",
    "Int. Comp.", "Prin Comp.", "Closing Prin.",
  ]);
  for (const row of result.rows) {
    rows.push([
      row.rowType === "prepayment" ? "Prepayment" : row.tranType,
      formatDate(row.fromDate),
      formatDate(row.toDate),
      row.openingPrincipal.toFixed(2),
      row.prepAdjDisb !== 0 ? row.prepAdjDisb.toFixed(2) : "",
      row.roi > 0 ? `${row.roi}%` : "",
      row.emi > 0 ? row.emi.toFixed(2) : "",
      row.months > 0 ? row.months.toString() : "",
      row.emiRcble > 0 ? row.emiRcble.toFixed(2) : "",
      row.intComp > 0 ? row.intComp.toFixed(2) : "",
      row.prinComp > 0 ? row.prinComp.toFixed(2) : "",
      row.closingPrincipal.toFixed(2),
    ]);
  }
  triggerCSVDownload(rows, `bank_amortization_${borrowerName.replace(/\s+/g, "_")}.csv`);
}

function triggerCSVDownload(rows: string[][], filename: string) {
  const csvContent = rows
    .map((r) => r.map((cell) => `"${cell}"`).join(","))
    .join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportToPDF(
  borrowerName: string,
  amort: AmortizationResult,
  savings: InterestSavings,
  principalAmount: number,
  interestRate: number,
  startDate: string,
  dueDate: string
) {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const PRIMARY = [29, 92, 66] as [number, number, number];
  const AMBER = [217, 119, 6] as [number, number, number];
  const DARK = [15, 23, 42] as [number, number, number];

  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, 297, 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Ledger — Loan Amortization Schedule", 14, 14);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${formatDate(new Date().toISOString().split("T")[0])}`, 250, 14);

  let y = 30;
  doc.setTextColor(...DARK);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(`Borrower: ${borrowerName}`, 14, y);

  y += 8;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);

  const infoLeft = [
    ["Principal Amount", `Rs ${principalAmount.toLocaleString("en-IN")}`],
    ["Annual Interest Rate", `${interestRate}% p.a.`],
    ["Loan Tenure", `${amort.tenureMonths} months`],
  ];
  const infoRight = [
    ["Start Date", formatDate(startDate)],
    ["Due Date", formatDate(dueDate)],
    ["Monthly EMI", `Rs ${amort.emi.toFixed(2)}`],
  ];
  infoLeft.forEach(([label, val], i) => {
    doc.setFont("helvetica", "bold");
    doc.text(label + ":", 14, y + i * 6);
    doc.setFont("helvetica", "normal");
    doc.text(val, 55, y + i * 6);
  });
  infoRight.forEach(([label, val], i) => {
    doc.setFont("helvetica", "bold");
    doc.text(label + ":", 110, y + i * 6);
    doc.setFont("helvetica", "normal");
    doc.text(val, 145, y + i * 6);
  });
  y += 22;

  autoTable(doc, {
    startY: y,
    head: [["Total Payment", "Principal", "Total Interest (Scheduled)", "Interest Saved"]],
    body: [[
      `Rs ${amort.totalPayment.toFixed(2)}`, `Rs ${principalAmount.toFixed(2)}`,
      `Rs ${amort.totalInterest.toFixed(2)}`,
      savings.interestSaved > 0 ? `Rs ${savings.interestSaved.toFixed(2)}` : "—",
    ]],
    theme: "grid",
    headStyles: { fillColor: PRIMARY, textColor: 255, fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: DARK },
    margin: { left: 14, right: 14 },
  });

  const afterSummary = (doc as any).lastAutoTable.finalY + 8;
  autoTable(doc, {
    startY: afterSummary,
    head: [["Month", "Date", "Opening Balance", "EMI", "Interest", "Principal", "Closing Balance"]],
    body: amort.schedule.map((row) => [
      row.month.toString(), formatDate(row.date),
      `Rs ${row.openingBalance.toFixed(2)}`, `Rs ${row.emi.toFixed(2)}`,
      `Rs ${row.interestComponent.toFixed(2)}`, `Rs ${row.principalComponent.toFixed(2)}`,
      `Rs ${row.closingBalance.toFixed(2)}`,
    ]),
    theme: "striped",
    headStyles: { fillColor: PRIMARY, textColor: 255, fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 8, textColor: DARK },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: { 4: { textColor: AMBER }, 5: { textColor: PRIMARY } },
    margin: { left: 14, right: 14 },
  });

  addPageNumbers(doc);
  doc.save(`amortization_${borrowerName.replace(/\s+/g, "_")}.pdf`);
}

export async function exportBankPDF(
  borrowerName: string,
  principalAmount: number,
  interestRate: number,
  startDate: string,
  dueDate: string,
  result: BankStyleResult
) {
  const { jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const PRIMARY = [29, 92, 66] as [number, number, number];
  const ORANGE = [194, 65, 12] as [number, number, number];
  const AMBER_TEXT = [146, 64, 14] as [number, number, number];
  const DARK = [15, 23, 42] as [number, number, number];
  const AMBER_BG = [255, 251, 235] as [number, number, number];

  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, 297, 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text("Ledger — Bank-Style Amortization Schedule", 14, 14);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${formatDate(new Date().toISOString().split("T")[0])}`, 245, 14);

  let y = 28;
  doc.setTextColor(...DARK);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Borrower: ${borrowerName}`, 14, y);

  y += 7;
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);

  const hdrs = ["LOAN AMOUNT", "ROI", "CURRENT EMI", "ORIGINAL SANCTION TERM"];
  const vals = [
    `Rs ${principalAmount.toLocaleString("en-IN")}`,
    `${interestRate}% p.a.`,
    `Rs ${result.initialEMI.toFixed(2)}`,
    `${result.tenureMonths} Months`,
  ];
  hdrs.forEach((h, i) => {
    const x = 14 + i * 70;
    doc.setFont("helvetica", "bold");
    doc.text(h + ":", x, y);
    doc.setFont("helvetica", "normal");
    doc.text(vals[i], x, y + 5);
  });
  y += 14;

  autoTable(doc, {
    startY: y,
    head: [[
      "Tran Type", "From Date", "To Date",
      "Opening Prin.", "Prep/Adj/Disb", "ROI",
      "EMI", "Months", "EMI Rcble",
      "Int. Comp.", "Prin Comp.", "Closing Prin.",
    ]],
    body: result.rows.map((row) => [
      row.rowType === "prepayment" ? "Prepayment" : row.tranType,
      formatDate(row.fromDate), formatDate(row.toDate),
      row.openingPrincipal.toFixed(2),
      row.prepAdjDisb !== 0 ? row.prepAdjDisb.toFixed(2) : "—",
      row.roi > 0 ? `${row.roi}%` : "—",
      row.emi > 0 ? row.emi.toFixed(2) : "—",
      row.months > 0 ? row.months.toString() : "—",
      row.emiRcble > 0 ? row.emiRcble.toFixed(2) : "—",
      row.intComp > 0 ? row.intComp.toFixed(2) : "—",
      row.prinComp > 0 ? row.prinComp.toFixed(2) : "—",
      row.closingPrincipal.toFixed(2),
    ]),
    theme: "grid",
    headStyles: { fillColor: ORANGE, textColor: 255, fontStyle: "bold", fontSize: 7 },
    bodyStyles: { fontSize: 7, textColor: DARK },
    columnStyles: { 9: { textColor: AMBER_TEXT }, 10: { textColor: PRIMARY } },
    didParseCell: (data: any) => {
      if (data.section === "body") {
        const row = result.rows[data.row.index];
        if (row?.rowType === "prepayment") {
          data.cell.styles.fillColor = AMBER_BG;
          data.cell.styles.textColor = [146, 64, 14];
          data.cell.styles.fontStyle = "bold";
        } else if (row?.isPast) {
          data.cell.styles.textColor = [160, 160, 160];
        } else if (row?.isCurrent) {
          data.cell.styles.fillColor = [236, 253, 245];
        }
      }
    },
    margin: { left: 6, right: 6 },
  });

  addPageNumbers(doc);
  doc.save(`bank_amortization_${borrowerName.replace(/\s+/g, "_")}.pdf`);
}

function addPageNumbers(doc: any) {
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${totalPages} — Ledger Loan Tracker`,
      14,
      doc.internal.pageSize.height - 6
    );
  }
}
