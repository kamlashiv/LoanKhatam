import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, loansTable, paymentsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
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

// GET /api/dashboard/summary
router.get("/summary", requireAuth, async (req: any, res) => {
  try {
    const loans = await db
      .select()
      .from(loansTable)
      .where(eq(loansTable.userId, req.userId));

    const today = new Date().toISOString().split("T")[0];

    let totalLoans = loans.length;
    let activeLoans = 0;
    let overdueLoans = 0;
    let paidLoans = 0;
    let totalLent = 0;
    let totalCollected = 0;

    for (const loan of loans) {
      const payments = await db
        .select()
        .from(paymentsTable)
        .where(eq(paymentsTable.loanId, loan.id));
      const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      totalCollected += totalPaid;
      totalLent += parseFloat(loan.principalAmount);

      if (loan.status === "paid") {
        paidLoans++;
      } else if (loan.status === "overdue" || (loan.status === "active" && loan.dueDate < today)) {
        overdueLoans++;
      } else {
        activeLoans++;
      }
    }

    const totalOutstanding = Math.max(0, totalLent - totalCollected);

    res.json({
      totalLoans,
      activeLoans,
      overdueLoans,
      paidLoans,
      totalLent,
      totalCollected,
      totalOutstanding,
    });
  } catch (err) {
    logger.error({ err }, "Error fetching dashboard summary");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
