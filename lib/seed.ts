import { db } from "@/db";
import {
  contactsTable,
  apInvoicesTable,
  apPaymentsTable,
  arInvoicesTable,
  arInvoiceItemsTable,
  glAccountsTable,
  glEntriesTable,
} from "@/db/schema";
import { sql } from "drizzle-orm";

async function clearAll() {
  await db.execute(sql`TRUNCATE gl_entries, ar_invoice_items, ar_invoices, ap_payments, ap_invoices, gl_accounts, contacts RESTART IDENTITY CASCADE`);
}

async function seedContacts() {
  const contacts = [
    { id: 1, name: "Kenny U-Pull", type: "Supplier", country: "Canada" },
    { id: 2, name: "Auto Luxe A.A", type: "Supplier", country: "Canada" },
    { id: 3, name: "Ministre de finances", type: "Supplier", country: "Canada" },
    { id: 4, name: "Hicham Jabeur", type: "Supplier", country: "Canada" },
    { id: 5, name: "Centre automobile regent inc", type: "Supplier", country: "Canada" },
    { id: 6, name: "IAA AuctionNow", type: "Supplier", country: "Canada" },
    { id: 7, name: "Saaq", type: "Supplier", country: "Canada" },
    { id: 8, name: "Lexus Gabriel Brossard", type: "Supplier", country: "Canada" },
    { id: 9, name: "Ezzitouna oil sahel", type: "Supplier", country: "Tunisia" },
    { id: 10, name: "Driver can transport", type: "Supplier", country: "Canada" },
    { id: 11, name: "Bank", type: "Supplier", country: "Canada" },
    { id: 12, name: "Blue Bird storage", type: "Supplier", country: "Canada" },
    { id: 13, name: "MSC SHIPPING", type: "Supplier", country: "Canada" },
    { id: 14, name: "Sadok international", type: "Supplier", country: "Tunisia" },
    { id: 15, name: "Essor insurance", type: "Supplier", country: "Canada" },
    { id: 16, name: "TRANSBOX", type: "Supplier", country: "Canada" },
    { id: 17, name: "google workspace", type: "Supplier", country: "Canada" },
  ];

  for (const c of contacts) {
    await db.execute(
      sql`INSERT INTO contacts (id, name, type, country) VALUES (${c.id}, ${c.name}, ${c.type}, ${c.country}) ON CONFLICT (id) DO NOTHING`,
    );
  }
  await db.execute(
    sql`SELECT setval(pg_get_serial_sequence('contacts','id'), (SELECT MAX(id) FROM contacts))`,
  );
  console.log("Contacts seeded");
}

async function seedGlAccounts() {
  const accounts = [
    { accountNumber: "1000", accountName: "Bank CAD–Tuni", type: "Asset" },
    { accountNumber: "1001", accountName: "Bank CAD–Tuni Savings", type: "Asset" },
    { accountNumber: "1010", accountName: "Bank USD–Tuni", type: "Asset" },
    { accountNumber: "1011", accountName: "Bank USD–AMS", type: "Asset" },
    { accountNumber: "1200", accountName: "Olive Oil Inventory", type: "Asset" },
    { accountNumber: "1210", accountName: "Vehicle Inventory", type: "Asset" },
    { accountNumber: "1250", accountName: "Packaging Inventory", type: "Asset" },
    { accountNumber: "1300", accountName: "GST Recoverable (ITC)", type: "Asset" },
    { accountNumber: "1310", accountName: "QST Recoverable", type: "Asset" },
    { accountNumber: "2100", accountName: "Accounts Payable", type: "Liability" },
    { accountNumber: "2200", accountName: "GST Payable", type: "Liability" },
    { accountNumber: "2210", accountName: "QST Payable", type: "Liability" },
    { accountNumber: "2300", accountName: "Loan Payable–Individuals", type: "Liability" },
    { accountNumber: "2310", accountName: "Due to Partner", type: "Liability" },
    { accountNumber: "3000", accountName: "Owner Capital–Khalil", type: "Equity" },
    { accountNumber: "3010", accountName: "Owner Capital–Khaled", type: "Equity" },
    { accountNumber: "4000", accountName: "Olive Oil Sales", type: "Revenue" },
    { accountNumber: "4010", accountName: "Vehicle Sales", type: "Revenue" },
    { accountNumber: "7050", accountName: "Exchange Gain", type: "Revenue" },
    { accountNumber: "5001", accountName: "Freight", type: "Expense" },
    { accountNumber: "5010", accountName: "Parts", type: "Expense" },
    { accountNumber: "5020", accountName: "Repair", type: "Expense" },
    { accountNumber: "5050", accountName: "COGS–Vehicles", type: "Expense" },
    { accountNumber: "5100", accountName: "Office Supplies", type: "Expense" },
    { accountNumber: "5200", accountName: "Garage Rent", type: "Expense" },
    { accountNumber: "5210", accountName: "Storage & Warehouse", type: "Expense" },
    { accountNumber: "5300", accountName: "Licenses & Permits", type: "Expense" },
    { accountNumber: "5400", accountName: "Design & Marketing", type: "Expense" },
    { accountNumber: "5500", accountName: "Bank Fees", type: "Expense" },
    { accountNumber: "6020", accountName: "Test Product Purchases", type: "Expense" },
    { accountNumber: "6050", accountName: "Fuel–Dealer", type: "Expense" },
    { accountNumber: "6060", accountName: "Fuel–Olive Oil", type: "Expense" },
    { accountNumber: "6150", accountName: "Exchange Loss", type: "Expense" },
  ];

  await db.insert(glAccountsTable).values(accounts).onConflictDoNothing();
  console.log("GL Accounts seeded");
}

async function seedApInvoices() {
  const invoices = [
    { supplierId: 9, invoiceNumber: "EZZI-2024-001", invoiceDate: new Date("2024-01-15"), amountCad: "15000.00", gst: null, qst: null, totalCad: "15000.00", currency: "USD", amountUsd: "10700.00", exchangeRate: "1.40", amountPaid: "15000.00", glAccount: "1200", expenseDescription: "Olive Oil Import - 500L" },
    { supplierId: 14, invoiceNumber: "SADOK-2024-001", invoiceDate: new Date("2024-01-20"), amountCad: "22000.00", gst: null, qst: null, totalCad: "22000.00", currency: "USD", amountUsd: "15700.00", exchangeRate: "1.40", amountPaid: "22000.00", glAccount: "1200", expenseDescription: "Olive Oil Import - 800L" },
    { supplierId: 1, invoiceNumber: "KUP-2024-001", invoiceDate: new Date("2024-02-05"), amountCad: "3500.00", gst: "175.00", qst: "349.13", totalCad: "4024.13", currency: "CAD", amountPaid: "4024.13", glAccount: "1210", expenseDescription: "Used Vehicle Parts" },
    { supplierId: 6, invoiceNumber: "IAA-2024-001", invoiceDate: new Date("2024-02-10"), amountCad: "18000.00", gst: "900.00", qst: "1795.50", totalCad: "20695.50", currency: "CAD", amountPaid: "20695.50", glAccount: "1210", expenseDescription: "Kia Forte 2018 Purchase" },
    { supplierId: 6, invoiceNumber: "IAA-2024-002", invoiceDate: new Date("2024-02-15"), amountCad: "16500.00", gst: "825.00", qst: "1645.88", totalCad: "18970.88", currency: "CAD", amountPaid: "18970.88", glAccount: "1210", expenseDescription: "Ford Escape 2018 Purchase" },
    { supplierId: 12, invoiceNumber: "BB-2024-001", invoiceDate: new Date("2024-02-20"), amountCad: "1200.00", gst: "60.00", qst: "119.70", totalCad: "1379.70", currency: "CAD", amountPaid: "1379.70", glAccount: "5210", expenseDescription: "Storage Jan-Feb 2024" },
    { supplierId: 13, invoiceNumber: "MSC-2024-001", invoiceDate: new Date("2024-03-01"), amountCad: "4500.00", gst: null, qst: null, totalCad: "4500.00", currency: "USD", amountUsd: "3215.00", exchangeRate: "1.40", amountPaid: "4500.00", glAccount: "5001", expenseDescription: "Shipping Container - Olive Oil" },
    { supplierId: 10, invoiceNumber: "DCT-2024-001", invoiceDate: new Date("2024-03-05"), amountCad: "800.00", gst: "40.00", qst: "79.80", totalCad: "919.80", currency: "CAD", amountPaid: "919.80", glAccount: "5001", expenseDescription: "Local Transport - Delivery" },
    { supplierId: 7, invoiceNumber: "SAAQ-2024-001", invoiceDate: new Date("2024-03-10"), amountCad: "350.00", gst: "17.50", qst: "34.91", totalCad: "402.41", currency: "CAD", amountPaid: "402.41", glAccount: "5300", expenseDescription: "Vehicle Registration Kia Forte" },
    { supplierId: 7, invoiceNumber: "SAAQ-2024-002", invoiceDate: new Date("2024-03-10"), amountCad: "350.00", gst: "17.50", qst: "34.91", totalCad: "402.41", currency: "CAD", amountPaid: "402.41", glAccount: "5300", expenseDescription: "Vehicle Registration Ford Escape" },
    { supplierId: 4, invoiceNumber: "HJ-2024-001", invoiceDate: new Date("2024-03-15"), amountCad: "5000.00", gst: null, qst: null, totalCad: "5000.00", currency: "CAD", amountPaid: "5000.00", glAccount: "5200", expenseDescription: "Garage Rent Q1 2024" },
    { supplierId: 15, invoiceNumber: "ESS-2024-001", invoiceDate: new Date("2024-03-20"), amountCad: "2400.00", gst: "120.00", qst: "239.40", totalCad: "2759.40", currency: "CAD", amountPaid: "2759.40", glAccount: "5300", expenseDescription: "Commercial Vehicle Insurance 2024" },
    { supplierId: 9, invoiceNumber: "EZZI-2024-002", invoiceDate: new Date("2024-04-01"), amountCad: "18500.00", gst: null, qst: null, totalCad: "18500.00", currency: "USD", amountUsd: "13214.00", exchangeRate: "1.40", amountPaid: "18500.00", glAccount: "1200", expenseDescription: "Olive Oil Import - 700L" },
    { supplierId: 14, invoiceNumber: "SADOK-2024-002", invoiceDate: new Date("2024-04-05"), amountCad: "25000.00", gst: null, qst: null, totalCad: "25000.00", currency: "USD", amountUsd: "17857.00", exchangeRate: "1.40", amountPaid: "25000.00", glAccount: "1200", expenseDescription: "Olive Oil Import - 1000L EVOO" },
    { supplierId: 16, invoiceNumber: "TRANS-2024-001", invoiceDate: new Date("2024-04-10"), amountCad: "3200.00", gst: "160.00", qst: "319.20", totalCad: "3679.20", currency: "CAD", amountPaid: "3679.20", glAccount: "5001", expenseDescription: "Container Transport to Warehouse" },
    { supplierId: 12, invoiceNumber: "BB-2024-002", invoiceDate: new Date("2024-04-20"), amountCad: "1200.00", gst: "60.00", qst: "119.70", totalCad: "1379.70", currency: "CAD", amountPaid: "1379.70", glAccount: "5210", expenseDescription: "Storage Mar-Apr 2024" },
    { supplierId: 5, invoiceNumber: "CAR-2024-001", invoiceDate: new Date("2024-04-25"), amountCad: "850.00", gst: "42.50", qst: "84.79", totalCad: "977.29", currency: "CAD", amountPaid: "977.29", glAccount: "5020", expenseDescription: "Vehicle Repair - Kia Forte" },
    { supplierId: 8, invoiceNumber: "LEX-2024-001", invoiceDate: new Date("2024-05-02"), amountCad: "1200.00", gst: "60.00", qst: "119.70", totalCad: "1379.70", currency: "CAD", amountPaid: "1379.70", glAccount: "5020", expenseDescription: "Maintenance Service" },
    { supplierId: 2, invoiceNumber: "ALA-2024-001", invoiceDate: new Date("2024-05-10"), amountCad: "22000.00", gst: null, qst: null, totalCad: "22000.00", currency: "CAD", amountPaid: "22000.00", glAccount: "1210", expenseDescription: "Used Vehicle Purchase" },
    { supplierId: 3, invoiceNumber: "MF-2024-001", invoiceDate: new Date("2024-05-15"), amountCad: "1850.00", gst: null, qst: null, totalCad: "1850.00", currency: "CAD", amountPaid: "1850.00", glAccount: "5300", expenseDescription: "Business Registration Fees" },
    { supplierId: 17, invoiceNumber: "GW-2024-001", invoiceDate: new Date("2024-05-20"), amountCad: "180.00", gst: "9.00", qst: "17.96", totalCad: "206.96", currency: "CAD", amountPaid: "206.96", glAccount: "5100", expenseDescription: "Google Workspace Annual" },
    { supplierId: 9, invoiceNumber: "EZZI-2024-003", invoiceDate: new Date("2024-06-01"), amountCad: "21000.00", gst: null, qst: null, totalCad: "21000.00", currency: "USD", amountUsd: "15000.00", exchangeRate: "1.40", amountPaid: "21000.00", glAccount: "1200", expenseDescription: "Olive Oil Import - Summer Batch" },
    { supplierId: 13, invoiceNumber: "MSC-2024-002", invoiceDate: new Date("2024-06-10"), amountCad: "5600.00", gst: null, qst: null, totalCad: "5600.00", currency: "USD", amountUsd: "4000.00", exchangeRate: "1.40", amountPaid: "5600.00", glAccount: "5001", expenseDescription: "Shipping - Summer Shipment" },
    { supplierId: 4, invoiceNumber: "HJ-2024-002", invoiceDate: new Date("2024-06-15"), amountCad: "5000.00", gst: null, qst: null, totalCad: "5000.00", currency: "CAD", amountPaid: "5000.00", glAccount: "5200", expenseDescription: "Garage Rent Q2 2024" },
    { supplierId: 12, invoiceNumber: "BB-2024-003", invoiceDate: new Date("2024-06-20"), amountCad: "1200.00", gst: "60.00", qst: "119.70", totalCad: "1379.70", currency: "CAD", amountPaid: "1379.70", glAccount: "5210", expenseDescription: "Storage May-Jun 2024" },
    { supplierId: 17, invoiceNumber: "MISC-2024-001", invoiceDate: new Date("2024-06-25"), amountCad: "450.00", gst: "22.50", qst: "44.89", totalCad: "517.39", currency: "CAD", amountPaid: "517.39", glAccount: "5100", expenseDescription: "Office Supplies - Misc" },
    { supplierId: 9, invoiceNumber: "EZZI-2024-004", invoiceDate: new Date("2024-07-05"), amountCad: "28000.00", gst: null, qst: null, totalCad: "28000.00", currency: "USD", amountUsd: "20000.00", exchangeRate: "1.40", amountPaid: "28000.00", glAccount: "1200", expenseDescription: "Olive Oil Import - Large Batch" },
    { supplierId: 14, invoiceNumber: "SADOK-2024-003", invoiceDate: new Date("2024-07-10"), amountCad: "14000.00", gst: null, qst: null, totalCad: "14000.00", currency: "USD", amountUsd: "10000.00", exchangeRate: "1.40", amountPaid: "14000.00", glAccount: "1200", expenseDescription: "Olive Oil Import Q3" },
    { supplierId: 6, invoiceNumber: "IAA-2024-003", invoiceDate: new Date("2024-07-20"), amountCad: "19500.00", gst: "975.00", qst: "1945.13", totalCad: "22420.13", currency: "CAD", amountPaid: "22420.13", glAccount: "1210", expenseDescription: "Vehicle Auction Purchase" },
    { supplierId: 16, invoiceNumber: "TRANS-2024-002", invoiceDate: new Date("2024-07-25"), amountCad: "2800.00", gst: "140.00", qst: "279.30", totalCad: "3219.30", currency: "CAD", amountPaid: "3219.30", glAccount: "5001", expenseDescription: "Freight & Customs Clearance" },
    { supplierId: 5, invoiceNumber: "CAR-2024-002", invoiceDate: new Date("2024-08-02"), amountCad: "650.00", gst: "32.50", qst: "64.84", totalCad: "747.34", currency: "CAD", amountPaid: "747.34", glAccount: "5020", expenseDescription: "Repair - Ford Escape" },
    { supplierId: 10, invoiceNumber: "DCT-2024-002", invoiceDate: new Date("2024-08-10"), amountCad: "950.00", gst: "47.50", qst: "94.76", totalCad: "1092.26", currency: "CAD", amountPaid: "1092.26", glAccount: "5001", expenseDescription: "Transport - Olive Oil Delivery" },
    { supplierId: 12, invoiceNumber: "BB-2024-004", invoiceDate: new Date("2024-08-20"), amountCad: "1200.00", gst: "60.00", qst: "119.70", totalCad: "1379.70", currency: "CAD", amountPaid: "1379.70", glAccount: "5210", expenseDescription: "Storage Jul-Aug 2024" },
    { supplierId: 4, invoiceNumber: "HJ-2024-003", invoiceDate: new Date("2024-09-01"), amountCad: "5000.00", gst: null, qst: null, totalCad: "5000.00", currency: "CAD", amountPaid: "5000.00", glAccount: "5200", expenseDescription: "Garage Rent Q3 2024" },
    { supplierId: 9, invoiceNumber: "EZZI-2024-005", invoiceDate: new Date("2024-09-10"), amountCad: "35000.00", gst: null, qst: null, totalCad: "35000.00", currency: "USD", amountUsd: "25000.00", exchangeRate: "1.40", amountPaid: "35000.00", glAccount: "1200", expenseDescription: "Olive Oil Import - Fall Harvest" },
    { supplierId: 13, invoiceNumber: "MSC-2024-003", invoiceDate: new Date("2024-09-15"), amountCad: "6300.00", gst: null, qst: null, totalCad: "6300.00", currency: "USD", amountUsd: "4500.00", exchangeRate: "1.40", amountPaid: "6300.00", glAccount: "5001", expenseDescription: "Shipping Fall Harvest" },
    { supplierId: 1, invoiceNumber: "KUP-2024-002", invoiceDate: new Date("2024-09-20"), amountCad: "2800.00", gst: "140.00", qst: "279.30", totalCad: "3219.30", currency: "CAD", amountPaid: "3219.30", glAccount: "1210", expenseDescription: "Vehicle Parts Inventory" },
    { supplierId: 15, invoiceNumber: "ESS-2024-002", invoiceDate: new Date("2024-09-25"), amountCad: "800.00", gst: "40.00", qst: "79.80", totalCad: "919.80", currency: "CAD", amountPaid: "919.80", glAccount: "5300", expenseDescription: "Insurance Premium Q4" },
    { supplierId: 16, invoiceNumber: "TRANS-2024-003", invoiceDate: new Date("2024-10-05"), amountCad: "3500.00", gst: "175.00", qst: "349.13", totalCad: "4024.13", currency: "CAD", amountPaid: "4024.13", glAccount: "5001", expenseDescription: "Fall Harvest Freight" },
    { supplierId: 12, invoiceNumber: "BB-2024-005", invoiceDate: new Date("2024-10-20"), amountCad: "1200.00", gst: "60.00", qst: "119.70", totalCad: "1379.70", currency: "CAD", amountPaid: "1379.70", glAccount: "5210", expenseDescription: "Storage Sep-Oct 2024" },
    { supplierId: 9, invoiceNumber: "EZZI-2024-006", invoiceDate: new Date("2024-11-01"), amountCad: "42000.00", gst: null, qst: null, totalCad: "42000.00", currency: "USD", amountUsd: "30000.00", exchangeRate: "1.40", amountPaid: "30000.00", balance: "12000.00", glAccount: "1200", expenseDescription: "Olive Oil Import - Winter Stock" },
    { supplierId: 14, invoiceNumber: "SADOK-2024-004", invoiceDate: new Date("2024-11-10"), amountCad: "17500.00", gst: null, qst: null, totalCad: "17500.00", currency: "USD", amountUsd: "12500.00", exchangeRate: "1.40", amountPaid: "10000.00", balance: "7500.00", glAccount: "1200", expenseDescription: "Olive Oil Import - Premium EVOO" },
    { supplierId: 4, invoiceNumber: "HJ-2024-004", invoiceDate: new Date("2024-12-01"), amountCad: "5000.00", gst: null, qst: null, totalCad: "5000.00", currency: "CAD", amountPaid: "0.00", balance: "5000.00", glAccount: "5200", expenseDescription: "Garage Rent Q4 2024" },
    { supplierId: 13, invoiceNumber: "MSC-2024-004", invoiceDate: new Date("2024-11-20"), amountCad: "7700.00", gst: null, qst: null, totalCad: "7700.00", currency: "USD", amountUsd: "5500.00", exchangeRate: "1.40", amountPaid: "7700.00", glAccount: "5001", expenseDescription: "Winter Stock Shipping" },
    { supplierId: 12, invoiceNumber: "BB-2024-006", invoiceDate: new Date("2024-12-20"), amountCad: "1200.00", gst: "60.00", qst: "119.70", totalCad: "1379.70", currency: "CAD", amountPaid: "0.00", balance: "1379.70", glAccount: "5210", expenseDescription: "Storage Nov-Dec 2024" },
    { supplierId: 17, invoiceNumber: "MISC-2024-002", invoiceDate: new Date("2024-12-10"), amountCad: "320.00", gst: "16.00", qst: "31.92", totalCad: "367.92", currency: "CAD", amountPaid: "367.92", glAccount: "5100", expenseDescription: "Office Supplies Year End" },
    { supplierId: 17, invoiceNumber: "GW-2024-002", invoiceDate: new Date("2024-12-15"), amountCad: "180.00", gst: "9.00", qst: "17.96", totalCad: "206.96", currency: "CAD", amountPaid: "206.96", glAccount: "5100", expenseDescription: "Google Workspace Renewal" },
    { supplierId: 5, invoiceNumber: "CAR-2024-003", invoiceDate: new Date("2024-10-15"), amountCad: "1100.00", gst: "55.00", qst: "109.73", totalCad: "1264.73", currency: "CAD", amountPaid: "1264.73", glAccount: "5020", expenseDescription: "Vehicle Overhaul - Q4" },
    { supplierId: 6, invoiceNumber: "IAA-2024-004", invoiceDate: new Date("2024-11-05"), amountCad: "24000.00", gst: "1200.00", qst: "2394.00", totalCad: "27594.00", currency: "CAD", amountPaid: "27594.00", glAccount: "1210", expenseDescription: "Auction Vehicle Purchase" },
    { supplierId: 3, invoiceNumber: "MF-2024-002", invoiceDate: new Date("2024-11-25"), amountCad: "750.00", gst: null, qst: null, totalCad: "750.00", currency: "CAD", amountPaid: "750.00", glAccount: "5300", expenseDescription: "Annual Business Fees" },
    { supplierId: 10, invoiceNumber: "DCT-2024-003", invoiceDate: new Date("2024-12-05"), amountCad: "1100.00", gst: "55.00", qst: "109.73", totalCad: "1264.73", currency: "CAD", amountPaid: "1264.73", glAccount: "5001", expenseDescription: "December Deliveries" },
    { supplierId: 11, invoiceNumber: "BANK-2024-001", invoiceDate: new Date("2024-12-31"), amountCad: "450.00", gst: null, qst: null, totalCad: "450.00", currency: "CAD", amountPaid: "450.00", glAccount: "5500", expenseDescription: "Bank Fees 2024 Annual" },
    { supplierId: 17, invoiceNumber: "MISC-2024-003", invoiceDate: new Date("2024-12-28"), amountCad: "680.00", gst: "34.00", qst: "67.82", totalCad: "781.82", currency: "CAD", amountPaid: "0.00", balance: "781.82", glAccount: "6020", expenseDescription: "Test Product Purchase" },
    { supplierId: 8, invoiceNumber: "LEX-2024-002", invoiceDate: new Date("2024-12-10"), amountCad: "950.00", gst: "47.50", qst: "94.76", totalCad: "1092.26", currency: "CAD", amountPaid: "1092.26", glAccount: "5020", expenseDescription: "Year-End Service - Lexus" },
    { supplierId: 6, invoiceNumber: "IAA-2024-005", invoiceDate: new Date("2024-12-20"), amountCad: "21000.00", gst: "1050.00", qst: "2094.75", totalCad: "24144.75", currency: "CAD", amountPaid: "0.00", balance: "24144.75", glAccount: "1210", expenseDescription: "Year End Vehicle Auction" },
    { supplierId: 7, invoiceNumber: "SAAQ-2024-003", invoiceDate: new Date("2024-12-22"), amountCad: "175.00", gst: "8.75", qst: "17.46", totalCad: "201.21", currency: "CAD", amountPaid: "201.21", glAccount: "5300", expenseDescription: "Vehicle Permit Renewal" },
  ];

  for (const inv of invoices) {
    const amountPaid = parseFloat(inv.amountPaid ?? "0");
    const totalCad = parseFloat(inv.totalCad);
    const balance = inv.balance ?? (totalCad - amountPaid).toFixed(2);
    await db.insert(apInvoicesTable).values({
      ...inv,
      amountPaid: amountPaid.toString(),
      balance: balance.toString(),
    });
  }
  console.log("AP Invoices seeded");
}

async function seedApPayments() {
  const payments = [
    { supplierId: 9, paymentNumber: "PAY-001", paymentDate: new Date("2024-01-20"), paymentMethod: "wire transfer", amountCad: "15000.00", currency: "CAD", linkedInvoiceNum: "EZZI-2024-001" },
    { supplierId: 14, paymentNumber: "PAY-002", paymentDate: new Date("2024-01-25"), paymentMethod: "wire transfer", amountCad: "22000.00", currency: "CAD", linkedInvoiceNum: "SADOK-2024-001" },
    { supplierId: 1, paymentNumber: "PAY-003", paymentDate: new Date("2024-02-07"), paymentMethod: "cheque", amountCad: "4024.13", currency: "CAD", linkedInvoiceNum: "KUP-2024-001" },
    { supplierId: 6, paymentNumber: "PAY-004", paymentDate: new Date("2024-02-12"), paymentMethod: "wire transfer", amountCad: "20695.50", currency: "CAD", linkedInvoiceNum: "IAA-2024-001" },
    { supplierId: 6, paymentNumber: "PAY-005", paymentDate: new Date("2024-02-17"), paymentMethod: "wire transfer", amountCad: "18970.88", currency: "CAD", linkedInvoiceNum: "IAA-2024-002" },
    { supplierId: 12, paymentNumber: "PAY-006", paymentDate: new Date("2024-02-22"), paymentMethod: "cheque", amountCad: "1379.70", currency: "CAD", linkedInvoiceNum: "BB-2024-001" },
    { supplierId: 13, paymentNumber: "PAY-007", paymentDate: new Date("2024-03-05"), paymentMethod: "wire transfer", amountCad: "4500.00", currency: "USD", amountUsd: "3215.00", exchangeRate: "1.40", linkedInvoiceNum: "MSC-2024-001" },
    { supplierId: 4, paymentNumber: "PAY-008", paymentDate: new Date("2024-03-20"), paymentMethod: "cheque", amountCad: "5000.00", currency: "CAD", linkedInvoiceNum: "HJ-2024-001" },
    { supplierId: 9, paymentNumber: "PAY-009", paymentDate: new Date("2024-04-08"), paymentMethod: "wire transfer", amountCad: "18500.00", currency: "CAD", linkedInvoiceNum: "EZZI-2024-002" },
    { supplierId: 14, paymentNumber: "PAY-010", paymentDate: new Date("2024-04-10"), paymentMethod: "wire transfer", amountCad: "25000.00", currency: "CAD", linkedInvoiceNum: "SADOK-2024-002" },
    { supplierId: 9, paymentNumber: "PAY-011", paymentDate: new Date("2024-06-10"), paymentMethod: "wire transfer", amountCad: "21000.00", currency: "CAD", linkedInvoiceNum: "EZZI-2024-003" },
    { supplierId: 9, paymentNumber: "PAY-012", paymentDate: new Date("2024-09-15"), paymentMethod: "wire transfer", amountCad: "35000.00", currency: "CAD", linkedInvoiceNum: "EZZI-2024-005" },
    { supplierId: 9, paymentNumber: "PAY-013", paymentDate: new Date("2024-11-15"), paymentMethod: "wire transfer", amountCad: "30000.00", currency: "USD", amountUsd: "21428.57", exchangeRate: "1.40", linkedInvoiceNum: "EZZI-2024-006" },
    { supplierId: 14, paymentNumber: "PAY-014", paymentDate: new Date("2024-11-20"), paymentMethod: "wire transfer", amountCad: "10000.00", currency: "CAD", linkedInvoiceNum: "SADOK-2024-004" },
    { supplierId: 9, paymentNumber: "PAY-015", paymentDate: new Date("2024-07-10"), paymentMethod: "wire transfer", amountCad: "28000.00", currency: "CAD", linkedInvoiceNum: "EZZI-2024-004" },
  ];

  for (const p of payments) {
    await db.insert(apPaymentsTable).values(p);
  }
  console.log("AP Payments seeded");
}

async function seedArInvoices() {
  const [arInvoice] = await db.insert(arInvoicesTable).values({
    invoiceNumber: "AR-2024-001",
    customerName: "Restaurant Mediterra",
    invoiceDate: new Date("2024-03-25"),
    dueDate: new Date("2024-04-25"),
    notes: "Olive oil delivery - 50 bottles premium EVOO",
    paymentStatus: "Paid",
    paymentDate: new Date("2024-04-10"),
  }).returning();

  // await db.insert(arInvoiceItemsTable).values([
  //   {
  //     invoiceId: arInvoice.id,
  //     itemType: "Product",
  //     description: "Extra Virgin Olive Oil 750ml",
  //     qtyBox: "10",
  //     priceBox: "120.00",
  //     unitPrice: "12.00",
  //     gst: "60.00",
  //     qst: "119.70",
  //     totalAmount: "1200.00",
  //     extendedPrice: "1379.70",
  //     glAccount: "4000",
  //   },
  //   {
  //     invoiceId: arInvoice.id,
  //     itemType: "Product",
  //     description: "Olive Oil 1L Bottle",
  //     qtyBox: "5",
  //     priceBox: "180.00",
  //     unitPrice: "18.00",
  //     gst: "45.00",
  //     qst: "89.78",
  //     totalAmount: "900.00",
  //     extendedPrice: "1034.78",
  //     glAccount: "4000",
  //   },
  // ]);
  console.log("AR Invoices seeded");
}

async function seedGlEntries() {
  const entries = [
    { date: new Date("2024-01-01"), documentType: "JE", documentNumber: "JE-001", lines: [
      { accountNumber: "3000", credit: "50000.00", description: "Owner Capital Investment - Khalil" },
      { accountNumber: "3010", credit: "50000.00", description: "Owner Capital Investment - Khaled" },
      { accountNumber: "1000", debit: "100000.00", description: "Initial Capital Deposit" },
    ]},
    { date: new Date("2024-01-15"), documentType: "AP", documentNumber: "EZZI-2024-001", lines: [
      { accountNumber: "1200", debit: "15000.00", description: "Olive Oil Inventory" },
      { accountNumber: "2100", credit: "15000.00", description: "Accounts Payable - Ezzitouna" },
    ]},
    { date: new Date("2024-01-20"), documentType: "PY", documentNumber: "PAY-001", lines: [
      { accountNumber: "2100", debit: "15000.00", description: "AP Payment - Ezzitouna" },
      { accountNumber: "1000", credit: "15000.00", description: "Bank CAD Payment" },
    ]},
    { date: new Date("2024-02-10"), documentType: "AP", documentNumber: "IAA-2024-001", lines: [
      { accountNumber: "1210", debit: "18000.00", description: "Vehicle Inventory - Kia Forte" },
      { accountNumber: "1300", debit: "900.00", description: "GST ITC" },
      { accountNumber: "1310", debit: "1795.50", description: "QST ITC" },
      { accountNumber: "2100", credit: "20695.50", description: "AP - IAA" },
    ]},
    { date: new Date("2024-02-12"), documentType: "PY", documentNumber: "PAY-004", lines: [
      { accountNumber: "2100", debit: "20695.50", description: "AP Payment IAA Kia" },
      { accountNumber: "1000", credit: "20695.50", description: "Bank Payment" },
    ]},
    { date: new Date("2024-03-25"), documentType: "AR", documentNumber: "AR-2024-001", lines: [
      { accountNumber: "4000", credit: "2100.00", description: "Olive Oil Sales" },
      { accountNumber: "2200", credit: "105.00", description: "GST Collected" },
      { accountNumber: "2210", credit: "209.48", description: "QST Collected" },
      { accountNumber: "1000", debit: "2414.48", description: "AR Receipt - Mediterra" },
    ]},
    { date: new Date("2024-04-01"), documentType: "AP", documentNumber: "EZZI-2024-002", lines: [
      { accountNumber: "1200", debit: "18500.00", description: "Olive Oil Inventory Spring" },
      { accountNumber: "2100", credit: "18500.00", description: "AP - Ezzitouna Spring" },
    ]},
    { date: new Date("2024-04-08"), documentType: "PY", documentNumber: "PAY-009", lines: [
      { accountNumber: "2100", debit: "18500.00", description: "Payment Ezzitouna Spring" },
      { accountNumber: "1000", credit: "18500.00", description: "Bank" },
    ]},
    { date: new Date("2024-11-01"), documentType: "AP", documentNumber: "EZZI-2024-006", lines: [
      { accountNumber: "1200", debit: "42000.00", description: "Olive Oil Winter Stock" },
      { accountNumber: "2100", credit: "42000.00", description: "AP - Ezzitouna Winter" },
    ]},
    { date: new Date("2024-12-31"), documentType: "JE", documentNumber: "JE-YE-001", lines: [
      { accountNumber: "5200", debit: "20000.00", description: "Rent & Storage FY2024" },
      { accountNumber: "5001", debit: "27800.00", description: "Freight & Logistics FY2024" },
      { accountNumber: "1000", credit: "47800.00", description: "Year-end operating accrual" },
    ]},
  ];

  let entryNumber = 1;
  for (const je of entries) {
    for (const line of je.lines) {
      await db.insert(glEntriesTable).values({
        entryNumber: entryNumber++,
        date: je.date,
        documentType: je.documentType,
        documentNumber: je.documentNumber,
        accountNumber: line.accountNumber,
        currency: "CAD",
        debit: (line as { debit?: string }).debit ?? null,
        credit: (line as { credit?: string }).credit ?? null,
        description: line.description,
        amountInCad: (line as { debit?: string }).debit ?? (line as { credit?: string }).credit ?? null,
      });
    }
  }
  console.log("GL Entries seeded");
}

export async function runSeed() {
  console.log("Starting seed...");
  await clearAll();
  await seedContacts();
  await seedGlAccounts();
  await seedApInvoices();
  await seedApPayments();
  await seedArInvoices();
  await seedGlEntries();
  console.log("Seed complete!");
}
