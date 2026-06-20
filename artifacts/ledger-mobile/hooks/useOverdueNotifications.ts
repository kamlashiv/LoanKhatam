import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";

import { listLoans } from "@workspace/api-client-react";

const NOTIFIED_KEY = "overdue_notified_loan_ids";
const NOTIF_ENABLED_KEY = "overdue_notifications_enabled";

export async function getNotificationsEnabled(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(NOTIF_ENABLED_KEY);
    return raw === null ? true : raw === "true";
  } catch {
    return true;
  }
}

export async function setNotificationsEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIF_ENABLED_KEY, enabled ? "true" : "false");
  } catch {
  }
}

async function getNotifiedIds(): Promise<Set<number>> {
  try {
    const raw = await AsyncStorage.getItem(NOTIFIED_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as number[];
    return new Set(parsed);
  } catch {
    return new Set();
  }
}

async function saveNotifiedIds(ids: Set<number>): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFIED_KEY, JSON.stringify([...ids]));
  } catch {
  }
}

export async function clearNotifiedIds(): Promise<void> {
  await AsyncStorage.removeItem(NOTIFIED_KEY);
}

async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const Notifications = await import("expo-notifications");
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

async function fireNotification(loanId: number, borrowerName: string, remainingAmount: number): Promise<void> {
  if (Platform.OS === "web") return;
  const Notifications = await import("expo-notifications");
  const rupees = "₹" + remainingAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 });
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Loan Overdue",
      body: `${borrowerName}'s loan of ${rupees} is past due.`,
      data: { loanId },
    },
    trigger: null,
  });
}

export function useOverdueNotifications(isSignedIn: boolean) {
  const router = useRouter();
  const listenerRef = useRef<ReturnType<typeof import("expo-notifications").addNotificationResponseReceivedListener> | null>(null);

  useEffect(() => {
    if (Platform.OS === "web") return;
    if (!isSignedIn) return;

    let cancelled = false;

    (async () => {
      const Notifications = await import("expo-notifications");

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      const enabled = await getNotificationsEnabled();
      if (!enabled || cancelled) return;

      const granted = await requestPermissions();
      if (!granted || cancelled) return;

      let overdueLoans: Awaited<ReturnType<typeof listLoans>> = [];
      try {
        overdueLoans = await listLoans({ status: "overdue" });
      } catch {
        return;
      }
      if (cancelled || overdueLoans.length === 0) return;

      const notifiedIds = await getNotifiedIds();
      const newlyOverdue = overdueLoans.filter((l) => !notifiedIds.has(l.id));

      for (const loan of newlyOverdue) {
        if (cancelled) break;
        await fireNotification(loan.id, loan.borrowerName, loan.remainingAmount);
        notifiedIds.add(loan.id);
      }

      if (newlyOverdue.length > 0) {
        await saveNotifiedIds(notifiedIds);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isSignedIn]);

  useEffect(() => {
    if (Platform.OS === "web") return;

    (async () => {
      const Notifications = await import("expo-notifications");
      listenerRef.current = Notifications.addNotificationResponseReceivedListener((response) => {
        const loanId = response.notification.request.content.data?.loanId as number | undefined;
        if (loanId != null) {
          router.push(`/loan/${loanId}` as never);
        }
      });
    })();

    return () => {
      listenerRef.current?.remove();
      listenerRef.current = null;
    };
  }, [router]);
}
