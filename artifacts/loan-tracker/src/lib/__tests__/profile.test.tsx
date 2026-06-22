/**
 * @jest-environment jsdom
 *
 * Cross-account privacy tests for the global financial profile.
 *
 * The profile holds sensitive data (income, debts, savings) and is the app's
 * single source of truth. A past bug let one account's profile bleed into the
 * next after an account switch. The fix has three parts, all in
 * `ProfileProvider`:
 *   1. the inner provider is keyed by `userId`, so switching accounts remounts
 *      it and resets all local state (draft, debounce timer, save status);
 *   2. the React Query cache key is scoped per user, so a value cached for one
 *      account can never be read by the next; and
 *   3. a `mountedRef` guard drops a save that resolves after the provider has
 *      unmounted (i.e. after an account switch), so a late write can't leak.
 *
 * These tests run the REAL provider, the REAL React Query client and the REAL
 * generated API hooks; only Clerk's `useAuth` and the network (`global.fetch`)
 * are faked. A regression in any of the three protections fails a test here.
 */
import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ── Clerk auth: a mutable signed-in state the test drives directly ───────────
let authState: { userId: string | null; isSignedIn: boolean } = {
  userId: null,
  isSignedIn: false,
};
jest.mock("@clerk/react", () => ({
  useAuth: () => authState,
}));

import { ProfileProvider, useProfile, EMPTY_PROFILE } from "../profile";
import type { FinancialProfileData } from "@workspace/api-client-react";

// ── Fake backend (mounted on global.fetch) ──────────────────────────────────
// A per-user store keyed by the user who owns the request. PUTs can be "held"
// so the test can resolve a save AFTER an account switch has happened.
const serverStore = new Map<string, FinancialProfileData>();
let holdPuts = false;
const heldPuts: Array<() => void> = [];

function jsonResponse(obj: unknown) {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    headers: new Headers({ "content-type": "application/json" }),
    // Non-null so customFetch does not treat it as an empty body.
    body: {},
    text: async () => JSON.stringify(obj),
  } as unknown as Response;
}

function installFetch() {
  (global as unknown as { fetch: unknown }).fetch = jest.fn(
    (input: RequestInfo | URL, init?: RequestInit) => {
      const url =
        typeof input === "string" ? input : String((input as Request).url ?? input);
      const method = (init?.method ?? "GET").toUpperCase();
      // Capture the user who owns this request at call time.
      const uid = authState.userId ?? "anon";

      if (url.endsWith("/api/profile") && method === "GET") {
        const data = serverStore.get(uid);
        return Promise.resolve(
          jsonResponse(
            data
              ? { data, updatedAt: new Date().toISOString() }
              : { data: { ...EMPTY_PROFILE }, updatedAt: null },
          ),
        );
      }

      if (url.endsWith("/api/profile") && method === "PUT") {
        const data = JSON.parse(String(init?.body)) as FinancialProfileData;
        const settle = () => {
          serverStore.set(uid, data);
          return jsonResponse({ data, updatedAt: new Date().toISOString() });
        };
        if (holdPuts) {
          return new Promise<Response>((resolve) => {
            heldPuts.push(() => resolve(settle()));
          });
        }
        return Promise.resolve(settle());
      }

      return Promise.reject(new Error(`unexpected fetch ${method} ${url}`));
    },
  );
}

// ── Probe consumer that surfaces the profile + a way to mutate it ────────────
function Probe() {
  const { profile, update, isLoading, saveStatus } = useProfile();
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="name">{profile.name}</span>
      <span data-testid="income">{profile.monthlyIncome}</span>
      <span data-testid="status">{saveStatus}</span>
      <button onClick={() => update({ name: "Alice", monthlyIncome: 100000 })}>
        fill-alice
      </button>
    </div>
  );
}

function makeUi(client: QueryClient) {
  return (
    <QueryClientProvider client={client}>
      <ProfileProvider>
        <Probe />
      </ProfileProvider>
    </QueryClientProvider>
  );
}

function freshClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
}

beforeEach(() => {
  serverStore.clear();
  heldPuts.length = 0;
  holdPuts = false;
  authState = { userId: null, isSignedIn: false };
  installFetch();
});

describe("Profile privacy across account switches", () => {
  it("does not show account A's profile to account B after signing out and in", async () => {
    authState = { userId: "user_A", isSignedIn: true };
    const client = freshClient();
    const { rerender } = render(makeUi(client));

    // A starts with an empty server profile.
    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("false"),
    );
    expect(screen.getByTestId("name").textContent).toBe("");

    // A fills the profile; wait for the debounced save to persist.
    fireEvent.click(screen.getByText("fill-alice"));
    await waitFor(() =>
      expect(screen.getByTestId("name").textContent).toBe("Alice"),
    );
    await waitFor(
      () => expect(screen.getByTestId("status").textContent).toBe("saved"),
      { timeout: 3000 },
    );
    expect(serverStore.get("user_A")?.name).toBe("Alice");

    // Sign out, then sign in as B.
    authState = { userId: null, isSignedIn: false };
    rerender(makeUi(client));
    authState = { userId: "user_B", isSignedIn: true };
    rerender(makeUi(client));

    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("false"),
    );

    // B must never see A's values — neither from a stale draft nor a shared
    // cache entry.
    expect(screen.getByTestId("name").textContent).toBe("");
    expect(screen.getByTestId("income").textContent).toBe("0");
  });

  it("does not let a save that resolves after the switch contaminate B", async () => {
    authState = { userId: "user_A", isSignedIn: true };
    const client = freshClient();
    const { rerender } = render(makeUi(client));

    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("false"),
    );

    // Hold A's save in-flight: trigger it, then wait until the PUT has fired.
    holdPuts = true;
    fireEvent.click(screen.getByText("fill-alice"));
    await waitFor(() => expect(heldPuts.length).toBe(1), { timeout: 3000 });

    // Switch to B before A's save resolves.
    authState = { userId: null, isSignedIn: false };
    rerender(makeUi(client));
    authState = { userId: "user_B", isSignedIn: true };
    rerender(makeUi(client));
    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("false"),
    );
    expect(screen.getByTestId("name").textContent).toBe("");

    // Now let A's stale save resolve. It must not touch B's view or cache.
    await act(async () => {
      heldPuts[0]();
      await Promise.resolve();
    });

    expect(screen.getByTestId("name").textContent).toBe("");
    expect(screen.getByTestId("income").textContent).toBe("0");

    const bCache = client.getQueryData<{ data: FinancialProfileData }>([
      "/api/profile",
      "user_B",
    ]);
    expect(bCache?.data?.name ?? "").not.toBe("Alice");
    expect(serverStore.get("user_B")).toBeUndefined();
  });

  it("never uploads browser-global legacy localStorage into the signed-in account", async () => {
    // Simulate a shared device where an earlier user/version left a legacy
    // financial profile in browser-global localStorage. The previous behavior
    // auto-migrated this into whichever account signed in next — leaking one
    // person's financial data into another's account. It must NOT be uploaded.
    localStorage.setItem(
      "loan-tracker:strategy-inputs",
      JSON.stringify({ name: "Victim", monthlyIncome: 250000, occupation: "Doctor" }),
    );
    localStorage.setItem(
      "loan-tracker:emi-invest",
      JSON.stringify({ monthlyIncome: 250000, monthlyExpenses: 90000 }),
    );

    authState = { userId: "user_B", isSignedIn: true };
    const client = freshClient();
    render(makeUi(client));

    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("false"),
    );

    // B sees an empty profile, and nothing was persisted to B's account.
    expect(screen.getByTestId("name").textContent).toBe("");
    expect(screen.getByTestId("income").textContent).toBe("0");

    // Give any (erroneous) debounced save a chance to fire — there must be none.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 1000));
    });
    expect(serverStore.get("user_B")).toBeUndefined();

    // The fully-obsolete legacy key is purged from the browser.
    expect(localStorage.getItem("loan-tracker:strategy-inputs")).toBeNull();

    // Legacy financial PII is stripped from the still-in-use analyzer key,
    // while its non-sensitive scenario knobs are preserved.
    const emi = JSON.parse(
      localStorage.getItem("loan-tracker:emi-invest") ?? "{}",
    ) as Record<string, unknown>;
    expect("monthlyIncome" in emi).toBe(false);
    expect("monthlyExpenses" in emi).toBe(false);
  });
});
