import type { ReactNode } from "react";
import { CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { LogoGlyph } from "@/components/logo";

const VALUE_PROPS = [
  { icon: CheckCircle2, text: "Keep perfect track of every rupee lent or borrowed" },
  { icon: Zap, text: "Auto-sync payments and balance calculations" },
  { icon: ShieldCheck, text: "Your financial data is private and securely encrypted" },
] as const;

/**
 * Two-pane authentication shell graduated from the approved "Split Showcase"
 * canvas mockup. The left pane is an immersive indigo value panel; the right
 * pane is a slot that holds the real Clerk <SignIn>/<SignUp> form.
 */
export function AuthShowcase({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-white selection:bg-indigo-500 selection:text-white lg:flex-row">
      {/* Left pane — immersive showcase */}
      <div className="relative z-0 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 p-10 text-white lg:w-[58%] lg:p-20">
        {/* Abstract background glows */}
        <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-500 opacity-30 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-emerald-500 opacity-20 blur-[120px]" />

        <div className="relative z-10">
          {/* Logo */}
          <div className="mb-16 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-300/30 bg-gradient-to-tr from-indigo-500 to-indigo-400 text-white shadow-lg">
              <LogoGlyph className="h-7 w-7" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white/90">Loan Khatam</span>
          </div>

          <div className="max-w-2xl">
            <h1 className="mb-6 text-5xl font-extrabold leading-[1.1] tracking-tight lg:text-7xl">
              Track what you lend.
              <br />
              <span className="bg-gradient-to-r from-emerald-300 to-emerald-100 bg-clip-text text-transparent">
                Get your money back.
              </span>
            </h1>
            <p className="mb-12 max-w-xl text-xl leading-relaxed text-indigo-100">
              The smartest way to manage personal loans with friends and family. Clear records,
              gentle reminders, zero awkwardness.
            </p>

            {/* Value props */}
            <div className="mb-16 flex flex-col gap-5">
              {VALUE_PROPS.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-400/20">
                    <Icon className="h-5 w-5 text-emerald-300" />
                  </div>
                  <p className="text-lg font-medium text-indigo-50">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product preview card */}
        <div className="relative z-10 mt-auto max-w-lg rotate-[-2deg] rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-md transition-transform duration-500 hover:rotate-0">
          <div className="mb-6 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-200 text-lg font-bold text-indigo-800">
                R
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">Rahul Sharma</h4>
                <p className="text-sm text-indigo-200">Lent on 12 Oct, 2023</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-200">
                Outstanding
              </p>
              <h3 className="text-3xl font-extrabold text-emerald-300">₹45,000</h3>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium text-indigo-100">
              <span>Repayment Progress</span>
              <span>₹15,000 / ₹60,000</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-indigo-900/50">
              <div className="h-full w-1/4 rounded-full bg-emerald-400" />
            </div>
          </div>
        </div>

        {/* Social proof */}
        <div className="absolute bottom-8 right-12 z-10 hidden items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 shadow-lg backdrop-blur-md lg:flex">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 w-6 rounded-full border border-indigo-600 bg-indigo-400" />
            ))}
          </div>
          <span className="ml-2 text-sm font-semibold text-white">Over ₹10 Lakh+ tracked today</span>
        </div>
      </div>

      {/* Right pane — auth form slot */}
      <div className="relative flex items-center justify-center bg-white p-8 lg:w-[42%] lg:p-24">
        <div className="w-full max-w-[440px]">{children}</div>
      </div>
    </div>
  );
}
