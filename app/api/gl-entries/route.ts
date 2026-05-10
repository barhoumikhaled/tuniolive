import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { glEntriesTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { sql } from "drizzle-orm";
import { ListGlEntriesQueryParams, CreateGlEntriesBody } from "@/lib/validators";

async function guard() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

export async function GET(req: NextRequest) {
  const unauth = await guard(); if (unauth) return unauth;
  const q = ListGlEntriesQueryParams.parse(Object.fromEntries(req.nextUrl.searchParams));
  const rows = await db.select().from(glEntriesTable).orderBy(glEntriesTable.date, glEntriesTable.documentNumber);
  let f = rows;
  if (q.accountNumber) f = f.filter((r) => r.accountNumber.includes(q.accountNumber!));
  if (q.documentType) f = f.filter((r) => r.documentType === q.documentType);
  if (q.currency) f = f.filter((r) => r.currency === q.currency);
  if (q.dateFrom) { const d = new Date(q.dateFrom); f = f.filter((r) => new Date(r.date) >= d); }
  if (q.dateTo) { const d = new Date(q.dateTo); f = f.filter((r) => new Date(r.date) <= d); }
  return NextResponse.json(f);
}

export async function POST(req: NextRequest) {
  const unauth = await guard(); if (unauth) return unauth;
  const body = CreateGlEntriesBody.parse(await req.json());
  const totalDebit = body.lines.reduce((s, l) => s + parseFloat(l.debit ?? "0"), 0);
  const totalCredit = body.lines.reduce((s, l) => s + parseFloat(l.credit ?? "0"), 0);
  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    return NextResponse.json({ error: "Journal entry must balance: debits must equal credits" }, { status: 400 });
  }
  const [{ maxEntry }] = await db.select({ maxEntry: sql<number>`coalesce(max(entry_number), 0)` }).from(glEntriesTable);
  const nextEntry = (maxEntry ?? 0) + 1;
  const inserted = await db.insert(glEntriesTable).values(
    body.lines.map((line, i) => ({
      entryNumber: nextEntry + i,
      date: new Date(body.date),
      documentType: body.documentType ?? null,
      documentNumber: body.documentNumber ?? null,
      accountNumber: line.accountNumber,
      currency: line.currency ?? "CAD",
      debit: line.debit ?? null,
      credit: line.credit ?? null,
      contactId: line.contactId ?? null,
      description: line.description ?? null,
      exchangeRate: line.exchangeRate ?? null,
      amountInCad: line.amountInCad ?? null,
      createdBy: line.createdBy ?? null,
      notes: line.notes ?? null,
    }))
  ).returning();
  return NextResponse.json(inserted, { status: 201 });
}
