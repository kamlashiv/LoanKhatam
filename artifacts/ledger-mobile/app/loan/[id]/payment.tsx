import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
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
  useAddPayment,
  getListPaymentsQueryKey,
  getGetLoanQueryKey,
  getGetDashboardSummaryQueryKey,
  getGetRecentLoansQueryKey,
} from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export default function RecordPaymentScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams<{ id: string }>();
  const loanId = parseInt(id ?? "0", 10);

  const { mutateAsync: addPayment, isPending } = useAddPayment();

  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(todayISO());
  const [notes, setNotes] = useState("");

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
      fontSize: 18,
      fontWeight: "700" as const,
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },
    content: {
      paddingHorizontal: 16,
      paddingBottom: 40 + insets.bottom + (Platform.OS === "web" ? 34 : 0),
    },
    amountCard: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius + 4,
      padding: 24,
      alignItems: "center",
      marginBottom: 28,
    },
    amountLabel: {
      fontSize: 13,
      color: "rgba(255,255,255,0.75)",
      marginBottom: 8,
      fontFamily: "Inter_400Regular",
    },
    amountInputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    rupeeSymbol: {
      fontSize: 28,
      color: colors.primaryForeground,
      fontFamily: "Inter_700Bold",
      fontWeight: "700" as const,
    },
    amountInput: {
      fontSize: 36,
      fontWeight: "700" as const,
      color: colors.primaryForeground,
      fontFamily: "Inter_700Bold",
      minWidth: 80,
      textAlign: "center",
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
    submitBtn: {
      backgroundColor: colors.success,
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
      color: colors.successForeground ?? colors.primaryForeground,
      fontSize: 16,
      fontWeight: "600" as const,
      fontFamily: "Inter_600SemiBold",
    },
  });

  const handleSubmit = async () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert("Required", "Enter a valid payment amount.");
      return;
    }
    if (!paymentDate) {
      Alert.alert("Required", "Enter a payment date.");
      return;
    }

    try {
      await addPayment({
        id: loanId,
        data: {
          amount: amt,
          paymentDate,
          notes: notes.trim() || undefined,
        },
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await queryClient.invalidateQueries({
        queryKey: getListPaymentsQueryKey(loanId),
      });
      await queryClient.invalidateQueries({
        queryKey: getGetLoanQueryKey(loanId),
      });
      await queryClient.invalidateQueries({
        queryKey: getGetDashboardSummaryQueryKey(),
      });
      await queryClient.invalidateQueries({
        queryKey: getGetRecentLoansQueryKey(),
      });
      router.back();
    } catch {
      Alert.alert("Error", "Could not record payment. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="x" size={18} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Record Payment</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Payment Amount</Text>
          <View style={styles.amountInputWrapper}>
            <Text style={styles.rupeeSymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor="rgba(255,255,255,0.5)"
              testID="payment-amount"
            />
          </View>
        </View>

        <Text style={styles.fieldLabel}>Payment Date</Text>
        <TextInput
          style={styles.input}
          value={paymentDate}
          onChangeText={setPaymentDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.mutedForeground}
          testID="payment-date"
        />

        <Text style={styles.fieldLabel}>Notes (optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="e.g. Cash payment"
          placeholderTextColor={colors.mutedForeground}
          multiline
          numberOfLines={3}
          testID="payment-notes"
        />

        <TouchableOpacity
          style={[styles.submitBtn, isPending && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isPending}
          testID="submit-payment"
        >
          <Feather
            name="check"
            size={18}
            color={colors.successForeground ?? colors.primaryForeground}
          />
          <Text style={styles.submitBtnText}>
            {isPending ? "Saving..." : "Record Payment"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
