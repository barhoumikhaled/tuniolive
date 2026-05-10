import { pgTable, serial, text, timestamp, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const glEntriesTable = pgTable("gl_entries", {
  id: serial("id").primaryKey(),
  entryNumber: integer("entry_number"),
  date: timestamp("date", { withTimezone: true }).notNull(),
  documentType: text("document_type"),
  documentNumber: text("document_number"),
  accountNumber: text("account_number").notNull(),
  currency: text("currency").notNull().default("CAD"),
  debit: numeric("debit", { precision: 18, scale: 6 }),
  credit: numeric("credit", { precision: 18, scale: 6 }),
  contactId: text("contact_id"),
  description: text("description"),
  exchangeRate: numeric("exchange_rate", { precision: 10, scale: 6 }),
  amountInCad: numeric("amount_in_cad", { precision: 18, scale: 6 }),
  createdBy: text("created_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertGlEntrySchema = createInsertSchema(glEntriesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertGlEntry = z.infer<typeof insertGlEntrySchema>;
export type GlEntry = typeof glEntriesTable.$inferSelect;
