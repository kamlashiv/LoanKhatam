import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, loansTable, paymentsTable } from "@workspace/db";
import { eq, and, sql, desc } from "drizzle-orm";
import {
  CreateLoanBody,
  UpdateLoanBody,
  ListLoansQueryParams,
} from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.userId = userId;
  next();
}

function computeLoanFields(loan: any, payments: any[]) {
  const totalPaid = payments.reduce(
    (sum, p) => sum + parseFloat(p.amount),
    0,
  );
  const remaining = Math.max(
    0,
    parseFloat(loan.principalAmount) - totalPaid,
  );
  const today = new Date().toISOString().split("T")[0];
  let status = loan.status;
  if (status === "active" && loan.dueDate < today && remaining > 0) {
    status = "overdue";
  }
  return {
    id: loan.id,
    userId: loan.userId,
    borrowerName: loan.borrowerName,
    principalAmount: parseFloat(loan.principalAmount),
    interestRate: parseFloat(loan.interestRate),
    startDate: loan.startDate,
    dueDate: loan.dueDate,
    description: loan.description ?? null,
    status,
    totalPaid,
    remainingAmount: remaining,
    createdAt: loan.createdAt.toISOString(),
    rateChanges: (loan.rateChanges as any[]) ?? [],
  };
}

// GET /api/loans
router.get("/", requireAuth, async (req: any, res) => {
  try {
    const parsed = ListLoansQueryParams.safeParse(req.query);
    const statusFilter = parsed.success ? parsed.data.status : undefined;

    let query = db
      .select()
      .from(loansTable)
      .where(eq(loansTable.userId, req.userId))
      .orderBy(desc(loansTable.createdAt));

    const loans = await query;

    const result = await Promise.all(
      loans.map(async (loan) => {
        const payments = await db
          .select()
          .from(paymentsTable)
          .where(eq(paymentsTable.loanId, loan.id));
        const computed = computeLoanFields(loan, payments);
        if (
          loan.status !== "paid" &&
          computed.status !== loan.status
        ) {
          await db
            .update(loansTable)
            .set({ status: computed.status as any })
            .where(eq(loansTable.id, loan.id));
        }
        return computed;
      }),
    );

    const filtered = statusFilter
      ? result.filter((l) => l.status === statusFilter)
      : result;
    res.json(filtered);
  } catch (err) {
    logger.error({ err }, "Error listing loans");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/loans
router.post("/", requireAuth, async (req: any, res) => {
  try {
    const parsed = CreateLoanBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input" });
    }
    const { borrowerName, principalAmount, interestRate, startDate, dueDate, description, rateChanges } =
      parsed.data;
    const [loan] = await db
      .insert(loansTable)
      .values({
        userId: req.userId,
        borrowerName,
        principalAmount: principalAmount.toString(),
        interestRate: interestRate.toString(),
        startDate,
        dueDate,
        description: description ?? null,
        status: "active",
        rateChanges: (rateChanges ?? []) as any,
      })
      .returning();
    res.status(201).json(computeLoanFields(loan, []));
  } catch (err) {
    logger.error({ err }, "Error creating loan");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/loans/recent
router.get("/recent", requireAuth, async (req: any, res) => {
  try {
    const loans = await db
      .select()
      .from(loansTable)
      .where(eq(loansTable.userId, req.userId))
      .orderBy(desc(loansTable.createdAt))
      .limit(5);

    const result = await Promise.all(
      loans.map(async (loan) => {
        const payments = await db
          .select()
          .from(paymentsTable)
          .where(eq(paymentsTable.loanId, loan.id));
        return computeLoanFields(loan, payments);
      }),
    );
    res.json(result);
  } catch (err) {
    logger.error({ err }, "Error fetching recent loans");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/loans/:id
router.get("/:id", requireAuth, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const [loan] = await db
      .select()
      .from(loansTable)
      .where(and(eq(loansTable.id, id), eq(loansTable.userId, req.userId)));

    if (!loan) return res.status(404).json({ error: "Not found" });

    const payments = await db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.loanId, id));

    res.json(computeLoanFields(loan, payments));
  } catch (err) {
    logger.error({ err }, "Error getting loan");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/loans/:id
router.patch("/:id", requireAuth, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const [existing] = await db
      .select()
      .from(loansTable)
      .where(and(eq(loansTable.id, id), eq(loansTable.userId, req.userId)));
    if (!existing) return res.status(404).json({ error: "Not found" });

    const parsed = UpdateLoanBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const updates: any = {};
    const d = parsed.data;
    if (d.borrowerName !== undefined) updates.borrowerName = d.borrowerName;
    if (d.principalAmount !== undefined)
      updates.principalAmount = d.principalAmount.toString();
    if (d.interestRate !== undefined)
      updates.interestRate = d.interestRate.toString();
    if (d.startDate !== undefined) updates.startDate = d.startDate;
    if (d.dueDate !== undefined) updates.dueDate = d.dueDate;
    if (d.description !== undefined) updates.description = d.description;
    if (d.status !== undefined) updates.status = d.status;
    if (d.rateChanges !== undefined) updates.rateChanges = d.rateChanges;

    const [updated] = await db
      .update(loansTable)
      .set(updates)
      .where(eq(loansTable.id, id))
      .returning();

    const payments = await db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.loanId, id));

    res.json(computeLoanFields(updated, payments));
  } catch (err) {
    logger.error({ err }, "Error updating loan");
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/loans/:id
router.delete("/:id", requireAuth, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const [existing] = await db
      .select()
      .from(loansTable)
      .where(and(eq(loansTable.id, id), eq(loansTable.userId, req.userId)));
    if (!existing) return res.status(404).json({ error: "Not found" });

    await db.delete(loansTable).where(eq(loansTable.id, id));
    res.status(204).send();
  } catch (err) {
    logger.error({ err }, "Error deleting loan");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
