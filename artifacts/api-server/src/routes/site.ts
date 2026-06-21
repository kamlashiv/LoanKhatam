import { Router } from "express";
import { TrackVisitBody, AddLikeBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";
import {
  getStats,
  recordVisit,
  addLike,
  getLikeStatus,
  getActivityFeed,
  pushActivity,
  isRateLimited,
  isLikelyBot,
} from "../lib/site-stats";

const router = Router();

function clientIp(req: any): string {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length > 0) return fwd.split(",")[0].trim();
  return req.ip ?? "unknown";
}

// GET /api/stats
router.get("/stats", async (_req, res) => {
  try {
    res.json(await getStats());
  } catch (err) {
    logger.error({ err }, "Error fetching site stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/track/visit
router.post("/track/visit", async (req, res) => {
  try {
    const parsed = TrackVisitBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const ip = clientIp(req);
    // Bot filtering + rate limiting: silently ignore the write but still
    // return the current stats so the UI keeps working.
    if (
      !isLikelyBot(req.headers["user-agent"]) &&
      !isRateLimited(ip)
    ) {
      const created = await recordVisit(parsed.data.visitorId);
      if (created) pushActivity("visit");
    }

    return res.json(await getStats());
  } catch (err) {
    logger.error({ err }, "Error tracking visit");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/activity
router.get("/activity", async (_req, res) => {
  try {
    res.json({ items: getActivityFeed() });
  } catch (err) {
    logger.error({ err }, "Error fetching activity feed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/likes?visitorId=...
router.get("/likes", async (req, res) => {
  try {
    const visitorId = req.query.visitorId;
    if (typeof visitorId !== "string" || visitorId.length < 8) {
      return res.status(400).json({ error: "Invalid input" });
    }
    return res.json(await getLikeStatus(visitorId));
  } catch (err) {
    logger.error({ err }, "Error fetching like status");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/likes
router.post("/likes", async (req, res) => {
  try {
    const parsed = AddLikeBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const ip = clientIp(req);
    if (isLikelyBot(req.headers["user-agent"]) || isRateLimited(ip)) {
      // Don't record a like for bots / abusive clients; return current status.
      return res.json(await getLikeStatus(parsed.data.visitorId));
    }

    const { liked, totalLikes, created } = await addLike(parsed.data.visitorId);
    if (created) pushActivity("like");
    return res.json({ liked, totalLikes });
  } catch (err) {
    logger.error({ err }, "Error adding like");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
