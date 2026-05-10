"use client";

import { useRef } from "react";
import { fmtCad, fmtDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

const GST_RATE = 0.05;
const QST_RATE = 0.09975;

function safeFloat(value: string | number | null | undefined): number {
  const n = parseFloat(String(value ?? ""));
  return isNaN(n) ? 0 : n;
}

interface LineItem {
  id?: number;
  description?: string | null;
  qtyBox?: string | null;
  priceBox?: string | null;
  gst?: string | null;
  qst?: string | null;
  extendedPrice?: string | null;
}

interface ComputedLine {
  item: LineItem;
  lineSubtotal: number;
  lineGst: number;
  lineQst: number;
  lineTotal: number;
}

interface InvoiceData {
  invoiceNumber?: string | null;
  customerName?: string | null;
  invoiceDate: string;
  dueDate?: string | null;
  paymentStatus?: string | null;
  notes?: string | null;
  lineItems?: LineItem[];
}

interface InvoicePrintTemplateProps {
  invoice: InvoiceData;
}

function computeLines(lineItems: LineItem[]): ComputedLine[] {
  return lineItems.map((item) => {
    const qty = safeFloat(item.qtyBox);
    const price = safeFloat(item.priceBox);
    const lineSubtotal = qty * price;
    const lineGst = item.gst != null ? safeFloat(item.gst) : lineSubtotal * GST_RATE;
    const lineQst = item.qst != null ? safeFloat(item.qst) : lineSubtotal * QST_RATE;
    const lineTotal = item.extendedPrice != null ? safeFloat(item.extendedPrice) : lineSubtotal + lineGst + lineQst;
    return { item, lineSubtotal, lineGst, lineQst, lineTotal };
  });
}

function sumTotals(lines: ComputedLine[]) {
  let subtotal = 0, gst = 0, qst = 0, total = 0;
  for (const l of lines) {
    subtotal += l.lineSubtotal;
    gst += l.lineGst;
    qst += l.lineQst;
    total += l.lineTotal;
  }
  return { subtotal, gst, qst, total };
}

export function InvoicePrintTemplate({ invoice }: InvoicePrintTemplateProps) {
  const printRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${invoice.invoiceNumber ?? ""}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; color: #1a1a1a; background: #fff; }
    .page { max-width: 820px; margin: 0 auto; padding: 40px; }

    /* Header */
    .inv-header { display: flex; justify-content: space-between; align-items: flex-start; background: #2d6a4f; color: #fff; padding: 28px 32px; border-radius: 4px 4px 0 0; }
    .inv-header-left { display: flex; flex-direction: column; gap: 6px; }
    .brand { display: flex; align-items: center; gap: 10px; }
    .brand-icon { width: 36px; height: 36px; background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .brand-icon svg { width: 20px; height: 20px; fill: #2d6a4f; }
    .brand-name { font-size: 20px; font-weight: 700; letter-spacing: 0.5px; }
    .brand-tagline { font-size: 11px; opacity: 0.8; margin-top: 2px; }
    .inv-title { font-size: 28px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase; color: #fff; text-align: right; }
    .inv-number { font-size: 14px; font-weight: 600; text-align: right; opacity: 0.9; margin-top: 4px; }

    /* Meta row */
    .inv-meta { display: flex; gap: 0; border: 1px solid #e0e0e0; border-top: none; }
    .inv-meta-cell { flex: 1; padding: 14px 18px; border-right: 1px solid #e0e0e0; }
    .inv-meta-cell:last-child { border-right: none; }
    .inv-meta-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: #6b7280; margin-bottom: 4px; }
    .inv-meta-value { font-size: 13px; font-weight: 600; color: #111; }

    /* Bill to */
    .inv-bill { padding: 22px 18px; border: 1px solid #e0e0e0; border-top: none; background: #f9fafb; }
    .inv-bill-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #6b7280; margin-bottom: 6px; }
    .inv-bill-name { font-size: 16px; font-weight: 700; color: #111; }

    /* Status badge */
    .status-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .status-paid { background: #d1fae5; color: #065f46; }
    .status-pending { background: #fef9c3; color: #854d0e; }
    .status-overdue { background: #fee2e2; color: #991b1b; }

    /* Line items table */
    .inv-table-section { padding: 0 0 0 0; border: 1px solid #e0e0e0; border-top: none; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #2d6a4f; color: #fff; }
    thead th { padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    thead th.num { text-align: right; }
    tbody tr { border-bottom: 1px solid #e8e8e8; }
    tbody tr:last-child { border-bottom: none; }
    tbody tr:nth-child(even) { background: #f9fafb; }
    tbody td { padding: 9px 14px; font-size: 13px; color: #1a1a1a; vertical-align: middle; }
    tbody td.num { text-align: right; font-variant-numeric: tabular-nums; }
    tbody td.desc { font-weight: 500; }

    /* Totals */
    .inv-totals { display: flex; justify-content: flex-end; border: 1px solid #e0e0e0; border-top: none; padding: 0; }
    .inv-totals-table { width: 300px; border-left: 1px solid #e0e0e0; }
    .totals-row { display: flex; justify-content: space-between; padding: 8px 18px; border-bottom: 1px solid #e8e8e8; font-size: 13px; }
    .totals-row:last-child { border-bottom: none; background: #2d6a4f; color: #fff; font-size: 15px; font-weight: 700; padding: 12px 18px; }
    .totals-label { color: inherit; }
    .totals-value { font-variant-numeric: tabular-nums; font-weight: 600; }

    /* Notes */
    .inv-notes { padding: 18px; border: 1px solid #e0e0e0; border-top: none; }
    .inv-notes-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #6b7280; margin-bottom: 6px; }
    .inv-notes-text { font-size: 13px; color: #374151; line-height: 1.5; }

    /* Footer */
    .inv-footer { margin-top: 32px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e0e0e0; padding-top: 16px; }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { padding: 20px; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
${content.innerHTML}
</body>
</html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  }

  const items = invoice.lineItems ?? [];
  const computedLines = computeLines(items);
  const { subtotal, gst, qst, total } = sumTotals(computedLines);
  const statusClass =
    invoice.paymentStatus === "Paid"
      ? "status-paid"
      : invoice.paymentStatus === "Overdue"
        ? "status-overdue"
        : "status-pending";

  return (
    <div>
      <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
        <Printer className="w-3.5 h-3.5" />
        Print / PDF
      </Button>

      {/* Hidden print template — rendered in DOM but invisible on screen */}
      <div className="hidden">
        <div ref={printRef}>
          <div className="page">
            {/* Header */}
            <div className="inv-header">
              <div className="inv-header-left">
                <div className="brand">
                  <div className="brand-icon">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 8C8 10 5.9 16.17 3.82 19.82C3.17 20.95 1.5 20.5 1.5 19.18V4.5C1.5 3.4 2.4 2.5 3.5 2.5H12C14.76 2.5 17 4.74 17 7.5V8Z"/>
                      <path d="M21.5 12C21.5 16.14 18.14 19.5 14 19.5L8 21.5L10 14.5C10 14.5 11 17.5 14 17.5C16.76 17.5 19 15.26 19 12.5C19 9.74 16.76 7.5 14 7.5H12V5.5H14C18.14 5.5 21.5 8.86 21.5 13V12Z" opacity="0.6"/>
                    </svg>
                  </div>
                  <div>
                    <div className="brand-name">TuniOlive</div>
                    <div className="brand-tagline">Premium Olive Products</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="inv-title">Invoice</div>
                <div className="inv-number">{invoice.invoiceNumber ?? "—"}</div>
              </div>
            </div>

            {/* Meta row */}
            <div className="inv-meta">
              <div className="inv-meta-cell">
                <div className="inv-meta-label">Invoice Date</div>
                <div className="inv-meta-value">{fmtDate(invoice.invoiceDate)}</div>
              </div>
              <div className="inv-meta-cell">
                <div className="inv-meta-label">Due Date</div>
                <div className="inv-meta-value">{fmtDate(invoice.dueDate)}</div>
              </div>
              <div className="inv-meta-cell">
                <div className="inv-meta-label">Status</div>
                <div className="inv-meta-value">
                  <span className={`status-badge ${statusClass}`}>
                    {invoice.paymentStatus ?? "Pending"}
                  </span>
                </div>
              </div>
              <div className="inv-meta-cell">
                <div className="inv-meta-label">GST Reg.</div>
                <div className="inv-meta-value" style={{ fontSize: "11px" }}>RT 0001 0001</div>
              </div>
              <div className="inv-meta-cell">
                <div className="inv-meta-label">QST Reg.</div>
                <div className="inv-meta-value" style={{ fontSize: "11px" }}>1000000000 TQ 0001</div>
              </div>
            </div>

            {/* Bill To */}
            <div className="inv-bill">
              <div className="inv-bill-label">Bill To</div>
              <div className="inv-bill-name">{invoice.customerName ?? "—"}</div>
            </div>

            {/* Line items */}
            <div className="inv-table-section">
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th className="num">Qty (Box)</th>
                    <th className="num">Price / Box</th>
                    <th className="num">Subtotal</th>
                    <th className="num">GST (5%)</th>
                    <th className="num">QST (9.975%)</th>
                    <th className="num">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {computedLines.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", color: "#9ca3af", padding: "20px" }}>
                        No line items
                      </td>
                    </tr>
                  ) : (
                    computedLines.map(({ item, lineSubtotal, lineGst, lineQst, lineTotal }, i) => (
                      <tr key={item.id ?? i}>
                        <td className="desc">{item.description ?? "—"}</td>
                        <td className="num">{item.qtyBox ?? "—"}</td>
                        <td className="num">{fmtCad(safeFloat(item.priceBox))}</td>
                        <td className="num">{fmtCad(lineSubtotal)}</td>
                        <td className="num">{fmtCad(lineGst)}</td>
                        <td className="num">{fmtCad(lineQst)}</td>
                        <td className="num">{fmtCad(lineTotal)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="inv-totals">
              <div className="inv-totals-table">
                <div className="totals-row">
                  <span className="totals-label" style={{ color: "#6b7280" }}>Subtotal</span>
                  <span className="totals-value">{fmtCad(subtotal)}</span>
                </div>
                <div className="totals-row">
                  <span className="totals-label" style={{ color: "#6b7280" }}>GST (5%)</span>
                  <span className="totals-value">{fmtCad(gst)}</span>
                </div>
                <div className="totals-row">
                  <span className="totals-label" style={{ color: "#6b7280" }}>QST (9.975%)</span>
                  <span className="totals-value">{fmtCad(qst)}</span>
                </div>
                <div className="totals-row">
                  <span className="totals-label">Total Due</span>
                  <span className="totals-value">{fmtCad(total)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="inv-notes">
                <div className="inv-notes-label">Notes</div>
                <div className="inv-notes-text">{invoice.notes}</div>
              </div>
            )}

            {/* Footer */}
            <div className="inv-footer">
              <p>TuniOlive Inc. &nbsp;·&nbsp; Quebec, Canada &nbsp;·&nbsp; Thank you for your business!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
