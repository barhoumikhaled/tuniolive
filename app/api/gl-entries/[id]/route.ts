import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { glEntriesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { IdParam, UpdateGlEntryBody } from "@/lib/validators";

async function guard() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await guard(); if (unauth) return unauth;
  const { id } = IdParam.parse(await params);
  const [entry] = await db.select().from(glEntriesTable).where(eq(glEntriesTable.id, id));
  if (!entry) return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  return NextResponse.json(entry);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await guard(); if (unauth) return unauth;
  const { id } = IdParam.parse(await params);
  const body = UpdateGlEntryBody.parse(await req.json());
  const update: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) { if (v !== undefined) update[k] = v; }
  if (update.date) update.date = new Date(update.date as string);
  const [entry] = await db.update(glEntriesTable).set(update).where(eq(glEntriesTable.id, id)).returning();
  if (!entry) return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  return NextResponse.json(entry);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await guard(); if (unauth) return unauth;
  const { id } = IdParam.parse(await params);
  await db.delete(glEntriesTable).where(eq(glEntriesTable.id, id));
  return new NextResponse(null, { status: 204 });
}
