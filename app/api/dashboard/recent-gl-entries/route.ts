import { NextResponse } from "next/server";
import { db } from "@/db";
import { glEntriesTable, glAccountsTable } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.select({
    id: glEntriesTable.id, entryNumber: glEntriesTable.entryNumber, date: glEntriesTable.date,
    documentType: glEntriesTable.documentType, documentNumber: glEntriesTable.documentNumber,
    accountNumber: glEntriesTable.accountNumber, accountName: glAccountsTable.accountName,
    debit: glEntriesTable.debit, credit: glEntriesTable.credit, description: glEntriesTable.description,
  }).from(glEntriesTable).leftJoin(glAccountsTable, eq(glEntriesTable.accountNumber, glAccountsTable.accountNumber)).orderBy(desc(glEntriesTable.date), desc(glEntriesTable.id)).limit(10);

  return NextResponse.json(rows);
}
