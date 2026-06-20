import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";
import {
  useGetProfile,
  useUpdateProfile,
  getGetProfileQueryKey,
  type FinancialProfileData,
  type FinancialProfile,
} from "@workspace/api-client-react";

export type ProfileData = FinancialProfileData;

export const EMPTY_PROFILE: ProfileData = {
  name: "",
  age: 30,
  occupation: "",
  monthlyIncome: 0,
  additionalIncome: 0,
  rent: 0,
  emi: 0,
  insurance: 0,
  utilities: 0,
  schoolFees: 0,
  internet: 0,
  otherFixed: 0,
  food: 0,
  fuel: 0,
  travel: 0,
  entertainment: 0,
  shopping: 0,
  medical: 0,
  miscellaneous: 0,
  currentSavings: 0,
  existingInvestments: 0,
  creditCardDebt: 0,
  debts: [],
  goals: [],
  riskProfile: "moderate",
};

// Legacy localStorage keys we migrate from on first load.
const STRATEGY_KEY = "loan-tracker:strategy-inputs";
const MIGRATION_FLAG = "loan-tracker:profile-migrated";

const SAVE_DEBOUNCE_MS = 800;

const RISK_PROFILES: ProfileData["riskProfile"][] = [
  "conservative",
  "moderate",
  "aggressive",
];

function num(raw: Record<string, unknown>, key: string, fallback: number): number {
  const v = raw[key];
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

/**
 * Read the old per-page localStorage entries (if any) and fold them into a
 * single profile object. Used once to seed the server profile for users who
 * had data before the global profile existed.
 */
function readLegacyProfile(): ProfileData | null {
  let strategy: Record<string, unknown> | null = null;
  try {
    const raw = localStorage.getItem(STRATEGY_KEY);
    if (raw) strategy = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    /* ignore corrupt storage */
  }

  if (!strategy) return null;

  const debts = Array.isArray(strategy.loans)
    ? (strategy.loans as unknown[]).flatMap((item) => {
        if (typeof item !== "object" || item === null) return [];
        const d = item as Record<string, unknown>;
        return [
          {
            id: typeof d.id === "string" && d.id ? d.id : crypto.randomUUID(),
            name: typeof d.name === "string" ? d.name : "",
            balance: num(d, "balance", 0),
            rate: num(d, "rate", 0),
            minPayment: num(d, "minPayment", 0),
          },
        ];
      })
    : [];
  const goals = Array.isArray(strategy.goals)
    ? (strategy.goals as unknown[]).filter((g): g is string => typeof g === "string")
    : [];
  const riskProfile = RISK_PROFILES.includes(
    strategy.riskProfile as ProfileData["riskProfile"],
  )
    ? (strategy.riskProfile as ProfileData["riskProfile"])
    : "moderate";

  return {
    name: typeof strategy.name === "string" ? strategy.name : "",
    age: num(strategy, "age", 30),
    occupation: typeof strategy.occupation === "string" ? strategy.occupation : "",
    monthlyIncome: num(strategy, "monthlyIncome", 0),
    additionalIncome: num(strategy, "additionalIncome", 0),
    rent: num(strategy, "rent", 0),
    emi: num(strategy, "emi", 0),
    insurance: num(strategy, "insurance", 0),
    utilities: num(strategy, "utilities", 0),
    schoolFees: num(strategy, "schoolFees", 0),
    internet: num(strategy, "internet", 0),
    otherFixed: num(strategy, "otherFixed", 0),
    food: num(strategy, "food", 0),
    fuel: num(strategy, "fuel", 0),
    travel: num(strategy, "travel", 0),
    entertainment: num(strategy, "entertainment", 0),
    shopping: num(strategy, "shopping", 0),
    medical: num(strategy, "medical", 0),
    miscellaneous: num(strategy, "miscellaneous", 0),
    currentSavings: num(strategy, "currentSavings", 0),
    existingInvestments: num(strategy, "existingInvestments", 0),
    creditCardDebt: num(strategy, "creditCardDebt", 0),
    debts,
    goals,
    riskProfile,
  };
}

function isEmptyProfile(p: ProfileData): boolean {
  return JSON.stringify({ ...p, name: "", occupation: "", age: 30 }) ===
    JSON.stringify({ ...EMPTY_PROFILE });
}

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface ProfileContextValue {
  profile: ProfileData;
  /** Apply a partial patch to the profile and trigger a debounced save. */
  update: (patch: Partial<ProfileData>) => void;
  /** Replace the whole profile (e.g. Reset) and trigger a debounced save. */
  replace: (next: ProfileData) => void;
  isLoading: boolean;
  saveStatus: SaveStatus;
  /** Last successful save time (server `updatedAt`), or null when never saved. */
  updatedAt: string | null;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  // Re-mount the inner provider whenever the signed-in user changes so all
  // local state (draft, save status, debounce timer, migration flag) is reset.
  // Without this, a previous user's profile could bleed into the next account.
  const { userId } = useAuth();
  return <ProfileProviderInner key={userId ?? "anon"}>{children}</ProfileProviderInner>;
}

function ProfileProviderInner({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const { isSignedIn, userId } = useAuth();
  // Scope the cache by the signed-in user so a late save from a previous
  // account can never repopulate the key the next account reads from.
  const profileKey = useMemo(
    () => [...getGetProfileQueryKey(), userId ?? "anon"],
    [userId],
  );
  const { data, isLoading } = useGetProfile({
    query: { enabled: isSignedIn === true, queryKey: profileKey },
  });
  const { mutateAsync } = useUpdateProfile();

  const [draft, setDraft] = useState<ProfileData | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const migrationTriedRef = useRef(false);
  const mountedRef = useRef(true);

  // Seed local draft from the server once it arrives.
  useEffect(() => {
    if (!data || draft !== null) return;
    setDraft(data.data);
    setUpdatedAt(data.updatedAt);
  }, [data, draft]);

  const persist = useCallback(
    async (next: ProfileData) => {
      setSaveStatus("saving");
      try {
        const saved = await mutateAsync({ data: next });
        // Ignore the result if this provider was unmounted (e.g. the user
        // switched accounts) so a stale write can't leak across sessions.
        if (!mountedRef.current) return;
        setUpdatedAt(saved.updatedAt);
        queryClient.setQueryData<FinancialProfile>(profileKey, saved);
        setSaveStatus("saved");
      } catch {
        if (mountedRef.current) setSaveStatus("error");
      }
    },
    [mutateAsync, queryClient, profileKey],
  );

  // One-time migration: if the server has no profile yet but legacy
  // localStorage data exists, push it up so nothing is lost.
  useEffect(() => {
    if (!data || migrationTriedRef.current) return;
    migrationTriedRef.current = true;
    if (data.updatedAt !== null) return; // already has a server profile
    let alreadyMigrated = false;
    try {
      alreadyMigrated = localStorage.getItem(MIGRATION_FLAG) === "1";
    } catch {
      /* ignore */
    }
    if (alreadyMigrated) return;
    const legacy = readLegacyProfile();
    try {
      localStorage.setItem(MIGRATION_FLAG, "1");
    } catch {
      /* ignore */
    }
    if (legacy && !isEmptyProfile(legacy)) {
      setDraft(legacy);
      void persist(legacy);
    }
  }, [data, persist]);

  const scheduleSave = useCallback(
    (next: ProfileData) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => void persist(next), SAVE_DEBOUNCE_MS);
    },
    [persist],
  );

  const update = useCallback(
    (patch: Partial<ProfileData>) => {
      setDraft((prev) => {
        const base = prev ?? EMPTY_PROFILE;
        const next = { ...base, ...patch };
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave],
  );

  const replace = useCallback(
    (next: ProfileData) => {
      setDraft(next);
      scheduleSave(next);
    },
    [scheduleSave],
  );

  useEffect(() => () => {
    mountedRef.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile: draft ?? EMPTY_PROFILE,
      update,
      replace,
      isLoading: isLoading && draft === null,
      saveStatus,
      updatedAt,
    }),
    [draft, update, replace, isLoading, saveStatus, updatedAt],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return ctx;
}

// ── Derived helpers shared across screens ────────────────────────────────────

export function totalIncome(p: ProfileData): number {
  return p.monthlyIncome + p.additionalIncome;
}

export function totalFixedExpenses(p: ProfileData): number {
  return (
    p.rent +
    p.emi +
    p.insurance +
    p.utilities +
    p.schoolFees +
    p.internet +
    p.otherFixed
  );
}

export function totalVariableExpenses(p: ProfileData): number {
  return (
    p.food +
    p.fuel +
    p.travel +
    p.entertainment +
    p.shopping +
    p.medical +
    p.miscellaneous
  );
}

export function totalExpenses(p: ProfileData): number {
  return totalFixedExpenses(p) + totalVariableExpenses(p);
}

export function monthlySurplus(p: ProfileData): number {
  return totalIncome(p) - totalExpenses(p);
}

/** Rough completeness signal for nudges (0–1). */
export function profileCompleteness(p: ProfileData): number {
  const checks = [
    p.name.trim().length > 0,
    p.occupation.trim().length > 0,
    p.monthlyIncome > 0,
    totalFixedExpenses(p) > 0,
    totalVariableExpenses(p) > 0,
    p.currentSavings > 0 || p.existingInvestments > 0,
    p.goals.length > 0,
  ];
  return checks.filter(Boolean).length / checks.length;
}
