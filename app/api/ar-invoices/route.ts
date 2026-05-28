import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { arInvoicesTable, arInvoiceItemsTable } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { ListArInvoicesQueryParams, CreateArInvoiceBody } from "@/lib/validators";
import { postArInvoiceToGl } from "@/lib/gl-posting";

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

export async function GET(req: NextRequest) {
  const unauth = await guard(); if (unauth) return unauth;
  const q = ListArInvoicesQueryParams.parse(Object.fromEntries(req.nextUrl.searchParams));

  const rows = await db.select({
    id:               arInvoicesTable.id,
    invoiceNumber:    arInvoicesTable.invoiceNumber,
    customerId:       arInvoicesTable.customerId,
    customerName:     arInvoicesTable.customerName,
    invoiceDate:      arInvoicesTable.invoiceDate,
    dueDate:          arInvoicesTable.dueDate,
    paymentTerms:     arInvoicesTable.paymentTerms,
    notes:            arInvoicesTable.notes,
    paymentStatus:    arInvoicesTable.paymentStatus,
    paymentDate:      arInvoicesTable.paymentDate,
    glRevenueAccount: arInvoicesTable.glRevenueAccount,
    glPosted:         arInvoicesTable.glPosted,
    createdAt:        arInvoicesTable.createdAt,
    total: sql<number>`(
      select coalesce(sum(total_amount), 0)
      from ar_invoice_items
      where ar_invoice_items.invoice_id = ar_invoices.id
    )`,
  }).from(arInvoicesTable).orderBy(arInvoicesTable.invoiceDate);

  return NextResponse.json(q.status ? rows.filter((r) => r.paymentStatus === q.status) : rows);
}

export async function POST(req: NextRequest) {
  const unauth = await guard(); if (unauth) return unauth;
  const body = CreateArInvoiceBody.parse(await req.json());
  const { lineItems, ...invoiceData } = body;
  const [invoice] = await db.insert(arInvoicesTable).values({
    ...invoiceData,
    glRevenueAccount: body.glRevenueAccount,
    invoiceDate: (() => { const [y,m,d] = body.invoiceDate.split("-").map(Number); return new Date(Date.UTC(y,m-1,d)); })(),
    dueDate:     body.dueDate     ? (() => { const [y,m,d] = body.dueDate.split("-").map(Number);     return new Date(Date.UTC(y,m-1,d)); })() : null,
    paymentDate: body.paymentDate ? (() => { const [y,m,d] = body.paymentDate.split("-").map(Number); return new Date(Date.UTC(y,m-1,d)); })() : null,
    glPosted: false,
  }).returning();

  let lineItemRows: typeof arInvoiceItemsTable.$inferSelect[] = [];
  if (lineItems && lineItems.length > 0) {
    const enriched = computeLineItemTotals(lineItems as { item?: string | null; description?: string | null; qtyBox?: string | null; priceBox?: string | null; priceUnit?: string | null }[]);
    await db.insert(arInvoiceItemsTable).values(enriched.map((item) => ({ ...item, invoiceId: invoice.id })));
    lineItemRows = await db.select().from(arInvoiceItemsTable).where(eq(arInvoiceItemsTable.invoiceId, invoice.id));
  }

  // Auto-post GL entries
  const total = lineItemRows.reduce((s, l) => s + parseFloat(l.totalAmount ?? "0"), 0);
  try {
    await postArInvoiceToGl({
      id: invoice.id,
      invoiceDate: invoice.invoiceDate,
      invoiceNumber: invoice.invoiceNumber,
      glRevenueAccount: invoice.glRevenueAccount,
      total,
    });
    await db.update(arInvoicesTable).set({ glPosted: true }).where(eq(arInvoicesTable.id, invoice.id));
  } catch (err) {
    console.error("[GL posting] AR invoice:", err);
  }

  return NextResponse.json({ ...invoice, glPosted: true, lineItems: lineItemRows }, { status: 201 });
}
