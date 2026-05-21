import { NextResponse } from "next/server";
import { db } from "@/db";
import { arInvoicesTable, arInvoiceItemsTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { sql } from "drizzle-orm";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Group invoices by customer, sum totals from line items
  const rows = await db
    .select({
      customerId: arInvoicesTable.customerId,
      customerName: arInvoicesTable.customerName,
      totalBilled: sql<number>`
        coalesce(sum((
          select sum(
            cast(coalesce(qty_box,'0') as numeric) *
            cast(coalesce(price_box,'0') as numeric)
          )
          from ar_invoice_items
          where invoice_id = ar_invoices.id
        )), 0)`,
      totalPaid: sql<number>`
        coalesce(sum(case when ar_invoices.payment_status = 'Paid' then (
          select sum(
            cast(coalesce(qty_box,'0') as numeric) *
            cast(coalesce(price_box,'0') as numeric)
          )
          from ar_invoice_items
          where invoice_id = ar_invoices.id
        ) else 0 end), 0)`,
      invoiceCount: sql<number>`count(*)::int`,
      unpaidCount: sql<number>`sum(case when ar_invoices.payment_status != 'Paid' then 1 else 0 end)::int`,
      lastInvoiceDate: sql<string>`max(ar_invoices.invoice_date)`,
    })
    .from(arInvoicesTable)
    .groupBy(arInvoicesTable.customerId, arInvoicesTable.customerName)
    .orderBy(arInvoicesTable.customerName);

  return NextResponse.json(
    rows.map((r) => ({
      ...r,
      totalBilled: Number(r.totalBilled ?? 0),
      totalPaid: Number(r.totalPaid ?? 0),
      balance: Number(r.totalBilled ?? 0) - Number(r.totalPaid ?? 0),
      invoiceCount: r.invoiceCount ?? 0,
      unpaidCount: r.unpaidCount ?? 0,
    }))
  );
}