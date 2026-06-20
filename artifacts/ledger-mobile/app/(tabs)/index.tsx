import { useAuth, useUser } from "@clerk/clerk-expo";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
import Svg, { Circle, G } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  useGetDashboardSummary,
  useGetRecentLoans,
} from "@workspace/api-client-react";
import { useColors } from "@/hooks/useColors";
import { clearNotifiedIds } from "@/hooks/useOverdueNotifications";

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

interface DonutSlice {
  value: number;
  color: string;
  label: string;
}

function DonutChart({
  slices,
  size = 140,
  strokeWidth = 22,
}: {
  slices: DonutSlice[];
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  const total = slices.reduce((s, sl) => s + sl.value, 0);
  if (total === 0) return null;

  let offset = 0;
  const segments = slices.map((sl) => {
    const pct = sl.value / total;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const seg = { ...sl, dash, gap, offset };
    offset += dash;
    return seg;
  });

  return (
    <Svg width={size} height={size}>
      <G rotation="-90" origin={`${cx},${cy}`}>
        {segments.map((seg, i) => (
          <Circle
            key={i}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${seg.dash} ${seg.gap}`}
            strokeDashoffset={-seg.offset}
            strokeLinecap="butt"
          />
        ))}
      </G>
    </Svg>
  );
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut } = useAuth();
  const { user } = useUser();

  const {
    data: summary,
    isLoading: summaryLoading,
    refetch: refetchSummary,
  } = useGetDashboardSummary();

  const {
    data: recentLoans,
    isLoading: loansLoading,
    refetch: refetchLoans,
  } = useGetRecentLoans();

  const isRefreshing = false;
  const onRefresh = () => {
    refetchSummary();
    refetchLoans();
  };

  const handleResetNotifications = () => {
    Alert.alert(
      "Reset Notification History",
      "Clear the record of overdue alerts you've already received? Overdue loans will trigger fresh notifications next time you open the app.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await clearNotifiedIds();
              Alert.alert(
                "Notification History Cleared",
                "Overdue loans will alert you again on your next app open."
              );
            } catch {
              Alert.alert("Error", "Could not reset notification history.");
            }
          },
        },
      ]
    );
  };

  const statusColor = (status: string) => {
    if (status === "paid") return colors.success;
    if (status === "overdue") return colors.destructive;
    return colors.primary;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 16,
      paddingHorizontal: 20,
      paddingBottom: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    greeting: {
      fontSize: 22,
      fontWeight: "700" as const,
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },
    subtitle: {
      fontSize: 13,
      color: colors.mutedForeground,
      marginTop: 2,
      fontFamily: "Inter_400Regular",
    },
    headerActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    signOutBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 120 + (Platform.OS === "web" ? 34 : 0),
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600" as const,
      color: colors.foreground,
      marginBottom: 12,
      fontFamily: "Inter_600SemiBold",
    },
    statsGrid: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 8,
    },
    statsRow2: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 20,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statCardPrimary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    statLabel: {
      fontSize: 12,
      color: colors.mutedForeground,
      marginBottom: 6,
      fontFamily: "Inter_400Regular",
    },
    statLabelLight: {
      color: "rgba(255,255,255,0.75)",
    },
    statValue: {
      fontSize: 20,
      fontWeight: "700" as const,
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },
    statValueLight: {
      color: colors.primaryForeground,
    },
    statValueSmall: {
      fontSize: 16,
      fontWeight: "700" as const,
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },
    badgeRow: {
      flexDirection: "row",
      gap: 6,
      marginTop: 4,
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: "600" as const,
      fontFamily: "Inter_600SemiBold",
    },
    chartCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      marginBottom: 20,
      flexDirection: "row",
      alignItems: "center",
      gap: 20,
    },
    chartLegend: {
      flex: 1,
      gap: 10,
    },
    legendRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    legendDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    legendLabel: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      flex: 1,
    },
    legendValue: {
      fontSize: 13,
      fontWeight: "600" as const,
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
    },
    chartCenter: {
      position: "absolute",
      alignItems: "center",
      justifyContent: "center",
      width: 140,
      height: 140,
    },
    chartCenterLabel: {
      fontSize: 10,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    chartCenterValue: {
      fontSize: 14,
      fontWeight: "700" as const,
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },
    recentSection: {
      marginTop: 4,
    },
    recentHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    viewAll: {
      fontSize: 13,
      color: colors.primary,
      fontFamily: "Inter_500Medium",
    },
    loanCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 10,
    },
    loanCardRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    borrowerName: {
      fontSize: 15,
      fontWeight: "600" as const,
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
    },
    loanAmount: {
      fontSize: 15,
      fontWeight: "700" as const,
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },
    loanDate: {
      fontSize: 12,
      color: colors.mutedForeground,
      marginTop: 4,
      fontFamily: "Inter_400Regular",
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    statusText: {
      fontSize: 11,
      fontWeight: "600" as const,
      fontFamily: "Inter_600SemiBold",
    },
    progressBar: {
      height: 4,
      backgroundColor: colors.muted,
      borderRadius: 2,
      marginTop: 10,
      overflow: "hidden",
    },
    progressFill: {
      height: 4,
      borderRadius: 2,
    },
    emptyText: {
      textAlign: "center",
      color: colors.mutedForeground,
      fontSize: 14,
      paddingVertical: 32,
      fontFamily: "Inter_400Regular",
    },
    loader: {
      paddingVertical: 40,
      alignItems: "center",
    },
  });

  const firstName = user?.firstName ?? "there";

  const donutSlices: DonutSlice[] = summary
    ? [
        {
          value: summary.totalCollected,
          color: colors.success,
          label: "Collected",
        },
        {
          value: summary.totalOutstanding,
          color: colors.primary,
          label: "Outstanding",
        },
      ]
    : [];

  const hasChartData = summary && summary.totalLent > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hi, {firstName} 👋</Text>
          <Text style={styles.subtitle}>Here's your lending overview</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={handleResetNotifications}
            testID="reset-notifications-btn"
          >
            <Feather name="bell-off" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={() => signOut()}
            testID="sign-out-btn"
          >
            <Feather name="log-out" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {summaryLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : summary ? (
          <>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, styles.statCardPrimary]}>
                <Text style={[styles.statLabel, styles.statLabelLight]}>
                  Total Lent
                </Text>
                <Text style={[styles.statValue, styles.statValueLight]}>
                  {formatRupees(summary.totalLent)}
                </Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Outstanding</Text>
                <Text style={styles.statValue}>
                  {formatRupees(summary.totalOutstanding)}
                </Text>
              </View>
            </View>
            <View style={styles.statsRow2}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Collected</Text>
                <Text style={styles.statValueSmall}>
                  {formatRupees(summary.totalCollected)}
                </Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Status</Text>
                <View style={styles.badgeRow}>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: colors.primary + "22" },
                    ]}
                  >
                    <Text
                      style={[styles.badgeText, { color: colors.primary }]}
                    >
                      {summary.activeLoans} active
                    </Text>
                  </View>
                  {summary.overdueLoans > 0 && (
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: colors.destructive + "22" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          { color: colors.destructive },
                        ]}
                      >
                        {summary.overdueLoans} overdue
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {hasChartData && (
              <View style={styles.chartCard}>
                <View style={{ position: "relative" }}>
                  <DonutChart
                    slices={donutSlices}
                    size={140}
                    strokeWidth={24}
                  />
                  <View
                    style={[
                      styles.chartCenter,
                      {
                        top: 0,
                        left: 0,
                      },
                    ]}
                  >
                    <Text style={styles.chartCenterLabel}>Recovered</Text>
                    <Text style={styles.chartCenterValue}>
                      {summary.totalLent > 0
                        ? Math.round(
                            (summary.totalCollected / summary.totalLent) * 100
                          )
                        : 0}
                      %
                    </Text>
                  </View>
                </View>
                <View style={styles.chartLegend}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600" as const,
                      color: colors.foreground,
                      fontFamily: "Inter_600SemiBold",
                      marginBottom: 4,
                    }}
                  >
                    Breakdown
                  </Text>
                  {donutSlices.map((sl) => (
                    <View key={sl.label} style={styles.legendRow}>
                      <View
                        style={[
                          styles.legendDot,
                          { backgroundColor: sl.color },
                        ]}
                      />
                      <Text style={styles.legendLabel}>{sl.label}</Text>
                      <Text style={styles.legendValue}>
                        {formatRupees(sl.value)}
                      </Text>
                    </View>
                  ))}
                  {summary.overdueLoans > 0 && (
                    <View style={styles.legendRow}>
                      <View
                        style={[
                          styles.legendDot,
                          { backgroundColor: colors.destructive },
                        ]}
                      />
                      <Text style={styles.legendLabel}>Overdue loans</Text>
                      <Text
                        style={[
                          styles.legendValue,
                          { color: colors.destructive },
                        ]}
                      >
                        {summary.overdueLoans}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </>
        ) : null}

        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>Recent Loans</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/loans")}>
              <Text style={styles.viewAll}>View all</Text>
            </TouchableOpacity>
          </View>

          {loansLoading ? (
            <View style={styles.loader}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : recentLoans && recentLoans.length > 0 ? (
            recentLoans.map((loan) => {
              const progress =
                loan.principalAmount > 0
                  ? Math.min(loan.totalPaid / loan.principalAmount, 1)
                  : 0;
              const sc = statusColor(loan.status);
              return (
                <TouchableOpacity
                  key={loan.id}
                  style={styles.loanCard}
                  onPress={() => router.push(`/loan/${loan.id}` as never)}
                  testID={`loan-card-${loan.id}`}
                >
                  <View style={styles.loanCardRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.borrowerName}>
                        {loan.borrowerName}
                      </Text>
                      <Text style={styles.loanDate}>
                        Due {formatDate(loan.dueDate)}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={styles.loanAmount}>
                        {formatRupees(loan.remainingAmount)}
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: sc + "22" },
                        ]}
                      >
                        <Text style={[styles.statusText, { color: sc }]}>
                          {loan.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${progress * 100}%`, backgroundColor: sc },
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.emptyText}>No loans yet. Add your first!</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
