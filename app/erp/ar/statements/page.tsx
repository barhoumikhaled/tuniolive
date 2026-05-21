"use client";

import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { fmtCad, fmtDate } from "@/lib/formatters";
import { AppLayout } from "@/components/erp/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/erp/shared/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { Printer, ChevronRight, Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CustomerSummary {
  customerId: number | null;
  customerName: string | null;
  totalBilled: number;
  totalPaid: number;
  balance: number;
  invoiceCount: number;
  unpaidCount: number;
  lastInvoiceDate: string | null;
}

interface InvoiceRow {
  id: number;
  invoiceNumber: string | null;
  invoiceDate: string;
  dueDate: string | null;
  paymentStatus: string | null;
  paymentDate: string | null;
  amount: number;
  balance: number;
  notes: string | null;
}

interface CustomerStatement {
  customerId: string;
  customerName: string;
  invoices: InvoiceRow[];
  totalBilled: number;
  totalPaid: number;
  balance: number;
}

export default function ArStatements() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const { data: customers = [], isLoading } = useQuery<CustomerSummary[]>({
    queryKey: ["ar-statements"],
    queryFn: () => apiFetch("/ar-statements"),
  });

  const { data: statement } = useQuery<CustomerStatement>({
    queryKey: ["ar-statement", selectedId],
    queryFn: () => apiFetch(`/ar-statements/${selectedId}`),
    enabled: selectedId !== null,
  });

  const selected = customers.find((c) => c.customerId === selectedId);
  const filtered = customers.filter((c) => {
    const matchSearch =
      !search ||
      c.customerName!.toLowerCase().includes(search.toLowerCase())
    return matchSearch;
  });

  function handlePrint() {
    if (!statement) return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    const logoUrl = window.location.origin + "/tuniolive-black.png";
    const today = new Date().toLocaleDateString("en-CA", {
      year: "numeric", month: "long", day: "numeric",
    });

    let running = 0;
    const rowsHtml = statement.invoices.map((inv) => {
      const charge = inv.amount;
      const paid = inv.paymentStatus === "Paid" ? inv.amount : 0;
      running += charge - paid;
      return `<tr>
      <td style="border:1px solid #ddd;padding:6px 10px">${fmtDate(inv.invoiceDate)}</td>
      <td style="border:1px solid #ddd;padding:6px 10px">${inv.invoiceNumber ?? "—"}</td>
      <td style="border:1px solid #ddd;padding:6px 10px;text-align:right">${charge > 0 ? "$" + charge.toFixed(2) : "—"}</td>
      <td style="border:1px solid #ddd;padding:6px 10px;text-align:right;color:#16a34a">${paid > 0 ? "$" + paid.toFixed(2) : "—"}</td>
      <td style="border:1px solid #ddd;padding:6px 10px;text-align:right;font-weight:600;color:${running > 0 ? "#dc2626" : "#16a34a"}">$${running.toFixed(2)}</td>
      <td style="border:1px solid #ddd;padding:6px 10px;text-align:center">
        <span style="background:${inv.paymentStatus === "Paid" ? "#dcfce7" : "#fef3c7"};color:${inv.paymentStatus === "Paid" ? "#166534" : "#92400e"};padding:2px 8px;border-radius:9999px;font-size:11px">
          ${inv.paymentStatus ?? "Pending"}
        </span>
      </td>
    </tr>`;
    }).join("");

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Statement — ${statement.customerName}</title>
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

  <table style="margin-bottom:24px">
    <tr>
      <td style="vertical-align:top;width:50%">
        <img src="${logoUrl}" style="height:60px;object-fit:contain"
             onerror="this.outerHTML='<strong style=font-size:20px>TuniOlive</strong>'"
             alt="TuniOlive"/>
        <div style="font-size:11px;color:#555;margin-top:8px;line-height:1.7">
          3203 Rue Noorduyn, Saint-Laurent, QC H4R 1A1<br/>
          info@tuniolive.com · (514) 601-0603
        </div>
      </td>
      <td style="text-align:right;vertical-align:top">
        <div style="font-size:20px;font-weight:800;text-transform:uppercase;letter-spacing:1px">
          Account Statement
        </div>
        <div style="font-size:11px;color:#555;margin-top:6px">Statement Date: ${today}</div>
      </td>
    </tr>
  </table>

  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:20px">
    <div style="font-size:11px;font-weight:600;color:#6b7280;margin-bottom:4px;text-transform:uppercase;letter-spacing:.5px">Billed To</div>
    <div style="font-size:18px;font-weight:800">${statement.customerName}</div>
  </div>

  <table style="margin-bottom:20px">
    <tr style="background:#f3f4f6">
      <th style="padding:10px 16px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.5px;border:1px solid #e5e7eb">Total Billed</th>
      <th style="padding:10px 16px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.5px;border:1px solid #e5e7eb;color:#16a34a">Total Paid</th>
      <th style="padding:10px 16px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.5px;border:1px solid #e5e7eb;color:#dc2626">Balance Due</th>
    </tr>
    <tr>
      <td style="padding:12px 16px;font-size:18px;font-weight:700;border:1px solid #e5e7eb">$${statement.totalBilled.toFixed(2)}</td>
      <td style="padding:12px 16px;font-size:18px;font-weight:700;color:#16a34a;border:1px solid #e5e7eb">$${statement.totalPaid.toFixed(2)}</td>
      <td style="padding:12px 16px;font-size:18px;font-weight:700;color:#dc2626;border:1px solid #e5e7eb">$${statement.balance.toFixed(2)}</td>
    </tr>
  </table>

  <table>
    <thead>
      <tr style="background:#1f2937;color:#fff">
        <th style="padding:8px 10px;text-align:left;font-size:11px;border:1px solid #374151">Date</th>
        <th style="padding:8px 10px;text-align:left;font-size:11px;border:1px solid #374151">Invoice #</th>
        <th style="padding:8px 10px;text-align:right;font-size:11px;border:1px solid #374151">Charges</th>
        <th style="padding:8px 10px;text-align:right;font-size:11px;border:1px solid #374151">Payments</th>
        <th style="padding:8px 10px;text-align:right;font-size:11px;border:1px solid #374151">Running Balance</th>
        <th style="padding:8px 10px;text-align:center;font-size:11px;border:1px solid #374151">Status</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
    <tfoot>
      <tr style="background:#f9fafb">
        <td colspan="2" style="padding:10px;font-weight:700;border:1px solid #ddd">Total</td>
        <td style="padding:10px;text-align:right;font-weight:700;border:1px solid #ddd">$${statement.totalBilled.toFixed(2)}</td>
        <td style="padding:10px;text-align:right;font-weight:700;color:#16a34a;border:1px solid #ddd">$${statement.totalPaid.toFixed(2)}</td>
        <td style="padding:10px;text-align:right;font-weight:700;color:${statement.balance > 0 ? "#dc2626" : "#16a34a"};border:1px solid #ddd">$${statement.balance.toFixed(2)}</td>
        <td style="padding:10px;border:1px solid #ddd"></td>
      </tr>
    </tfoot>
  </table>

  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;text-align:center;font-size:11px;color:#9ca3af">
    TuniOlive Inc. · Saint-Laurent, QC · Thank you for your business!
  </div>
</div>
</body>
</html>`;

    // Write into the persistent hidden iframe
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();

    // Wait for image to load before printing
    const img = doc.querySelector<HTMLImageElement>("img");
    const tryPrint = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
        window.print();
      }
    };

    if (img && !img.complete) {
      img.onload = () => setTimeout(tryPrint, 100);
      img.onerror = () => setTimeout(tryPrint, 100);
    } else {
      setTimeout(tryPrint, 300);
    }
  }

  return (
    <>
      {/* Hidden iframe for printing — must be in DOM at all times */}
  <iframe
    ref={iframeRef}
    title="statement-print-frame"
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "1px",
      height: "1px",
      opacity: 0,
      border: "none",
      pointerEvents: "none",
    }}
  />
      <AppLayout title="AR Statements">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-8rem)]">

          {/* Left — Customer list */ }
          <Card className="lg:col-span-1 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold text-sm">Customers</span>
              <span className="ml-auto text-xs text-muted-foreground">{ customers.length } total</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search by name, city, country…" className="pl-9" value={ search } onChange={ (e) => setSearch(e.target.value) } />
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              { isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={ i } className="px-4 py-3 border-b">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))
                : filtered.length === 0
                  ? (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No customers with invoices yet.
                    </div>
                  )
                  : filtered.map((c) => (
                    <button
                      key={ c.customerId }
                      onClick={ () => setSelectedId(c.customerId) }
                      className={ `w-full text-left px-4 py-3 border-b hover:bg-muted/40 transition-colors flex items-center gap-2
                      ${selectedId === c.customerId ? "bg-primary/5 border-l-2 border-l-primary" : ""}` }
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{ c.customerName ?? "—" }</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          { c.invoiceCount } invoice{ c.invoiceCount !== 1 ? "s" : "" }
                          { c.unpaidCount > 0 && (
                            <span className="ml-2 text-amber-600 font-medium">
                              { c.unpaidCount } unpaid
                            </span>
                          ) }
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={ `text-sm font-bold ${c.balance > 0 ? "text-red-600" : "text-green-600"}` }>
                          { fmtCad(c.balance) }
                        </p>
                        <p className="text-xs text-muted-foreground">balance</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    </button>
                  )) }
            </div>
          </Card>

          {/* Right — Statement detail */ }
          <Card className="lg:col-span-2 overflow-hidden flex flex-col">
            { !selectedId ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                <div className="text-center">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p>Select a customer to view their statement</p>
                </div>
              </div>
            ) : !statement ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : (
              <>
                {/* Statement header */ }
                <div className="px-6 py-4 border-b flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold">{ statement.customerName }</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Account Statement · { statement.invoices.length } invoice{ statement.invoices.length !== 1 ? "s" : "" }
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={ handlePrint } className="gap-1.5">
                    <Printer className="w-3.5 h-3.5" />
                    Print Statement
                  </Button>
                </div>

                {/* Summary cards */ }
                <div className="grid grid-cols-3 gap-3 px-6 py-4 border-b bg-muted/20">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Billed</p>
                    <p className="text-xl font-bold">{ fmtCad(statement.totalBilled) }</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Paid</p>
                    <p className="text-xl font-bold text-green-600">{ fmtCad(statement.totalPaid) }</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Balance Due</p>
                    <p className={ `text-xl font-bold ${statement.balance > 0 ? "text-red-600" : "text-green-600"}` }>
                      { fmtCad(statement.balance) }
                    </p>
                  </div>
                </div>

                {/* Invoice rows */ }
                <div className="overflow-y-auto flex-1">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-muted/80 backdrop-blur">
                      <tr>
                        { ["Date", "Invoice #", "Amount", "Status", "Due Date", "Paid On"].map((h) => (
                          <th key={ h } className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap border-b">
                            { h }
                          </th>
                        )) }
                      </tr>
                    </thead>
                    <tbody>
                      { statement.invoices.length === 0 ? (
                        <tr><td colSpan={ 6 } className="px-4 py-8 text-center text-muted-foreground text-sm">No invoices found.</td></tr>
                      ) : statement.invoices.map((inv) => (
                        <tr key={ inv.id } className="border-b border-border/50 hover:bg-muted/20">
                          <td className="px-4 py-3 whitespace-nowrap">{ fmtDate(inv.invoiceDate) }</td>
                          <td className="px-4 py-3 font-mono text-xs">{ inv.invoiceNumber ?? "—" }</td>
                          <td className="px-4 py-3 text-right font-mono font-semibold">{ fmtCad(inv.amount) }</td>
                          <td className="px-4 py-3"><StatusBadge status={ inv.paymentStatus ?? "Pending" } /></td>
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{ fmtDate(inv.dueDate) }</td>
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{ fmtDate(inv.paymentDate) }</td>
                        </tr>
                      )) }
                    </tbody>
                    { statement.invoices.length > 0 && (
                      <tfoot className="border-t-2 border-border bg-muted/30">
                        <tr>
                          <td colSpan={ 2 } className="px-4 py-3 font-semibold">Total</td>
                          <td className="px-4 py-3 text-right font-mono font-bold">{ fmtCad(statement.totalBilled) }</td>
                          <td colSpan={ 3 } className="px-4 py-3 text-right text-sm">
                            <span className={ `font-bold ${statement.balance > 0 ? "text-red-600" : "text-green-600"}` }>
                              { statement.balance > 0 ? `Outstanding: ${fmtCad(statement.balance)}` : "Fully paid ✓" }
                            </span>
                          </td>
                        </tr>
                      </tfoot>
                    ) }
                  </table>
                </div>
              </>
            ) }
          </Card>
        </div>
      </AppLayout>
    </>
  );
}