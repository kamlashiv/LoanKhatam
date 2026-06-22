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

// Fully obsolete browser-global localStorage key from a pre-server-profile
// version. It is no longer read into any account (auto-migration was removed
// because browser-global storage cannot be attributed to an authenticated user
// — uploading it into whichever account signs in leaked one user's financial
// profile into another's). We proactively purge it so leftover financial PII
// does not linger on a shared device.
const OBSOLETE_STRATEGY_KEY = "loan-tracker:strategy-inputs";

// Still-in-use browser-global key for the EMI-vs-Investment analyzer. It now
// only stores non-sensitive scenario knobs, but older versions also kept
// monthly income/expenses (financial PII) here. We strip those legacy PII
// fields proactively at boot so they don't linger on a shared device even if
// the analyzer is never opened to rewrite the entry.
const EMI_INVEST_KEY = "loan-tracker:emi-invest";
const EMI_INVEST_PII_FIELDS = ["monthlyIncome", "monthlyExpenses"];

const SAVE_DEBOUNCE_MS = 800;

function purgeObsoleteLegacyStorage(): void {
  try {
    localStorage.removeItem(OBSOLETE_STRATEGY_KEY);
  } catch {
    /* ignore storage access errors */
  }
  try {
    const raw = localStorage.getItem(EMI_INVEST_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      if (parsed && typeof parsed === "object") {
        let changed = false;
        for (const field of EMI_INVEST_PII_FIELDS) {
          if (field in parsed) {
            delete parsed[field];
            changed = true;
          }
        }
        if (changed) localStorage.setItem(EMI_INVEST_KEY, JSON.stringify(parsed));
      }
    }
  } catch {
    /* ignore corrupt storage / quota errors */
  }
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
  const mountedRef = useRef(true);
  // Whether the server profile has been folded into the local draft yet.
  const hydratedRef = useRef(false);
  // Edits made before the server profile arrives are buffered here so we can
  // merge them onto the loaded data instead of saving an EMPTY_PROFILE-based
  // payload that would clobber the user's persisted profile.
  const pendingPatchRef = useRef<Partial<ProfileData> | null>(null);

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

  // Purge the obsolete browser-global legacy profile key on mount so leftover
  // financial PII from an earlier user/version cannot linger on a shared device.
  // We deliberately do NOT migrate it into the current account: browser-global
  // storage cannot be attributed to an authenticated user, so auto-uploading it
  // would leak one person's financial profile into another's account.
  useEffect(() => {
    purgeObsoleteLegacyStorage();
  }, []);

  const scheduleSave = useCallback(
    (next: ProfileData) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => void persist(next), SAVE_DEBOUNCE_MS);
    },
    [persist],
  );

  // Seed local draft from the server once it arrives. If the user already made
  // edits while loading, merge those buffered patches onto the server data and
  // save the merged result — never overwrite the server profile with defaults.
  useEffect(() => {
    if (!data || hydratedRef.current) return;
    hydratedRef.current = true;
    setUpdatedAt(data.updatedAt);
    const pending = pendingPatchRef.current;
    if (pending) {
      pendingPatchRef.current = null;
      const merged = { ...data.data, ...pending };
      setDraft(merged);
      scheduleSave(merged);
    } else {
      setDraft(data.data);
    }
  }, [data, scheduleSave]);

  const update = useCallback(
    (patch: Partial<ProfileData>) => {
      // Before the server profile has loaded (signed-in or auth still
      // resolving), buffer the edit and reflect it in the UI, but do NOT save
      // yet — the seed effect merges it onto the server data once available.
      if (!hydratedRef.current && isSignedIn !== false) {
        pendingPatchRef.current = { ...(pendingPatchRef.current ?? {}), ...patch };
        setDraft((prev) => ({ ...(prev ?? EMPTY_PROFILE), ...patch }));
        return;
      }
      setDraft((prev) => {
        const base = prev ?? EMPTY_PROFILE;
        const next = { ...base, ...patch };
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave, isSignedIn],
  );

  const replace = useCallback(
    (next: ProfileData) => {
      // An explicit full replace (e.g. Reset) is authoritative: mark hydrated so
      // a late server response can't clobber it, and drop any buffered patches.
      hydratedRef.current = true;
      pendingPatchRef.current = null;
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

// Loan EMI is no longer stored on the profile — it is derived live from real
// DB loans (see `useDerivedLoans`). Screens that have the derived figure pass
// it in via `emi`; the `p.emi` fallback only covers pre-migration legacy data.
export function totalFixedExpenses(p: ProfileData, emi: number = p.emi): number {
  return (
    p.rent +
    emi +
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

export function totalExpenses(p: ProfileData, emi: number = p.emi): number {
  return totalFixedExpenses(p, emi) + totalVariableExpenses(p);
}

export function monthlySurplus(p: ProfileData, emi: number = p.emi): number {
  return totalIncome(p) - totalExpenses(p, emi);
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
