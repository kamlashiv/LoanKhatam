import { useState } from "react";
import {
  useListGroups,
  useCreateGroup,
  useDeleteGroup,
  useListGroupExpenses,
  useCreateGroupExpense,
  useDeleteGroupExpense,
  getListGroupsQueryKey,
  getGetDashboardSummaryQueryKey,
  getListGroupExpensesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { useTranslation } from "@/hooks/useTranslation";
import { formatRupees, formatDate } from "@/lib/loan-utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Plus,
  Trash2,
  List,
  PlusCircle,
  PiggyBank,
  CheckCircle,
  HelpCircle,
  Calendar,
  Wallet,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  User,
} from "lucide-react";

export function GroupSplitPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupMembers, setNewGroupMembers] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  // Expense form state
  const [expDescription, setExpDescription] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expPaidBy, setExpPaidBy] = useState("");
  const [splitEqually, setSplitEqually] = useState(true);
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({});
  const [showAddExpense, setShowAddExpense] = useState(false);

  // Queries & Mutations
  const { data: groups, isLoading: groupsLoading } = useListGroups();
  const createGroupMutation = useCreateGroup({
    mutation: {
      onSuccess: (newGroup) => {
        queryClient.invalidateQueries({ queryKey: getListGroupsQueryKey() });
        setSelectedGroupId(newGroup.id);
        setNewGroupName("");
        setNewGroupMembers("");
        setShowCreateGroup(false);
        toast({ title: "Group created successfully" });
      },
    },
  });

  const deleteGroupMutation = useDeleteGroup({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListGroupsQueryKey() });
        setSelectedGroupId(null);
        toast({ title: "Group deleted successfully" });
      },
    },
  });

  const { data: expenses, isLoading: expensesLoading } = useListGroupExpenses(
    selectedGroupId ?? 0,
    { query: { enabled: !!selectedGroupId, queryKey: getListGroupExpensesQueryKey(selectedGroupId ?? 0) } }
  );

  const createExpenseMutation = useCreateGroupExpense({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getListGroupExpensesQueryKey(selectedGroupId ?? 0),
        });
        queryClient.invalidateQueries({
          queryKey: getGetDashboardSummaryQueryKey(),
        });
        setExpDescription("");
        setExpAmount("");
        setExpPaidBy("");
        setCustomSplits({});
        setSplitEqually(true);
        setShowAddExpense(false);
        toast({ title: "Expense added successfully" });
      },
    },
  });

  const deleteExpenseMutation = useDeleteGroupExpense({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getListGroupExpensesQueryKey(selectedGroupId ?? 0),
        });
        toast({ title: "Expense deleted successfully" });
      },
    },
  });

  const activeGroup = groups?.find((g) => g.id === selectedGroupId);

  // Greedy debt simplifier
  const computeBalances = () => {
    if (!activeGroup || !expenses) return { netBalances: {}, simplifiedDebts: [] };

    const members = activeGroup.members;
    const netBalances: Record<string, number> = {};
    members.forEach((m) => {
      netBalances[m] = 0;
    });

    expenses.forEach((e) => {
      const payer = e.paidBy;
      const amount = parseFloat(e.amount.toString());
      if (netBalances[payer] !== undefined) {
        netBalances[payer] += amount;
      }

      const splits = e.splits as Record<string, number>;
      Object.entries(splits).forEach(([member, share]) => {
        if (netBalances[member] !== undefined) {
          netBalances[member] -= share;
        }
      });
    });

    // Simplify debts
    const simplifiedDebts: { from: string; to: string; amount: number }[] = [];
    const debtors = Object.entries(netBalances)
      .filter(([, bal]) => bal < -0.01)
      .map(([name, bal]) => ({ name, balance: Math.abs(bal) }));
    const creditors = Object.entries(netBalances)
      .filter(([, bal]) => bal > 0.01)
      .map(([name, bal]) => ({ name, balance: bal }));

    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const amount = Math.min(debtor.balance, creditor.balance);

      if (amount > 0.01) {
        simplifiedDebts.push({
          from: debtor.name,
          to: creditor.name,
          amount,
        });
      }

      debtor.balance -= amount;
      creditor.balance -= amount;

      if (debtor.balance < 0.01) i++;
      if (creditor.balance < 0.01) j++;
    }

    return { netBalances, simplifiedDebts };
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !newGroupMembers.trim()) return;

    // Split members by comma and filter empty
    const members = newGroupMembers
      .split(",")
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    createGroupMutation.mutate({
      data: {
        name: newGroupName.trim(),
        members,
      },
    });
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId || !activeGroup || !expDescription.trim() || !expAmount) return;

    const amountNum = parseFloat(expAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const members = activeGroup.members;
    let splits: Record<string, number> = {};

    if (splitEqually) {
      const share = parseFloat((amountNum / members.length).toFixed(2));
      members.forEach((m) => {
        splits[m] = share;
      });
      // Adjust last person's share for rounding errors
      const sum = Object.values(splits).reduce((a, b) => a + b, 0);
      const diff = amountNum - sum;
      if (Math.abs(diff) > 0.001 && members[0]) {
        splits[members[0]] = parseFloat((splits[members[0]] + diff).toFixed(2));
      }
    } else {
      let sum = 0;
      members.forEach((m) => {
        const val = parseFloat(customSplits[m] || "0");
        splits[m] = isNaN(val) ? 0 : val;
        sum += splits[m];
      });
      if (Math.abs(sum - amountNum) > 0.1) {
        toast({
          title: "Split total error",
          description: `Total split must sum to ₹${amountNum}. Currently sums to ₹${sum.toFixed(2)}`,
          variant: "destructive",
        });
        return;
      }
    }

    createExpenseMutation.mutate({
      id: selectedGroupId,
      data: {
        description: expDescription.trim(),
        amount: amountNum,
        paidBy: expPaidBy || members[0] || "",
        splits,
      },
    });
  };

  const handleDeleteGroup = (groupId: number) => {
    if (window.confirm("Are you sure you want to delete this group? All expense history will be lost.")) {
      deleteGroupMutation.mutate({ id: groupId });
    }
  };

  const { netBalances, simplifiedDebts } = computeBalances();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
              <Users className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              {t("groupSplit")}
            </h1>
            <p className="mt-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">
              Split bills equally or unequally with friends, roommates, or family.
            </p>
          </div>
          <Button
            onClick={() => setShowCreateGroup(!showCreateGroup)}
            className="rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm gap-2"
          >
            <Plus className="h-5 w-5" />
            {t("createGroup")}
          </Button>
        </div>

        {/* Group Creation Form */}
        {showCreateGroup && (
          <form
            onSubmit={handleCreateGroup}
            className="rounded-[2rem] border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-sm animate-slideDown"
          >
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">
              {t("createGroup")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="groupName">{t("groupName")}</Label>
                <Input
                  id="groupName"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. Flatmates, Goa Trip"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="members">{t("members")}</Label>
                <Input
                  id="members"
                  value={newGroupMembers}
                  onChange={(e) => setNewGroupMembers(e.target.value)}
                  placeholder={t("commaSeparated")}
                  required
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowCreateGroup(false)}
                className="rounded-xl font-bold"
              >
                {t("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={createGroupMutation.isPending}
                className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {t("submit")}
              </Button>
            </div>
          </form>
        )}

        {/* Group Selector Dropdown */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="w-full sm:w-72">
            <Select
              value={selectedGroupId?.toString() || ""}
              onValueChange={(val) => setSelectedGroupId(val ? parseInt(val) : null)}
            >
              <SelectTrigger className="rounded-2xl border-slate-200 dark:border-slate-800 font-bold bg-white dark:bg-slate-900 h-11">
                <SelectValue placeholder="Select a Group" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {groupsLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading groups...
                  </SelectItem>
                ) : (
                  groups?.map((g) => (
                    <SelectItem key={g.id} value={g.id.toString()}>
                      {g.name} ({g.members.length} members)
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          {activeGroup && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDeleteGroup(activeGroup.id)}
              className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 border-slate-200 dark:border-slate-800 h-11 w-11 rounded-2xl shrink-0"
              title="Delete current group"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Group Workspace */}
        {activeGroup ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left/Middle: Expenses list */}
            <div className="lg:col-span-2 space-y-6">
              {/* Expenses Log Header */}
              <div className="rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
                      {activeGroup.name}
                    </h2>
                    <p className="text-sm font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                      Members: {activeGroup.members.join(", ")}
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowAddExpense(!showAddExpense)}
                    className="rounded-2xl font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 gap-2 border border-indigo-100 dark:border-indigo-900/30"
                  >
                    <PlusCircle className="h-5 w-5" />
                    {t("addExpense")}
                  </Button>
                </div>

                {/* Add Expense Form */}
                {showAddExpense && (
                  <form
                    onSubmit={handleAddExpense}
                    className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-4 animate-slideDown"
                  >
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">
                      {t("addExpense")}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="expDesc">{t("expenseDescription")}</Label>
                        <Input
                          id="expDesc"
                          value={expDescription}
                          onChange={(e) => setExpDescription(e.target.value)}
                          placeholder="e.g. Dinner, Rent, Fuel"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="expAmount">{t("expenseAmount")}</Label>
                        <Input
                          id="expAmount"
                          type="number"
                          step="any"
                          min="0.01"
                          value={expAmount}
                          onChange={(e) => setExpAmount(e.target.value)}
                          placeholder="0.00"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="expPayer">{t("paidBy")}</Label>
                        <Select value={expPaidBy} onValueChange={setExpPaidBy}>
                          <SelectTrigger id="expPayer">
                            <SelectValue placeholder="Select who paid" />
                          </SelectTrigger>
                          <SelectContent>
                            {activeGroup.members.map((m) => (
                              <SelectItem key={m} value={m}>
                                {m}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2 pt-8">
                        <input
                          id="splitEq"
                          type="checkbox"
                          checked={splitEqually}
                          onChange={(e) => setSplitEqually(e.target.checked)}
                          className="h-4.5 w-4.5 text-indigo-600 focus:ring-indigo-500 rounded border-slate-300 animate-fadeIn"
                        />
                        <Label htmlFor="splitEq" className="cursor-pointer font-bold">
                          {t("splitEqually")}
                        </Label>
                      </div>
                    </div>

                    {/* Custom Split Inputs */}
                    {!splitEqually && (
                      <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                        <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">
                          Custom Splits (₹)
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {activeGroup.members.map((m) => (
                            <div key={m} className="space-y-1">
                              <Label className="text-xs font-semibold">{m}</Label>
                              <Input
                                type="number"
                                step="any"
                                placeholder="0.00"
                                value={customSplits[m] || ""}
                                onChange={(e) =>
                                  setCustomSplits({
                                    ...customSplits,
                                    [m]: e.target.value,
                                  })
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowAddExpense(false)}
                        className="rounded-xl font-bold"
                      >
                        {t("cancel")}
                      </Button>
                      <Button
                        type="submit"
                        disabled={createExpenseMutation.isPending}
                        className="rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        {t("submit")}
                      </Button>
                    </div>
                  </form>
                )}
              </div>

              {/* Expense List */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-slate-700 dark:text-slate-300 text-lg flex items-center gap-2">
                  <List className="h-5 w-5" /> Expense Log
                </h3>

                {expensesLoading ? (
                  <p className="text-sm text-slate-400">Loading expenses...</p>
                ) : expenses?.length === 0 ? (
                  <div className="rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 p-8 text-center">
                    <p className="text-sm text-slate-400">{t("noExpensesYet")}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {expenses?.map((exp) => (
                      <div
                        key={exp.id}
                        className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-800 dark:text-slate-100 truncate">
                            {exp.description}
                          </h4>
                          <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mt-1 font-semibold">
                            <User className="h-3 w-3" />
                            {exp.paidBy} paid {formatRupees(exp.amount)} • <Calendar className="h-3 w-3" /> {formatDate(exp.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-bold text-lg text-slate-800 dark:text-slate-100">
                            {formatRupees(exp.amount)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteExpenseMutation.mutate({ id: activeGroup.id, expenseId: exp.id })}
                            disabled={deleteExpenseMutation.isPending}
                            className="text-slate-400 hover:text-red-500 rounded-xl"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Balances summary panel */}
            <div className="space-y-6">
              {/* Debt Simplified Receipts */}
              <div className="rounded-[2rem] border border-primary/20 bg-card shadow-sm overflow-hidden flex flex-col">
                <div className="bg-primary/5 border-b border-primary/20 p-6">
                  <div className="flex items-center gap-2">
                    <PiggyBank className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                      {t("balances")}
                    </span>
                  </div>
                  <h3 className="mt-2 text-2xl font-black text-foreground">
                    {t("simplifiedDebts")}
                  </h3>
                </div>

                <div className="p-6 space-y-4">
                  {simplifiedDebts.length === 0 ? (
                    <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-bold text-sm bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100/50 dark:border-emerald-950">
                      <CheckCircle className="h-5 w-5 shrink-0" />
                      All accounts are fully settled! No outstanding debts.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {simplifiedDebts.map((debt, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between gap-3 text-sm bg-slate-50 dark:bg-slate-900/50 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl"
                        >
                          <div className="flex items-center gap-2 min-w-0 font-bold text-slate-800 dark:text-slate-100">
                            <span className="truncate">{debt.from}</span>
                            <ArrowRight className="h-4 w-4 text-indigo-500 shrink-0" />
                            <span className="truncate">{debt.to}</span>
                          </div>
                          <span className="font-extrabold text-indigo-600 dark:text-indigo-400 shrink-0 text-base">
                            {formatRupees(debt.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Individual net balances */}
                  <div className="border-t border-border pt-4 mt-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">
                      Net Balances
                    </p>
                    <div className="space-y-2.5">
                      {Object.entries(netBalances).map(([name, bal]) => {
                        const isOwed = bal > 0.01;
                        const owes = bal < -0.01;
                        return (
                          <div
                            key={name}
                            className="flex items-center justify-between gap-3 text-sm"
                          >
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {name}
                            </span>
                            <span
                              className={`font-bold flex items-center gap-1.5 ${
                                isOwed
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : owes
                                  ? "text-rose-600 dark:text-rose-400"
                                  : "text-slate-400"
                              }`}
                            >
                              {isOwed && <TrendingUp className="h-3.5 w-3.5" />}
                              {owes && <TrendingDown className="h-3.5 w-3.5" />}
                              {isOwed ? "+" : ""}
                              {formatRupees(bal)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 p-12 text-center max-w-xl mx-auto mt-8">
            <Users className="h-12 w-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">
              No Group Selected
            </h3>
            <p className="text-sm text-slate-400 mt-2">
              Choose an existing group from the list above or create a new one to start splitting bills.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
