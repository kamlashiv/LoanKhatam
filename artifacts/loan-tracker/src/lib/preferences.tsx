import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  socialAccounts: {
    whatsapp: null,
    facebook: null,
    instagram: null,
    twitter: null,
    linkedin: null,
    telegram: null,
    youtube: null,
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
    socialAccounts: {
      ...DEFAULT_SETTINGS.socialAccounts,
      ...s.socialAccounts,
    },
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
  // Re-mount the inner provider whenever the signed-in user changes so all
  // local state (cached settings + updatedAt) is reset. Without this, the
  // previous user's saved preferences — notification choices, WhatsApp number,
  // social account handles — could remain on screen for the next account on a
  // shared device until a fresh /api/settings response arrives.
  const { userId } = useAuth();
  return (
    <PreferencesProviderInner key={userId ?? "anon"}>
      {children}
    </PreferencesProviderInner>
  );
}

function PreferencesProviderInner({ children }: { children: ReactNode }) {
  const { isSignedIn, userId } = useAuth();
  // Scope the cache by the signed-in user so a late save from a previous
  // account can never repopulate the key the next account reads from.
  const settingsKey = useMemo(
    () => [...getGetSettingsQueryKey(), userId ?? "anon"],
    [userId],
  );
  const { data, isLoading } = useGetSettings({
    query: { enabled: !!isSignedIn, queryKey: settingsKey },
  });
  const { mutateAsync, isPending } = useUpdateSettings();

  const [local, setLocal] = useState<UserSettingsData | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const mountedRef = useRef(true);
  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    [],
  );

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
    // Ignore the result if this provider was unmounted (e.g. the user switched
    // accounts) so an in-flight save from user A can't update user B's state.
    if (!mountedRef.current) return;
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
