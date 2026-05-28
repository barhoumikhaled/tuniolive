import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { arInvoicesTable, arInvoiceItemsTable, contactsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { IdParam, UpdateArInvoiceBody } from "@/lib/validators";
import { postArInvoiceToGl, postArPaymentToGl, reverseGlEntries } from "@/lib/gl-posting";

async function guard() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

function computeLineItemTotals(items: { item?: string | null; description?: string | null; qtyBox?: string | null; priceBox?: string | null; priceUnit?: string | null }[]) {
  return items.map((item) => {
    const qty   = parseFloat(item.qtyBox   ?? "0");
    const price = parseFloat(item.priceBox ?? "0");
    return {
      item:        item.item        ?? null,
      description: item.description ?? null,
      qtyBox:      item.qtyBox      ?? null,
      priceBox:    item.priceBox    ?? null,
      priceUnit:   item.priceUnit   ?? null,
      totalAmount: (qty * price).toFixed(6),
    };
  });
}

function safeDate(val: unknown): Date | null {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  const str = String(val).slice(0, 10);
  const [y, m, d] = str.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await guard(); if (unauth) return unauth;
  const { id } = IdParam.parse(await params);

  const [invoice] = await db.select({
    id:               arInvoicesTable.id,
    invoiceNumber:    arInvoicesTable.invoiceNumber,
    customerId:       arInvoicesTable.customerId,
    customerName:     arInvoicesTable.customerName,
    customerAddress:  contactsTable.address,
    customerCity:     contactsTable.city,
    invoiceDate:      arInvoicesTable.invoiceDate,
    dueDate:          arInvoicesTable.dueDate,
    paymentTerms:     arInvoicesTable.paymentTerms,
    paymentStatus:    arInvoicesTable.paymentStatus,
    paymentDate:      arInvoicesTable.paymentDate,
    notes:            arInvoicesTable.notes,
    glRevenueAccount: arInvoicesTable.glRevenueAccount,
    glPosted:         arInvoicesTable.glPosted,
    createdAt:        arInvoicesTable.createdAt,
    updatedAt:        arInvoicesTable.updatedAt,
  }).from(arInvoicesTable)
    .leftJoin(contactsTable, eq(arInvoicesTable.customerId, contactsTable.id))
    .where(eq(arInvoicesTable.id, id));

  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  const lineItems = await db.select().from(arInvoiceItemsTable).where(eq(arInvoiceItemsTable.invoiceId, id));
  return NextResponse.json({ ...invoice, lineItems });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await guard(); if (unauth) return unauth;
  const { id } = IdParam.parse(await params);
  const body = UpdateArInvoiceBody.parse(await req.json());
  const { lineItems, ...invoiceData } = body as typeof body & {
    lineItems?: { item?: string | null; qtyBox?: string | null; priceBox?: string | null; description?: string | null; priceUnit?: string | null }[];
    glRevenueAccount?: string | null;
  };

  const update: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(invoiceData)) { if (v !== undefined) update[k] = v; }
  if ("invoiceDate" in update) update.invoiceDate = safeDate(update.invoiceDate);
  if ("dueDate"     in update) update.dueDate     = safeDate(update.dueDate);
  if ("paymentDate" in update) update.paymentDate  = safeDate(update.paymentDate);

  const [previous] = await db.select().from(arInvoicesTable).where(eq(arInvoicesTable.id, id));

  const [invoice] = await db.update(arInvoicesTable).set(update).where(eq(arInvoicesTable.id, id)).returning();
  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  // Update line items if provided
  if (lineItems !== undefined) {
    await db.delete(arInvoiceItemsTable).where(eq(arInvoiceItemsTable.invoiceId, id));
    if (lineItems.length > 0) {
      const enriched = computeLineItemTotals(lineItems);
      await db.insert(arInvoiceItemsTable).values(enriched.map((item) => ({ ...item, invoiceId: id })));
    }
  }

  const items = await db.select().from(arInvoiceItemsTable).where(eq(arInvoiceItemsTable.invoiceId, id));
  const total = items.reduce((s, l) => s + parseFloat(l.totalAmount ?? "0"), 0);

  // GL: repost if line items changed OR glRevenueAccount changed
  const glAccountChanged = update.glRevenueAccount !== undefined;
  if (lineItems !== undefined || glAccountChanged) {
    try {
      await reverseGlEntries("ar_invoice", String(id));
      if (total > 0) {
        await postArInvoiceToGl({
          id: invoice.id,
          invoiceDate: invoice.invoiceDate,
          invoiceNumber: invoice.invoiceNumber,
          glRevenueAccount: invoice.glRevenueAccount, // already updated in DB above
          total,
        });
      }
    } catch (err) {
      console.error("[GL re-posting] AR invoice:", err);
    }
  }

  // GL: if status just changed TO Paid, post the payment receipt entry
  const justPaid = update.paymentStatus === "Paid" && previous?.paymentStatus !== "Paid";
  if (justPaid && total > 0) {
    try {
      await reverseGlEntries("ar_payment", String(id));
      await postArPaymentToGl({
        id: invoice.id,
        invoiceDate: invoice.paymentDate ?? invoice.invoiceDate,
        invoiceNumber: invoice.invoiceNumber,
        total,
      });
    } catch (err) {
      console.error("[GL payment] AR invoice:", err);
    }
  }

  return NextResponse.json({ ...invoice, lineItems: items });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await guard(); if (unauth) return unauth;
  const { id } = IdParam.parse(await params);
  // Reverse all GL entries linked to this invoice
  try {
    await reverseGlEntries("ar_invoice", String(id));
    await reverseGlEntries("ar_payment", String(id));
  } catch (err) {
    console.error("[GL reversal]", err);
  }
  await db.delete(arInvoiceItemsTable).where(eq(arInvoiceItemsTable.invoiceId, id));
  await db.delete(arInvoicesTable).where(eq(arInvoicesTable.id, id));
  return new NextResponse(null, { status: 204 });
}
