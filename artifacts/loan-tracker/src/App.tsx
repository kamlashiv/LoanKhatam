import { lazy, Suspense, useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk, useUser } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import {
  getGetDashboardSummaryQueryKey,
  getGetRecentLoansQueryKey,
  getListLoansQueryKey,
  type DashboardSummary,
  type Loan,
  setBaseUrl,
} from "@workspace/api-client-react";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider, useTheme } from "@/lib/theme";
import { FramePreviewBanner } from "@/components/frame-preview-banner";
import { AuthShowcase } from "@/components/auth-showcase";
import { writeOfflineSnapshot, clearOfflineSnapshots } from "@/lib/offline-cache";
import { runBackInterceptor } from "@/lib/mobile-back-guard";

import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";
import { LandingPage } from "@/pages/landing";
import { ProfileProvider } from "@/lib/profile";
import { PreferencesProvider } from "@/lib/preferences";

// Authenticated and secondary pages are code-split into their own chunks so the
// public landing route (`/`) ships only the marketing UI, auth screens, and
// minimal shared shell — not the entire signed-in app.
const Dashboard = lazy(() =>
  import("@/pages/dashboard").then((m) => ({ default: m.Dashboard })),
);
const LoansList = lazy(() =>
  import("@/pages/loans").then((m) => ({ default: m.LoansList })),
);
const CreditCardsList = lazy(() =>
  import("@/pages/credit-cards").then((m) => ({ default: m.CreditCardsList })),
);
const LoanDetail = lazy(() =>
  import("@/pages/loan-detail").then((m) => ({ default: m.LoanDetail })),
);
const LoanForm = lazy(() =>
  import("@/pages/loan-form").then((m) => ({ default: m.LoanForm })),
);
const AllAmortization = lazy(() =>
  import("@/pages/all-amortization").then((m) => ({
    default: m.AllAmortization,
  })),
);
const Planner = lazy(() =>
  import("@/pages/planner").then((m) => ({ default: m.Planner })),
);
const Strategy = lazy(() => import("@/pages/strategy"));
const ProfilePage = lazy(() =>
  import("@/pages/profile").then((m) => ({ default: m.ProfilePage })),
);
const SettingsPage = lazy(() =>
  import("@/pages/settings").then((m) => ({ default: m.SettingsPage })),
);
const AboutPage = lazy(() =>
  import("@/pages/about").then((m) => ({ default: m.AboutPage })),
);
const HelpPage = lazy(() =>
  import("@/pages/help").then((m) => ({ default: m.HelpPage })),
);
const PrivacyPolicyPage = lazy(() =>
  import("@/pages/privacy-policy").then((m) => ({
    default: m.PrivacyPolicyPage,
  })),
);
const TermsPage = lazy(() =>
  import("@/pages/terms").then((m) => ({ default: m.TermsPage })),
);
const DisclaimerPage = lazy(() =>
  import("@/pages/disclaimer").then((m) => ({ default: m.DisclaimerPage })),
);
const CookiePolicyPage = lazy(() =>
  import("@/pages/cookie-policy").then((m) => ({ default: m.CookiePolicyPage })),
);
const DataUsagePage = lazy(() =>
  import("@/pages/data-usage").then((m) => ({ default: m.DataUsagePage })),
);
const LicensePage = lazy(() =>
  import("@/pages/license").then((m) => ({ default: m.LicensePage })),
);

const queryClient = new QueryClient();

if (import.meta.env.VITE_API_URL) {
  setBaseUrl(import.meta.env.VITE_API_URL);
}

let clerkPubKey = (window as any).VITE_CLERK_PUBLISHABLE_KEY || import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const hostname = window.location.hostname;
const isLocal =
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  /^192\.168\./.test(hostname) ||
  /^10\./.test(hostname) ||
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
  hostname.endsWith(".local");

const isReplit = hostname.endsWith(".replit.app") || hostname.endsWith(".repl.co") || hostname.includes("replit.dev");
if (!isLocal && isReplit) {
  try {
    clerkPubKey = publishableKeyFromHost(
      hostname,
      clerkPubKey,
    ) || clerkPubKey;
  } catch (e) {
    console.warn("Failed to parse Clerk key from host, using fallback:", e);
  }
}

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env file");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(243 75% 59%)",
    colorForeground: "hsl(var(--foreground))",
    colorMutedForeground: "hsl(var(--muted-foreground))",
    colorDanger: "hsl(var(--destructive))",
    colorBackground: "hsl(var(--card))",
    colorInput: "hsl(var(--card))",
    colorInputForeground: "hsl(var(--foreground))",
    colorNeutral: "hsl(var(--muted))",
    fontFamily: "Plus Jakarta Sans, sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "!bg-transparent !shadow-none !border-0 !rounded-none w-full max-w-full overflow-visible",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none !px-0 !py-0",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "!text-3xl sm:!text-4xl !font-bold !text-foreground tracking-tight",
    headerSubtitle: "!text-base sm:!text-lg !text-muted-foreground mt-2",
    socialButtonsBlockButtonText: "!text-sm !text-foreground !font-bold",
    formFieldLabel: "!text-sm !text-foreground !font-bold",
    footerActionLink: "!text-sm !text-primary !font-medium hover:underline",
    footerActionText: "!text-sm !text-muted-foreground",
    dividerText: "!text-xs !text-muted-foreground",
    identityPreviewEditButton: "!text-sm text-primary",
    formFieldSuccessText: "!text-xs text-success",
    alertText: "!text-sm text-foreground",
    logoBox: "flex justify-center mb-8",
    logoImage: "h-14 w-auto !max-w-none",
    socialButtonsBlockButton: "!py-2 border border-border bg-card hover:bg-muted text-foreground transition-colors",
    socialButtonsIconButton: "!py-2 border border-border bg-card hover:bg-muted transition-colors",
    formButtonPrimary: "!text-sm !font-semibold !py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
    formFieldInput: "!text-sm !py-2 border border-border bg-card text-foreground focus:ring-ring rounded-md",
    footerAction: "mt-4",
    dividerLine: "!bg-border",
    alert: "bg-destructive/10 border-destructive text-destructive",
    otpCodeFieldInput: "!text-lg border-border text-foreground",
    formFieldRow: "mb-3",
    main: "w-full",
  },
};

function SignInPage() {
  return (
    <AuthShowcase>
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </AuthShowcase>
  );
}

function SignUpPage() {
  return (
    <AuthShowcase>
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </AuthShowcase>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClient.clear();
        // Drop any cached offline snapshot so a prior user's financial data
        // can't render for the next account on a shared device.
        clearOfflineSnapshots();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

// Persists a small, read-only snapshot of the last-seen dashboard summary and
// loans to localStorage so the bundled `offline.html` page can show useful
// cached data when the device is offline. Scoped to the signed-in Clerk user.
function OfflineSnapshotWriter() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const userId = user?.id ?? null;

  useEffect(() => {
    if (!userId) return;

    const persist = () => {
      const summary =
        queryClient.getQueryData<DashboardSummary>(getGetDashboardSummaryQueryKey()) ?? null;
      const allLoans = queryClient.getQueryData<Loan[]>(getListLoansQueryKey());
      const recentLoans = queryClient.getQueryData<Loan[]>(getGetRecentLoansQueryKey());
      const loans = allLoans && allLoans.length > 0 ? allLoans : recentLoans ?? null;
      writeOfflineSnapshot(userId, { summary, loans });
    };

    persist();
    const unsubscribe = queryClient.getQueryCache().subscribe(persist);
    return unsubscribe;
  }, [queryClient, userId]);

  return null;
}

// On Android (Capacitor WebView), the hardware/gesture back button defaults to
// exiting the app. Instead, walk back through the app's own history (Wouter
// listens to popstate, so `history.back()` drives in-app navigation) and only
// exit when there is no in-app history left. On the root screen, require a
// second back press within a short window before exiting so an accidental tap
// doesn't close the app. No-op on web.
const BACK_TO_EXIT_WINDOW_MS = 2000;

function MobileBackButtonHandler() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let removeListener: (() => void) | undefined;
    let lastBackPressAt = 0;

    CapacitorApp.addListener("backButton", ({ canGoBack }) => {
      // Let an active screen (e.g. a dirty loan form) intercept the back press
      // first — it may show a "Discard changes?" confirm instead of navigating.
      if (runBackInterceptor()) {
        return;
      }

      if (canGoBack) {
        window.history.back();
        return;
      }

      const now = Date.now();
      if (now - lastBackPressAt < BACK_TO_EXIT_WINDOW_MS) {
        CapacitorApp.exitApp();
        return;
      }

      lastBackPressAt = now;
      toast({
        description: "Press back again to exit",
        duration: BACK_TO_EXIT_WINDOW_MS,
      });
    }).then((handle) => {
      removeListener = () => {
        void handle.remove();
      };
    });

    return () => {
      removeListener?.();
    };
  }, []);

  return null;
}

function RouteFallback() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <LandingPage />
      </Show>
    </>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <>
      <Show when="signed-in">
        <Layout>
          <Component />
        </Layout>
      </Show>
      <Show when="signed-out">
        <Redirect to="/" />
      </Show>
    </>
  );
}

function PublicRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <>
      <Show when="signed-in">
        <Layout>
          <Component />
        </Layout>
      </Show>
      <Show when="signed-out">
        <Component />
      </Show>
    </>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();
  const { isDark } = useTheme();

  const logoUrl = isDark
    ? `${window.location.origin}${basePath}/logo-dark.svg`
    : `${window.location.origin}${basePath}/logo.svg`;

  const dynamicAppearance = {
    ...clerkAppearance,
    options: {
      ...clerkAppearance.options,
      logoImageUrl: logoUrl,
    },
  };

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={dynamicAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Sign in to access your Loan Khatam account",
          },
        },
        signUp: {
          start: {
            title: "Create your Loan Khatam account",
            subtitle: "Track your loans with clarity",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <OfflineSnapshotWriter />
        <MobileBackButtonHandler />
        <ProfileProvider>
        <PreferencesProvider>
        <Suspense fallback={<RouteFallback />}>
        <Switch>
          <Route path="/" component={HomeRedirect} />
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />
          
          <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
          <Route path="/loans" component={() => <ProtectedRoute component={LoansList} />} />
          <Route path="/credit-cards" component={() => <ProtectedRoute component={CreditCardsList} />} />
          <Route path="/loans/new" component={() => <ProtectedRoute component={LoanForm} />} />
          <Route path="/loans/:id/edit" component={() => <ProtectedRoute component={LoanForm} />} />
          <Route path="/loans/:id" component={() => <ProtectedRoute component={LoanDetail} />} />
          <Route path="/amortization" component={() => <ProtectedRoute component={AllAmortization} />} />
          <Route path="/planner" component={() => <ProtectedRoute component={Planner} />} />
          <Route path="/strategy" component={() => <ProtectedRoute component={Strategy} />} />
          <Route path="/profile" component={() => <ProtectedRoute component={ProfilePage} />} />
          <Route path="/settings" component={() => <ProtectedRoute component={SettingsPage} />} />
          <Route path="/about" component={() => <PublicRoute component={AboutPage} />} />
          <Route path="/help" component={() => <PublicRoute component={HelpPage} />} />
          <Route path="/privacy-policy" component={() => <PublicRoute component={PrivacyPolicyPage} />} />
          <Route path="/terms" component={() => <PublicRoute component={TermsPage} />} />
          <Route path="/disclaimer" component={() => <PublicRoute component={DisclaimerPage} />} />
          <Route path="/cookie-policy" component={() => <PublicRoute component={CookiePolicyPage} />} />
          <Route path="/data-usage" component={() => <PublicRoute component={DataUsagePage} />} />
          <Route path="/license" component={() => <PublicRoute component={LicensePage} />} />
          
          <Route component={NotFound} />
        </Switch>
        </Suspense>
        </PreferencesProvider>
        </ProfileProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <FramePreviewBanner />
        <WouterRouter base={basePath}>
          <ClerkProviderWithRoutes />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;
