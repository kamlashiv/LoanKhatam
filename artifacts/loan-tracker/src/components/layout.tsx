import { Link, useLocation } from "wouter";
import { useClerk, useUser } from "@clerk/react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme";
import { useGetDashboardSummary } from "@workspace/api-client-react";
import {
  Wallet, LayoutDashboard, List, LogOut, Plus, Menu, BarChart3, Target, Flame,
  Sun, Moon, Sparkles, UserCircle, Settings, Share2, CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ShareApp } from "@/components/share-app";
import { LogoGlyph } from "@/components/logo";

const shareButtonClassName =
  "w-full justify-start gap-3 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100";

function ThemeToggle({ className }: { className?: string }) {
  const { isDark, toggleTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn("text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100", className)}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/credit-cards", label: "Cards & Accounts", icon: CreditCard },
  { href: "/profile", label: "Financial Profile", icon: UserCircle },
  { href: "/planner", label: "Smart Strategy", icon: Target },
  { href: "/strategy", label: "Financial Strategy", icon: Sparkles },
  
  { href: "/amortization", label: "Amortization", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

function Brand() {
  const { user } = useUser();
  const name =
    user?.firstName ||
    user?.username ||
    user?.fullName?.split(" ")[0] ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "";

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/20">
        <LogoGlyph className="h-5 w-5 text-white" />
      </div>
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Welcome
        </span>
        <span className="truncate text-xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
          {name || "back"}
        </span>
      </div>
    </div>
  );
}

function NavLinks({ location }: { location: string }) {
  return (
    <nav className="space-y-2">
      {navItems.map((item) => {
        const isActive = location === item.href || location.startsWith(item.href + "/");
        return (
          <Link key={item.href} href={item.href} className="block">
            <div
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200 cursor-pointer",
                isActive
                  ? "bg-white text-indigo-700 font-bold shadow-sm border border-slate-100 dark:bg-slate-800 dark:text-indigo-300 dark:border-slate-700"
                  : "text-slate-500 font-semibold hover:bg-white/60 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

function StayOnTopCard() {
  const { data: summary } = useGetDashboardSummary();
  const overdue = summary?.overdueLoans ?? 0;

  return (
    <div className="rounded-3xl border border-indigo-100 bg-indigo-50 p-5 dark:border-indigo-900/50 dark:bg-indigo-950/40">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-300">
        <Flame className="h-5 w-5" />
      </div>
      <h4 className="mb-1 font-bold text-slate-800 dark:text-slate-100">Stay on top</h4>
      <p className="mb-4 text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
        {overdue > 0
          ? `You have ${overdue} overdue loan${overdue === 1 ? "" : "s"} that need${overdue === 1 ? "s" : ""} your attention.`
          : "Every loan is on track. Nice work staying ahead."}
      </p>
      <Link
        href={overdue > 0 ? "/loans?status=overdue" : "/loans"}
        className="block w-full rounded-xl bg-indigo-600 py-2.5 text-center font-bold text-white shadow-sm transition-colors hover:bg-indigo-700"
      >
        {overdue > 0 ? "Review Now" : "View All Loans"}
      </Link>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  const handleLogout = () => {
    signOut({ redirectUrl: basePath || "/" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      {/* Mobile Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/80 p-4 backdrop-blur-xl md:hidden dark:border-slate-800 dark:bg-slate-900/80">
        <Brand />
        <div className="flex items-center gap-1">
          <ThemeToggle className="text-slate-700 dark:text-slate-300" />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu" className="text-slate-700 dark:text-slate-300">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex w-72 flex-col border-r-slate-200 bg-white p-6 pt-10 dark:border-r-slate-800 dark:bg-slate-900">
            <div className="mb-8">
              <Brand />
            </div>
            <NavLinks location={location} />
            <div className="mt-6">
              <Button asChild className="w-full justify-start gap-2 rounded-xl shadow-sm" size="lg">
                <Link href="/loans/new">
                  <Plus className="h-5 w-5" />
                  Add Loan
                </Link>
              </Button>
            </div>
            <div className="mt-auto space-y-3">
              <StayOnTopCard />
              <ShareApp
                trigger={
                  <Button variant="ghost" className={shareButtonClassName}>
                    <Share2 className="h-5 w-5" />
                    Share app
                  </Button>
                }
              />
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                Log out
              </Button>
            </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col justify-between border-r border-slate-200/60 bg-white/60 p-6 backdrop-blur-xl md:flex dark:border-slate-800 dark:bg-slate-900/60">
        <div>
          <div className="mb-10">
            <Brand />
          </div>
          <NavLinks location={location} />
          <div className="mt-8">
            <Button asChild className="w-full justify-start gap-2 rounded-xl shadow-sm" size="lg">
              <Link href="/loans/new">
                <Plus className="h-5 w-5" />
                Add Loan
              </Link>
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          <StayOnTopCard />
          <ShareApp
            trigger={
              <Button variant="ghost" className={shareButtonClassName}>
                <Share2 className="h-5 w-5" />
                Share app
              </Button>
            }
          />
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="flex-1 justify-start gap-3 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              Log out
            </Button>
            <ThemeToggle className="shrink-0 hover:bg-slate-100 dark:hover:bg-slate-800" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative min-w-0 flex-1 md:ml-64">
        <div className="mx-auto w-full max-w-6xl p-4 md:p-8 lg:p-10">{children}</div>
      </main>
    </div>
  );
}
