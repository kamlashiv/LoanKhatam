import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, feedbackTable } from "@workspace/db";
import { SubmitFeedbackBody } from "@workspace/api-zod";
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

// POST /api/feedback
router.post("/", requireAuth, async (req: any, res) => {
  try {
    const parsed = SubmitFeedbackBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const { kind, message, rating, email } = parsed.data;
    const [row] = await db
      .insert(feedbackTable)
      .values({
        userId: req.userId,
        kind,
        message,
        rating: rating ?? null,
        email: email ?? null,
      })
      .returning();

    return res.status(201).json({
      id: row.id,
      kind: row.kind,
      rating: row.rating,
      message: row.message,
      email: row.email,
      createdAt: row.createdAt.toISOString(),
    });
  } catch (err) {
    logger.error({ err }, "Error submitting feedback");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
