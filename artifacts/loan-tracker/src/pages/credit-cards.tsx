import { useMemo, useState } from "react";
import {
  useListCreditCards,
  useCreateCreditCard,
  useUpdateCreditCard,
  useDeleteCreditCard,
  useExtractFinancials,
  useGetGmailStatus,
  useScanGmail,
  getListCreditCardsQueryKey,
  getGetGmailStatusQueryKey,
} from "@workspace/api-client-react";
import type {
  CreditCard as CreditCardModel,
  DetectedCard,
  DetectedLoan,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Loader2,
  ClipboardPaste,
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

function SourceBadge({ source }: { source: string }) {
  const isGmail = source.toLowerCase() === "gmail";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        isGmail
          ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300"
          : "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300"
      }`}
    >
      {isGmail ? <Mail className="h-3 w-3" /> : <ClipboardPaste className="h-3 w-3" />}
      {source}
    </span>
  );
}

function ConfidenceBadge({ confidence }: { confidence: string }) {
  const tone =
    confidence === "high"
      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300"
      : confidence === "low"
        ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300"
        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${tone}`}
    >
      {confidence} match
    </span>
  );
}

export function CreditCardsList() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { data: cards, isLoading } = useListCreditCards();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CardFormState>(emptyForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Auto-Sync / AI detection state
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [detectedCards, setDetectedCards] = useState<DetectedCard[]>([]);
  const [detectedLoans, setDetectedLoans] = useState<DetectedLoan[]>([]);
  const [confirmingKey, setConfirmingKey] = useState<string | null>(null);
  const [hasScanned, setHasScanned] = useState(false);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListCreditCardsQueryKey() });
  };

  const gmailStatus = useGetGmailStatus({
    query: {
      queryKey: getGetGmailStatusQueryKey(),
      retry: false,
      refetchOnWindowFocus: false,
    },
  });
  const gmailConnected = gmailStatus.data?.connected ?? false;

  function mergeDetected(result: {
    cards?: DetectedCard[];
    loans?: DetectedLoan[];
  }) {
    const existingCardKeys = new Set(
      (cards ?? []).map((c) => `${c.bank.toLowerCase()}|${c.last4}`),
    );
    const newCards = (result.cards ?? []).filter(
      (c) => !existingCardKeys.has(`${c.bank.toLowerCase()}|${c.last4}`),
    );
    setDetectedCards((prev) => {
      const seen = new Set(prev.map((c) => `${c.bank.toLowerCase()}|${c.last4}`));
      return [
        ...prev,
        ...newCards.filter(
          (c) => !seen.has(`${c.bank.toLowerCase()}|${c.last4}`),
        ),
      ];
    });
    setDetectedLoans((prev) => {
      const seen = new Set(
        prev.map((l) => `${l.lender.toLowerCase()}|${l.principalAmount ?? ""}`),
      );
      return [
        ...prev,
        ...(result.loans ?? []).filter(
          (l) =>
            !seen.has(`${l.lender.toLowerCase()}|${l.principalAmount ?? ""}`),
        ),
      ];
    });
    setHasScanned(true);
  }

  const scanGmail = useScanGmail({
    mutation: {
      onSuccess: (data) => {
        mergeDetected(data);
        const found = (data.cards?.length ?? 0) + (data.loans?.length ?? 0);
        toast({
          title:
            found > 0
              ? `Found ${found} item${found === 1 ? "" : "s"}`
              : "No new cards or loans found",
          description: `Scanned ${data.emailsScanned} email${
            data.emailsScanned === 1 ? "" : "s"
          }. Nothing is added until you confirm.`,
        });
      },
      onError: (err: any) => {
        const notConnected = err?.status === 503;
        toast({
          title: notConnected ? "Gmail not connected" : "Scan failed",
          description: notConnected
            ? "Connect Gmail first, then try scanning again."
            : "Could not scan your inbox. Please try again.",
          variant: "destructive",
        });
        if (notConnected) gmailStatus.refetch();
      },
    },
  });

  const extractFinancials = useExtractFinancials({
    mutation: {
      onSuccess: (data) => {
        mergeDetected(data);
        const found = (data.cards?.length ?? 0) + (data.loans?.length ?? 0);
        toast({
          title:
            found > 0
              ? `Found ${found} item${found === 1 ? "" : "s"}`
              : "Nothing detected",
          description:
            found > 0
              ? "Review and confirm the detected items below."
              : "We couldn't find any cards or loans in that text.",
        });
        if (found > 0) {
          setPasteOpen(false);
          setPasteText("");
        }
      },
      onError: () => {
        toast({
          title: "Could not analyse text",
          description: "Please try again with clearer statement text.",
          variant: "destructive",
        });
      },
    },
  });

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

  const cardKey = (c: DetectedCard) => `${c.bank.toLowerCase()}|${c.last4}`;
  const loanKey = (l: DetectedLoan, i: number) =>
    `${l.lender.toLowerCase()}|${l.principalAmount ?? ""}|${i}`;

  function confirmDetectedCard(c: DetectedCard) {
    const key = cardKey(c);
    setConfirmingKey(key);
    createCard.mutate(
      {
        data: {
          bank: c.bank,
          cardName: c.cardName,
          last4: c.last4,
          network: c.network || "Unknown",
          creditLimit: c.creditLimit ?? 0,
          outstanding: c.outstanding ?? 0,
          dueDate: c.dueDate ?? undefined,
        },
      },
      {
        onSuccess: () => {
          invalidate();
          toast({ title: `Added ${c.bank} •••• ${c.last4}` });
          setDetectedCards((prev) => prev.filter((x) => cardKey(x) !== key));
          setConfirmingKey(null);
        },
        onError: () => {
          toast({ title: "Could not add card", variant: "destructive" });
          setConfirmingKey(null);
        },
      },
    );
  }

  function dismissDetectedCard(c: DetectedCard) {
    setDetectedCards((prev) => prev.filter((x) => cardKey(x) !== cardKey(c)));
  }

  function confirmDetectedLoan(l: DetectedLoan) {
    const params = new URLSearchParams();
    params.set("source", "ai");
    params.set("borrowerName", l.lender);
    if (l.principalAmount != null)
      params.set("principalAmount", String(l.principalAmount));
    if (l.interestRate != null)
      params.set("interestRate", String(l.interestRate));
    if (l.startDate) params.set("startDate", l.startDate);
    if (l.dueDate) params.set("dueDate", l.dueDate);
    const descParts = [l.loanType, l.emi ? `EMI ₹${l.emi}/mo` : null].filter(
      Boolean,
    );
    if (descParts.length) params.set("description", descParts.join(" · "));
    setLocation(`/loans/new?${params.toString()}`);
  }

  function dismissDetectedLoan(index: number) {
    setDetectedLoans((prev) => prev.filter((_, i) => i !== index));
  }

  function handleExtractPaste() {
    const text = pasteText.trim();
    if (text.length < 10) {
      toast({
        title: "Paste a bit more text",
        description: "Include the statement or alert content to analyse.",
        variant: "destructive",
      });
      return;
    }
    extractFinancials.mutate({ data: { text } });
  }

  const isScanning = scanGmail.isPending;
  const isExtracting = extractFinancials.isPending;
  const detectedCount = detectedCards.length + detectedLoans.length;

  return (
    <div className="space-y-8">
      {/* Page intro */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Your cards &amp; accounts
          </h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Add credit cards manually, or let Loan Khatam auto-import them from your
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

      {/* Auto-Sync hero (real) */}
      <section
        aria-label="Auto-Sync"
        className="overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white shadow-xl shadow-indigo-600/20 sm:p-8 dark:border-indigo-900/50"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-100">
              Auto-Sync
            </span>
          </div>
          {gmailConnected && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/25">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Gmail connected
            </span>
          )}
        </div>
        <h2 className="mt-3 max-w-xl text-2xl font-extrabold leading-tight sm:text-3xl">
          Auto-import every card &amp; loan
        </h2>
        <p className="mt-2 max-w-xl text-sm font-medium text-indigo-100">
          Loan Khatam&apos;s AI reads your bank statements and transaction alerts to
          detect your cards, loans and EMIs — then asks you to confirm before
          adding anything.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {/* Gmail scan */}
          <div className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/20 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                <Mail className="h-5 w-5 text-rose-500" />
              </div>
              <div className="min-w-0">
                <p className="font-bold">Scan Gmail</p>
                <p className="truncate text-xs text-indigo-100">
                  {gmailStatus.isLoading
                    ? "Checking connection…"
                    : gmailConnected
                      ? gmailStatus.data?.email ?? "Connected"
                      : "Reads statement & e-bill emails"}
                </p>
              </div>
            </div>
            {gmailConnected ? (
              <button
                type="button"
                onClick={() => scanGmail.mutate()}
                disabled={isScanning}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 disabled:opacity-70"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Scanning inbox…
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Scan inbox now
                  </>
                )}
              </button>
            ) : (
              <div className="mt-4 space-y-2">
                <p className="rounded-lg bg-white/10 px-3 py-2 text-xs text-indigo-50 ring-1 ring-white/15">
                  Connect a Gmail account in the Replit Integrations panel to
                  enable inbox scanning.
                </p>
                <button
                  type="button"
                  onClick={() => gmailStatus.refetch()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/80 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-white"
                >
                  <RefreshCw className="h-4 w-4" />
                  Re-check connection
                </button>
              </div>
            )}
          </div>

          {/* Paste / AI detect */}
          <div className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/20 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
                <ClipboardPaste className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-bold">Paste a statement</p>
                <p className="text-xs text-indigo-100">
                  AI reads any pasted email or SMS
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPasteOpen(true)}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
            >
              Paste &amp; detect
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 text-xs font-medium text-indigo-100">
          <Lock className="h-3.5 w-3.5" />
          Read-only access · nothing is added without your confirmation
        </div>
      </section>

      {/* Detected items — confirm to add */}
      {(detectedCount > 0 || hasScanned) && (
        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-extrabold">
                Detected — confirm to add
              </h3>
              <p className="text-xs font-medium text-muted-foreground">
                Review what Loan Khatam found. Nothing is saved until you confirm.
              </p>
            </div>
            {detectedCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                {detectedCount} item{detectedCount === 1 ? "" : "s"}
              </span>
            )}
          </div>

          {detectedCount === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center dark:border-slate-700 dark:bg-slate-800/50">
              <p className="text-sm font-medium text-muted-foreground">
                No new cards or loans were detected. Try pasting a statement, or
                scan Gmail again.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {detectedCards.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                    Credit cards
                  </p>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {detectedCards.map((c) => {
                      const key = cardKey(c);
                      const busy = confirmingKey === key;
                      return (
                        <div
                          key={key}
                          className="flex flex-wrap items-center justify-between gap-4 py-4"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                              <CreditCardIcon className="h-5 w-5 text-slate-500" />
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-bold text-slate-800 dark:text-slate-100">
                                  {c.bank} •••• {c.last4}
                                </p>
                                <SourceBadge source={c.source} />
                                <ConfidenceBadge confidence={c.confidence} />
                              </div>
                              <p className="text-xs font-medium text-muted-foreground">
                                {c.cardName} · {c.network}
                                {c.outstanding != null
                                  ? ` · ${formatRupees(c.outstanding)} due`
                                  : ""}
                                {c.dueDate ? ` · ${formatDate(c.dueDate)}` : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => dismissDetectedCard(c)}
                              className="text-slate-500"
                            >
                              Dismiss
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => confirmDetectedCard(c)}
                              disabled={busy}
                              className="gap-1.5"
                            >
                              {busy ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                              Confirm
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {detectedLoans.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                    Loans
                  </p>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {detectedLoans.map((l, i) => (
                      <div
                        key={loanKey(l, i)}
                        className="flex flex-wrap items-center justify-between gap-4 py-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                            <Building2 className="h-5 w-5 text-slate-500" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-bold text-slate-800 dark:text-slate-100">
                                {l.lender}
                              </p>
                              <SourceBadge source={l.source} />
                              <ConfidenceBadge confidence={l.confidence} />
                            </div>
                            <p className="text-xs font-medium text-muted-foreground">
                              {[
                                l.loanType,
                                l.principalAmount != null
                                  ? formatRupees(l.principalAmount)
                                  : null,
                                l.emi != null
                                  ? `EMI ${formatRupees(l.emi)}/mo`
                                  : null,
                              ]
                                .filter(Boolean)
                                .join(" · ") || "Loan detected"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dismissDetectedLoan(i)}
                            className="text-slate-500"
                          >
                            Dismiss
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => confirmDetectedLoan(l)}
                            className="gap-1.5"
                          >
                            <ArrowRight className="h-4 w-4" />
                            Review &amp; add
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Loans open the new-loan form pre-filled so you can review the
                    details before saving.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Trust footer */}
      <div className="flex items-center justify-center gap-2 pb-4 text-center text-xs font-medium text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-indigo-500" />
        Loan Khatam will use read-only, RBI-aligned access. We never store your bank
        passwords and you can disconnect any source anytime.
      </div>

      {/* Paste & detect dialog */}
      <Dialog
        open={pasteOpen}
        onOpenChange={(o) => {
          if (!o && !isExtracting) {
            setPasteOpen(false);
          } else if (o) {
            setPasteOpen(true);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Paste a statement or alert</DialogTitle>
            <DialogDescription>
              Paste the text of a bank statement, e-bill, or transaction SMS.
              Loan Khatam&apos;s AI will detect cards and loans — nothing is added
              until you confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="e.g. Your HDFC Bank Credit Card ending 4821 has a total amount due of ₹38,450, due on 05/07/2026…"
              rows={8}
              className="resize-none"
            />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5" />
              Text is analysed securely and not stored.
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPasteOpen(false)}
              disabled={isExtracting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleExtractPaste}
              disabled={isExtracting}
              className="gap-1.5"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analysing…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Detect items
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
