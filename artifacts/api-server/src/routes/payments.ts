import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, loansTable, paymentsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { AddPaymentBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router = Router({ mergeParams: true });

function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.userId = userId;
  next();
}

// GET /api/loans/:id/payments
router.get("/", requireAuth, async (req: any, res) => {
  try {
    const loanId = parseInt(req.params.id);
    if (isNaN(loanId)) return res.status(400).json({ error: "Invalid id" });

    const [loan] = await db
      .select()
      .from(loansTable)
      .where(and(eq(loansTable.id, loanId), eq(loansTable.userId, req.userId)));
    if (!loan) return res.status(404).json({ error: "Loan not found" });

    const payments = await db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.loanId, loanId))
      .orderBy(desc(paymentsTable.paymentDate));

    return res.json(
      payments.map((p) => ({
        id: p.id,
        loanId: p.loanId,
        amount: parseFloat(p.amount),
        paymentDate: p.paymentDate,
        notes: p.notes ?? null,
        createdAt: p.createdAt.toISOString(),
      })),
    );
  } catch (err) {
    logger.error({ err }, "Error listing payments");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/loans/:id/payments
router.post("/", requireAuth, async (req: any, res) => {
  try {
    const loanId = parseInt(req.params.id);
    if (isNaN(loanId)) return res.status(400).json({ error: "Invalid id" });

    const [loan] = await db
      .select()
      .from(loansTable)
      .where(and(eq(loansTable.id, loanId), eq(loansTable.userId, req.userId)));
    if (!loan) return res.status(404).json({ error: "Loan not found" });

    const parsed = AddPaymentBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const { amount, paymentDate, notes } = parsed.data;
    const [payment] = await db
      .insert(paymentsTable)
      .values({
        loanId,
        amount: amount.toString(),
        paymentDate,
        notes: notes ?? null,
      })
      .returning();

    const allPayments = await db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.loanId, loanId));

    const totalPaid = allPayments.reduce(
      (sum, p) => sum + parseFloat(p.amount),
      0,
    );

    if (totalPaid >= parseFloat(loan.principalAmount)) {
      await db
        .update(loansTable)
        .set({ status: "paid" })
        .where(eq(loansTable.id, loanId));
    }

    return res.status(201).json({
      id: payment.id,
      loanId: payment.loanId,
      amount: parseFloat(payment.amount),
      paymentDate: payment.paymentDate,
      notes: payment.notes ?? null,
      createdAt: payment.createdAt.toISOString(),
    });
  } catch (err) {
    logger.error({ err }, "Error adding payment");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/loans/:id/payments/:paymentId
router.delete("/:paymentId", requireAuth, async (req: any, res) => {
  try {
    const loanId = parseInt(req.params.id);
    const paymentId = parseInt(req.params.paymentId);

    if (isNaN(loanId) || isNaN(paymentId)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const [loan] = await db
      .select()
      .from(loansTable)
      .where(and(eq(loansTable.id, loanId), eq(loansTable.userId, req.userId)));
    if (!loan) return res.status(404).json({ error: "Loan not found" });

    const [payment] = await db
      .select()
      .from(paymentsTable)
      .where(
        and(eq(paymentsTable.id, paymentId), eq(paymentsTable.loanId, loanId)),
      );
    if (!payment) return res.status(404).json({ error: "Payment not found" });

    await db.delete(paymentsTable).where(eq(paymentsTable.id, paymentId));
    return res.status(204).send();
  } catch (err) {
    logger.error({ err }, "Error deleting payment");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
