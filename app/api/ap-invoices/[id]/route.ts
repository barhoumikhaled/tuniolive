import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { apInvoicesTable, contactsTable, apPaymentsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { IdParam, UpdateApInvoiceBody } from "@/lib/validators";

const GST_RATE = 0.05;
const QST_RATE = 0.09975;
const FOREIGN = ["Tunisia","TN","Italy","IT","Spain","ES","Greece","GR","Morocco","MA","Portugal","PT","USA","US","United States"];

async function guard() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

function computeStatus(totalCad: string | null, amountPaid: string | null) {
  const bal = parseFloat(totalCad ?? "0") - parseFloat(amountPaid ?? "0");
  if (bal <= 0.005) return "Paid";
  if (parseFloat(amountPaid ?? "0") > 0) return "Partial";
  return "Unpaid";
}

async function computeTaxes(supplierId: number, amountCad: string, currency: string) {
  if (currency !== "CAD") return { gst: "0.00", qst: "0.00" };
  const [s] = await db.select({ country: contactsTable.country }).from(contactsTable).where(eq(contactsTable.id, supplierId));
  if (s?.country && FOREIGN.includes(s.country)) return { gst: "0.00", qst: "0.00" };
  const a = parseFloat(amountCad);
  return { gst: (a * GST_RATE).toFixed(2), qst: (a * QST_RATE).toFixed(2) };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await guard(); if (unauth) return unauth;
  const { id } = IdParam.parse(await params);
  const [row] = await db.select({
    id: apInvoicesTable.id, supplierId: apInvoicesTable.supplierId, supplierName: contactsTable.name,
    invoiceNumber: apInvoicesTable.invoiceNumber, invoiceDate: apInvoicesTable.invoiceDate,
    dueDate: apInvoicesTable.dueDate, poNumber: apInvoicesTable.poNumber,
    receivingNumber: apInvoicesTable.receivingNumber, amountCad: apInvoicesTable.amountCad,
    gst: apInvoicesTable.gst, qst: apInvoicesTable.qst, totalCad: apInvoicesTable.totalCad,
    currency: apInvoicesTable.currency, amountUsd: apInvoicesTable.amountUsd,
    exchangeRate: apInvoicesTable.exchangeRate, amountPaid: apInvoicesTable.amountPaid,
    balance: apInvoicesTable.balance, expenseDescription: apInvoicesTable.expenseDescription,
    referenceId: apInvoicesTable.referenceId, referenceDescription: apInvoicesTable.referenceDescription,
    glAccount: apInvoicesTable.glAccount, createdAt: apInvoicesTable.createdAt, updatedAt: apInvoicesTable.updatedAt,
  }).from(apInvoicesTable).leftJoin(contactsTable, eq(apInvoicesTable.supplierId, contactsTable.id)).where(eq(apInvoicesTable.id, id));
  if (!row) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  const payments = await db.select().from(apPaymentsTable).where(eq(apPaymentsTable.linkedInvoiceId, id));
  return NextResponse.json({ ...row, status: computeStatus(row.totalCad, row.amountPaid), payments });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await guard(); if (unauth) return unauth;
  const { id } = IdParam.parse(await params);
  const body = UpdateApInvoiceBody.parse(await req.json());
  const update: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    if (v === undefined) continue;
    update[k] = v === "" ? null : v;
  }
  if (update.invoiceDate) update.invoiceDate = new Date(update.invoiceDate as string);
  if (update.dueDate) update.dueDate = new Date(update.dueDate as string);

  if (update.amountCad !== undefined || update.currency !== undefined || update.supplierId !== undefined) {
    const [current] = await db.select().from(apInvoicesTable).where(eq(apInvoicesTable.id, id));
    if (current) {
      const supplierId = (update.supplierId ?? current.supplierId) as number;
      const amountCad = String(update.amountCad ?? current.amountCad);
      const currency = String(update.currency ?? current.currency);
      const { gst, qst } = await computeTaxes(supplierId, amountCad, currency);
      const newTotal = (parseFloat(amountCad) + parseFloat(gst) + parseFloat(qst)).toFixed(2);
      update.gst = gst; update.qst = qst; update.totalCad = newTotal;
      update.balance = (parseFloat(newTotal) - parseFloat(current.amountPaid ?? "0")).toFixed(2);
    }
  } else if (update.totalCad !== undefined || update.amountPaid !== undefined) {
    const [current] = await db.select().from(apInvoicesTable).where(eq(apInvoicesTable.id, id));
    const total = parseFloat(String(update.totalCad ?? current?.totalCad ?? "0"));
    const paid = parseFloat(String(update.amountPaid ?? current?.amountPaid ?? "0"));
    update.balance = (total - paid).toFixed(2);
  }

  const [invoice] = await db.update(apInvoicesTable).set(update).where(eq(apInvoicesTable.id, id)).returning();
  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  return NextResponse.json({ ...invoice, status: computeStatus(invoice.totalCad, invoice.amountPaid) });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await guard(); if (unauth) return unauth;
  const { id } = IdParam.parse(await params);
  await db.delete(apInvoicesTable).where(eq(apInvoicesTable.id, id));
  return new NextResponse(null, { status: 204 });
}
