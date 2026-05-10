import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { arInvoicesTable, arInvoiceItemsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { IdParam, UpdateArInvoiceBody } from "@/lib/validators";

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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await guard(); if (unauth) return unauth;
  const { id } = IdParam.parse(await params);
  const [invoice] = await db.select().from(arInvoicesTable).where(eq(arInvoicesTable.id, id));
  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  const lineItems = await db.select().from(arInvoiceItemsTable).where(eq(arInvoiceItemsTable.invoiceId, id));
  return NextResponse.json({ ...invoice, lineItems });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await guard(); if (unauth) return unauth;
  const { id } = IdParam.parse(await params);
  const body = UpdateArInvoiceBody.parse(await req.json());
  const { lineItems, ...invoiceData } = body as typeof body & { lineItems?: { qtyBox?: string | null; priceBox?: string | null; description?: string | null }[] };
  const update: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(invoiceData)) { if (v !== undefined) update[k] = v; }
  if (update.invoiceDate) update.invoiceDate = new Date(update.invoiceDate as string);
  if (update.dueDate) update.dueDate = new Date(update.dueDate as string);
  if (update.paymentDate) update.paymentDate = new Date(update.paymentDate as string);

  const [invoice] = await db.update(arInvoicesTable).set(update).where(eq(arInvoicesTable.id, id)).returning();
  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  if (lineItems !== undefined) {
    await db.delete(arInvoiceItemsTable).where(eq(arInvoiceItemsTable.invoiceId, id));
    if (lineItems.length > 0) {
      const enriched = computeLineItemTotals(lineItems);
      await db.insert(arInvoiceItemsTable).values(enriched.map((item) => ({ ...item, invoiceId: id })));
    }
  }
  const items = await db.select().from(arInvoiceItemsTable).where(eq(arInvoiceItemsTable.invoiceId, id));
  return NextResponse.json({ ...invoice, lineItems: items });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await guard(); if (unauth) return unauth;
  const { id } = IdParam.parse(await params);
  await db.delete(arInvoiceItemsTable).where(eq(arInvoiceItemsTable.invoiceId, id));
  await db.delete(arInvoicesTable).where(eq(arInvoicesTable.id, id));
  return new NextResponse(null, { status: 204 });
}
