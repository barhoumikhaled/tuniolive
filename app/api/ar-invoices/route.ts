import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { arInvoicesTable, arInvoiceItemsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { ListArInvoicesQueryParams, CreateArInvoiceBody } from "@/lib/validators";

const GST_RATE = 0.05;
const QST_RATE = 0.09975;

async function guard() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

function computeLineItemTotals(items: { qtyBox?: string | null; priceBox?: string | null; description?: string | null }[]) {
  return items.map((item) => {
    const qty = parseFloat(item.qtyBox ?? "0");
    const price = parseFloat(item.priceBox ?? "0");
    const subtotal = qty * price;
    const gst = subtotal * GST_RATE;
    const qst = subtotal * QST_RATE;
    return { description: item.description ?? null, qtyBox: item.qtyBox ?? null, priceBox: item.priceBox ?? null, gst: gst.toFixed(2), qst: qst.toFixed(2), extendedPrice: (subtotal + gst + qst).toFixed(2) };
  });
}

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
    invoiceDate: new Date(invoiceData.invoiceDate),
    dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate) : null,
    paymentDate: invoiceData.paymentDate ? new Date(invoiceData.paymentDate) : null,
  }).returning();
  if (lineItems && lineItems.length > 0) {
    const enriched = computeLineItemTotals(lineItems as { qtyBox?: string | null; priceBox?: string | null; description?: string | null }[]);
    await db.insert(arInvoiceItemsTable).values(enriched.map((item) => ({ ...item, invoiceId: invoice.id })));
  }
  const items = await db.select().from(arInvoiceItemsTable).where(eq(arInvoiceItemsTable.invoiceId, invoice.id));
  return NextResponse.json({ ...invoice, lineItems: items }, { status: 201 });
}
