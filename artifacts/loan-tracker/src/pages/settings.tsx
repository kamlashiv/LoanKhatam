import { useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { UserProfile } from "@clerk/react";
import {
  Palette,
  Globe,
  Calculator,
  Bell,
  ShieldCheck,
  Database,
  MessageSquare,
  HelpCircle,
  Search,
  Sun,
  Moon,
  Monitor,
  Download,
  Upload,
  Star,
  Save,
  Info,
  FileText,
  ExternalLink,
} from "lucide-react";
import {
  useListLoans,
  useCreateLoan,
  useSubmitFeedback,
  FeedbackInputKind,
  type UserSettingsData,
  type LoanInput,
} from "@workspace/api-client-react";
import { usePreferences } from "@/lib/preferences";
import { useTheme, type ThemeMode, type FontSize } from "@/lib/theme";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CURRENCIES: { code: string; locale: string; label: string }[] = [
  { code: "INR", locale: "en-IN", label: "Indian Rupee (₹)" },
  { code: "USD", locale: "en-US", label: "US Dollar ($)" },
  { code: "EUR", locale: "de-DE", label: "Euro (€)" },
  { code: "GBP", locale: "en-GB", label: "British Pound (£)" },
  { code: "AED", locale: "ar-AE", label: "UAE Dirham (د.إ)" },
  { code: "SGD", locale: "en-SG", label: "Singapore Dollar (S$)" },
  { code: "AUD", locale: "en-AU", label: "Australian Dollar (A$)" },
  { code: "CAD", locale: "en-CA", label: "Canadian Dollar (C$)" },
];

const DATE_FORMATS: UserSettingsData["dateFormat"][] = [
  "DD/MM/YYYY",
  "MM/DD/YYYY",
  "YYYY-MM-DD",
];

const SECTIONS = [
  { id: "appearance", title: "Appearance", icon: Palette, keywords: "theme dark light system font size text motion accessibility display reduce animation" },
  { id: "region", title: "Language & Region", icon: Globe, keywords: "currency locale number date format language region rupee dollar" },
  { id: "calculator", title: "Calculator Defaults", icon: Calculator, keywords: "interest rate tenure emi default autosave calculation planner" },
  { id: "notifications", title: "Notifications", icon: Bell, keywords: "email push reminder emi due date weekly monthly summary alert prepayment" },
  { id: "account", title: "Account & Security", icon: ShieldCheck, keywords: "profile password email phone delete account sessions security two factor passkey name" },
  { id: "data", title: "Data Management", icon: Database, keywords: "export import backup json csv download restore data loans" },
  { id: "feedback", title: "Feedback", icon: MessageSquare, keywords: "feedback rating feature request bug review suggestion" },
  { id: "help", title: "Help & Legal", icon: HelpCircle, keywords: "help faq support about privacy terms disclaimer cookie license legal data usage" },
];

const LEGAL_LINKS = [
  { href: "/about", label: "About" },
  { href: "/help", label: "Help & FAQ" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/cookie-policy", label: "Cookie Policy" },
  { href: "/data-usage", label: "Data Usage Policy" },
  { href: "/license", label: "License" },
];

function SectionCard({
  id,
  title,
  description,
  icon: Icon,
  visible,
  children,
}: {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  visible: boolean;
  children: React.ReactNode;
}) {
  if (!visible) return null;
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-7"
    >
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">
            {title}
          </h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 py-4 first:border-t-0 first:pt-0 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-semibold text-slate-700 dark:text-slate-200">{label}</p>
        {hint && (
          <p className="text-sm text-slate-500 dark:text-slate-400">{hint}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function ComingSoon() {
  return (
    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
      Coming soon
    </span>
  );
}

export function SettingsPage() {
  const { toast } = useToast();
  const { settings, updateSettings, isSaving, updatedAt } = usePreferences();
  const { mode, setMode, fontSize, setFontSize, reduceMotion, setReduceMotion } =
    useTheme();

  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<UserSettingsData>(settings);
  const lastSyncedRef = useRef<string>(JSON.stringify(settings));

  // Re-sync the draft whenever the persisted settings change (initial load / save).
  const settingsKey = JSON.stringify(settings);
  if (settingsKey !== lastSyncedRef.current) {
    lastSyncedRef.current = settingsKey;
    setDraft(settings);
  }

  const dirty = JSON.stringify(draft) !== settingsKey;

  const q = query.trim().toLowerCase();
  const isVisible = (id: string) => {
    if (!q) return true;
    const s = SECTIONS.find((x) => x.id === id);
    if (!s) return true;
    return (
      s.title.toLowerCase().includes(q) || s.keywords.toLowerCase().includes(q)
    );
  };
  const visibleSections = useMemo(
    () => SECTIONS.filter((s) => isVisible(s.id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q],
  );

  const handleSave = async () => {
    try {
      await updateSettings(draft);
      toast({ title: "Preferences saved", description: "Your settings have been updated." });
    } catch {
      toast({
        title: "Could not save",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
          Settings
        </h1>
        <p className="mt-1 font-medium text-slate-500 dark:text-slate-400">
          Manage your preferences, account, data, and more.
        </p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="text-sm font-medium leading-relaxed text-amber-800 dark:text-amber-200">
          This application is not a bank, NBFC, loan provider, or licensed financial
          advisor. All calculations are estimates for educational and personal
          planning only. Please verify all financial decisions independently.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search settings…"
          className="h-12 rounded-2xl pl-11"
          aria-label="Search settings"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        {/* Section rail (desktop) */}
        <aside className="hidden lg:block">
          <nav className="sticky top-6 space-y-1">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => scrollTo(s.id)}
                disabled={!isVisible(s.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-semibold transition-colors",
                  isVisible(s.id)
                    ? "text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                    : "cursor-not-allowed text-slate-300 dark:text-slate-700",
                )}
              >
                <s.icon className="h-4 w-4" />
                {s.title}
              </button>
            ))}
          </nav>
        </aside>

        <div className="space-y-6">
          {visibleSections.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
              No settings match “{query}”.
            </div>
          )}

          {/* Appearance */}
          <SectionCard
            id="appearance"
            title="Appearance"
            description="Theme, text size, and motion preferences."
            icon={Palette}
            visible={isVisible("appearance")}
          >
            <Row label="Theme" hint="Choose light, dark, or match your system.">
              <div className="flex gap-2">
                {(
                  [
                    { value: "light", label: "Light", icon: Sun },
                    { value: "dark", label: "Dark", icon: Moon },
                    { value: "system", label: "System", icon: Monitor },
                  ] as { value: ThemeMode; label: string; icon: React.ComponentType<{ className?: string }> }[]
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMode(opt.value)}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors",
                      mode === opt.value
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/50 dark:text-indigo-300"
                        : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800",
                    )}
                    aria-pressed={mode === opt.value}
                  >
                    <opt.icon className="h-4 w-4" />
                    {opt.label}
                  </button>
                ))}
              </div>
            </Row>
            <Row label="Text size" hint="Scale the interface text up or down.">
              <Select value={fontSize} onValueChange={(v) => setFontSize(v as FontSize)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </Row>
            <Row label="Reduce motion" hint="Minimize animations and transitions.">
              <Switch checked={reduceMotion} onCheckedChange={setReduceMotion} aria-label="Reduce motion" />
            </Row>
          </SectionCard>

          {/* Language & Region */}
          <SectionCard
            id="region"
            title="Language & Region"
            description="Currency and date format used across the app."
            icon={Globe}
            visible={isVisible("region")}
          >
            <Row label="Currency" hint="Used to display all amounts.">
              <Select
                value={draft.currency}
                onValueChange={(code) => {
                  const c = CURRENCIES.find((x) => x.code === code);
                  setDraft((d) => ({ ...d, currency: code, locale: c?.locale ?? d.locale }));
                }}
              >
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Row>
            <Row label="Date format" hint="How dates appear throughout the app.">
              <Select
                value={draft.dateFormat}
                onValueChange={(v) =>
                  setDraft((d) => ({ ...d, dateFormat: v as UserSettingsData["dateFormat"] }))
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATE_FORMATS.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Row>
          </SectionCard>

          {/* Calculator Defaults */}
          <SectionCard
            id="calculator"
            title="Calculator Defaults"
            description="Defaults applied when adding a new loan or planning."
            icon={Calculator}
            visible={isVisible("calculator")}
          >
            <Row label="Default interest rate" hint="Annual rate (% p.a.) pre-filled in new loans.">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  step={0.1}
                  value={draft.defaultInterestRate}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, defaultInterestRate: Number(e.target.value) }))
                  }
                  className="w-28"
                  aria-label="Default interest rate"
                />
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">% p.a.</span>
              </div>
            </Row>
            <Row label="Default tenure" hint="Loan duration (months) pre-filled in new loans.">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  value={draft.defaultTenureMonths}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, defaultTenureMonths: Number(e.target.value) }))
                  }
                  className="w-28"
                  aria-label="Default tenure in months"
                />
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">months</span>
              </div>
            </Row>
            <Row label="Auto-save calculations" hint="Remember your most recent planner inputs.">
              <Switch
                checked={draft.autoSaveCalculations}
                onCheckedChange={(v) => setDraft((d) => ({ ...d, autoSaveCalculations: v }))}
                aria-label="Auto-save calculations"
              />
            </Row>
          </SectionCard>

          {/* Notifications */}
          <SectionCard
            id="notifications"
            title="Notifications"
            description="Choose which reminders and summaries you want."
            icon={Bell}
            visible={isVisible("notifications")}
          >
            {(
              [
                { key: "emiReminder", label: "EMI reminders", hint: "Get reminded before an EMI is due." },
                { key: "dueDateReminder", label: "Due-date reminders", hint: "Alerts as a loan's due date approaches." },
                { key: "prepaymentReminder", label: "Prepayment nudges", hint: "Suggestions when prepaying saves interest." },
                { key: "weeklySummary", label: "Weekly summary", hint: "A weekly digest of your loans." },
                { key: "monthlySummary", label: "Monthly summary", hint: "A monthly overview of progress." },
              ] as { key: keyof UserSettingsData["notifications"]; label: string; hint: string }[]
            ).map((n) => (
              <Row key={n.key} label={n.label} hint={n.hint}>
                <Switch
                  checked={draft.notifications[n.key]}
                  onCheckedChange={(v) =>
                    setDraft((d) => ({
                      ...d,
                      notifications: { ...d.notifications, [n.key]: v },
                    }))
                  }
                  aria-label={n.label}
                />
              </Row>
            ))}
            <Row label="Email notifications" hint="Delivery channel — not yet available.">
              <div className="flex items-center gap-3">
                <ComingSoon />
                <Switch checked={false} disabled aria-label="Email notifications" />
              </div>
            </Row>
            <Row label="Push notifications" hint="Delivery channel — not yet available.">
              <div className="flex items-center gap-3">
                <ComingSoon />
                <Switch checked={false} disabled aria-label="Push notifications" />
              </div>
            </Row>
            <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs font-medium text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
              Reminders currently appear in-app (e.g. overdue alerts on your dashboard).
              Email and push delivery are on the roadmap.
            </p>
          </SectionCard>

          {/* Account & Security */}
          <SectionCard
            id="account"
            title="Account & Security"
            description="Manage your profile, password, sessions, and account."
            icon={ShieldCheck}
            visible={isVisible("account")}
          >
            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
              <UserProfile routing="hash" />
            </div>
          </SectionCard>

          {/* Data Management */}
          <DataManagementSection visible={isVisible("data")} />

          {/* Feedback */}
          <FeedbackSection visible={isVisible("feedback")} />

          {/* Help & Legal */}
          <SectionCard
            id="help"
            title="Help & Legal"
            description="Guides, support, and policies."
            icon={HelpCircle}
            visible={isVisible("help")}
          >
            <div className="grid gap-2 sm:grid-cols-2">
              {LEGAL_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-700 dark:border-slate-800 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-300"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {l.label}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-50" />
                </Link>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Sticky save bar */}
      {dirty && (
        <div className="sticky bottom-4 z-20 flex items-center justify-between gap-4 rounded-2xl border border-indigo-200 bg-white/95 p-4 shadow-lg backdrop-blur dark:border-indigo-900/50 dark:bg-slate-900/95">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            You have unsaved changes.
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setDraft(settings)} disabled={isSaving}>
              Discard
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>
      )}

      {updatedAt && (
        <p className="text-center text-xs text-slate-400 dark:text-slate-600">
          Last saved {new Date(updatedAt).toLocaleString()}
        </p>
      )}
    </div>
  );
}

function DataManagementSection({ visible }: { visible: boolean }) {
  const { toast } = useToast();
  const { settings } = usePreferences();
  const { data: loans } = useListLoans();
  const { mutateAsync: createLoan } = useCreateLoan();
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const download = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      version: 1,
      settings,
      loans: loans ?? [],
    };
    download(
      `loan-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(payload, null, 2),
      "application/json",
    );
    toast({ title: "Export ready", description: "Your data was downloaded as JSON." });
  };

  const exportCSV = () => {
    const rows = loans ?? [];
    const headers = [
      "id",
      "borrowerName",
      "principalAmount",
      "interestRate",
      "tenureMonths",
      "startDate",
      "dueDate",
      "bank",
      "status",
      "totalPaid",
      "remainingAmount",
    ];
    const escape = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const csv = [
      headers.join(","),
      ...rows.map((r) => headers.map((h) => escape((r as unknown as Record<string, unknown>)[h])).join(",")),
    ].join("\n");
    download(
      `loan-tracker-loans-${new Date().toISOString().slice(0, 10)}.csv`,
      csv,
      "text/csv",
    );
    toast({ title: "Export ready", description: "Your loans were downloaded as CSV." });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const incoming: unknown[] = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.loans)
          ? parsed.loans
          : [];
      if (incoming.length === 0) {
        toast({
          title: "Nothing to import",
          description: "No loans were found in that file.",
          variant: "destructive",
        });
        return;
      }
      let ok = 0;
      let failed = 0;
      for (const raw of incoming) {
        const l = raw as Record<string, unknown>;
        const borrowerName = String(l.borrowerName ?? "").trim();
        const principalAmount = Number(l.principalAmount);
        const interestRate = Number(l.interestRate);
        if (!borrowerName || !Number.isFinite(principalAmount) || !Number.isFinite(interestRate)) {
          failed++;
          continue;
        }
        const body: LoanInput = {
          borrowerName,
          principalAmount,
          interestRate,
          ...(Number.isFinite(Number(l.tenureMonths)) && Number(l.tenureMonths) > 0
            ? { tenureMonths: Number(l.tenureMonths) }
            : {}),
          ...(l.startDate ? { startDate: String(l.startDate) } : {}),
          ...(l.dueDate ? { dueDate: String(l.dueDate) } : {}),
          ...(l.bank ? { bank: String(l.bank) } : {}),
          ...(l.description ? { description: String(l.description) } : {}),
        };
        try {
          await createLoan({ data: body });
          ok++;
        } catch {
          failed++;
        }
      }
      toast({
        title: "Import complete",
        description: `${ok} loan${ok === 1 ? "" : "s"} imported${failed ? `, ${failed} skipped` : ""}.`,
        variant: failed && !ok ? "destructive" : undefined,
      });
    } catch {
      toast({
        title: "Import failed",
        description: "That file could not be read. Please use a valid JSON backup.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <SectionCard
      id="data"
      title="Data Management"
      description="Export a backup of your data or import loans from a backup."
      icon={Database}
      visible={visible}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Button variant="outline" onClick={exportJSON} className="h-auto justify-start gap-3 rounded-2xl p-4 text-left">
          <Download className="h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
          <span>
            <span className="block font-bold">Export all data (JSON)</span>
            <span className="block text-xs font-normal text-slate-500 dark:text-slate-400">
              Full backup: loans + preferences
            </span>
          </span>
        </Button>
        <Button variant="outline" onClick={exportCSV} className="h-auto justify-start gap-3 rounded-2xl p-4 text-left">
          <Download className="h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
          <span>
            <span className="block font-bold">Export loans (CSV)</span>
            <span className="block text-xs font-normal text-slate-500 dark:text-slate-400">
              Spreadsheet-friendly loan list
            </span>
          </span>
        </Button>
      </div>
      <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleImport}
        />
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          className="gap-2"
        >
          <Upload className="h-4 w-4" />
          {importing ? "Importing…" : "Import loans from JSON"}
        </Button>
        <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          Imports create new loans from a previously exported JSON backup. Existing
          loans are never overwritten.
        </p>
      </div>
    </SectionCard>
  );
}

function FeedbackSection({ visible }: { visible: boolean }) {
  const { toast } = useToast();
  const { mutateAsync: submitFeedback, isPending } = useSubmitFeedback();
  const [kind, setKind] = useState<keyof typeof FeedbackInputKind>("feedback");
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast({
        title: "Add a message",
        description: "Please tell us a little more.",
        variant: "destructive",
      });
      return;
    }
    try {
      await submitFeedback({
        data: {
          kind: FeedbackInputKind[kind],
          message: message.trim(),
          ...(rating > 0 ? { rating } : {}),
        },
      });
      toast({ title: "Thank you!", description: "Your feedback has been received." });
      setMessage("");
      setRating(0);
      setKind("feedback");
    } catch {
      toast({
        title: "Could not send",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <SectionCard
      id="feedback"
      title="Feedback"
      description="Share a rating, report a bug, or request a feature."
      icon={MessageSquare}
      visible={visible}
    >
      <div className="space-y-4">
        <div>
          <Label className="mb-2 block">Type</Label>
          <Select value={kind} onValueChange={(v) => setKind(v as keyof typeof FeedbackInputKind)}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="feedback">General feedback</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="feature">Feature request</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="mb-2 block">Rating (optional)</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n === rating ? 0 : n)}
                aria-label={`${n} star${n === 1 ? "" : "s"}`}
                className="rounded-md p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={cn(
                    "h-6 w-6",
                    n <= rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-300 dark:text-slate-600",
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="feedback-message" className="mb-2 block">
            Message
          </Label>
          <Textarea
            id="feedback-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what's on your mind…"
            rows={4}
          />
        </div>

        <Button onClick={handleSubmit} disabled={isPending} className="gap-2">
          <MessageSquare className="h-4 w-4" />
          {isPending ? "Sending…" : "Send feedback"}
        </Button>
      </div>
    </SectionCard>
  );
}
