import { NextResponse } from "next/server";
import { db } from "@/db";
import { apInvoicesTable, contactsTable } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.select({
    id: apInvoicesTable.id, invoiceNumber: apInvoicesTable.invoiceNumber,
    supplierName: contactsTable.name, invoiceDate: apInvoicesTable.invoiceDate,
    dueDate: apInvoicesTable.dueDate, totalCad: apInvoicesTable.totalCad,
    currency: apInvoicesTable.currency, amountPaid: apInvoicesTable.amountPaid,
    balance: apInvoicesTable.balance, glAccount: apInvoicesTable.glAccount,
  }).from(apInvoicesTable).leftJoin(contactsTable, eq(apInvoicesTable.supplierId, contactsTable.id)).orderBy(desc(apInvoicesTable.invoiceDate)).limit(10);

  return NextResponse.json(rows.map((r) => {
    const total = parseFloat(r.totalCad ?? "0");
    const paid = parseFloat(r.amountPaid ?? "0");
    const balance = total - paid;
    const status = balance <= 0 ? "Paid" : paid > 0 ? "Partial" : "Unpaid";
    return { ...r, status };
  }));
}
