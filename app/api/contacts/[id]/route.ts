import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contactsTable, apInvoicesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { IdParam, UpdateContactBody } from "@/lib/validators";

async function guard() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await guard();
  if (unauth) return unauth;

  const { id } = IdParam.parse(await params);
  const [contact] = await db.select().from(contactsTable).where(eq(contactsTable.id, id));
  if (!contact) return NextResponse.json({ error: "Contact not found" }, { status: 404 });

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(apInvoicesTable)
    .where(eq(apInvoicesTable.supplierId, id));
  return NextResponse.json({ ...contact, apInvoiceCount: count ?? 0 });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await guard();
  if (unauth) return unauth;

  const { id } = IdParam.parse(await params);
  const body = UpdateContactBody.parse(await req.json());
  const update: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (v !== undefined && v !== null) update[k] = v;
  }
  const [contact] = await db.update(contactsTable).set(update).where(eq(contactsTable.id, id)).returning();
  if (!contact) return NextResponse.json({ error: "Contact not found" }, { status: 404 });
  return NextResponse.json(contact);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await guard();
  if (unauth) return unauth;

  const { id } = IdParam.parse(await params);
  await db.delete(contactsTable).where(eq(contactsTable.id, id));
  return new NextResponse(null, { status: 204 });
}
