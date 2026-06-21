import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, creditCardsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { CreateCreditCardBody, UpdateCreditCardBody } from "@workspace/api-zod";
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

function mapCard(card: any) {
  return {
    id: card.id,
    userId: card.userId,
    bank: card.bank,
    cardName: card.cardName,
    last4: card.last4,
    network: card.network,
    creditLimit: parseFloat(card.creditLimit),
    outstanding: parseFloat(card.outstanding),
    dueDate: card.dueDate ?? null,
    createdAt: card.createdAt.toISOString(),
  };
}

// GET /api/credit-cards
router.get("/", requireAuth, async (req: any, res) => {
  try {
    const cards = await db
      .select()
      .from(creditCardsTable)
      .where(eq(creditCardsTable.userId, req.userId))
      .orderBy(desc(creditCardsTable.createdAt));
    return res.json(cards.map(mapCard));
  } catch (err) {
    logger.error({ err }, "Error listing credit cards");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/credit-cards
router.post("/", requireAuth, async (req: any, res) => {
  try {
    const parsed = CreateCreditCardBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input" });
    }
    const { bank, cardName, last4, network, creditLimit, outstanding, dueDate } =
      parsed.data;
    const [card] = await db
      .insert(creditCardsTable)
      .values({
        userId: req.userId,
        bank,
        cardName,
        last4,
        network,
        creditLimit: creditLimit.toString(),
        outstanding: (outstanding ?? 0).toString(),
        dueDate: dueDate || null,
      })
      .returning();
    return res.status(201).json(mapCard(card));
  } catch (err) {
    logger.error({ err }, "Error creating credit card");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/credit-cards/:id
router.get("/:id", requireAuth, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const [card] = await db
      .select()
      .from(creditCardsTable)
      .where(
        and(
          eq(creditCardsTable.id, id),
          eq(creditCardsTable.userId, req.userId),
        ),
      );

    if (!card) return res.status(404).json({ error: "Not found" });
    return res.json(mapCard(card));
  } catch (err) {
    logger.error({ err }, "Error getting credit card");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/credit-cards/:id
router.patch("/:id", requireAuth, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const parsed = UpdateCreditCardBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const updates: any = {};
    const d = parsed.data;
    if (d.bank !== undefined) updates.bank = d.bank;
    if (d.cardName !== undefined) updates.cardName = d.cardName;
    if (d.last4 !== undefined) updates.last4 = d.last4;
    if (d.network !== undefined) updates.network = d.network;
    if (d.creditLimit !== undefined)
      updates.creditLimit = d.creditLimit.toString();
    if (d.outstanding !== undefined)
      updates.outstanding = d.outstanding.toString();
    if (d.dueDate !== undefined) updates.dueDate = d.dueDate || null;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const [updated] = await db
      .update(creditCardsTable)
      .set(updates)
      .where(
        and(
          eq(creditCardsTable.id, id),
          eq(creditCardsTable.userId, req.userId),
        ),
      )
      .returning();

    if (!updated) return res.status(404).json({ error: "Not found" });
    return res.json(mapCard(updated));
  } catch (err) {
    logger.error({ err }, "Error updating credit card");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/credit-cards/:id
router.delete("/:id", requireAuth, async (req: any, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

    const [deleted] = await db
      .delete(creditCardsTable)
      .where(
        and(
          eq(creditCardsTable.id, id),
          eq(creditCardsTable.userId, req.userId),
        ),
      )
      .returning();

    if (!deleted) return res.status(404).json({ error: "Not found" });
    return res.status(204).send();
  } catch (err) {
    logger.error({ err }, "Error deleting credit card");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
