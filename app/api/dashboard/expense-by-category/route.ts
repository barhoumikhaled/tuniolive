import { NextResponse } from "next/server";
import { db } from "@/db";
import { apInvoicesTable, glAccountsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.select({
    category: sql<string>`coalesce(${glAccountsTable.accountName}, ${apInvoicesTable.expenseDescription}, ${apInvoicesTable.glAccount}, 'Other')`,
    total: sql<string>`coalesce(sum(cast(coalesce(${apInvoicesTable.totalCad}, '0') as numeric)), 0)::text`,
  }).from(apInvoicesTable)
    .leftJoin(glAccountsTable, eq(apInvoicesTable.glAccount, glAccountsTable.accountNumber))
    .where(sql`cast(coalesce(${apInvoicesTable.totalCad}, '0') as numeric) > 0`)
    .groupBy(glAccountsTable.accountName, apInvoicesTable.expenseDescription, apInvoicesTable.glAccount)
    .orderBy(sql`2 desc`);

  return NextResponse.json(rows.map((row) => ({ category: row.category ?? "Other", total: parseFloat(row.total ?? "0") })).filter((row) => row.total > 0));
}
