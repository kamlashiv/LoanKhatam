import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";
import { LogoGlyph } from "@/components/logo";
import { Sun, Moon, Menu, Heart } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SocialConnect } from "@/components/social-connect";

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col overflow-hidden animate-fadeIn">
      {/* Sticky Header */}
      <header className="border-b border-slate-200/60 bg-white/80 dark:border-slate-800/60 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 cursor-pointer group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform duration-200">
              <LogoGlyph className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
              Loan Khatam
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500 dark:text-slate-400">
            <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
              Home
            </Link>
            <Link href="/tools" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
              Financial Tools
            </Link>
            <Link href="/blogs" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
              Blogs
            </Link>
            <Link href="/about" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
              About
            </Link>
            <Link href="/help" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">
              Help & Support
            </Link>
          </nav>

          {/* Action Area */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/sign-in">
              <Button variant="ghost" className="font-bold hidden sm:inline-flex rounded-xl cursor-pointer">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10 rounded-xl cursor-pointer">
                Get Started
              </Button>
            </Link>

            {/* Mobile Nav Toggle */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden rounded-xl">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 flex flex-col pt-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
                    <LogoGlyph className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-xl font-black">Loan Khatam</span>
                </div>
                
                <nav className="flex flex-col gap-4 text-base font-bold text-slate-500 dark:text-slate-400">
                  <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-1">
                    Home
                  </Link>
                  <Link href="/tools" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-1">
                    Financial Tools
                  </Link>
                  <Link href="/blogs" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-1">
                    Blogs
                  </Link>
                  <Link href="/about" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-1">
                    About
                  </Link>
                  <Link href="/help" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-1">
                    Help & Support
                  </Link>
                  
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
                  <Link href="/sign-in" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-1">
                    Sign In
                  </Link>
                  <Link href="/sign-up" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-1">
                    Get Started
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main content viewport */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-10">
        {children}
      </main>

      {/* Connect section */}
      <SocialConnect />

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200/60 dark:border-slate-800/60 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-6 text-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/20">
              <LogoGlyph className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
              Loan Khatam
            </span>
          </div>
          
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
            Your personal, secure, and private loan book. Simplify your cash flow tracking and clear your debts faster.
          </p>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-semibold text-slate-400 dark:text-slate-500">
            <Link href="/about" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">About</Link>
            <Link href="/help" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Help & Support</Link>
            <Link href="/privacy-policy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Terms of Service</Link>
            <Link href="/disclaimer" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Disclaimer</Link>
            <Link href="/cookie-policy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Cookie Policy</Link>
            <Link href="/data-usage" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Data Usage</Link>
            <Link href="/license" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">License</Link>
          </nav>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mt-2">
            <span>© {new Date().getFullYear()} Loan Khatam. Made with</span>
            <Heart className="h-3 w-3 text-red-500 fill-red-500" />
            <span>for financial clarity.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
