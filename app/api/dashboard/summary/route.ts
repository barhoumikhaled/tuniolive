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
  const [arOutstanding] = await db.select({ total: sql<string>`coalesce(sum(cast(${arInvoiceItemsTable.extendedPrice} as numeric)), 0)::text` }).from(arInvoiceItemsTable).innerJoin(arInvoicesTable, eq(arInvoiceItemsTable.invoiceId, arInvoicesTable.id)).where(sql`${arInvoicesTable.paymentStatus} != 'Paid'`);
  const [oliveInventory] = await db.select({ balance: sql<string>`coalesce(sum(cast(coalesce(debit,'0') as numeric) - cast(coalesce(credit,'0') as numeric)), 0)::text` }).from(glEntriesTable).where(eq(glEntriesTable.accountNumber, "1200"));
  const [vehicleInventory] = await db.select({ balance: sql<string>`coalesce(sum(cast(coalesce(debit,'0') as numeric) - cast(coalesce(credit,'0') as numeric)), 0)::text` }).from(glEntriesTable).where(eq(glEntriesTable.accountNumber, "1210"));
  const [unpaidCount] = await db.select({ count: sql<number>`count(*)::int` }).from(apInvoicesTable).where(sql`cast(balance as numeric) > 0`);

  return NextResponse.json({
    totalApOutstanding: parseFloat(apOutstanding?.total ?? "0"),
    totalArOutstanding: parseFloat(arOutstanding?.total ?? "0"),
    oliveOilInventoryValue: parseFloat(oliveInventory?.balance ?? "0"),
    vehicleInventoryValue: parseFloat(vehicleInventory?.balance ?? "0"),
    unpaidInvoiceCount: unpaidCount?.count ?? 0,
  });
}
