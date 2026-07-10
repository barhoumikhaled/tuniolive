import { NextResponse } from "next/server";
import { db } from "@/db";
import { apPaymentsTable, glEntriesTable, glAccountsTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const paymentRows = await db.select({
    month: sql<string>`to_char(${apPaymentsTable.paymentDate}, 'YYYY-MM')`,
    total: sql<string>`coalesce(sum(cast(coalesce(${apPaymentsTable.amountCad}, '0') as numeric)), 0)::text`,
  }).from(apPaymentsTable)
    .groupBy(sql`to_char(${apPaymentsTable.paymentDate}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${apPaymentsTable.paymentDate}, 'YYYY-MM')`);

  const manualExpenseRows = await db.select({
    month: sql<string>`to_char(${glEntriesTable.date}, 'YYYY-MM')`,
    total: sql<string>`coalesce(sum(cast(coalesce(${glEntriesTable.debit}, '0') as numeric) - cast(coalesce(${glEntriesTable.credit}, '0') as numeric)), 0)::text`,
  }).from(glEntriesTable)
    .leftJoin(glAccountsTable, eq(glEntriesTable.accountNumber, glAccountsTable.accountNumber))
    .where(and(eq(glAccountsTable.type, "Expense"), sql`${glEntriesTable.documentType} <> 'AP'`))
    .groupBy(sql`to_char(${glEntriesTable.date}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${glEntriesTable.date}, 'YYYY-MM')`);

  const byMonth = new Map<string, number>();

  for (const row of paymentRows) {
    const month = row.month;
    const total = parseFloat(row.total ?? "0");
    if (month) byMonth.set(month, (byMonth.get(month) ?? 0) + total);
  }

  for (const row of manualExpenseRows) {
    const month = row.month;
    const total = parseFloat(row.total ?? "0");
    if (month) byMonth.set(month, (byMonth.get(month) ?? 0) + total);
  }

  return NextResponse.json(Array.from(byMonth.entries())
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .filter((row) => row.total > 0));
}
