import { lazy, Suspense, useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import { FramePreviewBanner } from "@/components/frame-preview-banner";

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

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

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
    colorForeground: "hsl(215 30% 15%)",
    colorMutedForeground: "hsl(215 15% 45%)",
    colorDanger: "hsl(0 70% 45%)",
    colorBackground: "hsl(0 0% 100%)",
    colorInput: "hsl(0 0% 100%)",
    colorInputForeground: "hsl(215 30% 15%)",
    colorNeutral: "hsl(40 10% 85%)",
    fontFamily: "Plus Jakarta Sans, sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-card rounded-2xl w-[440px] max-w-full overflow-hidden shadow-lg border border-border rounded-tl-[25px] rounded-tr-[25px] rounded-br-[25px] rounded-bl-[25px]",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none !px-8 !py-8",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-2xl font-bold text-foreground tracking-tight",
    headerSubtitle: "text-muted-foreground mt-1",
    socialButtonsBlockButtonText: "text-foreground font-medium",
    formFieldLabel: "text-foreground font-medium",
    footerActionLink: "text-primary font-medium hover:underline",
    footerActionText: "text-muted-foreground",
    dividerText: "text-muted-foreground",
    identityPreviewEditButton: "text-primary",
    formFieldSuccessText: "text-success",
    alertText: "text-foreground",
    logoBox: "mb-6 flex justify-center",
    logoImage: "h-12 w-auto",
    socialButtonsBlockButton: "border-border hover:bg-secondary transition-colors",
    formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
    formFieldInput: "border-border bg-input text-foreground focus:ring-ring rounded-md",
    footerAction: "mt-6",
    dividerLine: "bg-border",
    alert: "bg-destructive/10 border-destructive text-destructive",
    otpCodeFieldInput: "border-border text-foreground",
    formFieldRow: "mb-4",
    main: "w-full",
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-12">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-12">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
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
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

// On Android (Capacitor WebView), the hardware/gesture back button defaults to
// exiting the app. Instead, walk back through the app's own history (Wouter
// listens to popstate, so `history.back()` drives in-app navigation) and only
// exit when there is no in-app history left. No-op on web.
function MobileBackButtonHandler() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let removeListener: (() => void) | undefined;

    CapacitorApp.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        CapacitorApp.exitApp();
      }
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

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Sign in to access your ledger",
          },
        },
        signUp: {
          start: {
            title: "Create your ledger",
            subtitle: "Track your loans with clarity",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
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
