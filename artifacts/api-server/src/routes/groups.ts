import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, groupsTable, groupExpensesTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { CreateGroupBody, CreateGroupExpenseBody } from "@workspace/api-zod";
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

// GET /api/groups
router.get("/", requireAuth, async (req: any, res) => {
  try {
    const groups = await db
      .select()
      .from(groupsTable)
      .where(eq(groupsTable.userId, req.userId))
      .orderBy(desc(groupsTable.createdAt));
    return res.json(
      groups.map((g) => ({
        id: g.id,
        name: g.name,
        members: g.members,
        createdAt: g.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    logger.error({ err }, "Error listing groups");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/groups
router.post("/", requireAuth, async (req: any, res) => {
  try {
    const parsed = CreateGroupBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input" });
    }
    const { name, members } = parsed.data;
    const [group] = await db
      .insert(groupsTable)
      .values({
        userId: req.userId,
        name,
        members: members,
      })
      .returning();
    return res.status(201).json({
      id: group.id,
      name: group.name,
      members: group.members,
      createdAt: group.createdAt.toISOString(),
    });
  } catch (err) {
    logger.error({ err }, "Error creating group");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/groups/:id
router.delete("/:id", requireAuth, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const [existing] = await db
      .select()
      .from(groupsTable)
      .where(and(eq(groupsTable.id, id), eq(groupsTable.userId, req.userId)));
    if (!existing) return res.status(404).json({ error: "Not found" });

    await db.delete(groupsTable).where(eq(groupsTable.id, id));
    return res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "Error deleting group");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/groups/:id/expenses
router.get("/:id/expenses", requireAuth, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const [existing] = await db
      .select()
      .from(groupsTable)
      .where(and(eq(groupsTable.id, id), eq(groupsTable.userId, req.userId)));
    if (!existing) return res.status(404).json({ error: "Group not found" });

    const expenses = await db
      .select()
      .from(groupExpensesTable)
      .where(eq(groupExpensesTable.groupId, id))
      .orderBy(desc(groupExpensesTable.createdAt));

    return res.json(
      expenses.map((e) => ({
        id: e.id,
        groupId: e.groupId,
        description: e.description,
        amount: parseFloat(e.amount),
        paidBy: e.paidBy,
        splits: e.splits,
        createdAt: e.createdAt.toISOString(),
      }))
    );
  } catch (err) {
    logger.error({ err }, "Error listing group expenses");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/groups/:id/expenses
router.post("/:id/expenses", requireAuth, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const [existing] = await db
      .select()
      .from(groupsTable)
      .where(and(eq(groupsTable.id, id), eq(groupsTable.userId, req.userId)));
    if (!existing) return res.status(404).json({ error: "Group not found" });

    const parsed = CreateGroupExpenseBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const { description, amount, paidBy, splits } = parsed.data;
    const [expense] = await db
      .insert(groupExpensesTable)
      .values({
        groupId: id,
        description,
        amount: amount.toString(),
        paidBy,
        splits,
      })
      .returning();

    return res.status(201).json({
      id: expense.id,
      groupId: expense.groupId,
      description: expense.description,
      amount: parseFloat(expense.amount),
      paidBy: expense.paidBy,
      splits: expense.splits,
      createdAt: expense.createdAt.toISOString(),
    });
  } catch (err) {
    logger.error({ err }, "Error creating group expense");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/groups/:id/expenses/:expenseId
router.delete("/:id/expenses/:expenseId", requireAuth, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    const expenseId = parseInt(req.params.expenseId);
    if (isNaN(id) || isNaN(expenseId)) {
      return res.status(400).json({ error: "Invalid id" });
    }

    const [existingGroup] = await db
      .select()
      .from(groupsTable)
      .where(and(eq(groupsTable.id, id), eq(groupsTable.userId, req.userId)));
    if (!existingGroup) return res.status(404).json({ error: "Group not found" });

    const [existingExpense] = await db
      .select()
      .from(groupExpensesTable)
      .where(
        and(
          eq(groupExpensesTable.id, expenseId),
          eq(groupExpensesTable.groupId, id)
        )
      );
    if (!existingExpense) return res.status(404).json({ error: "Expense not found" });

    await db.delete(groupExpensesTable).where(eq(groupExpensesTable.id, expenseId));
    return res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "Error deleting group expense");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
