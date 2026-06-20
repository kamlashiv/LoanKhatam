import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, financialProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateProfileBody } from "@workspace/api-zod";
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

const EMPTY_PROFILE = {
  name: "",
  age: 30,
  occupation: "",
  monthlyIncome: 0,
  additionalIncome: 0,
  rent: 0,
  emi: 0,
  insurance: 0,
  utilities: 0,
  schoolFees: 0,
  internet: 0,
  otherFixed: 0,
  food: 0,
  fuel: 0,
  travel: 0,
  entertainment: 0,
  shopping: 0,
  medical: 0,
  miscellaneous: 0,
  currentSavings: 0,
  existingInvestments: 0,
  creditCardDebt: 0,
  debts: [] as unknown[],
  goals: [] as string[],
  riskProfile: "moderate" as const,
};

// GET /api/profile
router.get("/", requireAuth, async (req: any, res) => {
  try {
    const [row] = await db
      .select()
      .from(financialProfilesTable)
      .where(eq(financialProfilesTable.userId, req.userId));

    if (!row) {
      return res.json({ data: EMPTY_PROFILE, updatedAt: null });
    }

    return res.json({ data: row.data, updatedAt: row.updatedAt.toISOString() });
  } catch (err) {
    logger.error({ err }, "Error fetching financial profile");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/profile
router.put("/", requireAuth, async (req: any, res) => {
  try {
    const parsed = UpdateProfileBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const now = new Date();
    const [row] = await db
      .insert(financialProfilesTable)
      .values({ userId: req.userId, data: parsed.data, updatedAt: now })
      .onConflictDoUpdate({
        target: financialProfilesTable.userId,
        set: { data: parsed.data, updatedAt: now },
      })
      .returning();

    return res.json({ data: row.data, updatedAt: row.updatedAt.toISOString() });
  } catch (err) {
    logger.error({ err }, "Error updating financial profile");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
