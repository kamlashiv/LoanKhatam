/**
 * @jest-environment jsdom
 *
 * Cross-account privacy tests for user settings/preferences.
 *
 * Settings hold personal data — notification choices, a WhatsApp phone number,
 * and social account handles. A bug let one account's saved settings remain on
 * screen for the next account after a sign-out/sign-in on a shared device,
 * because the provider kept the previous settings in React state, used an
 * unscoped query key, and never reset on user change. The fix mirrors
 * ProfileProvider's three-part isolation, all in PreferencesProvider:
 *   1. the inner provider is keyed by `userId`, so switching accounts remounts
 *      it and resets all local state (cached settings, updatedAt);
 *   2. the React Query cache key is scoped per user, so a value cached for one
 *      account can never be read by the next; and
 *   3. a `mountedRef` guard drops a save that resolves after the provider has
 *      unmounted (i.e. after an account switch), so a late write can't leak.
 *
 * These tests run the REAL provider, the REAL React Query client and the REAL
 * generated API hooks; only Clerk's `useAuth` and the network (`global.fetch`)
 * are faked.
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

import { PreferencesProvider, usePreferences, DEFAULT_SETTINGS } from "../preferences";
import type { UserSettingsData } from "@workspace/api-client-react";

// ── Fake backend (mounted on global.fetch) ──────────────────────────────────
const serverStore = new Map<string, UserSettingsData>();
let holdPuts = false;
const heldPuts: Array<() => void> = [];

function jsonResponse(obj: unknown) {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    headers: new Headers({ "content-type": "application/json" }),
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
      const uid = authState.userId ?? "anon";

      if (url.endsWith("/api/settings") && method === "GET") {
        const data = serverStore.get(uid);
        return Promise.resolve(
          jsonResponse(
            data
              ? { data, updatedAt: new Date().toISOString() }
              : { data: { ...DEFAULT_SETTINGS }, updatedAt: null },
          ),
        );
      }

      if (url.endsWith("/api/settings") && method === "PUT") {
        const data = JSON.parse(String(init?.body)) as UserSettingsData;
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

// ── Probe consumer surfacing a personal field + a way to mutate it ───────────
function Probe() {
  const { settings, updateSettings, isLoading } = usePreferences();
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="whatsapp">{settings.notifications.whatsappNumber ?? ""}</span>
      <span data-testid="instagram">{settings.socialAccounts.instagram ?? ""}</span>
      <button
        onClick={() =>
          void updateSettings({
            ...settings,
            notifications: { ...settings.notifications, whatsappNumber: "9990001111" },
            socialAccounts: { ...settings.socialAccounts, instagram: "@alice" },
          })
        }
      >
        fill-alice
      </button>
    </div>
  );
}

function makeUi(client: QueryClient) {
  return (
    <QueryClientProvider client={client}>
      <PreferencesProvider>
        <Probe />
      </PreferencesProvider>
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

describe("Preferences privacy across account switches", () => {
  it("does not show account A's settings to account B after signing out and in", async () => {
    authState = { userId: "user_A", isSignedIn: true };
    const client = freshClient();
    const { rerender } = render(makeUi(client));

    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("false"),
    );

    // A saves personal settings; wait for the save to persist.
    fireEvent.click(screen.getByText("fill-alice"));
    await waitFor(() =>
      expect(screen.getByTestId("whatsapp").textContent).toBe("9990001111"),
    );
    await waitFor(() => expect(serverStore.get("user_A")).toBeDefined(), {
      timeout: 3000,
    });

    // Sign out, then sign in as B.
    authState = { userId: null, isSignedIn: false };
    rerender(makeUi(client));
    authState = { userId: "user_B", isSignedIn: true };
    rerender(makeUi(client));

    await waitFor(() =>
      expect(screen.getByTestId("instagram").textContent).toBe(""),
    );

    // B must never see A's personal fields — neither from stale state nor a
    // shared cache entry.
    expect(screen.getByTestId("whatsapp").textContent).toBe("");
    expect(screen.getByTestId("instagram").textContent).toBe("");
  });

  it("does not let a save that resolves after the switch contaminate B", async () => {
    authState = { userId: "user_A", isSignedIn: true };
    const client = freshClient();
    const { rerender } = render(makeUi(client));

    await waitFor(() =>
      expect(screen.getByTestId("loading").textContent).toBe("false"),
    );

    // Hold A's save in-flight.
    holdPuts = true;
    fireEvent.click(screen.getByText("fill-alice"));
    await waitFor(() => expect(heldPuts.length).toBe(1), { timeout: 3000 });

    // Switch to B before A's save resolves.
    authState = { userId: null, isSignedIn: false };
    rerender(makeUi(client));
    authState = { userId: "user_B", isSignedIn: true };
    rerender(makeUi(client));
    await waitFor(() =>
      expect(screen.getByTestId("instagram").textContent).toBe(""),
    );

    // Let A's stale save resolve. It must not touch B's view or cache.
    await act(async () => {
      heldPuts[0]();
      await Promise.resolve();
    });

    expect(screen.getByTestId("whatsapp").textContent).toBe("");
    expect(screen.getByTestId("instagram").textContent).toBe("");
    expect(serverStore.get("user_B")).toBeUndefined();
  });
});
