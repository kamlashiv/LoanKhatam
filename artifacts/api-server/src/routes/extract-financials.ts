import { Router } from "express";
import { getAuth } from "@clerk/express";
import { extractFinancialsFromText } from "../lib/ai-extract";
import { rateLimitPerUser } from "../lib/rate-limit";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  req.userId = userId;
  next();
}

const MAX_TEXT_CHARS = 50000;

// POST /api/extract-financials  { text }
router.post(
  "/",
  requireAuth,
  rateLimitPerUser(20, 60 * 1000),
  async (req: any, res) => {
    try {
      const text = typeof req.body?.text === "string" ? req.body.text : "";
      if (!text.trim()) {
        return res.status(400).json({ error: "Provide some text to analyse" });
      }
      if (text.length > MAX_TEXT_CHARS) {
        return res
          .status(413)
          .json({ error: "That text is too long — paste a smaller excerpt." });
      }

      const result = await extractFinancialsFromText(text, "Pasted");
      req.log.info(
        { cards: result.cards.length, loans: result.loans.length },
        "financials extraction complete",
      );
      return res.json(result);
    } catch (err: any) {
      req.log.error({ err }, "financials extraction failed");
      if (err instanceof SyntaxError) {
        return res
          .status(422)
          .json({ error: "AI returned invalid data — try clearer text" });
      }
      return res
        .status(500)
        .json({ error: err.message ?? "Extraction failed" });
    }
  },
);

export default router;
