import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useListLoans } from "@workspace/api-client-react";
import type { Loan, ListLoansParams } from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";

type StatusFilter = "all" | "active" | "overdue" | "paid";

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

function LoanRow({
  loan,
  onPress,
  colors,
}: {
  loan: Loan;
  onPress: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  const statusColor =
    loan.status === "paid"
      ? colors.success
      : loan.status === "overdue"
        ? colors.destructive
        : colors.primary;

  const progress =
    loan.principalAmount > 0
      ? Math.min(loan.totalPaid / loan.principalAmount, 1)
      : 0;

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 10,
      marginHorizontal: 16,
    },
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    name: {
      fontSize: 15,
      fontWeight: "600" as const,
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
    },
    date: {
      fontSize: 12,
      color: colors.mutedForeground,
      marginTop: 3,
      fontFamily: "Inter_400Regular",
    },
    amount: {
      fontSize: 15,
      fontWeight: "700" as const,
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      marginTop: 4,
      alignSelf: "flex-end",
    },
    badgeText: {
      fontSize: 11,
      fontWeight: "600" as const,
      fontFamily: "Inter_600SemiBold",
    },
    progressBar: {
      height: 3,
      backgroundColor: colors.muted,
      borderRadius: 2,
      marginTop: 10,
      overflow: "hidden",
    },
    progressFill: {
      height: 3,
      borderRadius: 2,
    },
  });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} testID={`loan-row-${loan.id}`}>
      <View style={styles.row}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={styles.name}>{loan.borrowerName}</Text>
          <Text style={styles.date}>
            {loan.status === "paid"
              ? `Paid • ${formatDate(loan.dueDate)}`
              : `Due ${formatDate(loan.dueDate)}`}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.amount}>{formatRupees(loan.remainingAmount)}</Text>
          <View style={[styles.badge, { backgroundColor: statusColor + "22" }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>
              {loan.status}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${progress * 100}%`, backgroundColor: statusColor },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
}

const FILTER_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Overdue", value: "overdue" },
  { label: "Paid", value: "paid" },
];

export default function LoansScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const params: ListLoansParams =
    statusFilter !== "all" ? { status: statusFilter } : {};

  const { data: loans, isLoading, refetch } = useListLoans(params);

  const filtered = (loans ?? []).filter((l) =>
    l.borrowerName.toLowerCase().includes(search.toLowerCase())
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 12,
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    title: {
      fontSize: 22,
      fontWeight: "700" as const,
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
      marginBottom: 12,
    },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: colors.radius,
      paddingHorizontal: 12,
      height: 42,
      marginBottom: 12,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: colors.foreground,
      marginLeft: 8,
      fontFamily: "Inter_400Regular",
    },
    filterRow: {
      flexDirection: "row",
      gap: 8,
    },
    filterChip: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    filterChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterText: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontFamily: "Inter_500Medium",
    },
    filterTextActive: {
      color: colors.primaryForeground,
    },
    listContent: {
      paddingTop: 12,
      paddingBottom: 120 + (Platform.OS === "web" ? 34 : 0),
    },
    loader: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
    },
    empty: {
      alignItems: "center",
      paddingVertical: 60,
      paddingHorizontal: 32,
    },
    emptyIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: "600" as const,
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
      marginBottom: 4,
    },
    emptyText: {
      fontSize: 13,
      color: colors.mutedForeground,
      textAlign: "center",
      fontFamily: "Inter_400Regular",
    },
    fab: {
      position: "absolute",
      bottom: 100 + insets.bottom + (Platform.OS === "web" ? 34 : 0),
      right: 20,
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    },
  });

  const handleAddLoan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/loan/new");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Loans</Text>
        <View style={styles.searchRow}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search borrower..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
            testID="loan-search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.filterRow}>
          {FILTER_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.filterChip,
                statusFilter === opt.value && styles.filterChipActive,
              ]}
              onPress={() => setStatusFilter(opt.value)}
              testID={`filter-${opt.value}`}
            >
              <Text
                style={[
                  styles.filterText,
                  statusFilter === opt.value && styles.filterTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <LoanRow
              loan={item}
              colors={colors}
              onPress={() => router.push(`/loan/${item.id}` as never)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={refetch} />
          }
          scrollEnabled={!!filtered.length}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Feather name="file-text" size={24} color={colors.mutedForeground} />
              </View>
              <Text style={styles.emptyTitle}>No loans found</Text>
              <Text style={styles.emptyText}>
                {search
                  ? "Try a different search term."
                  : "Tap + to record your first loan."}
              </Text>
            </View>
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={handleAddLoan} testID="add-loan-fab">
        <Feather name="plus" size={24} color={colors.primaryForeground} />
      </TouchableOpacity>
    </View>
  );
}
