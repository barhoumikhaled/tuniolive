import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { glEntriesTable, glAccountsTable } from "@/db/schema";
import { eq, and, lte, gte } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { GetProfitLossQueryParams } from "@/lib/validators";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = GetProfitLossQueryParams.parse(Object.fromEntries(req.nextUrl.searchParams));
  const dateFrom = q.dateFrom ? new Date(q.dateFrom) : new Date("2000-01-01");
  const dateTo = q.dateTo ? new Date(q.dateTo) : new Date();

  const rows = await db.select({
    accountNumber: glEntriesTable.accountNumber, accountName: glAccountsTable.accountName, type: glAccountsTable.type,
    totalDebit: sql<string>`coalesce(sum(cast(coalesce(${glEntriesTable.debit},'0') as numeric)), 0)::text`,
    totalCredit: sql<string>`coalesce(sum(cast(coalesce(${glEntriesTable.credit},'0') as numeric)), 0)::text`,
  }).from(glEntriesTable).leftJoin(glAccountsTable, eq(glEntriesTable.accountNumber, glAccountsTable.accountNumber)).where(and(gte(glEntriesTable.date, dateFrom), lte(glEntriesTable.date, dateTo), sql`${glAccountsTable.type} in ('Revenue', 'Expense')`)).groupBy(glEntriesTable.accountNumber, glAccountsTable.accountName, glAccountsTable.type).orderBy(glEntriesTable.accountNumber);

  const revenue: { accountNumber: string; accountName: string; amount: number }[] = [];
  const expenses: { accountNumber: string; accountName: string; amount: number }[] = [];

  for (const r of rows) {
    const debit = parseFloat(r.totalDebit ?? "0");
    const credit = parseFloat(r.totalCredit ?? "0");
    if (r.type === "Revenue") revenue.push({ accountNumber: r.accountNumber, accountName: r.accountName ?? r.accountNumber, amount: credit - debit });
    else expenses.push({ accountNumber: r.accountNumber, accountName: r.accountName ?? r.accountNumber, amount: debit - credit });
  }

  const totalRevenue = revenue.reduce((s, r) => s + r.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  return NextResponse.json({ dateFrom: dateFrom.toISOString(), dateTo: dateTo.toISOString(), revenue, totalRevenue, expenses, totalExpenses, netIncome: totalRevenue - totalExpenses });
}
