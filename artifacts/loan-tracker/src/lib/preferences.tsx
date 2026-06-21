import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@clerk/react";
import {
  useGetSettings,
  useUpdateSettings,
  getGetSettingsQueryKey,
  type UserSettingsData,
} from "@workspace/api-client-react";
import { setFormatConfig, type DateFormat } from "./format-config";

export const DEFAULT_SETTINGS: UserSettingsData = {
  currency: "INR",
  locale: "en-IN",
  dateFormat: "DD/MM/YYYY",
  defaultInterestRate: 10,
  defaultTenureMonths: 60,
  autoSaveCalculations: true,
  notifications: {
    emiReminder: true,
    dueDateReminder: true,
    prepaymentReminder: true,
    weeklySummary: false,
    monthlySummary: false,
    emailNotifications: false,
    pushNotifications: false,
    whatsappNotifications: false,
    whatsappNumber: null,
  },
};

/**
 * Settings stored before a notification field existed won't have it. Merge the
 * loaded blob over the defaults so newer toggles (e.g. WhatsApp) are always
 * present and controlled, rather than `undefined`.
 */
function normalizeSettings(s: UserSettingsData): UserSettingsData {
  return {
    ...DEFAULT_SETTINGS,
    ...s,
    notifications: { ...DEFAULT_SETTINGS.notifications, ...s.notifications },
  };
}

interface PreferencesContextValue {
  settings: UserSettingsData;
  isLoading: boolean;
  isSaving: boolean;
  updatedAt: string | null;
  updateSettings: (next: UserSettingsData) => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

function applyFormat(s: UserSettingsData) {
  setFormatConfig({
    currency: s.currency,
    locale: s.locale,
    dateFormat: s.dateFormat as DateFormat,
  });
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { isSignedIn } = useAuth();
  const { data, isLoading } = useGetSettings({
    query: { enabled: !!isSignedIn, queryKey: getGetSettingsQueryKey() },
  });
  const { mutateAsync, isPending } = useUpdateSettings();

  const [local, setLocal] = useState<UserSettingsData | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    if (data?.data) {
      const normalized = normalizeSettings(data.data);
      setLocal(normalized);
      setUpdatedAt(data.updatedAt ?? null);
      applyFormat(normalized);
    }
  }, [data]);

  const settings = local ?? DEFAULT_SETTINGS;

  const updateSettings = async (next: UserSettingsData) => {
    setLocal(next);
    applyFormat(next);
    const saved = await mutateAsync({ data: next });
    setUpdatedAt(saved.updatedAt ?? new Date().toISOString());
  };

  const value = useMemo<PreferencesContextValue>(
    () => ({
      settings,
      isLoading: !!isSignedIn && isLoading && local === null,
      isSaving: isPending,
      updatedAt,
      updateSettings,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings, isLoading, isPending, updatedAt, isSignedIn, local],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextValue {
  const ctx = useContext(PreferencesContext);
  if (!ctx)
    throw new Error("usePreferences must be used within a PreferencesProvider");
  return ctx;
}
