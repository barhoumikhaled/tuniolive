import { NextResponse } from "next/server";
import { db } from "@/db";
import { glEntriesTable, glAccountsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.select({
    category: glAccountsTable.type,
    accountName: glAccountsTable.accountName,
    total: sql<string>`coalesce(sum(cast(coalesce(${glEntriesTable.debit},'0') as numeric)), 0)::text`,
  }).from(glEntriesTable).leftJoin(glAccountsTable, eq(glEntriesTable.accountNumber, glAccountsTable.accountNumber)).where(sql`cast(coalesce(${glEntriesTable.debit},'0') as numeric) > 0`).groupBy(glAccountsTable.type, glAccountsTable.accountName).orderBy(sql`3 desc`);

  const byCategory: Record<string, number> = {};
  for (const r of rows) {
    const cat = r.category ?? "Other";
    byCategory[cat] = (byCategory[cat] ?? 0) + parseFloat(r.total ?? "0");
  }

  return NextResponse.json(Object.entries(byCategory).map(([category, total]) => ({ category, total })).sort((a, b) => b.total - a.total));
}
