import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { glEntriesTable, glAccountsTable } from "@/db/schema";
import { eq, and, lte, gte } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { GetTrialBalanceQueryParams } from "@/lib/validators";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = GetTrialBalanceQueryParams.parse(Object.fromEntries(req.nextUrl.searchParams));
  const asOf = q.asOf ? new Date(q.asOf) : new Date();

  const rows = await db.select({
    accountNumber: glEntriesTable.accountNumber, accountName: glAccountsTable.accountName,
    type: glAccountsTable.type,
    totalDebit: sql<string>`coalesce(sum(cast(coalesce(${glEntriesTable.debit},'0') as numeric)), 0)::text`,
    totalCredit: sql<string>`coalesce(sum(cast(coalesce(${glEntriesTable.credit},'0') as numeric)), 0)::text`,
  }).from(glEntriesTable).leftJoin(glAccountsTable, eq(glEntriesTable.accountNumber, glAccountsTable.accountNumber)).where(lte(glEntriesTable.date, asOf)).groupBy(glEntriesTable.accountNumber, glAccountsTable.accountName, glAccountsTable.type).orderBy(glEntriesTable.accountNumber);

  const accounts = rows.map((r) => {
    const debit = parseFloat(r.totalDebit ?? "0");
    const credit = parseFloat(r.totalCredit ?? "0");
    return { accountNumber: r.accountNumber, accountName: r.accountName ?? r.accountNumber, type: r.type ?? "Other", totalDebits: debit, totalCredits: credit, balance: debit - credit };
  });

  return NextResponse.json({ asOf: asOf.toISOString(), accounts, totalDebits: accounts.reduce((s, a) => s + a.totalDebits, 0), totalCredits: accounts.reduce((s, a) => s + a.totalCredits, 0) });
}
