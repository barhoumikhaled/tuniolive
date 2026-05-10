import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contactsTable, apInvoicesTable } from "@/db/schema";
import { eq, ilike, or, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { ListContactsQueryParams, CreateContactBody } from "@/lib/validators";

async function guard() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

export async function GET(req: NextRequest) {
  const unauth = await guard();
  if (unauth) return unauth;

  const { searchParams } = req.nextUrl;
  const query = ListContactsQueryParams.parse(Object.fromEntries(searchParams));
  const conditions = [];
  if (query.type) conditions.push(eq(contactsTable.type, query.type));
  if (query.search) {
    conditions.push(
      or(
        ilike(contactsTable.name, `%${query.search}%`),
        ilike(contactsTable.city, `%${query.search}%`),
        ilike(contactsTable.country, `%${query.search}%`)
      )!
    );
  }
  const rows = await db
    .select()
    .from(contactsTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(contactsTable.name);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const unauth = await guard();
  if (unauth) return unauth;

  const body = CreateContactBody.parse(await req.json());
  const [contact] = await db.insert(contactsTable).values(body).returning();
  return NextResponse.json(contact, { status: 201 });
}
