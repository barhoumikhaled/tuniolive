import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { apInvoicesTable, contactsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { ListApInvoicesQueryParams, CreateApInvoiceBody } from "@/lib/validators";

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

export async function GET(req: NextRequest) {
  const unauth = await guard(); if (unauth) return unauth;
  const q = ListApInvoicesQueryParams.parse(Object.fromEntries(req.nextUrl.searchParams));
  const rows = await db.select({
    id: apInvoicesTable.id, supplierId: apInvoicesTable.supplierId, supplierName: contactsTable.name,
    invoiceNumber: apInvoicesTable.invoiceNumber, invoiceDate: apInvoicesTable.invoiceDate,
    dueDate: apInvoicesTable.dueDate, amountCad: apInvoicesTable.amountCad,
    gst: apInvoicesTable.gst, qst: apInvoicesTable.qst, totalCad: apInvoicesTable.totalCad,
    currency: apInvoicesTable.currency, amountUsd: apInvoicesTable.amountUsd,
    exchangeRate: apInvoicesTable.exchangeRate, amountPaid: apInvoicesTable.amountPaid,
    balance: apInvoicesTable.balance, glAccount: apInvoicesTable.glAccount,
    expenseDescription: apInvoicesTable.expenseDescription, createdAt: apInvoicesTable.createdAt,
  }).from(apInvoicesTable).leftJoin(contactsTable, eq(apInvoicesTable.supplierId, contactsTable.id)).orderBy(apInvoicesTable.invoiceDate);

  let f = rows;
  if (q.supplierId) f = f.filter((r) => r.supplierId === q.supplierId);
  if (q.currency) f = f.filter((r) => r.currency === q.currency);
  if (q.glAccount) f = f.filter((r) => r.glAccount?.includes(q.glAccount!));
  if (q.dateFrom) { const d = new Date(q.dateFrom); f = f.filter((r) => r.invoiceDate && new Date(r.invoiceDate) >= d); }
  if (q.dateTo) { const d = new Date(q.dateTo); f = f.filter((r) => r.invoiceDate && new Date(r.invoiceDate) <= d); }
  const result = f.map((r) => ({ ...r, status: computeStatus(r.totalCad, r.amountPaid) }));
  return NextResponse.json(q.status ? result.filter((r) => r.status === q.status) : result);
}

export async function POST(req: NextRequest) {
  const unauth = await guard(); if (unauth) return unauth;
  const body = CreateApInvoiceBody.parse(await req.json());
  const { gst, qst } = body.applyTaxes === false
    ? { gst: "0.00", qst: "0.00" }
    : await computeTaxes(body.supplierId, String(body.amountCad), body.currency);
  const a = parseFloat(String(body.amountCad));
  const totalCad = (a + parseFloat(gst) + parseFloat(qst)).toFixed(2);
  const [invoice] = await db.insert(apInvoicesTable).values({
    supplierId: body.supplierId, invoiceNumber: body.invoiceNumber ?? null,
    invoiceDate: new Date(body.invoiceDate), dueDate: body.dueDate ? new Date(body.dueDate) : null,
    poNumber: body.poNumber ?? null, receivingNumber: body.receivingNumber ?? null,
    amountCad: String(body.amountCad), gst, qst, totalCad, currency: body.currency,
    amountUsd: body.amountUsd ? String(body.amountUsd) : null,
    exchangeRate: body.exchangeRate ? String(body.exchangeRate) : null,
    amountPaid: "0", balance: totalCad,
    glAccount: body.glAccount ?? null, expenseDescription: body.expenseDescription ?? null,
    referenceId: body.referenceId ?? null, referenceDescription: body.referenceDescription ?? null,
  }).returning();
  return NextResponse.json({ ...invoice, status: computeStatus(invoice.totalCad, invoice.amountPaid) }, { status: 201 });
}
