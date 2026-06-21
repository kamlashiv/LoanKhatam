import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, userSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateSettingsBody } from "@workspace/api-zod";
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

export const DEFAULT_SETTINGS = {
  currency: "INR",
  locale: "en-IN",
  dateFormat: "DD/MM/YYYY" as const,
  defaultInterestRate: 10,
  defaultTenureMonths: 60,
  autoSaveCalculations: true,
  notifications: {
    emiReminder: true,
    dueDateReminder: true,
    prepaymentReminder: true,
    weeklySummary: false,
    monthlySummary: false,
    emailNotifications: false,
    pushNotifications: false,
    whatsappNotifications: false,
    whatsappNumber: null,
  },
  socialAccounts: {
    whatsapp: null,
    facebook: null,
    instagram: null,
    twitter: null,
    linkedin: null,
    telegram: null,
    youtube: null,
  },
};

// Merge stored settings over defaults so legacy rows that predate newer fields
// (e.g. socialAccounts) always return a schema-conformant shape to any client.
function normalizeSettings(data: any) {
  const stored = data ?? {};
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    notifications: {
      ...DEFAULT_SETTINGS.notifications,
      ...(stored.notifications ?? {}),
    },
    socialAccounts: {
      ...DEFAULT_SETTINGS.socialAccounts,
      ...(stored.socialAccounts ?? {}),
    },
  };
}

// GET /api/settings
router.get("/", requireAuth, async (req: any, res) => {
  try {
    const [row] = await db
      .select()
      .from(userSettingsTable)
      .where(eq(userSettingsTable.userId, req.userId));

    if (!row) {
      return res.json({ data: DEFAULT_SETTINGS, updatedAt: null });
    }

    return res.json({
      data: normalizeSettings(row.data),
      updatedAt: row.updatedAt.toISOString(),
    });
  } catch (err) {
    logger.error({ err }, "Error fetching user settings");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/settings
router.put("/", requireAuth, async (req: any, res) => {
  try {
    const parsed = UpdateSettingsBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const now = new Date();
    const [row] = await db
      .insert(userSettingsTable)
      .values({ userId: req.userId, data: parsed.data, updatedAt: now })
      .onConflictDoUpdate({
        target: userSettingsTable.userId,
        set: { data: parsed.data, updatedAt: now },
      })
      .returning();

    return res.json({ data: row.data, updatedAt: row.updatedAt.toISOString() });
  } catch (err) {
    logger.error({ err }, "Error updating user settings");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
