import { Router } from "express";
import { getAuth } from "@clerk/express";
import {
  getGmailStatus,
  scanGmailForFinancials,
  GmailNotConnectedError,
} from "../lib/gmail";
import { rateLimitPerUser } from "../lib/rate-limit";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  req.userId = userId;
  next();
}

// The Gmail connector is bound to the whole Repl (a single connected mailbox).
// GMAIL_OWNER_USER_ID must be set to the Clerk user id of the account owner to
// prevent other signed-in users from accessing the owner's mailbox-derived
// financial data. The routes are disabled entirely when the variable is absent
// to ensure this Repl-scoped credential is never exposed to arbitrary users.
function requireGmailOwner(req: any, res: any, next: any) {
  const owner = process.env.GMAIL_OWNER_USER_ID;
  if (!owner) {
    return res.status(503).json({
      error:
        "Gmail sync is not available: GMAIL_OWNER_USER_ID is not configured",
    });
  }
  if (req.userId !== owner) {
    return res
      .status(403)
      .json({ error: "Gmail sync is restricted to the account owner" });
  }
  next();
}

// GET /api/gmail/status
router.get("/status", requireAuth, requireGmailOwner, async (req: any, res) => {
  try {
    const status = await getGmailStatus();
    return res.json(status);
  } catch (err: any) {
    req.log.error({ err }, "gmail status check failed");
    return res.json({ connected: false, email: null });
  }
});

// POST /api/gmail/scan
router.post(
  "/scan",
  requireAuth,
  requireGmailOwner,
  rateLimitPerUser(6, 60 * 1000),
  async (req: any, res) => {
    try {
      const result = await scanGmailForFinancials();
      req.log.info(
        {
          cards: result.cards.length,
          loans: result.loans.length,
          emailsScanned: result.emailsScanned,
        },
        "gmail scan complete",
      );
      return res.json(result);
    } catch (err: any) {
      if (err instanceof GmailNotConnectedError) {
        return res.status(503).json({ error: "Gmail is not connected" });
      }
      req.log.error({ err }, "gmail scan failed");
      return res
        .status(500)
        .json({ error: err.message ?? "Gmail scan failed" });
    }
  },
);

export default router;
