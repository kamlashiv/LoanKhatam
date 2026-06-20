import { Link, useLocation } from "wouter";
import { useClerk } from "@clerk/react";
import { cn } from "@/lib/utils";
import { Wallet, LayoutDashboard, List, LogOut, Plus, Menu, BarChart3, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/loans", label: "All Loans", icon: List },
    { href: "/amortization", label: "Amortization", icon: BarChart3 },
    { href: "/planner", label: "Payoff Planner", icon: Target },
  ];

  const handleLogout = () => {
    signOut({ redirectUrl: basePath || "/" });
  };

  const NavLinks = () => (
    <>
      <div className="flex flex-col space-y-2 mt-6 px-4">
        {navItems.map((item) => {
          const isActive = location === item.href || location.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} className="block">
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer font-medium",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="px-4 mt-8">
        <Link href="/loans/new" className="block">
          <Button className="w-full justify-start gap-2 shadow-sm" size="lg">
            <Plus className="h-5 w-5" />
            Add Loan
          </Button>
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-sidebar border-b border-sidebar-border text-sidebar-foreground sticky top-0 z-20">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <Wallet className="h-6 w-6 text-primary" />
          <span>Ledger</span>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-sidebar-foreground">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-sidebar border-r-sidebar-border text-sidebar-foreground p-0 pt-10">
            <div className="px-6 flex items-center gap-2 font-bold text-2xl tracking-tight mb-8">
              <Wallet className="h-7 w-7 text-primary" />
              <span>Ledger</span>
            </div>
            <NavLinks />
            <div className="absolute bottom-8 left-0 right-0 px-4">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                Log out
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 bg-sidebar border-r border-sidebar-border z-10 text-sidebar-foreground">
        <div className="p-6 flex items-center gap-2 font-bold text-2xl tracking-tight mt-2">
          <Wallet className="h-7 w-7 text-primary" />
          <span>Ledger</span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <NavLinks />
        </div>
        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            Log out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 relative min-w-0">
        <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
