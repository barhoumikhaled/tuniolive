import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { apPaymentsTable, contactsTable, apInvoicesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { ListApPaymentsQueryParams, CreateApPaymentBody } from "@/lib/validators";

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

export async function GET(req: NextRequest) {
  const unauth = await guard(); if (unauth) return unauth;
  const q = ListApPaymentsQueryParams.parse(Object.fromEntries(req.nextUrl.searchParams));
  const rows = await db.select({
    id: apPaymentsTable.id, supplierId: apPaymentsTable.supplierId, supplierName: contactsTable.name,
    paymentNumber: apPaymentsTable.paymentNumber, paymentDate: apPaymentsTable.paymentDate,
    bankAccountCad: apPaymentsTable.bankAccountCad, bankAccountUsd: apPaymentsTable.bankAccountUsd,
    paymentMethod: apPaymentsTable.paymentMethod, referenceProof: apPaymentsTable.referenceProof,
    linkedInvoiceNum: apPaymentsTable.linkedInvoiceNum, linkedInvoiceId: apPaymentsTable.linkedInvoiceId,
    amountCad: apPaymentsTable.amountCad, currency: apPaymentsTable.currency,
    amountUsd: apPaymentsTable.amountUsd, exchangeRate: apPaymentsTable.exchangeRate, createdAt: apPaymentsTable.createdAt,
  }).from(apPaymentsTable).leftJoin(contactsTable, eq(apPaymentsTable.supplierId, contactsTable.id)).orderBy(apPaymentsTable.paymentDate);
  let f = rows;
  if (q.supplierId) f = f.filter((r) => r.supplierId === q.supplierId);
  return NextResponse.json(f);
}

export async function POST(req: NextRequest) {
  const unauth = await guard(); if (unauth) return unauth;
  const body = CreateApPaymentBody.parse(await req.json());
  let linkedInvoiceNum: string | null = null;
  if (body.linkedInvoiceId) {
    const [inv] = await db.select({ invoiceNumber: apInvoicesTable.invoiceNumber }).from(apInvoicesTable).where(eq(apInvoicesTable.id, body.linkedInvoiceId));
    linkedInvoiceNum = inv?.invoiceNumber ?? null;
  }
  const [payment] = await db.insert(apPaymentsTable).values({
    supplierId: body.supplierId, paymentNumber: body.paymentNumber ?? null,
    paymentDate: new Date(body.paymentDate), bankAccountCad: body.bankAccountCad ?? null,
    bankAccountUsd: body.bankAccountUsd ?? null, paymentMethod: body.paymentMethod ?? null,
    referenceProof: body.referenceProof ?? null, linkedInvoiceId: body.linkedInvoiceId ?? null,
    linkedInvoiceNum, amountCad: String(body.amountCad), currency: body.currency,
    amountUsd: body.amountUsd ? String(body.amountUsd) : null,
    exchangeRate: body.exchangeRate ? String(body.exchangeRate) : null,
  }).returning();
  if (body.linkedInvoiceId) await recomputeInvoiceBalance(body.linkedInvoiceId);
  return NextResponse.json(payment, { status: 201 });
}
