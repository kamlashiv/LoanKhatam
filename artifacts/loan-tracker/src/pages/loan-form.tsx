import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import {
  useCreateLoan,
  useGetLoan,
  useUpdateLoan,
  getListLoansQueryKey,
  getGetLoanQueryKey,
  getGetDashboardSummaryQueryKey,
  getGetRecentLoansQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function LoanForm() {
  const params = useParams<{ id: string }>();
  const id = params.id ? parseInt(params.id) : undefined;
  const isEditing = !!id;
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [form, setForm] = useState({
    borrowerName: "",
    principalAmount: "",
    interestRate: "",
    startDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    description: "",
  });

  const { data: existingLoan } = useGetLoan(id ?? 0, {
    query: { enabled: isEditing, queryKey: getGetLoanQueryKey(id ?? 0) },
  });

  useEffect(() => {
    if (existingLoan && isEditing) {
      setForm({
        borrowerName: existingLoan.borrowerName,
        principalAmount: existingLoan.principalAmount.toString(),
        interestRate: existingLoan.interestRate.toString(),
        startDate: existingLoan.startDate,
        dueDate: existingLoan.dueDate,
        description: existingLoan.description ?? "",
      });
    }
  }, [existingLoan, isEditing]);

  const createLoan = useCreateLoan({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListLoansQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetRecentLoansQueryKey() });
        toast({ title: "Loan created successfully" });
        setLocation(`/loans/${data.id}`);
      },
    },
  });

  const updateLoan = useUpdateLoan({
    mutation: {
      onSuccess: () => {
        if (id) {
          queryClient.invalidateQueries({ queryKey: getGetLoanQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getListLoansQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        }
        toast({ title: "Loan updated successfully" });
        setLocation(`/loans/${id}`);
      },
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      borrowerName: form.borrowerName,
      principalAmount: parseFloat(form.principalAmount),
      interestRate: parseFloat(form.interestRate),
      startDate: form.startDate,
      dueDate: form.dueDate,
      description: form.description || undefined,
    };

    if (isEditing && id) {
      updateLoan.mutate({ id, data });
    } else {
      createLoan.mutate({ data });
    }
  };

  const isPending = createLoan.isPending || updateLoan.isPending;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={isEditing ? `/loans/${id}` : "/loans"}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? "Edit Loan" : "Add New Loan"}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {isEditing ? "Update loan details" : "Record a new loan in your ledger"}
          </p>
        </div>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Loan Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="borrowerName">Borrower Name</Label>
              <Input
                id="borrowerName"
                name="borrowerName"
                placeholder="e.g. Ramesh Kumar"
                value={form.borrowerName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="principalAmount">Principal Amount (₹)</Label>
                <Input
                  id="principalAmount"
                  name="principalAmount"
                  type="number"
                  placeholder="0"
                  min="1"
                  step="any"
                  value={form.principalAmount}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="interestRate">Interest Rate (% p.a.)</Label>
                <Input
                  id="interestRate"
                  name="interestRate"
                  type="number"
                  placeholder="0"
                  min="0"
                  step="any"
                  value={form.interestRate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={form.dueDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="What is this loan for? e.g. Emergency medical expenses"
                value={form.description}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="flex-1" disabled={isPending}>
                {isPending ? "Saving..." : isEditing ? "Update Loan" : "Create Loan"}
              </Button>
              <Link href={isEditing ? `/loans/${id}` : "/loans"}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
