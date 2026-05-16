import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { arInvoicesTable, arInvoiceItemsTable, contactsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { ListArInvoicesQueryParams, CreateArInvoiceBody } from "@/lib/validators";

async function guard() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

function computeLineItemTotals(items: { item?: string | null; description?: string | null; qtyBox?: string | null; priceBox?: string | null; priceUnit?: string | null }[]) {
  return items.map((item) => {
    const qty = parseFloat(item.qtyBox ?? "0");
    const price = parseFloat(item.priceBox ?? "0");
    const totalAmount = qty * price;
    return {
      item: item.item ?? null,
      description: item.description ?? null,
      qtyBox: item.qtyBox ?? null,
      priceBox: item.priceBox ?? null,
      priceUnit: item.priceUnit ?? null,
      totalAmount: totalAmount.toFixed(6)
    };
  });
}

// If you accidentally added the join here too, revert it to:
export async function GET(req: NextRequest) {
  const unauth = await guard(); if (unauth) return unauth;
  const q = ListArInvoicesQueryParams.parse(Object.fromEntries(req.nextUrl.searchParams));
  const rows = await db.select().from(arInvoicesTable).orderBy(arInvoicesTable.invoiceDate);
  return NextResponse.json(q.status ? rows.filter((r) => r.paymentStatus === q.status) : rows);
}

export async function POST(req: NextRequest) {
  const unauth = await guard(); if (unauth) return unauth;
  const body = CreateArInvoiceBody.parse(await req.json());
  const { lineItems, ...invoiceData } = body;
  const [invoice] = await db.insert(arInvoicesTable).values({
    ...invoiceData,
    invoiceDate: (() => { const [y, m, d] = body.invoiceDate.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); })(),
    dueDate: body.dueDate ? (() => { const [y, m, d] = body.dueDate.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); })() : null,
    paymentDate: body.paymentDate ? (() => { const [y, m, d] = body.paymentDate.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); })() : null,
  }).returning();
  if (lineItems && lineItems.length > 0) {
    const enriched = computeLineItemTotals(lineItems as { item?: string | null; description?: string | null; qtyBox?: string | null; priceBox?: string | null; priceUnit?: string | null }[]);
    await db.insert(arInvoiceItemsTable).values(enriched.map((item) => ({ ...item, invoiceId: invoice.id })));
  }
  const items = await db.select().from(arInvoiceItemsTable).where(eq(arInvoiceItemsTable.invoiceId, invoice.id));
  return NextResponse.json({ ...invoice, lineItems: items }, { status: 201 });
}
