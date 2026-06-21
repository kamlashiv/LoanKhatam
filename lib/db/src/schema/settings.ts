import {
  pgTable,
  text,
  jsonb,
  timestamp,
  serial,
  integer,
} from "drizzle-orm/pg-core";

/**
 * One settings blob per user (account-level preferences: region, calculator
 * defaults, notification toggles). Device-level appearance (theme/font size)
 * is stored client-side, not here. The `data` payload is validated against the
 * OpenAPI-derived `UpdateSettingsBody` Zod schema at the API boundary.
 */
export const userSettingsTable = pgTable("user_settings", {
  userId: text("user_id").primaryKey(),
  data: jsonb("data").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type UserSettingsRow = typeof userSettingsTable.$inferSelect;

/**
 * User-submitted feedback: ratings, free-form feedback, and feature requests
 * from the Settings → Feedback section.
 */
export const feedbackTable = pgTable("feedback", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  kind: text("kind").notNull(),
  rating: integer("rating"),
  message: text("message").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type FeedbackRow = typeof feedbackTable.$inferSelect;
