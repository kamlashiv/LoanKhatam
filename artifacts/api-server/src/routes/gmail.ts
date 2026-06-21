import { Router } from "express";
import { getAuth } from "@clerk/express";
import {
  getGmailStatus,
  scanGmailForFinancials,
  GmailNotConnectedError,
} from "../lib/gmail";

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  req.userId = userId;
  next();
}

// GET /api/gmail/status
router.get("/status", requireAuth, async (req: any, res) => {
  try {
    const status = await getGmailStatus();
    return res.json(status);
  } catch (err: any) {
    req.log.error({ err }, "gmail status check failed");
    return res.json({ connected: false, email: null });
  }
});

// POST /api/gmail/scan
router.post("/scan", requireAuth, async (req: any, res) => {
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
    return res.status(500).json({ error: err.message ?? "Gmail scan failed" });
  }
});

export default router;
