import { randomUUID } from "node:crypto";
import {
  db,
  siteVisitsTable,
  siteLikesTable,
  loansTable,
  paymentsTable,
  feedbackTable,
} from "@workspace/db";
import { sql, count, gte } from "drizzle-orm";
import { logger } from "./logger";

export type SiteStats = {
  activeVisitors: number;
  totalVisitors: number;
  todayVisitors: number;
  monthlyVisitors: number;
  totalLikes: number;
  registeredUsers: number;
  loansTracked: number;
  paymentsRecorded: number;
  amountTracked: number;
  totalReviews: number;
};

export type ActivityKind = "visit" | "like" | "review" | "account";

export type ActivityItem = {
  id: string;
  kind: ActivityKind;
  createdAt: string;
};

// ---------------------------------------------------------------------------
// In-memory live state (presence + activity feed)
// ---------------------------------------------------------------------------

/**
 * Live presence keyed by device visitorId. Each visitor may hold a few open
 * sockets (multiple tabs); they collapse to ONE active visitor. Sockets with no
 * visitorId are counted individually under a reserved bucket.
 */
const presenceByVisitor = new Map<string, number>();
const ANON_KEY = "\u0000anon";

/** Hard cap on simultaneous connections a single visitor may hold. */
export const MAX_CONNECTIONS_PER_VISITOR = 5;

/** Number of UNIQUE visitors currently connected over WebSocket. */
let activeVisitors = 0;

/** Recent activity events since boot (most-recent-first ring buffer). */
const ACTIVITY_LIMIT = 30;
const activityFeed: ActivityItem[] = [];

/** Listeners notified whenever live state changes (used by the WS broadcaster). */
type Listener = () => void;
const listeners = new Set<Listener>();

export function onStateChange(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify(): void {
  for (const listener of listeners) {
    try {
      listener();
    } catch (err) {
      logger.error({ err }, "site-stats listener failed");
    }
  }
}

function recomputeActive(): void {
  // Each distinct visitorId counts once; anonymous sockets count individually.
  const anon = presenceByVisitor.get(ANON_KEY) ?? 0;
  const named = presenceByVisitor.has(ANON_KEY)
    ? presenceByVisitor.size - 1
    : presenceByVisitor.size;
  activeVisitors = Math.max(0, named + anon);
  notify();
}

/** How many sockets the given visitor currently holds. */
export function connectionCount(visitorId: string | null): number {
  return presenceByVisitor.get(visitorId || ANON_KEY) ?? 0;
}

/** Register a new live connection for a visitor (or anonymous). */
export function addPresence(visitorId: string | null): void {
  const key = visitorId || ANON_KEY;
  presenceByVisitor.set(key, (presenceByVisitor.get(key) ?? 0) + 1);
  recomputeActive();
}

/** Remove a closed connection for a visitor (or anonymous). */
export function removePresence(visitorId: string | null): void {
  const key = visitorId || ANON_KEY;
  const next = (presenceByVisitor.get(key) ?? 0) - 1;
  if (next <= 0) presenceByVisitor.delete(key);
  else presenceByVisitor.set(key, next);
  recomputeActive();
}

export function getActiveVisitors(): number {
  return activeVisitors;
}

export function pushActivity(kind: ActivityKind): ActivityItem {
  const item: ActivityItem = {
    id: randomUUID(),
    kind,
    createdAt: new Date().toISOString(),
  };
  activityFeed.unshift(item);
  if (activityFeed.length > ACTIVITY_LIMIT) {
    activityFeed.length = ACTIVITY_LIMIT;
  }
  notify();
  return item;
}

export function getActivityFeed(): ActivityItem[] {
  return activityFeed.slice();
}

// ---------------------------------------------------------------------------
// Visit de-duplication + simple per-IP rate limiting + bot filtering
// ---------------------------------------------------------------------------

/** A visitor's repeat hits inside this window count as the same visit. */
const VISIT_DEDUPE_MS = 30 * 60 * 1000;
const lastVisitByVisitor = new Map<string, number>();

/** Token-bucket-ish per-IP rate limiter for write endpoints. */
const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX = 30;
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

/**
 * Hard ceilings so a flood of unique visitorIds/IPs can't grow these maps
 * without bound (DoS protection on public, unauthenticated endpoints).
 */
const MAX_TRACKED_VISITORS = 50_000;
const MAX_TRACKED_IPS = 50_000;

/** Drop expired entries; if still over the cap, clear the map entirely. */
function sweepEphemeralState(): void {
  const now = Date.now();
  for (const [key, ts] of lastVisitByVisitor) {
    if (now - ts > VISIT_DEDUPE_MS) lastVisitByVisitor.delete(key);
  }
  if (lastVisitByVisitor.size > MAX_TRACKED_VISITORS) lastVisitByVisitor.clear();

  for (const [key, bucket] of rateBuckets) {
    if (now > bucket.resetAt) rateBuckets.delete(key);
  }
  if (rateBuckets.size > MAX_TRACKED_IPS) rateBuckets.clear();
}

// Periodic cleanup; unref so it never keeps the process alive on shutdown.
setInterval(sweepEphemeralState, 5 * 60 * 1000).unref();

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    if (rateBuckets.size > MAX_TRACKED_IPS) sweepEphemeralState();
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  bucket.count += 1;
  return bucket.count > RATE_MAX;
}

const BOT_UA = /(bot|crawl|spider|slurp|bingpreview|facebookexternalhit|headless|python-requests|curl|wget|axios|node-fetch|monitor|pingdom|uptime)/i;

export function isLikelyBot(userAgent: string | undefined): boolean {
  if (!userAgent || userAgent.trim() === "") return true;
  return BOT_UA.test(userAgent);
}

// ---------------------------------------------------------------------------
// DB-backed aggregate stats
// ---------------------------------------------------------------------------

function startOfTodayUTC(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

function startOfMonthUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

/**
 * Record a visit for a device, de-duplicated within VISIT_DEDUPE_MS.
 * Returns true when a fresh visit row was actually written.
 */
export async function recordVisit(visitorId: string): Promise<boolean> {
  const now = Date.now();
  const last = lastVisitByVisitor.get(visitorId);
  if (last && now - last < VISIT_DEDUPE_MS) {
    return false;
  }
  lastVisitByVisitor.set(visitorId, now);
  await db.insert(siteVisitsTable).values({ id: randomUUID(), visitorId });
  return true;
}

/** Add a like for a device; idempotent (one per device). Returns the new total. */
export async function addLike(
  visitorId: string,
): Promise<{ liked: boolean; totalLikes: number; created: boolean }> {
  const result = await db
    .insert(siteLikesTable)
    .values({ visitorId })
    .onConflictDoNothing()
    .returning();
  const created = result.length > 0;
  const totalLikes = await countRows(siteLikesTable);
  return { liked: true, totalLikes, created };
}

export async function getLikeStatus(
  visitorId: string,
): Promise<{ liked: boolean; totalLikes: number }> {
  const [row] = await db
    .select({ visitorId: siteLikesTable.visitorId })
    .from(siteLikesTable)
    .where(sql`${siteLikesTable.visitorId} = ${visitorId}`)
    .limit(1);
  const totalLikes = await countRows(siteLikesTable);
  return { liked: Boolean(row), totalLikes };
}

async function countRows(table: typeof siteLikesTable): Promise<number> {
  const [row] = await db.select({ value: count() }).from(table);
  return row?.value ?? 0;
}

async function countDistinctVisitors(since?: Date): Promise<number> {
  const base = db
    .select({
      value: sql<number>`count(distinct ${siteVisitsTable.visitorId})`,
    })
    .from(siteVisitsTable);
  const [row] = since
    ? await base.where(gte(siteVisitsTable.createdAt, since))
    : await base;
  return Number(row?.value ?? 0);
}

async function countRegisteredUsers(): Promise<number> {
  // No dedicated users table exists; approximate registered users as the count
  // of distinct user IDs that have created any record in the app.
  const result = await db.execute<{ value: number }>(sql`
    SELECT COUNT(*)::int AS value FROM (
      SELECT user_id FROM loans
      UNION
      SELECT user_id FROM financial_profiles
      UNION
      SELECT user_id FROM user_settings
    ) AS u
  `);
  return Number(result.rows[0]?.value ?? 0);
}

export async function getStats(): Promise<SiteStats> {
  const [
    totalVisitors,
    todayVisitors,
    monthlyVisitors,
    totalLikes,
    registeredUsers,
    loansAgg,
    paymentsAgg,
    totalReviews,
  ] = await Promise.all([
    countDistinctVisitors(),
    countDistinctVisitors(startOfTodayUTC()),
    countDistinctVisitors(startOfMonthUTC()),
    countRows(siteLikesTable),
    countRegisteredUsers(),
    db
      .select({
        loans: count(),
        amount: sql<number>`coalesce(sum(${loansTable.principalAmount}), 0)`,
      })
      .from(loansTable),
    db.select({ payments: count() }).from(paymentsTable),
    db.select({ value: count() }).from(feedbackTable),
  ]);

  return {
    activeVisitors,
    totalVisitors,
    todayVisitors,
    monthlyVisitors,
    totalLikes,
    registeredUsers,
    loansTracked: Number(loansAgg[0]?.loans ?? 0),
    paymentsRecorded: Number(paymentsAgg[0]?.payments ?? 0),
    amountTracked: Number(loansAgg[0]?.amount ?? 0),
    totalReviews: Number(totalReviews[0]?.value ?? 0),
  };
}
