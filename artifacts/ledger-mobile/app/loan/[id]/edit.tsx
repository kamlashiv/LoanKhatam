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

  useEffect(() => {
    if (loan) {
      setBorrowerName(loan.borrowerName);
      setPrincipalAmount(String(loan.principalAmount));
      setInterestRate(String(loan.interestRate));
      setStartDate(loan.startDate);
      setDueDate(loan.dueDate);
      setDescription(loan.description ?? "");
    }
  }, [loan]);

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
        },
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
      router.back();
    } catch {
      Alert.alert("Error", "Could not update loan. Please try again.");
    }
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
      </ScrollView>
    </View>
  );
}
