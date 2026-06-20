import {
  pgTable,
  serial,
  text,
  numeric,
  integer,
  timestamp,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const rateChangeSchema = z.object({
  effectiveDate: z.string(),
  newRate: z.number().min(0),
});

export type RateChange = z.infer<typeof rateChangeSchema>;

export const loanStatusEnum = pgEnum("loan_status", [
  "active",
  "paid",
  "overdue",
]);

export const loansTable = pgTable("loans", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  borrowerName: text("borrower_name").notNull(),
  principalAmount: numeric("principal_amount", {
    precision: 12,
    scale: 2,
  }).notNull(),
  interestRate: numeric("interest_rate", { precision: 5, scale: 2 }).notNull(),
  tenureMonths: integer("tenure_months"),
  startDate: text("start_date").notNull(),
  dueDate: text("due_date").notNull(),
  description: text("description"),
  status: loanStatusEnum("status").notNull().default("active"),
  rateChanges: jsonb("rate_changes").$type<RateChange[]>().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertLoanSchema = createInsertSchema(loansTable).omit({
  id: true,
  createdAt: true,
});

export type InsertLoan = z.infer<typeof insertLoanSchema>;
export type Loan = typeof loansTable.$inferSelect;
