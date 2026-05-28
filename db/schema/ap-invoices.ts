import { pgTable, serial, text, timestamp, numeric, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const apInvoicesTable = pgTable("ap_invoices", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").notNull(),
  invoiceNumber: text("invoice_number"),
  invoiceDate: timestamp("invoice_date", { withTimezone: true }).notNull(),
  dueDate: timestamp("due_date", { withTimezone: true }),
  poNumber: text("po_number"),
  receivingNumber: text("receiving_number"),
  amountCad: numeric("amount_cad", { precision: 18, scale: 6 }).notNull(),
  gst: numeric("gst", { precision: 18, scale: 6 }),
  qst: numeric("qst", { precision: 18, scale: 6 }),
  totalCad: numeric("total_cad", { precision: 18, scale: 6 }).notNull(),
  currency: text("currency").notNull().default("CAD"),
  amountUsd: numeric("amount_usd", { precision: 18, scale: 6 }),
  exchangeRate: numeric("exchange_rate", { precision: 10, scale: 6 }),
  amountPaid: numeric("amount_paid", { precision: 18, scale: 6 }).default("0"),
  balance: numeric("balance", { precision: 18, scale: 6 }),
  expenseDescription: text("expense_description"),
  referenceId: text("reference_id"),
  referenceDescription: text("reference_description"),
  glAccount: text("gl_account"),
  glPosted: boolean("gl_posted").default(false), // Whether GL entries have been auto-posted
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertApInvoiceSchema = createInsertSchema(apInvoicesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertApInvoice = z.infer<typeof insertApInvoiceSchema>;
export type ApInvoice = typeof apInvoicesTable.$inferSelect;
