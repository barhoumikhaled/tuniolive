export function fmtCad(value: string | number | null | undefined): string {
  const n = parseFloat(String(value ?? "0"));
  return n.toLocaleString("fr-CA", { style: "currency", currency: "CAD" });
}

export function fmtUsd(value: string | number | null | undefined): string {
  const n = parseFloat(String(value ?? "0"));
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function fmtDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  // If it's a date-only string like "2025-05-13" or starts with that,
  // parse as local date to avoid UTC midnight shifting the day back
  const str = typeof date === "string" ? date : date.toISOString();
  const dateOnly = str.slice(0, 10); // "2025-05-13"
  const [year, month, day] = dateOnly.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function fmtDateInput(value: string | Date | null | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toISOString().split("T")[0];
}

export function fmtNum(value: string | number | null | undefined, decimals = 2): string {
  const n = parseFloat(String(value ?? "0"));
  return n.toFixed(decimals);
}

export function computeStatus(totalCad: string | null, amountPaid: string | null): "Paid" | "Partial" | "Unpaid" {
  const total = parseFloat(totalCad ?? "0");
  const paid = parseFloat(amountPaid ?? "0");
  const balance = total - paid;
  if (balance <= 0.005) return "Paid";
  if (paid > 0) return "Partial";
  return "Unpaid";
}

export const GST_RATE = 0.05;
export const QST_RATE = 0.09975;

export function calculateTaxes(subtotal: number) {
  const gst = subtotal * GST_RATE;
  const qst = subtotal * QST_RATE;
  return { gst, qst, total: subtotal + gst + qst };
}
