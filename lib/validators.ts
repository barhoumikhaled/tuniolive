import { z } from "zod";

// ─── Contacts ────────────────────────────────────────────────────────────────
export const ListContactsQueryParams = z.object({
  type: z.string().optional(),
  search: z.string().optional(),
});

export const CreateContactBody = z.object({
  name: z.string().min(1),
  type: z.string().default("Supplier"),
  address: z.string().nullish(),
  city: z.string().nullish(),
  country: z.string().nullish(),
  phone: z.string().nullish(),
  email: z.string().nullish(),
  gstNumber: z.string().nullish(),
  qstNumber: z.string().nullish(),
});

export const IdParam = z.object({ id: z.coerce.number().int().positive() });

export const UpdateContactBody = CreateContactBody.partial();

// ─── AP Invoices ─────────────────────────────────────────────────────────────
export const ListApInvoicesQueryParams = z.object({
  supplierId: z.coerce.number().optional(),
  currency: z.string().optional(),
  glAccount: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  status: z.string().optional(),
});

export const CreateApInvoiceBody = z.object({
  supplierId: z.number().int().positive(),
  invoiceNumber: z.string().nullish(),
  invoiceDate: z.string(),
  dueDate: z.string().nullish(),
  poNumber: z.string().nullish(),
  receivingNumber: z.string().nullish(),
  amountCad: z.union([z.string(), z.number()]),
  gst: z.union([z.string(), z.number()]).nullish(),
  qst: z.union([z.string(), z.number()]).nullish(),
  totalCad: z.union([z.string(), z.number()]).nullish(),
  currency: z.string().default("CAD"),
  amountUsd: z.union([z.string(), z.number()]).nullish(),
  exchangeRate: z.union([z.string(), z.number()]).nullish(),
  glAccount: z.string().nullish(),
  expenseDescription: z.string().nullish(),
  referenceId: z.string().nullish(),
  referenceDescription: z.string().nullish(),
});

export const UpdateApInvoiceBody = CreateApInvoiceBody.partial();

// ─── AP Payments ─────────────────────────────────────────────────────────────
export const ListApPaymentsQueryParams = z.object({
  supplierId: z.coerce.number().optional(),
});

export const CreateApPaymentBody = z.object({
  supplierId: z.number().int().positive(),
  paymentNumber: z.string().nullish(),
  paymentDate: z.string(),
  bankAccountCad: z.string().nullish(),
  bankAccountUsd: z.string().nullish(),
  paymentMethod: z.string().nullish(),
  referenceProof: z.string().nullish(),
  linkedInvoiceId: z.number().int().positive().nullish(),
  amountCad: z.union([z.string(), z.number()]),
  currency: z.string().default("CAD"),
  amountUsd: z.union([z.string(), z.number()]).nullish(),
  exchangeRate: z.union([z.string(), z.number()]).nullish(),
});

export const UpdateApPaymentBody = CreateApPaymentBody.partial();

// ─── AR Invoices ─────────────────────────────────────────────────────────────
export const ListArInvoicesQueryParams = z.object({
  status: z.string().optional(),
});

export const CreateArInvoiceBody = z.object({
  invoiceNumber: z.string().nullish(),
  customerId: z.number().int().nullish(),
  customerName: z.string().nullish(),
  invoiceDate: z.string(),
  dueDate: z.string().nullish(),
  notes: z.string().nullish(),
  paymentStatus: z.string().nullish(),
  paymentDate: z.string().nullish(),
  lineItems: z
    .array(
      z.object({
        description: z.string().nullish(),
        qtyBox: z.string().nullish(),
        priceBox: z.string().nullish(),
      })
    )
    .optional(),
});

export const UpdateArInvoiceBody = CreateArInvoiceBody.partial();

// ─── GL Accounts ─────────────────────────────────────────────────────────────
export const ListGlAccountsQueryParams = z.object({
  type: z.string().optional(),
  active: z
    .string()
    .transform((v) => v === "true")
    .optional(),
});

export const CreateGlAccountBody = z.object({
  accountNumber: z.string().min(1),
  accountName: z.string().min(1),
  type: z.string(),
  parentAccount: z.string().nullish(),
  active: z.boolean().default(true),
});

export const UpdateGlAccountBody = CreateGlAccountBody.partial();

// ─── GL Entries ──────────────────────────────────────────────────────────────
export const ListGlEntriesQueryParams = z.object({
  accountNumber: z.string().optional(),
  documentType: z.string().optional(),
  currency: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const CreateGlEntriesBody = z.object({
  date: z.string(),
  documentType: z.string().nullish(),
  documentNumber: z.string().nullish(),
  lines: z.array(
    z.object({
      accountNumber: z.string(),
      currency: z.string().default("CAD"),
      debit: z.string().nullish(),
      credit: z.string().nullish(),
      contactId: z.coerce.string().nullish(),
      description: z.string().nullish(),
      exchangeRate: z.string().nullish(),
      amountInCad: z.string().nullish(),
      createdBy: z.string().nullish(),
      notes: z.string().nullish(),
    })
  ),
});

export const UpdateGlEntryBody = z.object({
  date: z.string().optional(),
  documentType: z.string().nullish(),
  documentNumber: z.string().nullish(),
  accountNumber: z.string().optional(),
  currency: z.string().optional(),
  debit: z.string().nullish(),
  credit: z.string().nullish(),
  description: z.string().nullish(),
  exchangeRate: z.string().nullish(),
  amountInCad: z.string().nullish(),
});

// ─── Reports ─────────────────────────────────────────────────────────────────
export const GetTrialBalanceQueryParams = z.object({
  asOf: z.string().optional(),
});

export const GetProfitLossQueryParams = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const GetBalanceSheetQueryParams = z.object({
  asOf: z.string().optional(),
});

// ─── Health ──────────────────────────────────────────────────────────────────
export const HealthCheckResponse = z.object({ status: z.string() });
