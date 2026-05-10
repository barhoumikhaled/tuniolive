import { pgTable, serial, text, timestamp, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const arInvoiceItemsTable = pgTable("ar_invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull(),
  itemType: text("item_type"),
  itemId: text("item_id"),
  description: text("description"),
  qtyBox: numeric("qty_box", { precision: 10, scale: 3 }),
  priceBox: numeric("price_box", { precision: 18, scale: 6 }),
  unitPrice: numeric("unit_price", { precision: 18, scale: 6 }),
  gst: numeric("gst", { precision: 18, scale: 6 }),
  qst: numeric("qst", { precision: 18, scale: 6 }),
  totalAmount: numeric("total_amount", { precision: 18, scale: 6 }),
  extendedPrice: numeric("extended_price", { precision: 18, scale: 6 }),
  glAccount: text("gl_account"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertArInvoiceItemSchema = createInsertSchema(arInvoiceItemsTable).omit({ id: true, createdAt: true });
export type InsertArInvoiceItem = z.infer<typeof insertArInvoiceItemSchema>;
export type ArInvoiceItem = typeof arInvoiceItemsTable.$inferSelect;
