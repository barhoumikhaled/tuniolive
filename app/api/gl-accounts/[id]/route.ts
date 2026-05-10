import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { glAccountsTable, glEntriesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { IdParam, UpdateGlAccountBody } from "@/lib/validators";

async function guard() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await guard(); if (unauth) return unauth;
  const { id } = IdParam.parse(await params);
  const [account] = await db.select().from(glAccountsTable).where(eq(glAccountsTable.id, id));
  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });
  return NextResponse.json(account);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await guard(); if (unauth) return unauth;
  const { id } = IdParam.parse(await params);
  const body = UpdateGlAccountBody.parse(await req.json());
  const update: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) { if (v !== undefined) update[k] = v; }
  const [account] = await db.update(glAccountsTable).set(update).where(eq(glAccountsTable.id, id)).returning();
  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });
  return NextResponse.json(account);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await guard(); if (unauth) return unauth;
  const { id } = IdParam.parse(await params);
  const [account] = await db.select().from(glAccountsTable).where(eq(glAccountsTable.id, id));
  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(glEntriesTable).where(eq(glEntriesTable.accountNumber, account.accountNumber));
  if ((count ?? 0) > 0) return NextResponse.json({ error: "Cannot delete account with existing GL entries" }, { status: 409 });
  await db.delete(glAccountsTable).where(eq(glAccountsTable.id, id));
  return new NextResponse(null, { status: 204 });
}
