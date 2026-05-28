import { db } from "@/db";
import { glEntriesTable } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

// Standard account numbers — aligned with TuniOlive chart of accounts
export const GL_ACCOUNTS = {
  ACCOUNTS_RECEIVABLE: "1100",
  BANK_CAD: "1010",
  BANK_USD: "1020",
  ACCOUNTS_PAYABLE: "2000",
  GST_RECOVERABLE: "2310",
  QST_RECOVERABLE: "2315",
  SALES_REVENUE: "4000",
};

async function getNextEntryNumber(): Promise<number> {
  const [{ maxEntry }] = await db
    .select({ maxEntry: sql<number>`coalesce(max(entry_number), 0)` })
    .from(glEntriesTable);
  return (maxEntry ?? 0) + 1;
}

function toDate(d: string | Date | null | undefined): Date {
  if (!d) return new Date();
  if (d instanceof Date) return d;
  const str = String(d).slice(0, 10);
  const [y, m, day] = str.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day));
}

// ─── Reverse all GL entries linked to a source document ─────────────────────
export async function reverseGlEntries(sourceType: string, sourceId: string): Promise<void> {
  const existing = await db
    .select()
    .from(glEntriesTable)
    .where(
      and(
        eq(glEntriesTable.sourceType, sourceType),
        eq(glEntriesTable.sourceId, sourceId),
        eq(glEntriesTable.isReversing, false)
      )
    );

  if (existing.length === 0) return;

  let nextEntry = await getNextEntryNumber();

  await db.insert(glEntriesTable).values(
    existing.map((e, i) => ({
      entryNumber: nextEntry + i,
      date: new Date(),
      documentType: e.documentType,
      documentNumber: e.documentNumber ? `REV-${e.documentNumber}` : null,
      accountNumber: e.accountNumber,
      currency: e.currency,
      // Swap debit and credit for reversal
      debit: e.credit ?? null,
      credit: e.debit ?? null,
      description: `Reversal: ${e.description ?? ""}`,
      sourceType,
      sourceId,
      isReversing: true,
      contactId: e.contactId,
      notes: e.notes,
    }))
  );
}

// ─── Post AP Invoice to GL ───────────────────────────────────────────────────
// Dr: Expense GL account     amountCad
// Dr: 2310 GST Recoverable   gst
// Dr: 2315 QST Recoverable   qst
// Cr: 2000 Accounts Payable  totalCad
export async function postApInvoiceToGl(invoice: {
  id: number;
  invoiceDate: Date | string;
  invoiceNumber?: string | null;
  amountCad: string;
  gst: string;
  qst: string;
  totalCad: string;
  glAccount?: string | null;
  currency: string;
}): Promise<void> {
  const date = toDate(invoice.invoiceDate);
  const docNum = invoice.invoiceNumber ?? `AP-${invoice.id}`;
  const sourceId = String(invoice.id);
  const amount = parseFloat(invoice.amountCad);
  const gst = parseFloat(invoice.gst ?? "0");
  const qst = parseFloat(invoice.qst ?? "0");
  const total = parseFloat(invoice.totalCad);

  let nextEntry = await getNextEntryNumber();
  const entries = [];

  // Dr: Expense account (only if GL account is set and amount > 0)
  if (invoice.glAccount && amount > 0) {
    entries.push({
      entryNumber: nextEntry++,
      date,
      documentType: "AP",
      documentNumber: docNum,
      accountNumber: invoice.glAccount,
      currency: invoice.currency,
      debit: invoice.amountCad,
      credit: null,
      description: `AP Invoice ${docNum} — Expense`,
      sourceType: "ap_invoice",
      sourceId,
      isReversing: false,
    });
  }

  // Dr: GST Recoverable
  if (gst > 0) {
    entries.push({
      entryNumber: nextEntry++,
      date,
      documentType: "AP",
      documentNumber: docNum,
      accountNumber: GL_ACCOUNTS.GST_RECOVERABLE,
      currency: "CAD",
      debit: invoice.gst,
      credit: null,
      description: `GST on AP Invoice ${docNum}`,
      sourceType: "ap_invoice",
      sourceId,
      isReversing: false,
    });
  }

  // Dr: QST Recoverable
  if (qst > 0) {
    entries.push({
      entryNumber: nextEntry++,
      date,
      documentType: "AP",
      documentNumber: docNum,
      accountNumber: GL_ACCOUNTS.QST_RECOVERABLE,
      currency: "CAD",
      debit: invoice.qst,
      credit: null,
      description: `QST on AP Invoice ${docNum}`,
      sourceType: "ap_invoice",
      sourceId,
      isReversing: false,
    });
  }

  // Cr: Accounts Payable
  if (total > 0) {
    entries.push({
      entryNumber: nextEntry++,
      date,
      documentType: "AP",
      documentNumber: docNum,
      accountNumber: GL_ACCOUNTS.ACCOUNTS_PAYABLE,
      currency: "CAD",
      debit: null,
      credit: invoice.totalCad,
      description: `AP Invoice ${docNum} — Payable`,
      sourceType: "ap_invoice",
      sourceId,
      isReversing: false,
    });
  }

  if (entries.length > 0) {
    await db.insert(glEntriesTable).values(entries);
  }
}

// ─── Post AR Invoice to GL ───────────────────────────────────────────────────
// Dr: 1100 Accounts Receivable   total
// Cr: [glRevenueAccount]         total
export async function postArInvoiceToGl(invoice: {
  id: number;
  invoiceDate: Date | string;
  invoiceNumber?: string | null;
  glRevenueAccount?: string | null;
  total: number; // sum of qty * price from line items
}): Promise<void> {
  if (invoice.total <= 0) return;

  const revenueAccount = invoice.glRevenueAccount || GL_ACCOUNTS.SALES_REVENUE;
  const date = toDate(invoice.invoiceDate);
  const docNum = invoice.invoiceNumber ?? `AR-${invoice.id}`;
  const sourceId = String(invoice.id);
  const amount = invoice.total.toFixed(2);

  let nextEntry = await getNextEntryNumber();

  await db.insert(glEntriesTable).values([
    {
      entryNumber: nextEntry,
      date,
      documentType: "AR",
      documentNumber: docNum,
      accountNumber: GL_ACCOUNTS.ACCOUNTS_RECEIVABLE,
      currency: "CAD",
      debit: amount,
      credit: null,
      description: `AR Invoice ${docNum} — Receivable`,
      sourceType: "ar_invoice",
      sourceId,
      isReversing: false,
    },
    {
      entryNumber: nextEntry + 1,
      date,
      documentType: "AR",
      documentNumber: docNum,
      accountNumber: revenueAccount,
      currency: "CAD",
      debit: null,
      credit: amount,
      description: `AR Invoice ${docNum} — Revenue`,
      sourceType: "ar_invoice",
      sourceId,
      isReversing: false,
    },
  ]);
}

// ─── Post AR Payment to GL (when invoice marked Paid) ───────────────────────
// Dr: 1010 Bank CAD              total
// Cr: 1100 Accounts Receivable   total
export async function postArPaymentToGl(invoice: {
  id: number;
  invoiceDate: Date | string;
  invoiceNumber?: string | null;
  total: number;
}): Promise<void> {
  if (invoice.total <= 0) return;

  const date = toDate(invoice.invoiceDate);
  const docNum = invoice.invoiceNumber ?? `AR-${invoice.id}`;
  const sourceId = `payment-${invoice.id}`;
  const amount = invoice.total.toFixed(2);

  let nextEntry = await getNextEntryNumber();

  await db.insert(glEntriesTable).values([
    {
      entryNumber: nextEntry,
      date,
      documentType: "RC", // Receipt
      documentNumber: docNum,
      accountNumber: GL_ACCOUNTS.BANK_CAD,
      currency: "CAD",
      debit: amount,
      credit: null,
      description: `Payment received — AR Invoice ${docNum}`,
      sourceType: "ar_payment",
      sourceId,
      isReversing: false,
    },
    {
      entryNumber: nextEntry + 1,
      date,
      documentType: "RC",
      documentNumber: docNum,
      accountNumber: GL_ACCOUNTS.ACCOUNTS_RECEIVABLE,
      currency: "CAD",
      debit: null,
      credit: amount,
      description: `Payment received — AR Invoice ${docNum}`,
      sourceType: "ar_payment",
      sourceId,
      isReversing: false,
    },
  ]);
}
