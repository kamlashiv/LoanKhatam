import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";

/**
 * A single global financial profile per user — the source of truth for the
 * user's personal-finance picture that auto-fills every planning screen.
 *
 * The flexible `data` payload is validated against the OpenAPI-derived
 * `FinancialProfileData` Zod schema at the API boundary, so the column stays a
 * single JSONB blob rather than dozens of individual columns.
 */
export const financialProfilesTable = pgTable("financial_profiles", {
  userId: text("user_id").primaryKey(),
  data: jsonb("data").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type FinancialProfileRow = typeof financialProfilesTable.$inferSelect;
