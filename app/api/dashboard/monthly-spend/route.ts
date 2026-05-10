import { NextResponse } from "next/server";
import { db } from "@/db";
import { glEntriesTable } from "@/db/schema";
import { sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.select({
    month: sql<string>`to_char(${glEntriesTable.date}, 'YYYY-MM')`,
    total: sql<string>`coalesce(sum(cast(coalesce(${glEntriesTable.debit},'0') as numeric)), 0)::text`,
  }).from(glEntriesTable).groupBy(sql`to_char(${glEntriesTable.date}, 'YYYY-MM')`).orderBy(sql`to_char(${glEntriesTable.date}, 'YYYY-MM')`);

  return NextResponse.json(rows.map((r) => ({ month: r.month, total: parseFloat(r.total ?? "0") })));
}
