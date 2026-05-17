"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

function safeFloat(v: string | number | null | undefined): number {
  const n = parseFloat(String(v ?? ""));
  return isNaN(n) ? 0 : n;
}

interface LineItem {
  id?: number;
  item?: string | null;
  description?: string | null;
  qtyBox?: string | null;
  priceBox?: string | null;
  priceUnit?: string | null;
}

interface InvoiceData {
  invoiceNumber?: string | null;
  customerName?: string | null;
  customerAddress?: string | null;
  customerCity?: string | null;
  invoiceDate: string;
  dueDate?: string | null;
  paymentTerms?: string | null;
  paymentStatus?: string | null;
  notes?: string | null;
  lineItems?: LineItem[];
}

function calcTotal(line: LineItem): number {
  return safeFloat(line.qtyBox) * safeFloat(line.priceBox);
}

function fmtShortDate(s: string | null | undefined): string {
  if (!s) return "";
  const str = typeof s === "string" ? s : new Date(s).toISOString();
  const dateOnly = str.slice(0, 10);
  const [year, month, day] = dateOnly.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return (
    d.toLocaleString("en-US", { month: "short" }) +
    " " +
    d.getDate() +
    " - " +
    String(d.getFullYear()).slice(2)
  );
}

function dollar(n: number | string | null | undefined): string {
  return "$" + safeFloat(n).toFixed(2);
}

function buildHtml(invoice: InvoiceData, logoUrl: string): string {
  const items = invoice.lineItems ?? [];
  const grandTotal = items.reduce((s, l) => s + calcTotal(l), 0);

  const rowsHtml =
    items.length === 0
      ? `<tr><td colspan="6" style="text-align:center;color:#aaa;padding:20px">No line items</td></tr>`
      : items
        .map(
          (item, i) => `<tr>
            <td style="text-align:center;border:1px solid #ccc;padding:6px 10px">${item.item ?? i + 1}</td>
            <td style="border:1px solid #ccc;padding:6px 10px">${item.description ?? ""}</td>
            <td style="text-align:center;border:1px solid #ccc;padding:6px 10px">${item.qtyBox ? item.qtyBox + " Box" : ""}</td>
            <td style="text-align:right;border:1px solid #ccc;padding:6px 10px">${item.priceBox ? dollar(item.priceBox) : ""}</td>
            <td style="text-align:right;border:1px solid #ccc;padding:6px 10px">${item.priceUnit ? dollar(item.priceUnit) : ""}</td>
            <td style="text-align:right;border:1px solid #ccc;padding:6px 10px;font-weight:600">${calcTotal(item) > 0 ? dollar(calcTotal(item)) : ""}</td>
          </tr>`
        )
        .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Invoice ${invoice.invoiceNumber ?? ""}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #111; background: #fff; }
  .page { max-width: 860px; margin: 0 auto; padding: 32px 40px; }
  table { border-collapse: collapse; width: 100%; }
  @media print {
    html, body { width: 100%; height: 100%; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { padding: 20px 24px; }
  }
</style>
</head>
<body>
<div class="page">

  <table style="margin-bottom:20px">
    <tr>
      <td style="vertical-align:top;width:60%">
        <img src="${logoUrl}" alt="TuniOlive"
          style="height:70px;width:auto;object-fit:contain"
          onerror="this.outerHTML='<span style=font-size:22px;font-weight:800>TuniOlive</span>'"/>
        <div style="font-size:11px;color:#444;line-height:1.7;margin-top:8px">
          3203 Rue Noorduyn, Saint-Laurent, QC H4R 1A1<br/>
          Email: info@tuniolive.com<br/>
          Email: Tuniolive518@gmail.com<br/>
          Phone: (514) 601-0603
        </div>
      </td>
      <td style="vertical-align:top;width:40%">
        <table style="border:1px solid #000;float:right;width:230px">
          <tr>
            <td colspan="2" style="background:#000;color:#fff;text-align:center;font-size:13px;font-weight:700;padding:5px 12px;letter-spacing:1px;text-transform:uppercase">
              FACTURE / INVOICE
            </td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:5px 10px;font-weight:600">Facture / Invoice</td>
            <td style="border:1px solid #000;padding:5px 10px;font-weight:700;text-align:right">${invoice.invoiceNumber ?? ""}</td>
          </tr>
          <tr>
            <td style="border:1px solid #000;padding:5px 10px;font-weight:600">Date M/J-D/A-Y</td>
            <td style="border:1px solid #000;padding:5px 10px;font-weight:700;text-align:right">${fmtShortDate(invoice.invoiceDate)}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

<!-- Bill to / Ship to -->
  <table style="margin-bottom:16px">
    <tr>
      <td style="width:50%;vertical-align:top;padding-right:20px">
        <div style="font-weight:700;margin-bottom:4px">Vendu a / Sold to:</div>
        <div style="line-height:1.6">
          ${invoice.customerName ?? ""}
          ${invoice.customerAddress ? "<br/>" + invoice.customerAddress : ""}
          ${invoice.customerCity ? "<br/>" + invoice.customerCity : ""}
        </div>
      </td>
      <td style="width:50%;vertical-align:top">
        <div style="font-weight:700;margin-bottom:4px">Expedie a / Shipped to:</div>
        <div style="line-height:1.6">
          ${invoice.customerName ?? ""}
          ${invoice.customerAddress ? "<br/>" + invoice.customerAddress : ""}
          ${invoice.customerCity ? "<br/>" + invoice.customerCity : ""}
        </div>
      </td>
    </tr>
  </table>

  <!-- Notes -->
  <div style="margin-bottom:14px">
    <span style="font-weight:700">Notes:</span>
    <span style="color:#444;margin-left:6px">${invoice.notes ?? ""}</span>
  </div>

  <!-- Delivery / Terms / Order -->
  <table style="border:1px solid #ccc;margin-bottom:0">
    <thead>
      <tr style="background:#f0f0f0">
        <th style="border:1px solid #ccc;padding:5px 10px;text-align:center;font-size:11px">Instruction de laivraison<br/>delivery instruction</th>
        <th style="border:1px solid #ccc;padding:5px 10px;text-align:center;font-size:11px">Delai<br/>Terms</th>
        <th style="border:1px solid #ccc;padding:5px 10px;text-align:center;font-size:11px">No Commande de Client<br/>Customer Order no.</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="border:1px solid #ccc;padding:5px 10px;text-align:center;font-size:11px"></td>
        <td style="border:1px solid #ccc;padding:5px 10px;text-align:center;font-size:11px">${invoice.paymentTerms ?? "Net 30"}</td>
        <td style="border:1px solid #ccc;padding:5px 10px;text-align:center;font-size:11px"></td>
      </tr>
    </tbody>
  </table>

  <!-- Line items -->
  <table style="border:1px solid #ccc;border-top:none">
    <thead>
      <tr style="background:#f0f0f0">
        <th style="border:1px solid #ccc;padding:6px 10px;text-align:center;font-size:11px;width:60px">Item #</th>
        <th style="border:1px solid #ccc;padding:6px 10px;text-align:center;font-size:11px">Description</th>
        <th style="border:1px solid #ccc;padding:6px 10px;text-align:center;font-size:11px;width:110px">Quantite / Quantity</th>
        <th style="border:1px solid #ccc;padding:6px 10px;text-align:center;font-size:11px;width:110px">Price per Box</th>
        <th style="border:1px solid #ccc;padding:6px 10px;text-align:center;font-size:11px;width:110px">Price per Btl/Tin.</th>
        <th style="border:1px solid #ccc;padding:6px 10px;text-align:center;font-size:11px;width:120px">Total Price/Prix</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
    <tfoot>
      <tr>
        <td colspan="5" style="text-align:right;border:1px solid #ccc;padding:6px 10px;background:#fafafa;font-weight:700">Subtotal:</td>
        <td style="text-align:right;border:1px solid #ccc;padding:6px 10px;background:#fafafa;font-weight:700">${dollar(grandTotal)}</td>
      </tr>
      <tr>
        <td colspan="5" style="text-align:right;border:1px solid #ccc;padding:8px 10px;font-weight:800;font-size:14px">Total:</td>
        <td style="text-align:right;border:1px solid #ccc;padding:8px 10px;font-weight:800;font-size:14px"><strong>${dollar(grandTotal)}</strong></td>
      </tr>
    </tfoot>
  </table>

  <!-- Payment options + Signature -->
  <table style="margin-top:28px">
    <tr>
      <td style="vertical-align:top;padding-right:20px">
        <div style="font-weight:700;font-size:11px;margin-bottom:6px">Payment Options:</div>
        <div style="font-size:11px;line-height:1.8;color:#333">
          You can make an <strong>Interac e-transfer</strong> to tuniolive518@gmail.com<br/>
          You can issue a cheque payable to TuniOlive Inc.<br/>
          We also accept cash on delivery or cheque<br/>
          You can also make a direct deposit. Direct deposit information is available upon request.
        </div>
      </td>
      <td style="vertical-align:top;padding-right:20px">
        <div style="font-weight:700;font-size:11px;margin-bottom:6px">Options de paiement :</div>
        <div style="font-size:11px;line-height:1.8;color:#333">
          Vous pouvez faire un <strong>virement Interac</strong> à tuniolive518@gmail.com<br/>
          Vous pouvez émettre un chèque au nom de TuniOlive Inc.<br/>
          Nous acceptons également le paiement comptant à la livraison ou par chèque<br/>
          Vous pouvez aussi effectuer un dépôt direct. Les informations pour le dépôt direct sont disponibles sur demande.
        </div>
      </td>
      <td style="vertical-align:bottom;text-align:center;width:130px">
        <div style="border-top:1px solid #999;margin-top:56px;padding-top:4px;font-size:10px;color:#888">Authorized Signature</div>
      </td>
    </tr>
  </table>

  <div style="margin-top:24px;text-align:center;font-size:10px;color:#aaa;border-top:1px solid #eee;padding-top:12px">
    TuniOlive Inc. &nbsp;&middot;&nbsp; Saint-Laurent, QC &nbsp;&middot;&nbsp; Thank you for your business! / Merci pour votre confiance!
  </div>
</div>
</body>
</html>`;
}

export function InvoicePrintTemplate({ invoice }: { invoice: InvoiceData }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  function handlePrint() {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const logoUrl = window.location.origin + "/tuniolive-black.png";
    const html = buildHtml(invoice, logoUrl);

    // Write into the hidden iframe
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(html);
    doc.close();

    // Wait for images to load before printing
    const tryPrint = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
        // Safari fallback — use the parent window's print on the iframe
        window.frames[0]?.print?.();
      }
    };

    // Give Safari time to render
    const img = doc.querySelector("img");
    if (img && !img.complete) {
      img.onload = () => setTimeout(tryPrint, 100);
      img.onerror = () => setTimeout(tryPrint, 100);
    } else {
      setTimeout(tryPrint, 250);
    }
  }

  return (
    <>
      {/* Hidden iframe — never visible, used only for printing */ }
      <iframe
        ref={ iframeRef }
        style={ {
          position: "fixed",
          top: 0,
          left: 0,
          width: "1px",
          height: "1px",
          opacity: 0,
          border: "none",
          pointerEvents: "none",
        } }
        title="print-frame"
      />
      <Button variant="outline" size="sm" onClick={ handlePrint } className="gap-1.5">
        <Printer className="w-3.5 h-3.5" />
        Print / PDF
      </Button>
    </>
  );
}