import { jsx, jsxs } from "react/jsx-runtime";
import { renderToString } from "react-dom/server";
import { Link, Router } from "wouter";
import * as React from "react";
import { createContext, useState, useEffect, useCallback, useMemo, useContext } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Instagram, Twitter, Linkedin, Youtube, Facebook, ArrowUpRight, ShieldCheck, Wallet, ArrowDownRight, CheckCircle2, TrendingUp, Users, ChevronDown, Sun, Moon, ArrowLeft, Info, Tag, CalendarDays, Globe, Mail, BookOpen, Target, PiggyBank, Scale, CalendarClock, LifeBuoy, HelpCircle, Bug, Lightbulb, ListChecks, FileText, AlertTriangle, ShieldAlert, Cookie, Database, Lock, Download, Trash2, ScrollText } from "lucide-react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
const MODE_KEY = "loan-tracker-theme";
const FONT_KEY = "loan-tracker-font-size";
const MOTION_KEY = "loan-tracker-reduce-motion";
const FONT_PX = {
  small: "14px",
  medium: "16px",
  large: "18px"
};
const ThemeContext = createContext(null);
function readStored(key, allowed, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    if (stored && allowed.includes(stored)) return stored;
  } catch {
  }
  return fallback;
}
function systemPrefersDark() {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-color-scheme: dark)").matches;
}
function resolveTheme(mode) {
  if (mode === "system") return systemPrefersDark() ? "dark" : "light";
  return mode;
}
function applyTheme(theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}
function applyFontSize(size) {
  document.documentElement.style.fontSize = FONT_PX[size];
}
function applyReduceMotion(value) {
  document.documentElement.classList.toggle("reduce-motion", value);
}
function ThemeProvider({ children }) {
  const [mode, setModeState] = useState(
    () => readStored(MODE_KEY, ["light", "dark", "system"], "system")
  );
  const [fontSize, setFontSizeState] = useState(
    () => readStored(FONT_KEY, ["small", "medium", "large"], "medium")
  );
  const [reduceMotion, setReduceMotionState] = useState(
    () => readStored(MOTION_KEY, ["true", "false"], "false") === "true"
  );
  const [theme, setResolvedTheme] = useState(() => resolveTheme(mode));
  useEffect(() => {
    const resolved = resolveTheme(mode);
    setResolvedTheme(resolved);
    applyTheme(resolved);
    try {
      window.localStorage.setItem(MODE_KEY, mode);
    } catch {
    }
  }, [mode]);
  useEffect(() => {
    if (mode !== "system" || typeof window === "undefined") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const resolved = systemPrefersDark() ? "dark" : "light";
      setResolvedTheme(resolved);
      applyTheme(resolved);
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [mode]);
  useEffect(() => {
    applyFontSize(fontSize);
    try {
      window.localStorage.setItem(FONT_KEY, fontSize);
    } catch {
    }
  }, [fontSize]);
  useEffect(() => {
    applyReduceMotion(reduceMotion);
    try {
      window.localStorage.setItem(MOTION_KEY, String(reduceMotion));
    } catch {
    }
  }, [reduceMotion]);
  const setMode = useCallback((next) => setModeState(next), []);
  const setTheme = useCallback((next) => setModeState(next), []);
  const setFontSize = useCallback((next) => setFontSizeState(next), []);
  const setReduceMotion = useCallback(
    (next) => setReduceMotionState(next),
    []
  );
  const toggleTheme = useCallback(
    () => setModeState(resolveTheme(mode) === "dark" ? "light" : "dark"),
    [mode]
  );
  const value = useMemo(
    () => ({
      theme,
      isDark: theme === "dark",
      mode,
      setMode,
      toggleTheme,
      setTheme,
      fontSize,
      setFontSize,
      reduceMotion,
      setReduceMotion
    }),
    [theme, mode, setMode, toggleTheme, setTheme, fontSize, setFontSize, reduceMotion, setReduceMotion]
  );
  return /* @__PURE__ */ jsx(ThemeContext.Provider, { value, children });
}
function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover-elevate active-elevate-2",
  {
    variants: {
      variant: {
        default: (
          // @replit: no hover, and add primary border
          "bg-primary text-primary-foreground border border-primary-border"
        ),
        destructive: "bg-destructive text-destructive-foreground shadow-sm border-destructive-border",
        outline: (
          // @replit Shows the background color of whatever card / sidebar / accent background it is inside of.
          // Inherits the current text color. Uses shadow-xs. no shadow on active
          // No hover state
          " border [border-color:var(--button-outline)] shadow-xs active:shadow-none "
        ),
        secondary: (
          // @replit border, no hover, no shadow, secondary border.
          "border bg-secondary text-secondary-foreground border border-secondary-border "
        ),
        // @replit no hover, transparent border
        ghost: "border border-transparent",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        // @replit changed sizes
        default: "min-h-9 px-4 py-2",
        sm: "min-h-8 rounded-md px-3 text-xs",
        lg: "min-h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx(
      Comp,
      {
        className: cn(buttonVariants({ variant, size, className })),
        ref,
        ...props
      }
    );
  }
);
Button.displayName = "Button";
const channels = [
  {
    name: "Instagram",
    handle: "@loankhatam.app",
    followers: "48.2K",
    href: "https://instagram.com/loankhatam.app",
    icon: Instagram,
    tint: "bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600",
    iconColor: "text-white"
  },
  {
    name: "X (Twitter)",
    handle: "@loankhatam",
    followers: "31.6K",
    href: "https://x.com/loankhatam",
    icon: Twitter,
    tint: "bg-black dark:bg-slate-800",
    iconColor: "text-white"
  },
  {
    name: "LinkedIn",
    handle: "Loan Khatam Finance",
    followers: "22.9K",
    href: "https://linkedin.com/company/loankhatam",
    icon: Linkedin,
    tint: "bg-[#0a66c2]",
    iconColor: "text-white"
  },
  {
    name: "YouTube",
    handle: "@loankhatamapp",
    followers: "15.3K",
    href: "https://youtube.com/@loankhatamapp",
    icon: Youtube,
    tint: "bg-[#ff0000]",
    iconColor: "text-white"
  },
  {
    name: "Facebook",
    handle: "/loankhatamapp",
    followers: "27.1K",
    href: "https://facebook.com/loankhatamapp",
    icon: Facebook,
    tint: "bg-[#1877f2]",
    iconColor: "text-white"
  }
];
function SocialConnect() {
  return /* @__PURE__ */ jsx("section", { className: "py-20 px-6 bg-background", children: /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl lg:text-4xl font-bold tracking-tight text-foreground", children: "Connect with us" }),
      /* @__PURE__ */ jsx("p", { className: "mx-auto mt-4 max-w-xl text-lg text-muted-foreground", children: "Follow Loan Khatam for money tips, product updates, and stories from people getting their loans paid off — faster." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", children: [
      channels.map((c) => {
        const Icon = c.icon;
        return /* @__PURE__ */ jsxs(
          "a",
          {
            href: c.href,
            target: "_blank",
            rel: "noopener noreferrer",
            "aria-label": `Follow Loan Khatam on ${c.name}`,
            className: "group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md",
            children: [
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: `flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${c.tint}`,
                  children: /* @__PURE__ */ jsx(Icon, { className: `h-6 w-6 ${c.iconColor}` })
                }
              ),
              /* @__PURE__ */ jsxs("span", { className: "min-w-0 flex-1", children: [
                /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 font-semibold text-foreground", children: [
                  c.name,
                  /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-4 w-4 text-muted-foreground/50 transition-colors group-hover:text-primary" })
                ] }),
                /* @__PURE__ */ jsx("span", { className: "block truncate text-sm text-muted-foreground", children: c.handle })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "shrink-0 text-right", children: [
                /* @__PURE__ */ jsx("span", { className: "block text-sm font-semibold text-foreground", children: c.followers }),
                /* @__PURE__ */ jsx("span", { className: "block text-xs text-muted-foreground", children: "followers" })
              ] })
            ]
          },
          c.name
        );
      }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-center gap-3 rounded-2xl bg-primary p-6 text-primary-foreground shadow-sm", children: [
        /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold leading-snug", children: "Join 145K+ people managing loans the smart way" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-primary-foreground/80", children: "New tips every week across all our channels." })
      ] })
    ] })
  ] }) });
}
function LogoGlyph({ className }) {
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      className,
      "aria-hidden": "true",
      children: [
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M5.5 16.5 L9.5 12.5 L12.5 15 L17.5 8.5",
            stroke: "currentColor",
            strokeWidth: "1.7",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        ),
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M14 8.5 L17.5 8.5 L17.5 12",
            stroke: "currentColor",
            strokeWidth: "1.7",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        ),
        /* @__PURE__ */ jsx("circle", { cx: "16.5", cy: "17", r: "2.75", stroke: "currentColor", strokeWidth: "1.3", fill: "none" }),
        /* @__PURE__ */ jsx("circle", { cx: "16.5", cy: "17", r: "1", fill: "#34d399" })
      ]
    }
  );
}
function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  return /* @__PURE__ */ jsx(
    Button,
    {
      variant: "ghost",
      size: "icon",
      onClick: toggleTheme,
      "aria-label": isDark ? "Switch to light mode" : "Switch to dark mode",
      title: isDark ? "Switch to light mode" : "Switch to dark mode",
      children: isDark ? /* @__PURE__ */ jsx(Sun, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(Moon, { className: "h-5 w-5" })
    }
  );
}
function LandingPage() {
  const features = [
    {
      icon: Wallet,
      title: "Loan Register",
      description: "Track every rupee you lend — principal, interest rate, due date, all in one place."
    },
    {
      icon: TrendingUp,
      title: "Payment Tracking",
      description: "Record each payment and watch the outstanding balance update automatically."
    },
    {
      icon: ShieldCheck,
      title: "Status at a Glance",
      description: "Know instantly which loans are active, overdue, or fully paid."
    },
    {
      icon: Users,
      title: "Private & Secure",
      description: "Keep your loans to friends and family private and secure with Loan Khatam."
    }
  ];
  const faqs = [
    {
      q: "What is Loan Khatam?",
      a: "Loan Khatam is a free personal loan and udhaar tracker. It helps you record money you lend to friends, family, or colleagues, track repayments and EMIs, and see outstanding balances at a glance — all in Indian Rupees (₹)."
    },
    {
      q: "How do I keep track of money I lend to friends and family?",
      a: "Add each loan with the borrower's name, amount, interest rate, and due date. Every time you receive a repayment, record it and Loan Khatam updates the outstanding balance automatically, so you always know who owes you how much."
    },
    {
      q: "Is Loan Khatam free to use?",
      a: "Yes. Loan Khatam is completely free to sign up and use for tracking your personal loans and udhaar."
    },
    {
      q: "Can I track informal udhaar and EMI-based loans?",
      a: "Absolutely. You can track both casual udhaar between friends and structured loans with interest and monthly EMIs. The app calculates balances, due dates, and overdue status for you."
    },
    {
      q: "Is my financial data private and secure?",
      a: "Yes. Your account is protected with secure sign-in, and your loan records stay private to you — only you can see the money you have lent and the repayments you record."
    },
    {
      q: "Can I use Loan Khatam on my phone?",
      a: "Yes. Loan Khatam works in any mobile browser and is also available as an Android app, so you can update your loan khata anytime, anywhere."
    }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background text-foreground flex flex-col overflow-hidden", children: [
    /* @__PURE__ */ jsx("header", { className: "border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto px-6 py-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/20", children: /* @__PURE__ */ jsx(LogoGlyph, { className: "h-5 w-5 text-white" }) }),
        /* @__PURE__ */ jsx("span", { className: "text-2xl font-extrabold tracking-tight text-foreground", children: "Loan Khatam" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 sm:gap-4", children: [
        /* @__PURE__ */ jsx(ThemeToggle, {}),
        /* @__PURE__ */ jsx(Link, { href: "/sign-in", children: /* @__PURE__ */ jsx(Button, { variant: "ghost", className: "font-medium hidden sm:inline-flex", children: "Sign In" }) }),
        /* @__PURE__ */ jsx(Link, { href: "/sign-up", children: /* @__PURE__ */ jsx(Button, { className: "font-medium", children: "Get Started" }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "relative pt-16 pb-20 lg:pt-24 lg:pb-32 px-6", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-left space-y-8 z-10", children: [
        /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium", children: [
          /* @__PURE__ */ jsx(ShieldCheck, { className: "h-4 w-4" }),
          "Personal loan management, simplified"
        ] }),
        /* @__PURE__ */ jsxs("h1", { className: "text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-foreground", children: [
          "Your money,",
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsx("span", { className: "text-primary", children: "accounted for." })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-lg", children: "Keep a trusted record of every loan you've given — to friends, family, or colleagues. Track payments, monitor balances, and never lose sight of what's owed." }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4", children: [
          /* @__PURE__ */ jsx(Link, { href: "/sign-up", className: "w-full sm:w-auto", children: /* @__PURE__ */ jsx(Button, { size: "lg", className: "w-full sm:w-auto text-base px-8 py-6 font-semibold shadow-lg shadow-primary/20", children: "Start tracking for free" }) }),
          /* @__PURE__ */ jsx(Link, { href: "/sign-in", className: "w-full sm:w-auto", children: /* @__PURE__ */ jsx(Button, { size: "lg", variant: "outline", className: "w-full sm:w-auto text-base px-8 py-6 font-semibold bg-background/50 backdrop-blur-sm", children: "Sign in to Loan Khatam" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "relative w-full h-[500px] lg:h-[600px] rounded-2xl bg-gradient-to-tr from-primary/5 to-muted border border-border p-4 sm:p-8 flex items-center justify-center overflow-hidden bento-shadow", children: [
        /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md bg-card rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col relative z-10 transform rotate-[-1deg] transition-transform hover:rotate-0 duration-500", children: [
          /* @__PURE__ */ jsxs("div", { className: "px-5 py-4 border-b border-border bg-muted/30 flex justify-between items-center", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground font-medium mb-1", children: "Total Outstanding" }),
              /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold font-mono tracking-tight", children: "₹4,25,000" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(Wallet, { className: "h-5 w-5 text-primary" }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "p-2 flex flex-col gap-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-lg flex items-center justify-between hover:bg-muted/50 transition-colors", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold text-sm", children: "MK" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: "font-semibold text-sm", children: "Mohan (Car Repair)" }),
                  /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-3 w-3 text-destructive" }),
                    "Due in 5 days"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
                /* @__PURE__ */ jsx("div", { className: "font-bold text-sm font-mono", children: "₹1,20,000" }),
                /* @__PURE__ */ jsx("div", { className: "text-xs text-destructive font-medium", children: "Pending" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-lg flex items-center justify-between hover:bg-muted/50 transition-colors", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm", children: "SJ" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: "font-semibold text-sm", children: "Sneha (Rent Share)" }),
                  /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx(ArrowDownRight, { className: "h-3 w-3 text-success" }),
                    "Paid yesterday"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
                /* @__PURE__ */ jsx("div", { className: "font-bold text-sm font-mono", children: "₹85,000" }),
                /* @__PURE__ */ jsxs("div", { className: "text-xs text-success font-medium flex items-center justify-end gap-1", children: [
                  /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3 w-3" }),
                  " Paid"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-lg flex items-center justify-between hover:bg-muted/50 transition-colors", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-sm", children: "DT" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("div", { className: "font-semibold text-sm", children: "Dev (Startup)" }),
                  /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Monthly • 5% APR" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
                /* @__PURE__ */ jsx("div", { className: "font-bold text-sm font-mono", children: "₹2,20,000" }),
                /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground font-medium", children: "Active" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl" }),
        /* @__PURE__ */ jsx("div", { className: "absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "py-20 px-6 border-y border-border bg-card", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-12", children: /* @__PURE__ */ jsx("h2", { className: "text-3xl lg:text-4xl font-bold tracking-tight", children: "Everything you need to track loans" }) }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6", children: features.map((f) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "bg-background rounded-2xl p-6 border border-border flex flex-col items-start text-left bento-hover",
          children: [
            /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6", children: /* @__PURE__ */ jsx(f.icon, { className: "h-6 w-6 text-primary" }) }),
            /* @__PURE__ */ jsx("h3", { className: "font-bold text-xl mb-3 text-foreground", children: f.title }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed flex-1", children: f.description })
          ]
        },
        f.title
      )) })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "py-20 px-6 bg-background", "aria-labelledby": "faq-heading", children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto", children: [
      /* @__PURE__ */ jsx(
        "h2",
        {
          id: "faq-heading",
          className: "text-3xl lg:text-4xl font-bold tracking-tight mb-4 text-center",
          children: "Frequently asked questions"
        }
      ),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-center mb-10", children: "Everything about tracking personal loans and udhaar with Loan Khatam." }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-3", children: faqs.map((item) => /* @__PURE__ */ jsxs(
        "details",
        {
          className: "group rounded-2xl border border-border bg-card p-5",
          children: [
            /* @__PURE__ */ jsxs("summary", { className: "flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-foreground", children: [
              item.q,
              /* @__PURE__ */ jsx(ChevronDown, { className: "h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-3 leading-relaxed text-muted-foreground", children: item.a })
          ]
        },
        item.q
      )) })
    ] }) }),
    /* @__PURE__ */ jsx(
      "script",
      {
        type: "application/ld+json",
        dangerouslySetInnerHTML: {
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((item) => ({
              "@type": "Question",
              name: item.q,
              acceptedAnswer: { "@type": "Answer", text: item.a }
            }))
          })
        }
      }
    ),
    /* @__PURE__ */ jsxs("section", { className: "py-24 px-6 relative overflow-hidden bg-primary text-primary-foreground", children: [
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" }),
      /* @__PURE__ */ jsxs("div", { className: "max-w-3xl mx-auto text-center relative z-10", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-4xl lg:text-5xl font-bold mb-6 tracking-tight", children: "Ready to start?" }),
        /* @__PURE__ */ jsx("p", { className: "text-primary-foreground/80 text-xl mb-10 max-w-xl mx-auto", children: "Create your Loan Khatam account in seconds. No complexity, just clarity." }),
        /* @__PURE__ */ jsx(Link, { href: "/sign-up", children: /* @__PURE__ */ jsx(Button, { size: "lg", variant: "secondary", className: "text-base px-10 py-6 font-semibold shadow-xl hover:scale-105 transition-transform text-primary", children: "Create your free account" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(SocialConnect, {}),
    /* @__PURE__ */ jsx("footer", { className: "bg-background border-t border-border py-12 px-6", children: /* @__PURE__ */ jsxs("div", { className: "max-w-7xl mx-auto flex flex-col items-center justify-center gap-4 text-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-foreground", children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/20", children: /* @__PURE__ */ jsx(LogoGlyph, { className: "h-5 w-5 text-white" }) }),
        /* @__PURE__ */ jsx("span", { className: "text-2xl font-extrabold tracking-tight", children: "Loan Khatam" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Your trusted personal loan register." }),
      /* @__PURE__ */ jsxs("nav", { className: "flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsx(Link, { href: "/about", className: "hover:text-foreground transition-colors", children: "About" }),
        /* @__PURE__ */ jsx(Link, { href: "/help", className: "hover:text-foreground transition-colors", children: "Help" }),
        /* @__PURE__ */ jsx(Link, { href: "/privacy-policy", className: "hover:text-foreground transition-colors", children: "Privacy Policy" }),
        /* @__PURE__ */ jsx(Link, { href: "/terms", className: "hover:text-foreground transition-colors", children: "Terms of Service" }),
        /* @__PURE__ */ jsx(Link, { href: "/disclaimer", className: "hover:text-foreground transition-colors", children: "Disclaimer" }),
        /* @__PURE__ */ jsx(Link, { href: "/cookie-policy", className: "hover:text-foreground transition-colors", children: "Cookie Policy" }),
        /* @__PURE__ */ jsx(Link, { href: "/data-usage", className: "hover:text-foreground transition-colors", children: "Data Usage" }),
        /* @__PURE__ */ jsx(Link, { href: "/license", className: "hover:text-foreground transition-colors", children: "License" })
      ] })
    ] }) })
  ] });
}
const META = [
  { icon: Wallet, label: "App Name", value: "Loan Khatam" },
  { icon: Tag, label: "Version", value: "1.0.0" },
  { icon: CalendarDays, label: "Release Date", value: "June 2026" },
  { icon: Users, label: "Developer", value: "Loan Tracker Team" }
];
const HOW_IT_WORKS = [
  {
    icon: Wallet,
    title: "EMI Calculation",
    text: "Enter a loan's principal, interest rate and tenure and Loan Khatam computes the equated monthly instalment along with a full amortization schedule of principal and interest for every month."
  },
  {
    icon: Target,
    title: "Payoff Strategies",
    text: "Compare repayment approaches such as the avalanche (highest interest first) and snowball (smallest balance first) methods to see which clears your debt faster or cheaper."
  },
  {
    icon: PiggyBank,
    title: "Prepayments",
    text: "Model one-time or recurring extra payments to visualise how they shorten your tenure and reduce the total interest you pay over the life of a loan."
  },
  {
    icon: TrendingUp,
    title: "Interest Savings",
    text: "Instantly see the interest you could avoid by paying more than the minimum, helping you weigh the trade-off between faster freedom and monthly cash flow."
  },
  {
    icon: Scale,
    title: "Investment Comparison",
    text: "Explore whether a surplus is better used to prepay a loan or to invest, using transparent, side-by-side estimates based on assumed returns you control."
  },
  {
    icon: CalendarClock,
    title: "Loan Closure Planning",
    text: "Set a target closure date or budget and Loan Khatam maps out a clear, month-by-month plan so you always know where you stand on the road to being debt-free."
  }
];
function AboutPage() {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs(
      Link,
      {
        href: "/",
        className: "inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100",
        children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
          "Back to Home"
        ]
      }
    ),
    /* @__PURE__ */ jsxs("header", { children: [
      /* @__PURE__ */ jsxs("h1", { className: "flex items-center gap-3 text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 md:text-3xl", children: [
        /* @__PURE__ */ jsx("span", { className: "flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/20", children: /* @__PURE__ */ jsx(Info, { className: "h-5 w-5 text-white" }) }),
        "About Loan Tracker"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-2xl font-medium text-slate-500 dark:text-slate-400", children: "A calm, private workspace for understanding your loans and planning your journey to becoming debt-free." })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-slate-800 dark:text-slate-100", children: "Application Details" }),
      /* @__PURE__ */ jsxs("dl", { className: "mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2", children: [
        META.map(({ icon: Icon, label, value }) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40",
            children: [
              /* @__PURE__ */ jsx("span", { className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300", children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsx("dt", { className: "text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500", children: label }),
                /* @__PURE__ */ jsx("dd", { className: "truncate font-bold text-slate-800 dark:text-slate-100", children: value })
              ] })
            ]
          },
          label
        )),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40", children: [
          /* @__PURE__ */ jsx("span", { className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300", children: /* @__PURE__ */ jsx(Globe, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx("dt", { className: "text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500", children: "Website" }),
            /* @__PURE__ */ jsx("dd", { className: "truncate font-bold text-slate-800 dark:text-slate-100", children: "This application" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40", children: [
          /* @__PURE__ */ jsx("span", { className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300", children: /* @__PURE__ */ jsx(Mail, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx("dt", { className: "text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500", children: "Support" }),
            /* @__PURE__ */ jsx("dd", { className: "truncate font-bold", children: /* @__PURE__ */ jsx(
              "a",
              {
                href: "mailto:support@loantracker.app",
                className: "text-indigo-600 hover:underline dark:text-indigo-300",
                children: "support@loantracker.app"
              }
            ) })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900", children: [
      /* @__PURE__ */ jsxs("h2", { className: "flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100", children: [
        /* @__PURE__ */ jsx(BookOpen, { className: "h-5 w-5 text-indigo-600 dark:text-indigo-400" }),
        "Purpose of Application"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-3 space-y-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400", children: [
        /* @__PURE__ */ jsx("p", { children: "Loan Khatam exists to give individuals a clear, jargon-free picture of their borrowing. Loan statements are often dense and hard to reason about, which makes it difficult to know whether you are on track, how much interest you are really paying, or what a small change to your payments would actually achieve." }),
        /* @__PURE__ */ jsxs("p", { children: [
          "Loan Khatam turns those numbers into something you can explore and understand. It is built purely as an",
          " ",
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-slate-700 dark:text-slate-200", children: "educational and personal financial planning" }),
          " ",
          'tool — a private sandbox for asking "what if" questions about your own loans. It does not lend money, process payments, or replace professional advice; it simply helps you make more informed decisions with confidence.'
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-slate-800 dark:text-slate-100", children: "How it works" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm font-medium text-slate-500 dark:text-slate-400", children: "Every feature is designed for educational and personal financial planning only." }),
      /* @__PURE__ */ jsx("div", { className: "mt-5 grid grid-cols-1 gap-4 md:grid-cols-2", children: HOW_IT_WORKS.map(({ icon: Icon, title, text }) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "rounded-xl border border-slate-100 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/40",
          children: [
            /* @__PURE__ */ jsx("div", { className: "mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300", children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsx("h3", { className: "font-bold text-slate-800 dark:text-slate-100", children: title }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400", children: text })
          ]
        },
        title
      )) })
    ] })
  ] });
}
const Accordion = AccordionPrimitive.Root;
const AccordionItem = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  AccordionPrimitive.Item,
  {
    ref,
    className: cn("border-b", className),
    ...props
  }
));
AccordionItem.displayName = "AccordionItem";
const AccordionTrigger = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsx(AccordionPrimitive.Header, { className: "flex", children: /* @__PURE__ */ jsxs(
  AccordionPrimitive.Trigger,
  {
    ref,
    className: cn(
      "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline text-left [&[data-state=open]>svg]:rotate-180",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" })
    ]
  }
) }));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;
const AccordionContent = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsx(
  AccordionPrimitive.Content,
  {
    ref,
    className: "overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
    ...props,
    children: /* @__PURE__ */ jsx("div", { className: cn("pb-4 pt-0", className), children })
  }
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;
const FAQS = [
  {
    q: "What is an EMI and how does Loan Khatam calculate it?",
    a: "An EMI (Equated Monthly Instalment) is the fixed amount you pay each month towards a loan. Loan Khatam calculates it from the principal, annual interest rate and tenure using the standard reducing-balance formula, then breaks every instalment down into its principal and interest components."
  },
  {
    q: "How do prepayments affect my loan?",
    a: "A prepayment is any amount you pay above your scheduled EMI. Because it goes straight towards your principal, it reduces the balance on which future interest is charged. In Loan Khatam you can model one-time or recurring prepayments and immediately see how much tenure and interest you would save."
  },
  {
    q: "How do I add a new loan?",
    a: 'Use the "Add Loan" button in the sidebar, or import a statement from the dashboard. Enter the borrower, principal, interest rate and dates — Loan Khatam handles the rest and builds the full amortization schedule for you.'
  },
  {
    q: "Can I import a loan from a document?",
    a: 'Yes. From the dashboard choose "Import Data" and upload an amortization PDF, screenshot, CSV or JSON file. Loan Khatam reads the details and pre-fills the Add Loan form so you can review and confirm before saving.'
  },
  {
    q: "Is my financial data private?",
    a: "Your loan data is stored securely against your own authenticated account and is never sold or shared for marketing. You remain in control and can export or delete your data at any time. See our Privacy Policy and Data Usage Policy for full details."
  },
  {
    q: "Which currency does Loan Khatam use?",
    a: "Amounts are displayed in Indian Rupees (₹) using standard Indian number formatting. Loan Khatam is a planning tool, so all figures are estimates intended for personal financial planning rather than official statements."
  },
  {
    q: "What is the difference between the avalanche and snowball strategies?",
    a: "The avalanche method targets the loan with the highest interest rate first to minimise total interest paid, while the snowball method clears the smallest balance first for quicker psychological wins. Loan Khatam lets you compare both side by side."
  },
  {
    q: "Should I prepay my loan or invest the surplus?",
    a: "It depends on your loan's interest rate versus your expected investment return. Loan Khatam's investment comparison shows transparent, side-by-side estimates, but the figures are illustrative only — please verify any financial decision independently."
  }
];
const GUIDE = [
  "Set up your Financial Profile so planners can auto-fill your income, expenses and surplus.",
  "Add your loans manually, or import them from a statement on the dashboard.",
  "Open any loan to view its full amortization schedule and current balance.",
  "Use the Smart Strategy planner to compare payoff approaches and prepayment scenarios.",
  "Review the interest savings and closure timeline, then adjust the numbers to explore options.",
  "Record payments to keep your dashboard and progress up to date."
];
function HelpPage() {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs(
      Link,
      {
        href: "/",
        className: "inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100",
        children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
          "Back to Home"
        ]
      }
    ),
    /* @__PURE__ */ jsxs("header", { children: [
      /* @__PURE__ */ jsxs("h1", { className: "flex items-center gap-3 text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 md:text-3xl", children: [
        /* @__PURE__ */ jsx("span", { className: "flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/20", children: /* @__PURE__ */ jsx(LifeBuoy, { className: "h-5 w-5 text-white" }) }),
        "Help & Support"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-2xl font-medium text-slate-500 dark:text-slate-400", children: "Answers to common questions, a quick start guide, and ways to reach the team when you need a hand." })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900", children: [
      /* @__PURE__ */ jsxs("h2", { className: "flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100", children: [
        /* @__PURE__ */ jsx(HelpCircle, { className: "h-5 w-5 text-indigo-600 dark:text-indigo-400" }),
        "Frequently Asked Questions"
      ] }),
      /* @__PURE__ */ jsx(Accordion, { type: "single", collapsible: true, className: "mt-3", children: FAQS.map((faq, i) => /* @__PURE__ */ jsxs(
        AccordionItem,
        {
          value: `item-${i}`,
          className: "border-slate-200 dark:border-slate-800",
          children: [
            /* @__PURE__ */ jsx(AccordionTrigger, { className: "text-left font-semibold text-slate-800 hover:no-underline dark:text-slate-100", children: faq.q }),
            /* @__PURE__ */ jsx(AccordionContent, { className: "text-sm leading-relaxed text-slate-500 dark:text-slate-400", children: faq.a })
          ]
        },
        faq.q
      )) })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "grid grid-cols-1 gap-4 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxs(
        "a",
        {
          href: "mailto:support@loantracker.app",
          className: "group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700",
          children: [
            /* @__PURE__ */ jsx("div", { className: "mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300", children: /* @__PURE__ */ jsx(Mail, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsx("h3", { className: "font-bold text-slate-800 dark:text-slate-100", children: "Contact Support" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400", children: "Have a question? Email our team and we'll be happy to help." })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "a",
        {
          href: "mailto:support@loantracker.app?subject=Bug%20Report",
          className: "group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700",
          children: [
            /* @__PURE__ */ jsx("div", { className: "mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300", children: /* @__PURE__ */ jsx(Bug, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsx("h3", { className: "font-bold text-slate-800 dark:text-slate-100", children: "Report a Bug" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400", children: "Spotted something off? Let us know what happened so we can fix it." })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "a",
        {
          href: "mailto:support@loantracker.app?subject=Feature%20Request",
          className: "group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700",
          children: [
            /* @__PURE__ */ jsx("div", { className: "mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300", children: /* @__PURE__ */ jsx(Lightbulb, { className: "h-5 w-5" }) }),
            /* @__PURE__ */ jsx("h3", { className: "font-bold text-slate-800 dark:text-slate-100", children: "Request a Feature" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400", children: "Share an idea — your feedback shapes where Loan Khatam goes next." })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900", children: [
      /* @__PURE__ */ jsxs("h2", { className: "flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100", children: [
        /* @__PURE__ */ jsx(ListChecks, { className: "h-5 w-5 text-indigo-600 dark:text-indigo-400" }),
        "User Guide"
      ] }),
      /* @__PURE__ */ jsx("ol", { className: "mt-4 space-y-3", children: GUIDE.map((step, i) => /* @__PURE__ */ jsxs("li", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300", children: i + 1 }),
        /* @__PURE__ */ jsx("span", { className: "pt-0.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400", children: step })
      ] }, step)) })
    ] })
  ] });
}
function PrivacyPolicyPage() {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs(
      Link,
      {
        href: "/",
        className: "inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100",
        children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
          "Back to Home"
        ]
      }
    ),
    /* @__PURE__ */ jsxs("header", { children: [
      /* @__PURE__ */ jsxs("h1", { className: "flex items-center gap-3 text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 md:text-3xl", children: [
        /* @__PURE__ */ jsx("span", { className: "flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/20", children: /* @__PURE__ */ jsx(ShieldCheck, { className: "h-5 w-5 text-white" }) }),
        "Privacy Policy"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-2xl font-medium text-slate-500 dark:text-slate-400", children: "How Loan Tracker — Loan Khatam collects, uses and protects your information. Last updated June 2026." })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-slate-800 dark:text-slate-100", children: "Overview" }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400", children: "Your privacy matters to us. This policy explains what information Loan Tracker — Loan Khatam collects when you use the application, why we collect it, and the choices you have. We collect only what is needed to provide the planning features you use, and we never sell your personal data." })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-slate-800 dark:text-slate-100", children: "Information We Collect" }),
      /* @__PURE__ */ jsxs("ul", { className: "mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-500 dark:text-slate-400", children: [
        /* @__PURE__ */ jsxs("li", { children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-slate-700 dark:text-slate-200", children: "Account information" }),
          " ",
          "such as your name and email address, managed through our third-party authentication provider."
        ] }),
        /* @__PURE__ */ jsxs("li", { children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-slate-700 dark:text-slate-200", children: "Loan and financial data" }),
          " ",
          "you enter or import, including principal amounts, interest rates, dates and payment records used to power your planners."
        ] }),
        /* @__PURE__ */ jsxs("li", { children: [
          /* @__PURE__ */ jsx("span", { className: "font-semibold text-slate-700 dark:text-slate-200", children: "Limited technical data" }),
          " ",
          "needed to keep your session secure and the application running reliably."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-slate-800 dark:text-slate-100", children: "How We Use Your Information" }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400", children: "We use your information solely to provide and improve the application: to authenticate you, store your loans securely against your account, generate the calculations and projections you request, and respond to support enquiries. We do not use your financial data for advertising, and we do not sell or rent your personal data to anyone." })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-slate-800 dark:text-slate-100", children: "Data Storage & Security" }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400", children: "Your data is stored securely and is scoped to your individual authenticated user account, so each user can only access their own information. Authentication is handled by a trusted third-party provider, which means we do not store your password. We apply reasonable technical and organisational measures to protect your data, although no method of transmission or storage can be guaranteed to be completely secure." })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-slate-800 dark:text-slate-100", children: "Your Rights & Choices" }),
      /* @__PURE__ */ jsxs("p", { className: "mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400", children: [
        "You remain in control of your information. You can view and update your data at any time, export it for your own records, and permanently delete your data or your entire account. If you would like help exercising these rights, you can contact us at",
        " ",
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "mailto:support@loantracker.app",
            className: "font-semibold text-indigo-600 hover:underline dark:text-indigo-300",
            children: "support@loantracker.app"
          }
        ),
        "."
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-slate-800 dark:text-slate-100", children: "Changes to This Policy" }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400", children: 'We may update this Privacy Policy from time to time to reflect changes to the application or legal requirements. When we do, we will revise the "last updated" date above, and significant changes will be communicated within the application.' })
    ] })
  ] });
}
function TermsPage() {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs(
      Link,
      {
        href: "/",
        className: "inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100",
        children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
          "Back to Home"
        ]
      }
    ),
    /* @__PURE__ */ jsxs("header", { children: [
      /* @__PURE__ */ jsxs("h1", { className: "flex items-center gap-3 text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 md:text-3xl", children: [
        /* @__PURE__ */ jsx("span", { className: "flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/20", children: /* @__PURE__ */ jsx(FileText, { className: "h-5 w-5 text-white" }) }),
        "Terms & Conditions"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-2xl font-medium text-slate-500 dark:text-slate-400", children: "The terms that govern your use of Loan Tracker — Loan Khatam. Last updated June 2026." })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-slate-800 dark:text-slate-100", children: "Acceptance of Terms" }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400", children: "By accessing or using Loan Tracker — Loan Khatam, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not use the application. We may update these terms from time to time, and your continued use after changes constitutes acceptance of the revised terms." })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-amber-300 bg-amber-50 p-6 shadow-sm dark:border-amber-800 dark:bg-amber-950/30", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-amber-800 dark:text-amber-300", children: [
        /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold", children: "Nature of the Service" })
      ] }),
      /* @__PURE__ */ jsxs("ul", { className: "mt-3 space-y-2 text-sm font-semibold leading-relaxed text-amber-900 dark:text-amber-200", children: [
        /* @__PURE__ */ jsx("li", { children: "This application is not a bank, NBFC, loan provider, financial institution, government agency, or licensed financial advisor." }),
        /* @__PURE__ */ jsx("li", { children: "This application does not provide loans, approve loans, collect repayments, or offer financial advice." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-slate-800 dark:text-slate-100", children: "Your Account" }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400", children: "Access to the application requires an account created through our third-party authentication provider. You are responsible for maintaining the security of your login credentials and for all activity that occurs under your account. Please notify us promptly of any unauthorised use." })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-slate-800 dark:text-slate-100", children: "Acceptable Use" }),
      /* @__PURE__ */ jsxs("ul", { className: "mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-500 dark:text-slate-400", children: [
        /* @__PURE__ */ jsx("li", { children: "Use the application only for lawful, personal financial planning purposes." }),
        /* @__PURE__ */ jsx("li", { children: "Do not attempt to disrupt, reverse engineer or compromise the service." }),
        /* @__PURE__ */ jsx("li", { children: "Do not misrepresent the application's output as professional advice." }),
        /* @__PURE__ */ jsx("li", { children: "Provide accurate information so your planning results are meaningful to you." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-slate-800 dark:text-slate-100", children: "Estimates & No Advice" }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400", children: "All calculations are estimates and are intended only for educational and personal financial planning purposes. The application does not provide financial, investment, legal or tax advice, and users should verify all financial decisions independently before acting on them." })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-slate-800 dark:text-slate-100", children: "Limitation of Liability" }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400", children: 'The application is provided "as is" without warranties of any kind. To the maximum extent permitted by law, the developers shall not be liable for any direct, indirect or consequential loss arising from your use of, or reliance on, the application or its estimates.' })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-slate-800 dark:text-slate-100", children: "Termination & Contact" }),
      /* @__PURE__ */ jsxs("p", { className: "mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400", children: [
        "You may stop using the application and delete your account at any time. We may suspend or terminate access where these terms are breached. For any questions about these terms, contact us at",
        " ",
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "mailto:support@loantracker.app",
            className: "font-semibold text-indigo-600 hover:underline dark:text-indigo-300",
            children: "support@loantracker.app"
          }
        ),
        "."
      ] })
    ] })
  ] });
}
const DISCLAIMERS = [
  "This application is not a bank, NBFC, loan provider, financial institution, government agency, or licensed financial advisor.",
  "This application does not provide loans, approve loans, collect repayments, or offer financial advice.",
  "All calculations are estimates and are intended only for educational and personal financial planning purposes.",
  "Users should verify all financial decisions independently."
];
function DisclaimerPage() {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs(
      Link,
      {
        href: "/",
        className: "inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100",
        children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
          "Back to Home"
        ]
      }
    ),
    /* @__PURE__ */ jsxs("header", { children: [
      /* @__PURE__ */ jsxs("h1", { className: "flex items-center gap-3 text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 md:text-3xl", children: [
        /* @__PURE__ */ jsx("span", { className: "flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/20", children: /* @__PURE__ */ jsx(ShieldAlert, { className: "h-5 w-5 text-white" }) }),
        "Disclaimer"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-2xl font-medium text-slate-500 dark:text-slate-400", children: "Please read the following carefully before relying on any information in this application." })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-amber-300 bg-amber-50 p-6 shadow-sm dark:border-amber-800 dark:bg-amber-950/30", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-amber-800 dark:text-amber-300", children: [
        /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold", children: "Important Disclaimers" })
      ] }),
      /* @__PURE__ */ jsx("ul", { className: "mt-4 space-y-3", children: DISCLAIMERS.map((d) => /* @__PURE__ */ jsxs(
        "li",
        {
          className: "flex gap-3 rounded-xl border border-amber-200 bg-white/60 p-4 text-sm font-semibold leading-relaxed text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200",
          children: [
            /* @__PURE__ */ jsx(AlertTriangle, { className: "mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" }),
            /* @__PURE__ */ jsx("span", { children: d })
          ]
        },
        d
      )) })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-slate-800 dark:text-slate-100", children: "No Professional Advice" }),
      /* @__PURE__ */ jsxs("div", { className: "mt-3 space-y-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400", children: [
        /* @__PURE__ */ jsx("p", { children: "Loan Tracker — Loan Khatam is a self-service educational and planning tool. The content, calculators and projections it provides are general in nature and do not take into account your specific circumstances, objectives or needs. Nothing in this application constitutes financial, investment, legal, tax or lending advice." }),
        /* @__PURE__ */ jsx("p", { children: "Before making any financial decision you should consider seeking advice from a qualified and licensed professional who can assess your individual situation." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-slate-800 dark:text-slate-100", children: "Accuracy of Estimates" }),
      /* @__PURE__ */ jsxs("div", { className: "mt-3 space-y-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400", children: [
        /* @__PURE__ */ jsx("p", { children: "All figures, schedules and projections are estimates generated from the information you provide and from assumptions you can control, such as interest rates and expected returns. Real-world outcomes may differ due to changes in rates, fees, payment timing, rounding, and the specific terms of your actual loan agreements." }),
        /* @__PURE__ */ jsx("p", { children: "You should always refer to your official statements and lender documentation for authoritative figures, and verify all financial decisions independently." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-slate-800 dark:text-slate-100", children: "Limitation of Liability" }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400", children: "To the maximum extent permitted by law, the developers of this application accept no responsibility for any loss or damage arising from reliance on the estimates, projections or information presented here. You use the application at your own discretion and risk." })
    ] })
  ] });
}
function CookiePolicyPage() {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs(
      Link,
      {
        href: "/",
        className: "inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100",
        children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
          "Back to Home"
        ]
      }
    ),
    /* @__PURE__ */ jsxs("header", { children: [
      /* @__PURE__ */ jsxs("h1", { className: "flex items-center gap-3 text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 md:text-3xl", children: [
        /* @__PURE__ */ jsx("span", { className: "flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/20", children: /* @__PURE__ */ jsx(Cookie, { className: "h-5 w-5 text-white" }) }),
        "Cookie Policy"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-2xl font-medium text-slate-500 dark:text-slate-400", children: "How and why Loan Tracker — Loan Khatam uses cookies and similar technologies. Last updated June 2026." })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-slate-800 dark:text-slate-100", children: "What Are Cookies?" }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400", children: "Cookies are small text files stored on your device by your browser. They help applications remember information about your visit, such as keeping you signed in. Similar technologies like local storage may also be used to keep the application working smoothly." })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-slate-800 dark:text-slate-100", children: "How We Use Cookies" }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400", children: "Loan Tracker — Loan Khatam uses cookies only for essential session and authentication purposes. They allow us to keep you securely signed in as you move between pages and to protect your account. We do not use cookies for advertising, cross-site tracking, or selling your data." }),
      /* @__PURE__ */ jsx("div", { className: "mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-left text-sm", children: [
        /* @__PURE__ */ jsx("thead", { className: "bg-slate-50 dark:bg-slate-800/60", children: /* @__PURE__ */ jsxs("tr", { className: "text-slate-700 dark:text-slate-200", children: [
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 font-semibold", children: "Type" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 font-semibold", children: "Purpose" })
        ] }) }),
        /* @__PURE__ */ jsxs("tbody", { className: "divide-y divide-slate-200 dark:divide-slate-800 text-slate-500 dark:text-slate-400", children: [
          /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-medium text-slate-700 dark:text-slate-200", children: "Authentication" }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: "Keeps you securely signed in via our third-party authentication provider." })
          ] }),
          /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-medium text-slate-700 dark:text-slate-200", children: "Session" }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: "Maintains your session state so the application functions correctly." })
          ] }),
          /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-medium text-slate-700 dark:text-slate-200", children: "Preferences" }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: "Remembers basic choices such as your light or dark theme." })
          ] })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-slate-800 dark:text-slate-100", children: "Third-Party Cookies" }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400", children: "Authentication is handled by a trusted third-party provider, which may set its own cookies strictly to sign you in and keep your account secure. These are used only for authentication and are governed by that provider's own privacy and cookie policies." })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-slate-800 dark:text-slate-100", children: "Managing Cookies" }),
      /* @__PURE__ */ jsxs("p", { className: "mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400", children: [
        "You can control or delete cookies through your browser settings. Please note that because the cookies we use are essential for signing in and securing your session, disabling them may prevent the application from working correctly. If you have questions, contact us at",
        " ",
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "mailto:support@loantracker.app",
            className: "font-semibold text-indigo-600 hover:underline dark:text-indigo-300",
            children: "support@loantracker.app"
          }
        ),
        "."
      ] })
    ] })
  ] });
}
function DataUsagePage() {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs(
      Link,
      {
        href: "/",
        className: "inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100",
        children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
          "Back to Home"
        ]
      }
    ),
    /* @__PURE__ */ jsxs("header", { children: [
      /* @__PURE__ */ jsxs("h1", { className: "flex items-center gap-3 text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 md:text-3xl", children: [
        /* @__PURE__ */ jsx("span", { className: "flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/20", children: /* @__PURE__ */ jsx(Database, { className: "h-5 w-5 text-white" }) }),
        "Data Usage Policy"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-2xl font-medium text-slate-500 dark:text-slate-400", children: "A clear explanation of what data Loan Tracker — Loan Khatam stores and how it is used. Last updated June 2026." })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-slate-800 dark:text-slate-100", children: "What Data We Store" }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400", children: "Loan Khatam stores the loan and financial planning information you choose to add — such as loan principals, interest rates, tenures, payment records and your financial profile — together with the basic account details needed to sign you in. All of this data is stored securely and is tied to your individual authenticated user account." })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900", children: [
      /* @__PURE__ */ jsxs("h2", { className: "flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100", children: [
        /* @__PURE__ */ jsx(Lock, { className: "h-5 w-5 text-indigo-600 dark:text-indigo-400" }),
        "How Your Data Is Protected"
      ] }),
      /* @__PURE__ */ jsxs("ul", { className: "mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-500 dark:text-slate-400", children: [
        /* @__PURE__ */ jsx("li", { children: "Data is scoped per user account, so you only ever see your own information." }),
        /* @__PURE__ */ jsx("li", { children: "Authentication is handled by a trusted third-party provider — we never store your password." }),
        /* @__PURE__ */ jsx("li", { children: "Reasonable technical and organisational safeguards protect data in storage and transit." }),
        /* @__PURE__ */ jsx("li", { children: "We do not sell, rent or share your personal data for marketing purposes." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-slate-800 dark:text-slate-100", children: "How We Use Your Data" }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400", children: "Your data is used only to deliver the features you ask for: storing your loans, generating EMI schedules and projections, comparing payoff strategies, and keeping your dashboard current. Calculations are performed to support your personal financial planning and are not used for advertising or sold to third parties." })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900", children: [
        /* @__PURE__ */ jsx("div", { className: "mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300", children: /* @__PURE__ */ jsx(Download, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsx("h3", { className: "font-bold text-slate-800 dark:text-slate-100", children: "Export Your Data" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400", children: "You can export your loan and planning data at any time to keep a copy for your own records." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900", children: [
        /* @__PURE__ */ jsx("div", { className: "mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300", children: /* @__PURE__ */ jsx(Trash2, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsx("h3", { className: "font-bold text-slate-800 dark:text-slate-100", children: "Delete Your Data" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400", children: "You can permanently delete individual records, or your entire account and its data, whenever you choose." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-slate-800 dark:text-slate-100", children: "Data Retention" }),
      /* @__PURE__ */ jsxs("p", { className: "mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400", children: [
        "We retain your data only for as long as your account remains active or as needed to provide the service. When you delete your data or close your account, the associated information is removed from active systems. For any questions about how your data is handled, contact us at",
        " ",
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "mailto:support@loantracker.app",
            className: "font-semibold text-indigo-600 hover:underline dark:text-indigo-300",
            children: "support@loantracker.app"
          }
        ),
        "."
      ] })
    ] })
  ] });
}
function LicensePage() {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs(
      Link,
      {
        href: "/",
        className: "inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100",
        children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
          "Back to Home"
        ]
      }
    ),
    /* @__PURE__ */ jsxs("header", { children: [
      /* @__PURE__ */ jsxs("h1", { className: "flex items-center gap-3 text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 md:text-3xl", children: [
        /* @__PURE__ */ jsx("span", { className: "flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/20", children: /* @__PURE__ */ jsx(ScrollText, { className: "h-5 w-5 text-white" }) }),
        "License"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-2xl font-medium text-slate-500 dark:text-slate-400", children: "The terms under which Loan Tracker — Loan Khatam is made available to you." })
    ] }),
    /* @__PURE__ */ jsxs(
      "section",
      {
        className: "rounded-2xl border border-amber-300 bg-amber-50 p-6 shadow-sm dark:border-amber-800 dark:bg-amber-950/30",
        "aria-label": "Important notice",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-amber-800 dark:text-amber-300", children: [
            /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5" }),
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-extrabold tracking-tight", children: "IMPORTANT NOTICE" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-3 space-y-2 text-sm font-semibold leading-relaxed text-amber-900 dark:text-amber-200", children: [
            /* @__PURE__ */ jsx("p", { children: "This software is NOT licensed by any bank, NBFC, RBI, financial institution, or government authority." }),
            /* @__PURE__ */ jsx("p", { children: "This software is intended solely for personal financial planning, educational use, and loan analysis." }),
            /* @__PURE__ */ jsx("p", { children: "This application should not be interpreted as financial, investment, legal, tax, or lending advice." })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-slate-800 dark:text-slate-100", children: "Grant of License" }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400", children: "Subject to your acceptance of these terms, you are granted a personal, non-exclusive, non-transferable and revocable license to access and use Loan Tracker — Loan Khatam for your own lawful, personal financial planning and educational purposes. This license does not transfer any ownership of the software or its underlying intellectual property to you." })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-slate-800 dark:text-slate-100", children: "Permitted Use" }),
      /* @__PURE__ */ jsxs("ul", { className: "mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-500 dark:text-slate-400", children: [
        /* @__PURE__ */ jsx("li", { children: "Tracking and analysing your own loans for personal planning." }),
        /* @__PURE__ */ jsx("li", { children: "Modelling EMIs, prepayments, payoff strategies and closure timelines." }),
        /* @__PURE__ */ jsx("li", { children: "Exporting your own data for personal record-keeping." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-slate-800 dark:text-slate-100", children: "Restrictions" }),
      /* @__PURE__ */ jsxs("ul", { className: "mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-500 dark:text-slate-400", children: [
        /* @__PURE__ */ jsx("li", { children: "You may not present the application or its output as official financial, lending or regulatory advice." }),
        /* @__PURE__ */ jsx("li", { children: "You may not resell, sublicense, or commercially redistribute the software without written permission." }),
        /* @__PURE__ */ jsx("li", { children: "You may not reverse engineer, tamper with, or attempt to bypass the security of the application." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-slate-800 dark:text-slate-100", children: "Warranty & Liability" }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400", children: 'The software is provided "as is", without warranties of any kind, express or implied. All calculations are estimates and are intended only for educational and personal financial planning purposes, and users should verify all financial decisions independently. To the maximum extent permitted by law, the developers shall not be liable for any damages arising from the use of, or inability to use, the application.' })
    ] })
  ] });
}
const DESC = "Loan Khatam is a free personal loan and udhaar tracker — record money you lend to friends and family, track repayments and EMIs, and watch outstanding balances settle. Amounts shown in ₹.";
const ROUTES = [
  {
    path: "/",
    file: "index.html",
    title: "Loan Khatam — Personal Loan & Udhaar Tracker",
    description: DESC,
    indexable: true,
    component: LandingPage
  },
  {
    path: "/about",
    file: "about.html",
    title: "About — Loan Khatam",
    description: "Learn about Loan Khatam, a free educational tool to track personal loans and udhaar, calculate EMIs, compare payoff strategies, model prepayments, and plan loan closure. Amounts in ₹.",
    indexable: true,
    component: AboutPage
  },
  {
    path: "/help",
    file: "help.html",
    title: "Help & Support — Loan Khatam",
    description: "Answers to common Loan Khatam questions — how EMIs are calculated, how prepayments work, importing loans, data privacy, and the avalanche vs snowball payoff strategies.",
    indexable: true,
    component: HelpPage
  },
  {
    path: "/privacy-policy",
    file: "privacy-policy.html",
    title: "Privacy Policy — Loan Khatam",
    description: "How Loan Khatam collects, uses and protects your information. We collect only what is needed to power the planner and never sell your personal data.",
    indexable: true,
    component: PrivacyPolicyPage
  },
  {
    path: "/terms",
    file: "terms.html",
    title: "Terms & Conditions — Loan Khatam",
    description: "The terms that govern your use of Loan Khatam, an educational personal loan and udhaar planning tool.",
    indexable: true,
    component: TermsPage
  },
  {
    path: "/disclaimer",
    file: "disclaimer.html",
    title: "Disclaimer — Loan Khatam",
    description: "Loan Khatam is an educational and personal financial planning tool. It is not a bank, lender, or financial advisor, and all calculations are estimates to verify independently.",
    indexable: true,
    component: DisclaimerPage
  },
  {
    path: "/cookie-policy",
    file: "cookie-policy.html",
    title: "Cookie Policy — Loan Khatam",
    description: "How and why Loan Khatam uses cookies and similar technologies to keep you signed in and the application running reliably.",
    indexable: true,
    component: CookiePolicyPage
  },
  {
    path: "/data-usage",
    file: "data-usage.html",
    title: "Data Usage Policy — Loan Khatam",
    description: "A clear explanation of what data Loan Khatam stores, how it is used, and how you can export or delete your information at any time.",
    indexable: true,
    component: DataUsagePage
  },
  {
    path: "/license",
    file: "license.html",
    title: "License — Loan Khatam",
    description: "The terms under which Loan Khatam is made available to you, including usage limitations for this educational planning tool.",
    indexable: true,
    component: LicensePage
  },
  // Auth utility pages: route-specific metadata + noindex, no SSR body (Clerk
  // renders client-side). Intentionally excluded from sitemap.xml and llms.txt.
  {
    path: "/sign-in",
    file: "sign-in.html",
    title: "Sign In — Loan Khatam",
    description: "Sign in to your Loan Khatam account to manage your loans and repayments.",
    indexable: false,
    component: null
  },
  {
    path: "/sign-up",
    file: "sign-up.html",
    title: "Sign Up — Loan Khatam",
    description: "Create a free Loan Khatam account to start tracking loans, udhaar, and EMIs.",
    indexable: false,
    component: null
  }
];
function renderRoute(routePath, basePath) {
  const route = ROUTES.find((r) => r.path === routePath);
  if (!route || !route.component) return "";
  const Component = route.component;
  const base = (basePath || "/").replace(/\/$/, "");
  return renderToString(
    /* @__PURE__ */ jsx(ThemeProvider, { children: /* @__PURE__ */ jsx(Router, { base, ssrPath: routePath, children: /* @__PURE__ */ jsx(Component, {}) }) })
  );
}
export {
  ROUTES,
  renderRoute
};
