import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";

import {
  useGetLoan,
  useListPayments,
  useDeleteLoan,
  useDeletePayment,
  getListLoansQueryKey,
  getGetRecentLoansQueryKey,
  getGetDashboardSummaryQueryKey,
} from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";

function formatRupees(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function LoanDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();
  const loanId = parseInt(id ?? "0", 10);

  const {
    data: loan,
    isLoading: loanLoading,
    refetch: refetchLoan,
  } = useGetLoan(loanId);

  const {
    data: payments,
    isLoading: paymentsLoading,
    refetch: refetchPayments,
  } = useListPayments(loanId);

  const { mutateAsync: deleteLoan, isPending: deletingLoan } = useDeleteLoan();
  const { mutateAsync: deletePayment } = useDeletePayment();

  const onRefresh = () => {
    refetchLoan();
    refetchPayments();
  };

  const handleDeleteLoan = () => {
    Alert.alert("Delete Loan", "Remove this loan permanently?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteLoan({ id: loanId });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await queryClient.invalidateQueries({
              queryKey: getListLoansQueryKey(),
            });
            await queryClient.invalidateQueries({
              queryKey: getGetRecentLoansQueryKey(),
            });
            await queryClient.invalidateQueries({
              queryKey: getGetDashboardSummaryQueryKey(),
            });
            router.back();
          } catch {
            Alert.alert("Error", "Could not delete loan.");
          }
        },
      },
    ]);
  };

  const handleDeletePayment = (paymentId: number) => {
    Alert.alert("Remove Payment", "Remove this payment record?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePayment({ id: loanId, paymentId });
            refetchLoan();
            refetchPayments();
            await queryClient.invalidateQueries({
              queryKey: getGetDashboardSummaryQueryKey(),
            });
          } catch {
            Alert.alert("Error", "Could not remove payment.");
          }
        },
      },
    ]);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 8,
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    editBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    deleteBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.destructive + "22",
      alignItems: "center",
      justifyContent: "center",
    },
    content: {
      paddingHorizontal: 16,
      paddingBottom: 40 + insets.bottom + (Platform.OS === "web" ? 34 : 0),
    },
    loanCard: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius + 4,
      padding: 20,
      marginBottom: 20,
    },
    borrowerName: {
      fontSize: 22,
      fontWeight: "700" as const,
      color: colors.primaryForeground,
      fontFamily: "Inter_700Bold",
      marginBottom: 4,
    },
    statusBadge: {
      alignSelf: "flex-start",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: "rgba(255,255,255,0.2)",
      marginBottom: 16,
    },
    statusText: {
      fontSize: 12,
      fontWeight: "600" as const,
      color: colors.primaryForeground,
      textTransform: "capitalize",
      fontFamily: "Inter_600SemiBold",
    },
    amountRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    amountLabel: {
      fontSize: 12,
      color: "rgba(255,255,255,0.7)",
      fontFamily: "Inter_400Regular",
    },
    amountValue: {
      fontSize: 20,
      fontWeight: "700" as const,
      color: colors.primaryForeground,
      fontFamily: "Inter_700Bold",
    },
    amountValueSmall: {
      fontSize: 15,
      fontWeight: "600" as const,
      color: colors.primaryForeground,
      fontFamily: "Inter_600SemiBold",
    },
    progressBar: {
      height: 6,
      backgroundColor: "rgba(255,255,255,0.25)",
      borderRadius: 3,
      overflow: "hidden",
    },
    progressFill: {
      height: 6,
      backgroundColor: colors.primaryForeground,
      borderRadius: 3,
    },
    progressLabel: {
      fontSize: 11,
      color: "rgba(255,255,255,0.7)",
      marginTop: 6,
      fontFamily: "Inter_400Regular",
    },
    detailGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginBottom: 20,
    },
    detailItem: {
      flex: 1,
      minWidth: "45%",
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    detailLabel: {
      fontSize: 11,
      color: colors.mutedForeground,
      marginBottom: 4,
      fontFamily: "Inter_400Regular",
    },
    detailValue: {
      fontSize: 14,
      fontWeight: "600" as const,
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600" as const,
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
    },
    addPaymentBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: colors.primary,
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
    },
    addPaymentText: {
      fontSize: 13,
      color: colors.primaryForeground,
      fontWeight: "500" as const,
      fontFamily: "Inter_500Medium",
    },
    paymentRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 8,
    },
    paymentDate: {
      fontSize: 13,
      fontWeight: "600" as const,
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
    },
    paymentNotes: {
      fontSize: 12,
      color: colors.mutedForeground,
      marginTop: 2,
      fontFamily: "Inter_400Regular",
    },
    paymentAmount: {
      fontSize: 15,
      fontWeight: "700" as const,
      color: colors.success,
      fontFamily: "Inter_700Bold",
    },
    deletePaymentBtn: {
      padding: 6,
      marginLeft: 8,
    },
    emptyPayments: {
      textAlign: "center",
      color: colors.mutedForeground,
      fontSize: 14,
      paddingVertical: 24,
      fontFamily: "Inter_400Regular",
    },
    description: {
      fontSize: 13,
      color: colors.mutedForeground,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 20,
      lineHeight: 18,
      fontFamily: "Inter_400Regular",
    },
    payFasterCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      marginBottom: 20,
    },
    payFasterTitle: {
      fontSize: 14,
      fontWeight: "600" as const,
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
      marginBottom: 2,
    },
    payFasterSubtitle: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginBottom: 12,
    },
    payFasterRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    payFasterGoal: {
      fontSize: 13,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
    },
    payFasterGoalSub: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginTop: 1,
    },
    payFasterAmount: {
      fontSize: 14,
      fontWeight: "700" as const,
      color: colors.primary,
      fontFamily: "Inter_700Bold",
    },
    payFasterAmountSub: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      textAlign: "right",
    },
    loader: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
  });

  if (loanLoading) {
    return (
      <View style={[styles.container, styles.loader]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!loan) {
    return (
      <View style={[styles.container, styles.loader]}>
        <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
          Loan not found.
        </Text>
      </View>
    );
  }

  const progress =
    loan.principalAmount > 0
      ? Math.min(loan.totalPaid / loan.principalAmount, 1)
      : 0;

  const statusColor =
    loan.status === "paid"
      ? colors.success
      : loan.status === "overdue"
        ? colors.destructive
        : colors.primary;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push(`/loan/${loanId}/edit` as never)}
            testID="edit-loan-btn"
          >
            <Feather name="edit-2" size={16} color={colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={handleDeleteLoan}
            disabled={deletingLoan}
            testID="delete-loan-btn"
          >
            <Feather name="trash-2" size={16} color={colors.destructive} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={onRefresh} />
        }
      >
        <View style={[styles.loanCard, { backgroundColor: statusColor }]}>
          <Text style={styles.borrowerName}>{loan.borrowerName}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{loan.status}</Text>
          </View>
          <View style={styles.amountRow}>
            <View>
              <Text style={styles.amountLabel}>Remaining</Text>
              <Text style={styles.amountValue}>
                {formatRupees(loan.remainingAmount)}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.amountLabel}>Principal</Text>
              <Text style={styles.amountValueSmall}>
                {formatRupees(loan.principalAmount)}
              </Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${progress * 100}%` }]}
            />
          </View>
          <Text style={styles.progressLabel}>
            {formatRupees(loan.totalPaid)} collected (
            {Math.round(progress * 100)}%)
          </Text>
        </View>

        <View style={styles.detailGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Interest Rate</Text>
            <Text style={styles.detailValue}>{loan.interestRate}% p.a.</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Start Date</Text>
            <Text style={styles.detailValue}>{formatDate(loan.startDate)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Due Date</Text>
            <Text style={styles.detailValue}>{formatDate(loan.dueDate)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Total Paid</Text>
            <Text style={styles.detailValue}>{formatRupees(loan.totalPaid)}</Text>
          </View>
        </View>

        {loan.description ? (
          <Text style={styles.description}>{loan.description}</Text>
        ) : null}

        {loan.remainingAmount > 0 && loan.status !== "paid" && (() => {
          const today = new Date();
          const due = new Date(loan.dueDate);
          const msPerMonth = 1000 * 60 * 60 * 24 * 30.44;
          const monthsLeft = Math.max(
            1,
            Math.round((due.getTime() - today.getTime()) / msPerMonth)
          );
          const isOverdue = due < today;

          const scenarios: Array<{
            label: string;
            sub: string;
            months: number;
            highlight?: boolean;
          }> = [];

          if (!isOverdue && monthsLeft > 1) {
            scenarios.push({
              label: "On time",
              sub: `by ${formatDate(loan.dueDate)}`,
              months: monthsLeft,
            });
          }
          if (monthsLeft > 6) {
            scenarios.push({
              label: "6 months early",
              sub: `finish ${monthsLeft - 6} months sooner`,
              months: monthsLeft - 6,
            });
          }
          scenarios.push({
            label: "Clear in 6 months",
            sub: "6 equal payments",
            months: 6,
            highlight: monthsLeft > 6,
          });
          scenarios.push({
            label: "Clear in 3 months",
            sub: "3 equal payments",
            months: 3,
            highlight: true,
          });
          scenarios.push({
            label: "Pay it all now",
            sub: "single payment",
            months: 1,
          });

          return (
            <View style={styles.payFasterCard}>
              <Text style={styles.payFasterTitle}>⚡ Pay Faster</Text>
              <Text style={styles.payFasterSubtitle}>
                {isOverdue
                  ? `Overdue — clear ${formatRupees(loan.remainingAmount)} ASAP`
                  : `${monthsLeft} month${monthsLeft !== 1 ? "s" : ""} until due date`}
              </Text>
              {scenarios.map((sc) => {
                const perMonth = Math.ceil(loan.remainingAmount / sc.months);
                return (
                  <View key={sc.label} style={styles.payFasterRow}>
                    <View>
                      <Text style={styles.payFasterGoal}>{sc.label}</Text>
                      <Text style={styles.payFasterGoalSub}>{sc.sub}</Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text
                        style={[
                          styles.payFasterAmount,
                          sc.highlight && { color: colors.success },
                        ]}
                      >
                        {sc.months === 1
                          ? formatRupees(loan.remainingAmount)
                          : `${formatRupees(perMonth)}/mo`}
                      </Text>
                      {sc.months > 1 && (
                        <Text style={styles.payFasterAmountSub}>
                          × {sc.months} = {formatRupees(loan.remainingAmount)}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          );
        })()}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Payments</Text>
          <TouchableOpacity
            style={styles.addPaymentBtn}
            onPress={() =>
              router.push(`/loan/${loanId}/payment` as never)
            }
            testID="add-payment-btn"
          >
            <Feather name="plus" size={14} color={colors.primaryForeground} />
            <Text style={styles.addPaymentText}>Record</Text>
          </TouchableOpacity>
        </View>

        {paymentsLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : payments && payments.length > 0 ? (
          payments.map((pmt) => (
            <View key={pmt.id} style={styles.paymentRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.paymentDate}>
                  {formatDate(pmt.paymentDate)}
                </Text>
                {pmt.notes ? (
                  <Text style={styles.paymentNotes}>{pmt.notes}</Text>
                ) : null}
              </View>
              <Text style={styles.paymentAmount}>
                +{formatRupees(pmt.amount)}
              </Text>
              <TouchableOpacity
                style={styles.deletePaymentBtn}
                onPress={() => handleDeletePayment(pmt.id)}
                testID={`delete-payment-${pmt.id}`}
              >
                <Feather name="x" size={14} color={colors.destructive} />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.emptyPayments}>
            No payments recorded yet. Tap Record to add one.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
