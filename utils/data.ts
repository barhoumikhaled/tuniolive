import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";

export type Client = {
  Name: string;
  Email: string;
  Country: string;
};

export function readClients(): Client[] {
  const filePath = path.join(process.cwd(), "data", "TuniOlive.xlsx");
  const fileBuffer = fs.readFileSync(filePath);

  const workbook = XLSX.read(fileBuffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convert the first sheet to JSON
  const data: Client[] = XLSX.utils.sheet_to_json(sheet);
  return data;
}

export function addInvoiceRow(row: any[]) {
  const filePath = path.join(process.cwd(), "data", "TuniOlive.xlsx");
  // Read the workbook
  const workbook = XLSX.readFile(filePath);

  // Get the first sheet (you can also pick by name: workbook.Sheets["Sheet1"])
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert sheet to JSON array of arrays
  const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  // Push new row at the end
  data.push(row);

  // Convert back to sheet
  const newSheet = XLSX.utils.aoa_to_sheet(data);
  workbook.Sheets[sheetName] = newSheet;

  // Save back
  XLSX.writeFile(workbook, filePath);
}