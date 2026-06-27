import { pgTable, serial, text, numeric, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { groupsTable } from "./groups";

export const groupExpensesTable = pgTable("group_expenses", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id")
    .references(() => groupsTable.id, { onDelete: "cascade" })
    .notNull(),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  paidBy: text("paid_by").notNull(),
  splits: jsonb("splits").$type<Record<string, number>>().notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type GroupExpense = typeof groupExpensesTable.$inferSelect;
export type InsertGroupExpense = typeof groupExpensesTable.$inferInsert;
