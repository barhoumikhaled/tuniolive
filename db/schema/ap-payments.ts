import { pgTable, serial, text, timestamp, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const apPaymentsTable = pgTable("ap_payments", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").notNull(),
  paymentNumber: text("payment_number"),
  paymentDate: timestamp("payment_date", { withTimezone: true }).notNull(),
  bankAccountCad: text("bank_account_cad"),
  bankAccountUsd: text("bank_account_usd"),
  paymentMethod: text("payment_method"),
  referenceProof: text("reference_proof"),
  linkedInvoiceNum: text("linked_invoice_num"),
  linkedInvoiceId: integer("linked_invoice_id"),
  amountCad: numeric("amount_cad", { precision: 18, scale: 6 }).notNull(),
  currency: text("currency").notNull().default("CAD"),
  amountUsd: numeric("amount_usd", { precision: 18, scale: 6 }),
  exchangeRate: numeric("exchange_rate", { precision: 10, scale: 6 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertApPaymentSchema = createInsertSchema(apPaymentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertApPayment = z.infer<typeof insertApPaymentSchema>;
export type ApPayment = typeof apPaymentsTable.$inferSelect;
