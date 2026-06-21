import { pgTable, text, timestamp, index } from "drizzle-orm/pg-core";

/**
 * One row per unique visitor "session" on the public landing page.
 *
 * A visitor is identified by a client-generated `visitorId` (persisted in the
 * browser's localStorage). The server de-duplicates rapid repeat hits from the
 * same visitor inside a short window, so each row represents a genuine visit.
 * Counts (total / today / this-month) are derived from this table.
 */
export const siteVisitsTable = pgTable(
  "site_visits",
  {
    id: text("id").primaryKey(),
    visitorId: text("visitor_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("site_visits_visitor_idx").on(table.visitorId),
    index("site_visits_created_at_idx").on(table.createdAt),
  ],
);

export type SiteVisitRow = typeof siteVisitsTable.$inferSelect;

/**
 * One like per visitor/device. The `visitorId` is the primary key, which
 * structurally guarantees a single like per device and prevents duplicates.
 */
export const siteLikesTable = pgTable("site_likes", {
  visitorId: text("visitor_id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type SiteLikeRow = typeof siteLikesTable.$inferSelect;
