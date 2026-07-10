import { NextResponse } from "next/server";
import { db } from "@/db";
import { apInvoicesTable, arInvoicesTable, arInvoiceItemsTable, glEntriesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [apOutstanding] = await db.select({ total: sql<string>`coalesce(sum(cast(balance as numeric)), 0)::text` }).from(apInvoicesTable).where(sql`cast(balance as numeric) > 0`);

  const arInvoiceTotals = await db.select({
    paymentStatus: arInvoicesTable.paymentStatus,
    total: sql<string>`coalesce(sum(cast(coalesce(${arInvoiceItemsTable.totalAmount}, '0') as numeric)), 0)::text`,
  }).from(arInvoicesTable)
    .leftJoin(arInvoiceItemsTable, eq(arInvoiceItemsTable.invoiceId, arInvoicesTable.id))
    .groupBy(arInvoicesTable.id, arInvoicesTable.paymentStatus);

  const totalArOutstanding = arInvoiceTotals
    .filter((invoice) => invoice.paymentStatus !== "Paid")
    .reduce((sum, invoice) => sum + parseFloat(invoice.total ?? "0"), 0);

  const [oliveInventory] = await db.select({ balance: sql<string>`coalesce(sum(cast(coalesce(debit,'0') as numeric) - cast(coalesce(credit,'0') as numeric)), 0)::text` }).from(glEntriesTable).where(eq(glEntriesTable.accountNumber, "1200"));
  const [vehicleInventory] = await db.select({ balance: sql<string>`coalesce(sum(cast(coalesce(debit,'0') as numeric) - cast(coalesce(credit,'0') as numeric)), 0)::text` }).from(glEntriesTable).where(eq(glEntriesTable.accountNumber, "1210"));
  const [unpaidCount] = await db.select({ count: sql<number>`count(*)::int` }).from(apInvoicesTable).where(sql`cast(balance as numeric) > 0`);

  return NextResponse.json({
    totalApOutstanding: parseFloat(apOutstanding?.total ?? "0"),
    totalArOutstanding,
    oliveOilInventoryValue: parseFloat(oliveInventory?.balance ?? "0"),
    vehicleInventoryValue: parseFloat(vehicleInventory?.balance ?? "0"),
    unpaidInvoiceCount: unpaidCount?.count ?? 0,
  });
}
