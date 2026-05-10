import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const glAccountsTable = pgTable("gl_accounts", {
  id: serial("id").primaryKey(),
  accountNumber: text("account_number").notNull().unique(),
  accountName: text("account_name").notNull(),
  type: text("type").notNull(),
  parentAccount: text("parent_account"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGlAccountSchema = createInsertSchema(glAccountsTable).omit({ id: true, createdAt: true });
export type InsertGlAccount = z.infer<typeof insertGlAccountSchema>;
export type GlAccount = typeof glAccountsTable.$inferSelect;
