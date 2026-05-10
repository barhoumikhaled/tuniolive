import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { glAccountsTable } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { ListGlAccountsQueryParams, CreateGlAccountBody } from "@/lib/validators";

async function guard() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

export async function GET(req: NextRequest) {
  const unauth = await guard(); if (unauth) return unauth;
  const q = ListGlAccountsQueryParams.parse(Object.fromEntries(req.nextUrl.searchParams));
  let rows = await db.select().from(glAccountsTable).orderBy(glAccountsTable.accountNumber);
  if (q.type) rows = rows.filter((r) => r.type === q.type);
  if (q.active !== undefined) rows = rows.filter((r) => r.active === q.active);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const unauth = await guard(); if (unauth) return unauth;
  const body = CreateGlAccountBody.parse(await req.json());
  const [account] = await db.insert(glAccountsTable).values(body).returning();
  return NextResponse.json(account, { status: 201 });
}
