import { pgTable, serial, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const arInvoicesTable = pgTable("ar_invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number"),
  customerId: integer("customer_id"),
  customerName: text("customer_name"),
  invoiceDate: timestamp("invoice_date", { withTimezone: true }).notNull(),
  dueDate: timestamp("due_date", { withTimezone: true }),
  paymentTerms: text("payment_terms"),
  notes: text("notes"),
  paymentStatus: text("payment_status").default("Pending"),
  paymentDate: timestamp("payment_date", { withTimezone: true }),
  glRevenueAccount: text("gl_revenue_account"), // Revenue account to credit (e.g. "4000")
  glPosted: boolean("gl_posted").default(false), // Whether GL entries have been auto-posted
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertArInvoiceSchema = createInsertSchema(arInvoicesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertArInvoice = z.infer<typeof insertArInvoiceSchema>;
export type ArInvoice = typeof arInvoicesTable.$inferSelect;
