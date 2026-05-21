import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { arInvoicesTable, arInvoiceItemsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ customerId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { customerId } = await params;
  const id = parseInt(customerId);

  const invoices = await db
    .select({
      id: arInvoicesTable.id,
      invoiceNumber: arInvoicesTable.invoiceNumber,
      invoiceDate: arInvoicesTable.invoiceDate,
      dueDate: arInvoicesTable.dueDate,
      paymentStatus: arInvoicesTable.paymentStatus,
      paymentDate: arInvoicesTable.paymentDate,
      customerName: arInvoicesTable.customerName,
      notes: arInvoicesTable.notes,
      amount: sql<number>`coalesce((
        select sum(
          cast(coalesce(qty_box,'0') as numeric) *
          cast(coalesce(price_box,'0') as numeric)
        )
        from ar_invoice_items
        where invoice_id = ar_invoices.id
      ), 0)`,
    })
    .from(arInvoicesTable)
    .where(eq(arInvoicesTable.customerId, id))
    .orderBy(arInvoicesTable.invoiceDate);

  const totalBilled = invoices.reduce((s, inv) => s + Number(inv.amount), 0);
  const totalPaid = invoices
    .filter((inv) => inv.paymentStatus === 'Paid')
    .reduce((s, inv) => s + Number(inv.amount), 0);

  return NextResponse.json({
    customerId,
    customerName: invoices[0]?.customerName ?? "Unknown",
    invoices: invoices.map((inv) => ({
      ...inv,
      amount: Number(inv.amount),
      balance: inv.paymentStatus === 'Paid' ? 0 : Number(inv.amount),
    })),
    totalBilled,
    totalPaid,
    balance: totalBilled - totalPaid,
  });
}