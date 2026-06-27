import { pgTable, serial, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const groupsTable = pgTable("groups", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  members: jsonb("members").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Group = typeof groupsTable.$inferSelect;
export type InsertGroup = typeof groupsTable.$inferInsert;
