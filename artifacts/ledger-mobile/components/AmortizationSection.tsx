import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { calculateBankStyleSchedule, type RateChange } from "@/lib/amortization";
import { useColors } from "@/hooks/useColors";

interface Payment {
  paymentDate: string;
  amount: number;
}

interface Props {
  principalAmount: number;
  interestRate: number;
  startDate: string;
  dueDate: string;
  payments?: Payment[];
  rateChanges?: RateChange[];
}

function fmt(n: number): string {
  if (n === 0) return "—";
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

const PREVIEW_COUNT = 18;

const COL = {
  type: 110,
  date: 90,
  amount: 96,
  roi: 60,
};

export function AmortizationSection({
  principalAmount,
  interestRate,
  startDate,
  dueDate,
  payments = [],
  rateChanges = [],
}: Props) {
  const colors = useColors();
  const [showAll, setShowAll] = useState(false);

  const result = useMemo(
    () =>
      calculateBankStyleSchedule(
        principalAmount,
        interestRate,
        startDate,
        dueDate,
        payments,
        rateChanges
      ),
    [principalAmount, interestRate, startDate, dueDate, payments, rateChanges]
  );

  const { rows, initialEMI, tenureMonths } = result;
  const displayedRows = showAll ? rows : rows.slice(0, PREVIEW_COUNT);

  const styles = StyleSheet.create({
    summaryCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      marginBottom: 12,
    },
    summaryRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 14,
    },
    summaryItem: {
      minWidth: "44%",
    },
    summaryLabel: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginBottom: 2,
    },
    summaryValue: {
      fontSize: 14,
      fontWeight: "700" as const,
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },
    tableWrap: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: colors.radius,
      overflow: "hidden",
    },
    headerRow: {
      flexDirection: "row",
      backgroundColor: colors.primary,
    },
    headerCell: {
      paddingVertical: 8,
      paddingHorizontal: 8,
      fontSize: 11,
      fontWeight: "700" as const,
      color: colors.primaryForeground,
      fontFamily: "Inter_700Bold",
    },
    dataRow: {
      flexDirection: "row",
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    cell: {
      paddingVertical: 8,
      paddingHorizontal: 8,
      fontSize: 11,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
    },
    badge: {
      alignSelf: "flex-start",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    badgeText: {
      fontSize: 9,
      fontWeight: "700" as const,
      fontFamily: "Inter_700Bold",
    },
    showMoreBtn: {
      paddingVertical: 12,
      alignItems: "center",
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.card,
    },
    showMoreText: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: "600" as const,
      fontFamily: "Inter_600SemiBold",
    },
    empty: {
      textAlign: "center",
      color: colors.mutedForeground,
      fontSize: 13,
      paddingVertical: 24,
      fontFamily: "Inter_400Regular",
    },
  });

  if (rows.length === 0) {
    return (
      <Text style={styles.empty}>
        Amortization schedule unavailable — check start and due dates.
      </Text>
    );
  }

  const rateChangeBg = colors.primary + "14";
  const prepaymentBg = colors.success + "14";
  const currentBg = colors.primary + "0D";

  return (
    <View>
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Starting EMI</Text>
            <Text style={styles.summaryValue}>₹{fmt(initialEMI)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Term</Text>
            <Text style={styles.summaryValue}>{tenureMonths} months</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Interest</Text>
            <Text style={styles.summaryValue}>₹{fmt(result.totalInterest)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Principal</Text>
            <Text style={styles.summaryValue}>₹{fmt(result.totalPrincipal)}</Text>
          </View>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View style={styles.tableWrap}>
          <View style={styles.headerRow}>
            <Text style={[styles.headerCell, { width: COL.type }]}>Type</Text>
            <Text style={[styles.headerCell, { width: COL.date }]}>From</Text>
            <Text style={[styles.headerCell, { width: COL.amount, textAlign: "right" }]}>
              Opening
            </Text>
            <Text style={[styles.headerCell, { width: COL.roi, textAlign: "right" }]}>
              ROI
            </Text>
            <Text style={[styles.headerCell, { width: COL.amount, textAlign: "right" }]}>
              EMI
            </Text>
            <Text style={[styles.headerCell, { width: COL.amount, textAlign: "right" }]}>
              Interest
            </Text>
            <Text style={[styles.headerCell, { width: COL.amount, textAlign: "right" }]}>
              Principal
            </Text>
            <Text style={[styles.headerCell, { width: COL.amount, textAlign: "right" }]}>
              Closing
            </Text>
          </View>

          {displayedRows.map((row, idx) => {
            const isRateChange = row.rowType === "rate_change";
            const isPrepayment = row.rowType === "prepayment";
            const rowBg = isRateChange
              ? rateChangeBg
              : isPrepayment
                ? prepaymentBg
                : row.isCurrent
                  ? currentBg
                  : "transparent";

            return (
              <View
                key={idx}
                style={[
                  styles.dataRow,
                  { backgroundColor: rowBg, opacity: row.isPast && !isRateChange ? 0.6 : 1 },
                ]}
              >
                <View style={[styles.cell, { width: COL.type }]}>
                  {isRateChange ? (
                    <View
                      style={[styles.badge, { backgroundColor: colors.primary + "22" }]}
                    >
                      <Text style={[styles.badgeText, { color: colors.primary }]}>
                        Rate Change
                      </Text>
                    </View>
                  ) : isPrepayment ? (
                    <View
                      style={[styles.badge, { backgroundColor: colors.success + "22" }]}
                    >
                      <Text style={[styles.badgeText, { color: colors.success }]}>
                        Payment
                      </Text>
                    </View>
                  ) : (
                    <Text
                      style={[
                        styles.badgeText,
                        { color: colors.foreground, fontSize: 11 },
                      ]}
                    >
                      {row.tranType}
                      {row.isCurrent ? " • Today" : ""}
                    </Text>
                  )}
                </View>
                <Text style={[styles.cell, { width: COL.date }]}>
                  {formatDate(row.fromDate)}
                </Text>
                <Text style={[styles.cell, { width: COL.amount, textAlign: "right" }]}>
                  {fmt(row.openingPrincipal)}
                </Text>
                <Text style={[styles.cell, { width: COL.roi, textAlign: "right" }]}>
                  {row.roi > 0 ? `${row.roi}%` : "—"}
                </Text>
                <Text style={[styles.cell, { width: COL.amount, textAlign: "right" }]}>
                  {isPrepayment ? fmt(row.prepAdjDisb) : row.emi > 0 ? fmt(row.emi) : "—"}
                </Text>
                <Text
                  style={[
                    styles.cell,
                    { width: COL.amount, textAlign: "right", color: colors.mutedForeground },
                  ]}
                >
                  {fmt(row.intComp)}
                </Text>
                <Text
                  style={[
                    styles.cell,
                    { width: COL.amount, textAlign: "right", color: colors.primary },
                  ]}
                >
                  {fmt(row.prinComp)}
                </Text>
                <Text
                  style={[
                    styles.cell,
                    { width: COL.amount, textAlign: "right", fontWeight: "600" },
                  ]}
                >
                  {fmt(row.closingPrincipal)}
                </Text>
              </View>
            );
          })}

          {rows.length > PREVIEW_COUNT && (
            <TouchableOpacity
              style={styles.showMoreBtn}
              onPress={() => setShowAll(!showAll)}
            >
              <Text style={styles.showMoreText}>
                {showAll ? "Show less ▲" : `View all ${rows.length} rows ▼`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
