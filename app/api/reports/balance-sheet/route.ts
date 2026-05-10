import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { glEntriesTable, glAccountsTable } from "@/db/schema";
import { eq, and, lte } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { GetBalanceSheetQueryParams } from "@/lib/validators";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = GetBalanceSheetQueryParams.parse(Object.fromEntries(req.nextUrl.searchParams));
  const asOf = q.asOf ? new Date(q.asOf) : new Date();

  const bsRows = await db.select({
    accountNumber: glEntriesTable.accountNumber, accountName: glAccountsTable.accountName, type: glAccountsTable.type,
    totalDebit: sql<string>`coalesce(sum(cast(coalesce(${glEntriesTable.debit},'0') as numeric)), 0)::text`,
    totalCredit: sql<string>`coalesce(sum(cast(coalesce(${glEntriesTable.credit},'0') as numeric)), 0)::text`,
  }).from(glEntriesTable).leftJoin(glAccountsTable, eq(glEntriesTable.accountNumber, glAccountsTable.accountNumber)).where(and(lte(glEntriesTable.date, asOf), sql`${glAccountsTable.type} in ('Asset', 'Liability', 'Equity')`)).groupBy(glEntriesTable.accountNumber, glAccountsTable.accountName, glAccountsTable.type).orderBy(glEntriesTable.accountNumber);

  const plRows = await db.select({
    type: glAccountsTable.type,
    totalDebit: sql<string>`coalesce(sum(cast(coalesce(${glEntriesTable.debit},'0') as numeric)), 0)::text`,
    totalCredit: sql<string>`coalesce(sum(cast(coalesce(${glEntriesTable.credit},'0') as numeric)), 0)::text`,
  }).from(glEntriesTable).leftJoin(glAccountsTable, eq(glEntriesTable.accountNumber, glAccountsTable.accountNumber)).where(and(lte(glEntriesTable.date, asOf), sql`${glAccountsTable.type} in ('Revenue', 'Expense')`)).groupBy(glAccountsTable.type);

  let totalRevenue = 0, totalExpenses = 0;
  for (const r of plRows) {
    const debit = parseFloat(r.totalDebit ?? "0"), credit = parseFloat(r.totalCredit ?? "0");
    if (r.type === "Revenue") totalRevenue = credit - debit;
    else if (r.type === "Expense") totalExpenses = debit - credit;
  }
  const netIncome = totalRevenue - totalExpenses;

  const assets: { accountNumber: string; accountName: string; balance: number }[] = [];
  const liabilities: { accountNumber: string; accountName: string; balance: number }[] = [];
  const equity: { accountNumber: string; accountName: string; balance: number }[] = [];

  for (const r of bsRows) {
    const debit = parseFloat(r.totalDebit ?? "0"), credit = parseFloat(r.totalCredit ?? "0");
    const entry = { accountNumber: r.accountNumber, accountName: r.accountName ?? r.accountNumber, balance: debit - credit };
    if (r.type === "Asset") assets.push(entry);
    else if (r.type === "Liability") liabilities.push({ ...entry, balance: credit - debit });
    else equity.push({ ...entry, balance: credit - debit });
  }
  if (netIncome !== 0) equity.push({ accountNumber: "NI", accountName: "Net Income (Current Period)", balance: netIncome });

  const totalAssets = assets.reduce((s, a) => s + a.balance, 0);
  const totalLiabilities = liabilities.reduce((s, l) => s + l.balance, 0);
  const totalEquity = equity.reduce((s, e) => s + e.balance, 0);

  return NextResponse.json({ asOf: asOf.toISOString(), assets, totalAssets, liabilities, totalLiabilities, equity, totalEquity, netIncome, balanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01 });
}
