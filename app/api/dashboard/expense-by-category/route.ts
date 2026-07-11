import { NextResponse } from "next/server";
import { db } from "@/db";
import { apInvoicesTable, apPaymentsTable, glAccountsTable, glEntriesTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const paymentRows = await db.select({
    category: sql<string>`coalesce(${glAccountsTable.accountName}, ${apInvoicesTable.expenseDescription}, ${apInvoicesTable.glAccount}, 'Other')`,
    total: sql<string>`coalesce(sum(cast(coalesce(${apPaymentsTable.amountCad}, '0') as numeric)), 0)::text`,
  }).from(apPaymentsTable)
    .leftJoin(apInvoicesTable, eq(apPaymentsTable.linkedInvoiceId, apInvoicesTable.id))
    .leftJoin(glAccountsTable, eq(apInvoicesTable.glAccount, glAccountsTable.accountNumber))
    .where(sql`cast(coalesce(${apPaymentsTable.amountCad}, '0') as numeric) > 0`)
    .groupBy(glAccountsTable.accountName, apInvoicesTable.expenseDescription, apInvoicesTable.glAccount)
    .orderBy(sql`2 desc`);

  const manualExpenseRows = await db.select({
    category: sql<string>`coalesce(${glAccountsTable.accountName}, 'Other')`,
    total: sql<string>`coalesce(sum(cast(coalesce(${glEntriesTable.debit}, '0') as numeric) - cast(coalesce(${glEntriesTable.credit}, '0') as numeric)), 0)::text`,
  }).from(glEntriesTable)
    .leftJoin(glAccountsTable, eq(glEntriesTable.accountNumber, glAccountsTable.accountNumber))
    .where(and(eq(glAccountsTable.type, "Expense"), sql`${glEntriesTable.documentType} <> 'AP'`))
    .groupBy(glAccountsTable.accountName)
    .orderBy(sql`2 desc`);

  const byCategory = new Map<string, number>();

  for (const row of paymentRows) {
    const category = row.category ?? "Other";
    const total = parseFloat(row.total ?? "0");
    byCategory.set(category, (byCategory.get(category) ?? 0) + total);
  }

  for (const row of manualExpenseRows) {
    const category = row.category ?? "Other";
    const total = parseFloat(row.total ?? "0");
    byCategory.set(category, (byCategory.get(category) ?? 0) + total);
  }

  return NextResponse.json(Array.from(byCategory.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)
    .filter((row) => row.total > 0));
}
