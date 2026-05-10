import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { apPaymentsTable, contactsTable, apInvoicesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { IdParam, UpdateApPaymentBody } from "@/lib/validators";

async function guard() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return null;
}

async function recomputeInvoiceBalance(invoiceId: number) {
  const [invoice] = await db.select().from(apInvoicesTable).where(eq(apInvoicesTable.id, invoiceId));
  if (!invoice) return;
  const payments = await db.select().from(apPaymentsTable).where(eq(apPaymentsTable.linkedInvoiceId, invoiceId));
  const totalPaid = payments.reduce((s, p) => s + parseFloat(p.amountCad ?? "0"), 0);
  const total = parseFloat(invoice.totalCad);
  await db.update(apInvoicesTable).set({ amountPaid: totalPaid.toFixed(2), balance: (total - totalPaid).toFixed(2) }).where(eq(apInvoicesTable.id, invoiceId));
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await guard(); if (unauth) return unauth;
  const { id } = IdParam.parse(await params);
  const [payment] = await db.select({
    id: apPaymentsTable.id, supplierId: apPaymentsTable.supplierId, supplierName: contactsTable.name,
    paymentNumber: apPaymentsTable.paymentNumber, paymentDate: apPaymentsTable.paymentDate,
    bankAccountCad: apPaymentsTable.bankAccountCad, bankAccountUsd: apPaymentsTable.bankAccountUsd,
    paymentMethod: apPaymentsTable.paymentMethod, referenceProof: apPaymentsTable.referenceProof,
    linkedInvoiceNum: apPaymentsTable.linkedInvoiceNum, linkedInvoiceId: apPaymentsTable.linkedInvoiceId,
    amountCad: apPaymentsTable.amountCad, currency: apPaymentsTable.currency,
    amountUsd: apPaymentsTable.amountUsd, exchangeRate: apPaymentsTable.exchangeRate,
    createdAt: apPaymentsTable.createdAt, updatedAt: apPaymentsTable.updatedAt,
  }).from(apPaymentsTable).leftJoin(contactsTable, eq(apPaymentsTable.supplierId, contactsTable.id)).where(eq(apPaymentsTable.id, id));
  if (!payment) return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  return NextResponse.json(payment);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await guard(); if (unauth) return unauth;
  const { id } = IdParam.parse(await params);
  const body = UpdateApPaymentBody.parse(await req.json());
  const update: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) { if (v !== undefined) update[k] = v === "" ? null : v; }
  if (update.paymentDate) update.paymentDate = new Date(update.paymentDate as string);

  const [before] = await db.select().from(apPaymentsTable).where(eq(apPaymentsTable.id, id));
  if (!before) return NextResponse.json({ error: "Payment not found" }, { status: 404 });

  if (update.linkedInvoiceId) {
    const [inv] = await db.select({ invoiceNumber: apInvoicesTable.invoiceNumber }).from(apInvoicesTable).where(eq(apInvoicesTable.id, update.linkedInvoiceId as number));
    update.linkedInvoiceNum = inv?.invoiceNumber ?? null;
  } else if (update.linkedInvoiceId === null) {
    update.linkedInvoiceNum = null;
  }

  const [payment] = await db.update(apPaymentsTable).set(update).where(eq(apPaymentsTable.id, id)).returning();
  const ids = new Set<number>();
  if (before.linkedInvoiceId) ids.add(before.linkedInvoiceId);
  const newId = (update.linkedInvoiceId ?? before.linkedInvoiceId) as number | null;
  if (newId) ids.add(newId);
  for (const iid of ids) await recomputeInvoiceBalance(iid);
  return NextResponse.json(payment);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauth = await guard(); if (unauth) return unauth;
  const { id } = IdParam.parse(await params);
  const [payment] = await db.select().from(apPaymentsTable).where(eq(apPaymentsTable.id, id));
  if (!payment) return new NextResponse(null, { status: 404 });
  await db.delete(apPaymentsTable).where(eq(apPaymentsTable.id, id));
  if (payment.linkedInvoiceId) await recomputeInvoiceBalance(payment.linkedInvoiceId);
  return new NextResponse(null, { status: 204 });
}
