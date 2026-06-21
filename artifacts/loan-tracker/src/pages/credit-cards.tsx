import { useMemo, useState } from "react";
import {
  useListCreditCards,
  useCreateCreditCard,
  useUpdateCreditCard,
  useDeleteCreditCard,
  getListCreditCardsQueryKey,
} from "@workspace/api-client-react";
import type { CreditCard as CreditCardModel } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Mail,
  Smartphone,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Building2,
  CreditCard as CreditCardIcon,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Lock,
  Pencil,
  Trash2,
  Clock,
} from "lucide-react";
import { formatRupees, formatDate } from "@/lib/loan-utils";
import { useToast } from "@/hooks/use-toast";

const NETWORKS = ["VISA", "MasterCard", "RuPay", "American Express", "Diners Club"];

const BANK_OPTIONS = [
  "HDFC Bank",
  "ICICI Bank",
  "State Bank of India (SBI)",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "Punjab National Bank (PNB)",
  "Bank of Baroda",
  "IDFC First Bank",
  "Yes Bank",
  "IndusInd Bank",
  "American Express",
  "Other",
];

const GRADIENTS = [
  "linear-gradient(135deg, #1e3a8a 0%, #4f46e5 100%)",
  "linear-gradient(135deg, #7c2d12 0%, #b45309 100%)",
  "linear-gradient(135deg, #111827 0%, #374151 100%)",
  "linear-gradient(135deg, #134e4a 0%, #0d9488 100%)",
  "linear-gradient(135deg, #581c87 0%, #9333ea 100%)",
  "linear-gradient(135deg, #831843 0%, #db2777 100%)",
];

function gradientFor(card: CreditCardModel, index: number): string {
  return GRADIENTS[index % GRADIENTS.length];
}

type CardFormState = {
  bank: string;
  cardName: string;
  last4: string;
  network: string;
  creditLimit: string;
  outstanding: string;
  dueDate: string;
};

const emptyForm: CardFormState = {
  bank: "",
  cardName: "",
  last4: "",
  network: "VISA",
  creditLimit: "",
  outstanding: "",
  dueDate: "",
};

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
        {value}
      </p>
      {sub && <p className="mt-1 text-xs font-medium text-slate-500">{sub}</p>}
    </div>
  );
}

function ComingSoonBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
      <Clock className="h-3.5 w-3.5" />
      Coming soon
    </span>
  );
}

export function CreditCardsList() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: cards, isLoading } = useListCreditCards();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CardFormState>(emptyForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListCreditCardsQueryKey() });
  };

  const createCard = useCreateCreditCard({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast({ title: "Card added" });
        closeDialog();
      },
      onError: () => {
        toast({ title: "Could not add card", variant: "destructive" });
      },
    },
  });

  const updateCard = useUpdateCreditCard({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast({ title: "Card updated" });
        closeDialog();
      },
      onError: () => {
        toast({ title: "Could not update card", variant: "destructive" });
      },
    },
  });

  const deleteCard = useDeleteCreditCard({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast({ title: "Card removed" });
        setDeleteId(null);
      },
      onError: () => {
        toast({ title: "Could not remove card", variant: "destructive" });
      },
    },
  });

  const summary = useMemo(() => {
    const list = cards ?? [];
    const totalLimit = list.reduce((s, c) => s + c.creditLimit, 0);
    const totalOutstanding = list.reduce((s, c) => s + c.outstanding, 0);
    const banks = new Set(list.map((c) => c.bank)).size;
    const withDue = list.filter((c) => c.dueDate);
    const nextDue = withDue
      .slice()
      .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1))[0];
    const utilised =
      totalLimit > 0 ? Math.round((totalOutstanding / totalLimit) * 100) : 0;
    return { list, totalLimit, totalOutstanding, banks, nextDue, utilised };
  }, [cards]);

  function closeDialog() {
    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(card: CreditCardModel) {
    setEditingId(card.id);
    setForm({
      bank: card.bank,
      cardName: card.cardName,
      last4: card.last4,
      network: card.network,
      creditLimit: String(card.creditLimit),
      outstanding: String(card.outstanding),
      dueDate: card.dueDate ?? "",
    });
    setDialogOpen(true);
  }

  const isSaving = createCard.isPending || updateCard.isPending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const last4 = form.last4.trim();
    if (!/^\d{4}$/.test(last4)) {
      toast({ title: "Enter the last 4 digits", variant: "destructive" });
      return;
    }
    const creditLimit = parseFloat(form.creditLimit);
    if (!form.bank.trim() || !form.cardName.trim() || isNaN(creditLimit)) {
      toast({ title: "Fill in the required fields", variant: "destructive" });
      return;
    }
    const data = {
      bank: form.bank.trim(),
      cardName: form.cardName.trim(),
      last4,
      network: form.network,
      creditLimit,
      outstanding: form.outstanding ? parseFloat(form.outstanding) || 0 : 0,
      dueDate: form.dueDate || undefined,
    };
    if (editingId != null) {
      updateCard.mutate({ id: editingId, data });
    } else {
      createCard.mutate({ data });
    }
  }

  return (
    <div className="space-y-8">
      {/* Page intro */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Your cards &amp; accounts
          </h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Add credit cards manually, or let Ledger auto-import them from your
            email and SMS.
          </p>
        </div>
        <Button onClick={openAdd} className="shrink-0 gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          Add card
        </Button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat
          label="Cards"
          value={String(summary.list.length)}
          sub={`${summary.banks} bank${summary.banks === 1 ? "" : "s"}`}
        />
        <Stat label="Total limit" value={formatRupees(summary.totalLimit)} />
        <Stat
          label="Outstanding"
          value={formatRupees(summary.totalOutstanding)}
          sub={`${summary.utilised}% utilised`}
        />
        <Stat
          label="Next due"
          value={summary.nextDue ? formatDate(summary.nextDue.dueDate!) : "—"}
          sub={
            summary.nextDue
              ? `${summary.nextDue.bank} · ${summary.nextDue.cardName}`
              : "No due dates set"
          }
        />
      </div>

      {/* Auto-Sync hero (preview) */}
      <section
        aria-label="Auto-Sync preview"
        className="overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white shadow-xl shadow-indigo-600/20 sm:p-8 dark:border-indigo-900/50"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-100">
              Auto-Sync
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/25">
            <Clock className="h-3.5 w-3.5" />
            Coming soon
          </span>
        </div>
        <h2 className="mt-3 max-w-xl text-2xl font-extrabold leading-tight sm:text-3xl">
          Auto-import every card &amp; loan
        </h2>
        <p className="mt-2 max-w-xl text-sm font-medium text-indigo-100">
          Connect once and Ledger&apos;s AI reads your bank statements and
          transaction alerts to detect your cards, loans and EMIs — then asks you
          to confirm before adding anything. We&apos;re finishing secure,
          RBI-aligned access; for now, add your cards manually below.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {/* Gmail connect */}
          <div className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/20 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                <Mail className="h-5 w-5 text-rose-500" />
              </div>
              <div>
                <p className="font-bold">Connect Gmail</p>
                <p className="text-xs text-indigo-100">
                  Reads statement &amp; e-bill emails
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled
              className="mt-4 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-white/70 px-4 py-2.5 text-sm font-semibold text-indigo-700/70"
            >
              Connect Gmail
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Mobile verify */}
          <div className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/20 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                <Smartphone className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-bold">Verify mobile number</p>
                <p className="text-xs text-indigo-100">
                  Scans bank SMS alerts via OTP
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 rounded-xl bg-white/15 px-3 py-2.5 text-sm font-medium text-white/80 ring-1 ring-white/25">
                +91 ••••• •••••
              </div>
              <button
                type="button"
                disabled
                className="inline-flex cursor-not-allowed items-center justify-center rounded-xl bg-white/70 px-4 py-2.5 text-sm font-semibold text-indigo-700/70"
              >
                Send OTP
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 text-xs font-medium text-indigo-100">
          <Lock className="h-3.5 w-3.5" />
          Read-only access · bank-grade encryption · revoke anytime
        </div>
      </section>

      {/* AI bank detection (preview) */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50">
              <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold">AI bank detection</h3>
              <p className="text-xs font-medium text-muted-foreground">
                Once connected, Ledger identifies your banks from emails &amp; SMS
              </p>
            </div>
          </div>
          <ComingSoonBadge />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 opacity-70 sm:grid-cols-4">
          {[
            { short: "HDFC", color: "#004C8F", detected: true },
            { short: "ICICI", color: "#AE282E", detected: true },
            { short: "SBI", color: "#22409A", detected: true },
            { short: "Axis", color: "#97144D", detected: false },
          ].map((b) => (
            <div
              key={b.short}
              className={`flex items-center gap-3 rounded-2xl border p-4 ${
                b.detected
                  ? "border-indigo-200 bg-indigo-50/40 dark:border-indigo-900/50 dark:bg-indigo-950/30"
                  : "border-dashed border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50"
              }`}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
                style={{ background: b.color }}
              >
                {b.short.slice(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                  {b.short}
                </p>
                {b.detected ? (
                  <p className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <CheckCircle2 className="h-3 w-3" /> Example
                  </p>
                ) : (
                  <p className="flex items-center gap-1 text-xs font-medium text-slate-400">
                    <RefreshCw className="h-3 w-3" /> Example
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Credit cards wallet (real) */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-extrabold">Credit cards</h3>
          <span className="text-sm font-semibold text-muted-foreground">
            {summary.list.length} card{summary.list.length === 1 ? "" : "s"}
          </span>
        </div>

        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900"
              >
                <Skeleton className="h-32 w-full rounded-none" />
                <div className="space-y-3 p-5">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-2 w-full rounded-full" />
                  <Skeleton className="h-4 w-40" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {summary.list.map((c, index) => {
              const util =
                c.creditLimit > 0
                  ? Math.round((c.outstanding / c.creditLimit) * 100)
                  : 0;
              return (
                <div
                  key={c.id}
                  className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  {/* card visual */}
                  <div
                    style={{ background: gradientFor(c, index) }}
                    className="relative p-5 text-white"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 opacity-90" />
                        <span className="text-sm font-semibold">{c.bank}</span>
                      </div>
                      <CreditCardIcon className="h-5 w-5 opacity-80" />
                    </div>
                    <p className="mt-6 font-mono text-lg tracking-widest">
                      •••• {c.last4}
                    </p>
                    <div className="mt-3 flex items-end justify-between">
                      <span className="text-xs uppercase tracking-wide opacity-80">
                        {c.cardName}
                      </span>
                      <span className="text-sm font-bold italic">{c.network}</span>
                    </div>
                  </div>

                  {/* card details */}
                  <div className="space-y-3 p-5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        Outstanding
                      </span>
                      <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                        {formatRupees(c.outstanding)}
                      </span>
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs font-medium text-muted-foreground">
                        <span>Utilised {util}%</span>
                        <span>{formatRupees(c.creditLimit)} limit</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className={`h-full rounded-full ${
                            util > 50 ? "bg-amber-500" : "bg-indigo-600"
                          }`}
                          style={{ width: `${Math.min(100, util)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        {c.dueDate ? (
                          <>
                            <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                            Due {formatDate(c.dueDate)}
                          </>
                        ) : (
                          "No due date"
                        )}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${c.bank} card ending ${c.last4}`}
                          onClick={() => openEdit(c)}
                          className="h-8 w-8 text-slate-500 hover:text-indigo-600"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${c.bank} card ending ${c.last4}`}
                          onClick={() => setDeleteId(c.id)}
                          className="h-8 w-8 text-slate-500 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* add card manually */}
            <button
              type="button"
              onClick={openAdd}
              className="flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-white/50 p-5 text-slate-500 transition hover:border-indigo-400 hover:bg-indigo-50/40 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/30"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                <Plus className="h-6 w-6" />
              </div>
              <span className="text-sm font-semibold">Add card manually</span>
              <span className="max-w-[180px] text-center text-xs text-slate-400">
                Enter card details yourself
              </span>
            </button>
          </div>
        )}
      </section>

      {/* Auto-imported loans (preview) */}
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-extrabold">Loans found — confirm to add</h3>
            <p className="text-xs font-medium text-muted-foreground">
              When connected, detected loans appear here. Nothing is added until
              you approve.
            </p>
          </div>
          <ComingSoonBadge />
        </div>

        <div className="divide-y divide-slate-100 opacity-70 dark:divide-slate-800">
          {[
            {
              lender: "Bajaj Finserv",
              type: "Personal Loan",
              amount: 250000,
              emi: 8420,
              source: "Gmail" as const,
              confidence: 96,
            },
            {
              lender: "HDFC Bank",
              type: "Car Loan",
              amount: 620000,
              emi: 11150,
              source: "SMS" as const,
              confidence: 91,
            },
          ].map((l) => (
            <div
              key={l.lender + l.type}
              className="flex flex-wrap items-center justify-between gap-4 py-4"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                  <Building2 className="h-5 w-5 text-slate-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-800 dark:text-slate-100">
                      {l.lender}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        l.source === "Gmail"
                          ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300"
                          : "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300"
                      }`}
                    >
                      {l.source === "Gmail" ? (
                        <Mail className="h-3 w-3" />
                      ) : (
                        <Smartphone className="h-3 w-3" />
                      )}
                      via {l.source}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {l.type} · {formatRupees(l.amount)} · EMI {formatRupees(l.emi)}/mo ·{" "}
                    <span className="text-emerald-600">{l.confidence}% match</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled
                  className="cursor-not-allowed rounded-xl px-3 py-2 text-sm font-semibold text-slate-400"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  disabled
                  className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-xl bg-indigo-600/60 px-4 py-2 text-sm font-semibold text-white"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Confirm
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust footer */}
      <div className="flex items-center justify-center gap-2 pb-4 text-center text-xs font-medium text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-indigo-500" />
        Ledger will use read-only, RBI-aligned access. We never store your bank
        passwords and you can disconnect any source anytime.
      </div>

      {/* Add / edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => (o ? setDialogOpen(true) : closeDialog())}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId != null ? "Edit card" : "Add a card"}</DialogTitle>
            <DialogDescription>
              Enter your card details. We only store what you type here.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cc-bank">Bank</Label>
              <Select
                value={form.bank}
                onValueChange={(v) => setForm((f) => ({ ...f, bank: v }))}
              >
                <SelectTrigger id="cc-bank">
                  <SelectValue placeholder="Select bank" />
                </SelectTrigger>
                <SelectContent>
                  {BANK_OPTIONS.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cc-name">Card name</Label>
              <Input
                id="cc-name"
                placeholder="e.g. Millennia Credit Card"
                value={form.cardName}
                onChange={(e) => setForm((f) => ({ ...f, cardName: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cc-last4">Last 4 digits</Label>
                <Input
                  id="cc-last4"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="4821"
                  value={form.last4}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      last4: e.target.value.replace(/\D/g, "").slice(0, 4),
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cc-network">Network</Label>
                <Select
                  value={form.network}
                  onValueChange={(v) => setForm((f) => ({ ...f, network: v }))}
                >
                  <SelectTrigger id="cc-network">
                    <SelectValue placeholder="Network" />
                  </SelectTrigger>
                  <SelectContent>
                    {NETWORKS.map((n) => (
                      <SelectItem key={n} value={n}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cc-limit">Credit limit (₹)</Label>
                <Input
                  id="cc-limit"
                  inputMode="numeric"
                  placeholder="150000"
                  value={form.creditLimit}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      creditLimit: e.target.value.replace(/[^\d.]/g, ""),
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cc-outstanding">Outstanding (₹)</Label>
                <Input
                  id="cc-outstanding"
                  inputMode="numeric"
                  placeholder="38450"
                  value={form.outstanding}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      outstanding: e.target.value.replace(/[^\d.]/g, ""),
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cc-due">Payment due date</Label>
              <Input
                id="cc-due"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving
                  ? "Saving..."
                  : editingId != null
                    ? "Save changes"
                    : "Add card"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog
        open={deleteId != null}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this card?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the card from your wallet. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId != null && deleteCard.mutate({ id: deleteId })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
