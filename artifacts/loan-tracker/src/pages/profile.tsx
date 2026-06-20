import { useCallback } from "react";
import { Link } from "wouter";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  UserCircle, Wallet, Receipt, ShoppingBag, Landmark, Target, Gauge,
  RefreshCw, Sparkles, TrendingUp,
} from "lucide-react";
import { formatRupees } from "@/lib/loan-utils";
import { GOAL_OPTIONS, type RiskProfile } from "@/lib/strategy-engine";
import {
  useProfile, EMPTY_PROFILE, type ProfileData,
  totalIncome, totalFixedExpenses, totalVariableExpenses, monthlySurplus,
  profileCompleteness,
} from "@/lib/profile";
import { useDerivedLoans } from "@/lib/loan-derive";
import { SaveIndicator } from "@/components/save-indicator";

function MoneyField({
  label, value, onChange, placeholder = "0",
}: { label: string; value: number; onChange: (n: number) => void; placeholder?: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-slate-500 dark:text-slate-400">{label}</Label>
      <Input
        type="number"
        min={0}
        inputMode="numeric"
        className="h-9 text-sm"
        value={value === 0 ? "" : value}
        placeholder={placeholder}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
      />
    </div>
  );
}

function DerivedField({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-slate-500 dark:text-slate-400">{label}</Label>
      <div className="flex h-9 items-center rounded-md border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 text-sm font-medium text-slate-700 dark:text-slate-200">
        {value}
      </div>
      {hint && <p className="text-[10px] text-slate-400 dark:text-slate-500">{hint}</p>}
    </div>
  );
}

function SectionTitle({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
      <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
      <h3 className="text-sm font-semibold uppercase tracking-wide">{children}</h3>
    </div>
  );
}

const RISK_PROFILES: RiskProfile[] = ["conservative", "moderate", "aggressive"];

export function ProfilePage() {
  const { profile, update, replace, saveStatus, updatedAt } = useProfile();
  const derived = useDerivedLoans();

  const set = useCallback(
    <K extends keyof ProfileData>(key: K, val: ProfileData[K]) => {
      update({ [key]: val } as Partial<ProfileData>);
    },
    [update],
  );

  const toggleGoal = (g: string) =>
    set("goals", profile.goals.includes(g) ? profile.goals.filter((x) => x !== g) : [...profile.goals, g]);

  const reset = () => replace({ ...EMPTY_PROFILE });

  const income = totalIncome(profile);
  const fixed = totalFixedExpenses(profile, derived.aggregateEmi);
  const variable = totalVariableExpenses(profile);
  const surplus = monthlySurplus(profile, derived.aggregateEmi);
  const completeness = Math.round(profileCompleteness(profile) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
            <UserCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Financial Profile
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Enter your finances once. Every planner and strategy across Ledger reads from this
              profile and stays in sync automatically.
            </p>
          </div>
        </div>
        <SaveIndicator status={saveStatus} updatedAt={updatedAt} />
      </div>

      {/* Snapshot */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SnapshotStat label="Monthly Income" value={income} tone="text-emerald-600 dark:text-emerald-400" />
        <SnapshotStat label="Fixed Expenses" value={fixed} tone="text-rose-600 dark:text-rose-400" />
        <SnapshotStat label="Variable Expenses" value={variable} tone="text-amber-600 dark:text-amber-400" />
        <SnapshotStat
          label="Monthly Surplus"
          value={surplus}
          tone={surplus >= 0 ? "text-indigo-600 dark:text-indigo-400" : "text-rose-600 dark:text-rose-400"}
        />
      </div>

      {/* Completeness */}
      <Card>
        <CardContent className="flex items-center gap-4 py-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Profile completeness
              </span>
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                {completeness}%
              </span>
            </div>
            <Progress value={completeness} className="h-2" />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {completeness >= 100
                ? "Your profile is complete — every tool has what it needs."
                : "Fill in more details to unlock sharper insights across your planners."}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">About you</CardTitle>
            <CardDescription>Basic details used to personalise guidance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SectionTitle icon={UserCircle}>Personal</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 col-span-2">
                <Label className="text-xs text-slate-500 dark:text-slate-400">Full Name</Label>
                <Input
                  className="h-9 text-sm"
                  value={profile.name}
                  placeholder="Your name"
                  onChange={(e) => set("name", e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-500 dark:text-slate-400">Occupation</Label>
                <Input
                  className="h-9 text-sm"
                  value={profile.occupation}
                  placeholder="e.g. Engineer"
                  onChange={(e) => set("occupation", e.target.value)}
                />
              </div>
              <MoneyField label="Age" value={profile.age} onChange={(n) => set("age", n)} placeholder="30" />
            </div>

            <Separator />

            <SectionTitle icon={Wallet}>Income</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <MoneyField label="Monthly Income" value={profile.monthlyIncome} onChange={(n) => set("monthlyIncome", n)} />
              <MoneyField label="Additional Income" value={profile.additionalIncome} onChange={(n) => set("additionalIncome", n)} />
            </div>

            <Separator />

            <SectionTitle icon={Gauge}>Risk Profile</SectionTitle>
            <div className="flex rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden text-xs">
              {RISK_PROFILES.map((rp) => (
                <button
                  key={rp}
                  onClick={() => set("riskProfile", rp)}
                  className={`flex-1 px-2 py-2 capitalize transition-colors ${
                    profile.riskProfile === rp
                      ? "bg-indigo-600 text-white"
                      : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {rp}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly expenses</CardTitle>
            <CardDescription>What goes out each month, fixed and variable.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SectionTitle icon={Receipt}>Fixed Expenses</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <MoneyField label="Rent" value={profile.rent} onChange={(n) => set("rent", n)} />
              <DerivedField label="Loan EMI" value={formatRupees(derived.aggregateEmi)} hint="From your loans" />
              <MoneyField label="Insurance" value={profile.insurance} onChange={(n) => set("insurance", n)} />
              <MoneyField label="Utilities" value={profile.utilities} onChange={(n) => set("utilities", n)} />
              <MoneyField label="School Fees" value={profile.schoolFees} onChange={(n) => set("schoolFees", n)} />
              <MoneyField label="Internet" value={profile.internet} onChange={(n) => set("internet", n)} />
              <MoneyField label="Other Fixed" value={profile.otherFixed} onChange={(n) => set("otherFixed", n)} />
            </div>

            <Separator />

            <SectionTitle icon={ShoppingBag}>Variable Expenses</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <MoneyField label="Food" value={profile.food} onChange={(n) => set("food", n)} />
              <MoneyField label="Fuel" value={profile.fuel} onChange={(n) => set("fuel", n)} />
              <MoneyField label="Travel" value={profile.travel} onChange={(n) => set("travel", n)} />
              <MoneyField label="Entertainment" value={profile.entertainment} onChange={(n) => set("entertainment", n)} />
              <MoneyField label="Shopping" value={profile.shopping} onChange={(n) => set("shopping", n)} />
              <MoneyField label="Medical" value={profile.medical} onChange={(n) => set("medical", n)} />
              <MoneyField label="Miscellaneous" value={profile.miscellaneous} onChange={(n) => set("miscellaneous", n)} />
            </div>
          </CardContent>
        </Card>

        {/* Assets & liabilities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assets &amp; liabilities</CardTitle>
            <CardDescription>Savings, investments, and what you owe.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SectionTitle icon={TrendingUp}>Assets</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <MoneyField label="Current Savings" value={profile.currentSavings} onChange={(n) => set("currentSavings", n)} />
              <MoneyField label="Existing Investments" value={profile.existingInvestments} onChange={(n) => set("existingInvestments", n)} />
              <MoneyField label="Credit Card Debt" value={profile.creditCardDebt} onChange={(n) => set("creditCardDebt", n)} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <SectionTitle icon={Landmark}>Your Debts</SectionTitle>
              <Button asChild variant="ghost" size="sm" className="h-7 gap-1 text-xs text-indigo-600 dark:text-indigo-400">
                <Link href="/loans">Manage</Link>
              </Button>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Pulled live from your loan list — add or edit loans on the Loans page and they sync here automatically.
            </p>
            {derived.debtItems.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500">
                No active loans yet. Add loans on the Loans page to model payoff strategies.
              </p>
            ) : (
              <div className="space-y-2">
                {derived.debtItems.map((debt) => (
                  <div key={debt.id} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{debt.name}</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">{formatRupees(debt.balance)}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{debt.rate}% rate</span>
                      <span>{debt.minPayment > 0 ? `${formatRupees(debt.minPayment)}/mo EMI` : "no fixed EMI"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Financial goals</CardTitle>
            <CardDescription>What you&apos;re working toward.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SectionTitle icon={Target}>Goals</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {GOAL_OPTIONS.map((g) => {
                const active = profile.goals.includes(g);
                return (
                  <button
                    key={g}
                    onClick={() => toggleGoal(g)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>

            <Separator />

            <div className="rounded-xl bg-indigo-50 dark:bg-indigo-950/40 p-4">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 mb-1">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-semibold">Synced everywhere</span>
              </div>
              <p className="text-xs text-indigo-700/80 dark:text-indigo-300/80">
                These numbers power your Smart Strategy and Financial Strategy tabs. Update them here
                once and the rest of Ledger follows.
              </p>
            </div>

            <Button
              variant="ghost"
              className="w-full gap-2 text-slate-500 dark:text-slate-400"
              onClick={reset}
            >
              <RefreshCw className="h-4 w-4" /> Reset profile
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SnapshotStat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <Card>
      <CardContent className="py-4">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className={`mt-1 text-xl font-bold tracking-tight ${tone}`}>{formatRupees(value)}</p>
      </CardContent>
    </Card>
  );
}
