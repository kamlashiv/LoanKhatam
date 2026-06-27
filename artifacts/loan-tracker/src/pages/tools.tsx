import { Link } from "wouter";
import { Calculator, Sparkles, TrendingUp, ArrowRight, ShieldCheck, HelpCircle, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

const toolsList = [
  {
    href: "/tools/emi-calculator",
    icon: Calculator,
    title: "EMI Calculator",
    description: "Calculate your monthly payments (EMIs), track principal vs interest shares, and generate full amortization schedule tables.",
    badge: "Most Popular",
    color: "from-blue-500/10 to-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50",
  },
  {
    href: "/tools/loan-calculator",
    icon: TrendingUp,
    title: "Loan & Prepayment Saver",
    description: "Find out how much interest you can save and how many months you can shave off by making extra payments or prepayments.",
    badge: "Highly Useful",
    color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50",
  },
  {
    href: "/tools/emi-vs-sip",
    icon: Scale,
    title: "EMI vs. SIP Calculator",
    description: "Compare whether it is mathematically wiser to prepay your loan or invest your monthly surplus in a mutual fund SIP.",
    badge: "Highly Advanced",
    color: "from-indigo-500/10 to-blue-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50",
  },
  {
    href: "/tools/ai-assistant",
    icon: Sparkles,
    title: "AI Financial Guide",
    description: "Struggling with debt? Ask our interactive AI helper about snowball, avalanche, and other smart loan strategies.",
    badge: "Smart AI",
    color: "from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/50",
  },
  {
    href: "/tools/loan-closure-checklist",
    icon: ShieldCheck,
    title: "Loan Closure Checklist",
    description: "Get a step-by-step checklist of legal documents (NOC, NDC, hypothecation removal) to collect from banks upon loan closure.",
    badge: "New Release",
    color: "from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50",
  },
];

export function ToolsPage() {
  return (
    <div className="space-y-12 py-4">
      {/* Hero section */}
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
          Free Financial Planning Tools
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
          Make smarter decisions with your money. Calculate monthly EMIs, estimate interest savings, and plan your journey to becoming completely debt-free.
        </p>
      </section>

      {/* Grid of Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {toolsList.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.title}
              className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 hover:shadow-lg transition-all duration-300 group hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br border ${tool.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    {tool.badge}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {tool.title}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  {tool.description}
                </p>
              </div>

              <Link href={tool.href}>
                <Button className="w-full justify-between rounded-xl font-bold bg-slate-50 hover:bg-indigo-600 hover:text-white text-slate-700 border border-slate-200 dark:bg-slate-800/50 dark:hover:bg-indigo-600 dark:text-slate-300 dark:border-slate-800 transition-all cursor-pointer">
                  <span>Open Tool</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Info Notice card */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col md:flex-row items-center gap-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div className="space-y-1 text-center md:text-left">
          <h3 className="font-bold text-slate-800 dark:text-slate-100">
            100% Private & Anonymous
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Our calculators run entirely inside your browser. No personal details, amounts, or financial data are ever stored or sent to any server. Explore freely!
          </p>
        </div>
      </section>

      {/* Help links */}
      <section className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
          <HelpCircle className="h-4 w-4 text-indigo-500" />
          <span>Need more advanced features?</span>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-md mx-auto">
          Create a free account to import your actual loans, sync outstanding balances, build custom payment strategies, and extract loan documents with AI.
        </p>
      </section>
    </div>
  );
}
