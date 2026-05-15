import { pgTable, serial, text, timestamp, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const arInvoiceItemsTable = pgTable("ar_invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull(),
  item: text("item"),
  description: text("description"),
  qtyBox: numeric("qty_box", { precision: 10, scale: 3 }),
  priceBox: numeric("price_box", { precision: 18, scale: 6 }),
  priceUnit: numeric("price_unit", { precision: 18, scale: 6 }),
  totalAmount: numeric("total_amount", { precision: 18, scale: 6 }),
  glAccount: text("gl_account"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertArInvoiceItemSchema = createInsertSchema(arInvoiceItemsTable).omit({ id: true, createdAt: true });
export type InsertArInvoiceItem = z.infer<typeof insertArInvoiceItemSchema>;
export type ArInvoiceItem = typeof arInvoiceItemsTable.$inferSelect;
