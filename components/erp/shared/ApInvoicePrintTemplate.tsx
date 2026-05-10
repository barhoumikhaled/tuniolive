"use client";
import Image from 'next/image'
import { useRef } from "react";
import { fmtCad, fmtDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

function safeFloat(value: string | number | null | undefined): number {
  const n = parseFloat(String(value ?? ""));
  return isNaN(n) ? 0 : n;
}

interface ApPaymentLine {
  id: number;
  paymentNumber?: string | null;
  paymentDate?: string | null;
  paymentMethod?: string | null;
  amountCad?: string | null;
}

interface ApInvoiceData {
  invoiceNumber?: string | null;
  supplierName?: string | null;
  invoiceDate: string;
  dueDate?: string | null;
  amountCad?: string | null;
  gst?: string | null;
  qst?: string | null;
  totalCad?: string | null;
  amountPaid?: string | null;
  balance?: string | null;
  status?: string | null;
  glAccount?: string | null;
  expenseDescription?: string | null;
  currency?: string | null;
  payments?: ApPaymentLine[];
}

interface Props {
  invoice: ApInvoiceData;
}

export function ApInvoicePrintTemplate({ invoice }: Props) {
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
  <title>AP Invoice ${invoice.invoiceNumber ?? ""}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; color: #1a1a1a; background: #fff; }
    .page { max-width: 820px; margin: 0 auto; padding: 40px; }

    .inv-header { display: flex; justify-content: space-between; align-items: flex-start; background: #ffffff; color: #1E4D2B; padding: 28px 32px; border-radius: 4px 4px 0 0; }
    .inv-header-left { display: flex; flex-direction: column; gap: 6px; }
    .brand { display: flex; align-items: center; gap: 10px; }
    .brand-icon { width: 50px; height: 50px; background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .brand-icon svg { width: 28px; height: 28px; fill: #1E4D2B; }
    .brand-name { font-size: 20px; font-weight: 700; letter-spacing: 0.5px; color: #1E4D2B; }
    .brand-tagline { font-size: 11px; opacity: 0.8; margin-top: 2px; color: #1E4D2B; }
    .inv-title { font-size: 28px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase; color: #1E4D2B; text-align: right; }
    .inv-subtitle { font-size: 11px; opacity: 0.85; text-align: right; margin-top: 2px; letter-spacing: 1px; color: #1E4D2B; }
    .inv-number { font-size: 14px; font-weight: 600; text-align: right; opacity: 0.9; margin-top: 4px; color: #1E4D2B; }

    .inv-meta { display: flex; gap: 0; border: 1px solid #e0e0e0; border-top: none; }
    .inv-meta-cell { flex: 1; padding: 14px 18px; border-right: 1px solid #e0e0e0; }
    .inv-meta-cell:last-child { border-right: none; }
    .inv-meta-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: #6b7280; margin-bottom: 4px; }
    .inv-meta-value { font-size: 13px; font-weight: 600; color: #111; }

    .inv-bill { padding: 22px 18px; border: 1px solid #e0e0e0; border-top: none; background: #f9fafb; }
    .inv-bill-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #6b7280; margin-bottom: 6px; }
    .inv-bill-name { font-size: 16px; font-weight: 700; color: #111; }

    .status-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .status-paid { background: #d1fae5; color: #065f46; }
    .status-partial { background: #dbeafe; color: #1e40af; }
    .status-unpaid { background: #fee2e2; color: #991b1b; }

    .inv-table-section { border: 1px solid #e0e0e0; border-top: none; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #f9fafb; color: #1E4D2B; border-bottom: 2px solid #1E4D2B; }
    thead th { padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    thead th.num { text-align: right; }
    tbody tr { border-bottom: 1px solid #e8e8e8; }
    tbody tr:last-child { border-bottom: none; }
    tbody tr:nth-child(even) { background: #f9fafb; }
    tbody td { padding: 9px 14px; font-size: 13px; color: #1a1a1a; vertical-align: middle; }
    tbody td.num { text-align: right; font-variant-numeric: tabular-nums; }
    tbody td.desc { font-weight: 500; }

    .inv-totals { display: flex; justify-content: flex-end; border: 1px solid #e0e0e0; border-top: none; padding: 0; }
    .inv-totals-table { width: 320px; border-left: 1px solid #e0e0e0; }
    .totals-row { display: flex; justify-content: space-between; padding: 8px 18px; border-bottom: 1px solid #e8e8e8; font-size: 13px; }
    .totals-row.grand { background: #f9fafb; color: #1E4D2B; border: 2px solid #1E4D2B; font-size: 15px; font-weight: 700; padding: 12px 18px; border-bottom: 2px solid #1E4D2B; }
    .totals-row.balance { background: #fef3c7; color: #92400e; font-weight: 700; }
    .totals-label { color: inherit; }
    .totals-value { font-variant-numeric: tabular-nums; font-weight: 600; }

    .inv-notes { padding: 18px; border: 1px solid #e0e0e0; border-top: none; }
    .inv-notes-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #6b7280; margin-bottom: 6px; }
    .inv-notes-text { font-size: 13px; color: #374151; line-height: 1.5; }

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

  const amount = safeFloat(invoice.amountCad);
  const gst = safeFloat(invoice.gst);
  const qst = safeFloat(invoice.qst);
  const total = safeFloat(invoice.totalCad) || amount + gst + qst;
  const paid = safeFloat(invoice.amountPaid);
  const balance = invoice.balance != null ? safeFloat(invoice.balance) : total - paid;

  const status = (invoice.status ?? "Unpaid").toLowerCase();
  const statusClass =
    status === "paid" ? "status-paid" : status === "partial" ? "status-partial" : "status-unpaid";

  const payments = invoice.payments ?? [];

  return (
    <div>
      <Button variant="outline" size="sm" onClick={ handlePrint } className="gap-1.5">
        <Printer className="w-3.5 h-3.5" />
        Print / PDF
      </Button>

      <div className="hidden">
        <div ref={ printRef }>
          <div className="page">
            <div className="inv-header">
              <div className="flex items-center space-x-2">
                <Image src="/tuniolive-black.png" style={ { height: "auto" } } alt="Tunisian Olive oil" width={ 140 } height={ 10 } />
              </div>
              <div>
                <div className="inv-title">Bill</div>
                <div className="inv-subtitle">Supplier Invoice</div>
                <div className="inv-number">{ invoice.invoiceNumber ?? "—" }</div>
              </div>
            </div>

            <div className="inv-meta">
              <div className="inv-meta-cell">
                <div className="inv-meta-label">Invoice Date</div>
                <div className="inv-meta-value">{ fmtDate(invoice.invoiceDate) }</div>
              </div>
              <div className="inv-meta-cell">
                <div className="inv-meta-label">Due Date</div>
                <div className="inv-meta-value">{ fmtDate(invoice.dueDate) }</div>
              </div>
              <div className="inv-meta-cell">
                <div className="inv-meta-label">Status</div>
                <div className="inv-meta-value">
                  <span className={ `status-badge ${statusClass}` }>
                    { invoice.status ?? "Unpaid" }
                  </span>
                </div>
              </div>
              <div className="inv-meta-cell">
                <div className="inv-meta-label">Currency</div>
                <div className="inv-meta-value">{ invoice.currency ?? "CAD" }</div>
              </div>
              <div className="inv-meta-cell">
                <div className="inv-meta-label">GL Account</div>
                <div className="inv-meta-value" style={ { fontFamily: "monospace" } }>{ invoice.glAccount ?? "—" }</div>
              </div>
            </div>

            <div className="inv-bill">
              <div className="inv-bill-label">Bill From (Supplier)</div>
              <div className="inv-bill-name">{ invoice.supplierName ?? "—" }</div>
            </div>

            <div className="inv-table-section">
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th className="num">Amount</th>
                    <th className="num">GST</th>
                    <th className="num">QST</th>
                    <th className="num">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="desc">{ invoice.expenseDescription ?? "Goods / Services received" }</td>
                    <td className="num">{ fmtCad(amount) }</td>
                    <td className="num">{ fmtCad(gst) }</td>
                    <td className="num">{ fmtCad(qst) }</td>
                    <td className="num">{ fmtCad(total) }</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="inv-totals">
              <div className="inv-totals-table">
                <div className="totals-row">
                  <span className="totals-label" style={ { color: "#6b7280" } }>Subtotal</span>
                  <span className="totals-value">{ fmtCad(amount) }</span>
                </div>
                <div className="totals-row">
                  <span className="totals-label" style={ { color: "#6b7280" } }>GST (5%)</span>
                  <span className="totals-value">{ fmtCad(gst) }</span>
                </div>
                <div className="totals-row">
                  <span className="totals-label" style={ { color: "#6b7280" } }>QST (9.975%)</span>
                  <span className="totals-value">{ fmtCad(qst) }</span>
                </div>
                <div className="totals-row grand">
                  <span className="totals-label">Invoice Total</span>
                  <span className="totals-value">{ fmtCad(total) }</span>
                </div>
                <div className="totals-row">
                  <span className="totals-label" style={ { color: "#065f46" } }>Amount Paid</span>
                  <span className="totals-value" style={ { color: "#065f46" } }>{ fmtCad(paid) }</span>
                </div>
                <div className="totals-row balance">
                  <span className="totals-label">Balance Due</span>
                  <span className="totals-value">{ fmtCad(balance) }</span>
                </div>
              </div>
            </div>

            { payments.length > 0 && (
              <div className="inv-table-section" style={ { marginTop: "20px", borderTop: "1px solid #e0e0e0" } }>
                <div style={ { padding: "12px 18px", background: "#f9fafb", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "#6b7280" } }>
                  Payment History
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Payment #</th>
                      <th>Date</th>
                      <th>Method</th>
                      <th className="num">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    { payments.map((p) => (
                      <tr key={ p.id }>
                        <td className="desc">{ p.paymentNumber ?? "—" }</td>
                        <td>{ fmtDate(p.paymentDate) }</td>
                        <td>{ p.paymentMethod ?? "—" }</td>
                        <td className="num">{ fmtCad(p.amountCad) }</td>
                      </tr>
                    )) }
                  </tbody>
                </table>
              </div>
            ) }

            { invoice.expenseDescription && (
              <div className="inv-notes">
                <div className="inv-notes-label">Description / Notes</div>
                <div className="inv-notes-text">{ invoice.expenseDescription }</div>
              </div>
            ) }

            <div className="inv-footer">
              <p>TuniOlive Inc. &nbsp;·&nbsp; Quebec, Canada &nbsp;·&nbsp; Internal AP record — for filing &amp; reprint</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
