import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";

import {
  useGetLoan,
  useUpdateLoan,
  getGetLoanQueryKey,
  getListLoansQueryKey,
  getGetRecentLoansQueryKey,
  getGetDashboardSummaryQueryKey,
} from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";

interface RateChangeEntry {
  effectiveDate: string;
  newRate: string;
}

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export default function EditLoanScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();
  const loanId = parseInt(id ?? "0", 10);

  const { data: loan, isLoading } = useGetLoan(loanId);
  const { mutateAsync: updateLoan, isPending } = useUpdateLoan();

  const [borrowerName, setBorrowerName] = useState("");
  const [principalAmount, setPrincipalAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [rateChanges, setRateChanges] = useState<RateChangeEntry[]>([]);

  useEffect(() => {
    if (loan) {
      setBorrowerName(loan.borrowerName);
      setPrincipalAmount(String(loan.principalAmount));
      setInterestRate(String(loan.interestRate));
      setStartDate(loan.startDate);
      setDueDate(loan.dueDate);
      setDescription(loan.description ?? "");
      if (loan.rateChanges && loan.rateChanges.length > 0) {
        setRateChanges(
          loan.rateChanges.map((rc) => ({
            effectiveDate: rc.effectiveDate,
            newRate: String(rc.newRate),
          }))
        );
      } else {
        setRateChanges([]);
      }
    }
  }, [loan]);

  const addRateChange = () => {
    setRateChanges((prev) => [
      ...prev,
      { effectiveDate: todayISO(), newRate: "" },
    ]);
  };

  const removeRateChange = (index: number) => {
    setRateChanges((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRateChange = (
    index: number,
    field: keyof RateChangeEntry,
    value: string
  ) => {
    setRateChanges((prev) =>
      prev.map((rc, i) => (i === index ? { ...rc, [field]: value } : rc))
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 8,
      paddingHorizontal: 16,
      paddingBottom: 12,
      gap: 12,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: "700" as const,
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },
    loader: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    content: {
      paddingHorizontal: 16,
      paddingBottom: 40 + insets.bottom + (Platform.OS === "web" ? 34 : 0),
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: "600" as const,
      color: colors.foreground,
      marginBottom: 6,
      marginTop: 16,
      fontFamily: "Inter_600SemiBold",
    },
    input: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: colors.radius,
      paddingHorizontal: 14,
      height: 46,
      fontSize: 15,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
    },
    textArea: {
      height: 80,
      paddingTop: 12,
      paddingBottom: 12,
    },
    row: {
      flexDirection: "row",
      gap: 12,
    },
    halfField: {
      flex: 1,
    },
    helpText: {
      fontSize: 11,
      color: colors.mutedForeground,
      marginTop: 4,
      fontFamily: "Inter_400Regular",
    },
    rateSectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 20,
    },
    rateSectionTitle: {
      fontSize: 13,
      fontWeight: "600" as const,
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
    },
    rateSectionSub: {
      fontSize: 11,
      color: colors.mutedForeground,
      marginTop: 2,
      fontFamily: "Inter_400Regular",
      maxWidth: 220,
    },
    addRateBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 16,
    },
    addRateBtnText: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: "600" as const,
      fontFamily: "Inter_600SemiBold",
    },
    rateList: {
      marginTop: 10,
      gap: 8,
      backgroundColor: colors.muted,
      borderRadius: colors.radius,
      padding: 10,
    },
    rateRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 8,
    },
    rateInputLabel: {
      fontSize: 11,
      color: colors.mutedForeground,
      marginBottom: 4,
      fontFamily: "Inter_400Regular",
    },
    rateInput: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: colors.radius - 2,
      paddingHorizontal: 10,
      height: 40,
      fontSize: 14,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
    },
    removeRateBtn: {
      width: 40,
      height: 40,
      borderRadius: colors.radius - 2,
      backgroundColor: colors.destructive + "18",
      alignItems: "center",
      justifyContent: "center",
    },
    submitBtn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      height: 50,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 28,
      flexDirection: "row",
      gap: 8,
    },
    submitBtnDisabled: {
      opacity: 0.6,
    },
    submitBtnText: {
      color: colors.primaryForeground,
      fontSize: 16,
      fontWeight: "600" as const,
      fontFamily: "Inter_600SemiBold",
    },
    markPaidBtn: {
      borderWidth: 1,
      borderColor: colors.success,
      backgroundColor: colors.success + "14",
      borderRadius: colors.radius,
      height: 50,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 12,
      flexDirection: "row",
      gap: 8,
    },
    markPaidBtnText: {
      color: colors.success,
      fontSize: 16,
      fontWeight: "600" as const,
      fontFamily: "Inter_600SemiBold",
    },
    paidNotice: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginTop: 12,
      paddingVertical: 14,
      borderRadius: colors.radius,
      backgroundColor: colors.success + "14",
    },
    paidNoticeText: {
      color: colors.success,
      fontSize: 14,
      fontWeight: "600" as const,
      fontFamily: "Inter_600SemiBold",
    },
  });

  const handleSubmit = async () => {
    const name = borrowerName.trim();
    const principal = parseFloat(principalAmount);
    const rate = parseFloat(interestRate);

    if (!name) {
      Alert.alert("Required", "Enter the borrower's name.");
      return;
    }
    if (isNaN(principal) || principal <= 0) {
      Alert.alert("Required", "Enter a valid principal amount.");
      return;
    }
    if (isNaN(rate) || rate < 0) {
      Alert.alert("Required", "Enter a valid interest rate (0 or more).");
      return;
    }
    if (!startDate || !dueDate) {
      Alert.alert("Required", "Enter start and due dates.");
      return;
    }

    const validRateChanges = rateChanges
      .filter((rc) => rc.effectiveDate && rc.newRate !== "")
      .map((rc) => ({
        effectiveDate: rc.effectiveDate,
        newRate: parseFloat(rc.newRate),
      }))
      .filter((rc) => !isNaN(rc.newRate) && rc.newRate >= 0)
      .sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate));

    const performUpdate = async () => {
      try {
        await updateLoan({
          id: loanId,
          data: {
            borrowerName: name,
            principalAmount: principal,
            interestRate: rate,
            startDate,
            dueDate,
            description: description.trim() || undefined,
            rateChanges: validRateChanges,
          },
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await invalidateLoanQueries();
        router.back();
      } catch {
        Alert.alert("Error", "Could not update loan. Please try again.");
      }
    };

    // Warn before saving large edits to principal or interest rate, which can
    // confusingly shift the outstanding balance once payments exist.
    const bigChange = (original: number, next: number): boolean => {
      if (original === next) return false;
      if (original <= 0) return next > 0;
      return Math.abs(next - original) / original > 0.1;
    };

    const principalChanged = loan
      ? bigChange(loan.principalAmount, principal)
      : false;
    const rateChanged = loan ? bigChange(loan.interestRate, rate) : false;

    if (principalChanged || rateChanged) {
      const changes: string[] = [];
      if (principalChanged) {
        changes.push(
          `Principal: ₹${loan!.principalAmount.toLocaleString("en-IN")} → ₹${principal.toLocaleString("en-IN")}`
        );
      }
      if (rateChanged) {
        changes.push(`Interest rate: ${loan!.interestRate}% → ${rate}%`);
      }
      Alert.alert(
        "Confirm big change",
        `You're making a significant change to this loan:\n\n${changes.join(
          "\n"
        )}\n\nThis can change the outstanding balance. Save anyway?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Save Changes", style: "destructive", onPress: performUpdate },
        ]
      );
      return;
    }

    await performUpdate();
  };

  const invalidateLoanQueries = async () => {
    await queryClient.invalidateQueries({
      queryKey: getGetLoanQueryKey(loanId),
    });
    await queryClient.invalidateQueries({
      queryKey: getListLoansQueryKey(),
    });
    await queryClient.invalidateQueries({
      queryKey: getGetRecentLoansQueryKey(),
    });
    await queryClient.invalidateQueries({
      queryKey: getGetDashboardSummaryQueryKey(),
    });
  };

  const handleMarkAsPaid = () => {
    Alert.alert(
      "Mark as Paid",
      "Close out this loan by setting its status to paid?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark as Paid",
          onPress: async () => {
            try {
              await updateLoan({ id: loanId, data: { status: "paid" } });
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
              await invalidateLoanQueries();
              router.back();
            } catch {
              Alert.alert(
                "Error",
                "Could not mark loan as paid. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="x" size={18} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Loan</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.fieldLabel}>Borrower Name</Text>
        <TextInput
          style={styles.input}
          value={borrowerName}
          onChangeText={setBorrowerName}
          placeholder="e.g. Rahul Sharma"
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="words"
          testID="edit-borrower-name"
        />

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>Principal (₹)</Text>
            <TextInput
              style={styles.input}
              value={principalAmount}
              onChangeText={setPrincipalAmount}
              placeholder="50000"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="decimal-pad"
              testID="edit-principal-amount"
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>Interest Rate (%)</Text>
            <TextInput
              style={styles.input}
              value={interestRate}
              onChangeText={setInterestRate}
              placeholder="12"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="decimal-pad"
              testID="edit-interest-rate"
            />
            <Text style={styles.helpText}>Annual %</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>Start Date</Text>
            <TextInput
              style={styles.input}
              value={startDate}
              onChangeText={setStartDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.mutedForeground}
              testID="edit-start-date"
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>Due Date</Text>
            <TextInput
              style={styles.input}
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.mutedForeground}
              testID="edit-due-date"
            />
          </View>
        </View>

        <Text style={styles.fieldLabel}>Description (optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Notes about this loan..."
          placeholderTextColor={colors.mutedForeground}
          multiline
          numberOfLines={3}
          testID="edit-description"
        />

        <View style={styles.rateSectionHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rateSectionTitle}>Rate Change Events</Text>
            <Text style={styles.rateSectionSub}>
              Add dates when the interest rate changed (e.g. RBI rate revision)
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addRateBtn}
            onPress={addRateChange}
            testID="add-rate-change"
          >
            <Feather name="plus" size={14} color={colors.primary} />
            <Text style={styles.addRateBtnText}>Add</Text>
          </TouchableOpacity>
        </View>

        {rateChanges.length > 0 && (
          <View style={styles.rateList}>
            {rateChanges.map((rc, index) => (
              <View key={index} style={styles.rateRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rateInputLabel}>Effective Date</Text>
                  <TextInput
                    style={styles.rateInput}
                    value={rc.effectiveDate}
                    onChangeText={(v) =>
                      updateRateChange(index, "effectiveDate", v)
                    }
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.mutedForeground}
                    testID={`rate-change-date-${index}`}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rateInputLabel}>New Rate (%)</Text>
                  <TextInput
                    style={styles.rateInput}
                    value={rc.newRate}
                    onChangeText={(v) => updateRateChange(index, "newRate", v)}
                    placeholder="10"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="decimal-pad"
                    testID={`rate-change-rate-${index}`}
                  />
                </View>
                <TouchableOpacity
                  style={styles.removeRateBtn}
                  onPress={() => removeRateChange(index)}
                  testID={`remove-rate-change-${index}`}
                >
                  <Feather name="trash-2" size={16} color={colors.destructive} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitBtn, isPending && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isPending}
          testID="submit-edit-loan"
        >
          <Feather
            name="check"
            size={18}
            color={colors.primaryForeground}
          />
          <Text style={styles.submitBtnText}>
            {isPending ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>

        {loan.status === "paid" ? (
          <View style={styles.paidNotice}>
            <Feather name="check-circle" size={18} color={colors.success} />
            <Text style={styles.paidNoticeText}>This loan is marked as paid</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.markPaidBtn}
            onPress={handleMarkAsPaid}
            disabled={isPending}
            testID="mark-as-paid"
          >
            <Feather name="check-circle" size={18} color={colors.success} />
            <Text style={styles.markPaidBtnText}>Mark as Paid</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
