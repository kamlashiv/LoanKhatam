import { pgTable, serial, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const creditCardsTable = pgTable("credit_cards", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  bank: text("bank").notNull(),
  cardName: text("card_name").notNull(),
  last4: text("last4").notNull(),
  network: text("network").notNull(),
  creditLimit: numeric("credit_limit", { precision: 12, scale: 2 }).notNull(),
  outstanding: numeric("outstanding", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  dueDate: text("due_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCreditCardSchema = createInsertSchema(creditCardsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertCreditCard = z.infer<typeof insertCreditCardSchema>;
export type CreditCard = typeof creditCardsTable.$inferSelect;
