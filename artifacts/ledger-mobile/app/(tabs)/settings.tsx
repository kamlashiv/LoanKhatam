import { useAuth, useUser } from "@clerk/clerk-expo";
import { Feather } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import {
  clearNotifiedIds,
  getNotificationsEnabled,
  setNotificationsEnabled,
} from "@/hooks/useOverdueNotifications";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const { user } = useUser();

  const [notificationsOn, setNotificationsOn] = useState(true);

  const loadEnabled = useCallback(() => {
    let cancelled = false;
    (async () => {
      const enabled = await getNotificationsEnabled();
      if (!cancelled) setNotificationsOn(enabled);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => loadEnabled(), [loadEnabled]);
  useFocusEffect(loadEnabled);

  const handleToggleNotifications = async (value: boolean) => {
    setNotificationsOn(value);
    await setNotificationsEnabled(value);
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

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => signOut(),
      },
    ]);
  };

  const accountLabel =
    user?.primaryEmailAddress?.emailAddress ??
    user?.fullName ??
    user?.firstName ??
    "Signed in";

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) + 16,
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    title: {
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
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 120 + (Platform.OS === "web" ? 34 : 0),
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: "600" as const,
      color: colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginTop: 24,
      marginBottom: 8,
      fontFamily: "Inter_600SemiBold",
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
    },
    rowDivider: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    rowIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    rowTextWrap: {
      flex: 1,
    },
    rowTitle: {
      fontSize: 15,
      fontWeight: "600" as const,
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
    },
    rowSubtitle: {
      fontSize: 12,
      color: colors.mutedForeground,
      marginTop: 2,
      fontFamily: "Inter_400Regular",
    },
    rowTitleDestructive: {
      color: colors.destructive,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your app preferences</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>Notifications</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Feather name="bell" size={16} color={colors.foreground} />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowTitle}>Overdue alerts</Text>
              <Text style={styles.rowSubtitle}>
                Get notified when a loan becomes overdue
              </Text>
            </View>
            <Switch
              value={notificationsOn}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: colors.muted, true: colors.primary }}
              thumbColor={Platform.OS === "android" ? colors.card : undefined}
              testID="notifications-toggle"
            />
          </View>

          <TouchableOpacity
            style={[styles.row, styles.rowDivider]}
            onPress={handleResetNotifications}
            testID="reset-notifications-btn"
          >
            <View style={styles.rowIcon}>
              <Feather name="bell-off" size={16} color={colors.foreground} />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowTitle}>Reset notification history</Text>
              <Text style={styles.rowSubtitle}>
                Re-alert me about loans that are already overdue
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={18}
              color={colors.mutedForeground}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowIcon}>
              <Feather name="user" size={16} color={colors.foreground} />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowTitle}>Signed in</Text>
              <Text style={styles.rowSubtitle} numberOfLines={1}>
                {accountLabel}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.row, styles.rowDivider]}
            onPress={handleSignOut}
            testID="sign-out-btn"
          >
            <View style={styles.rowIcon}>
              <Feather name="log-out" size={16} color={colors.destructive} />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={[styles.rowTitle, styles.rowTitleDestructive]}>
                Sign out
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
