import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import path from "path";
import fs, { writeFileSync } from "fs";

export async function GET() {
  const filePath = path.join(process.cwd(), "data", "TuniOlive.xlsx");
  const fileBuffer = fs.readFileSync(filePath);

  const workbook = XLSX.read(fileBuffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[4];
  const sheet = workbook.Sheets[sheetName];

  const clients = XLSX.utils.sheet_to_json(sheet);
  const invoices = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[3]]);
  return NextResponse.json({ clients, invoices });
}

export async function POST(
  req: Request
) {
  const row = await req.json()
  const filePath = path.join(process.cwd(), "data", "TuniOlive.xlsx");
  const fileBuffer = fs.readFileSync(filePath);
  // Read the workbook
  const workbook = XLSX.read(fileBuffer, { type: "buffer" });

  // Get the first sheet (you can also pick by name: workbook.Sheets["Sheet1"])
  const sheetName = workbook.SheetNames[3];
  const worksheet = workbook.Sheets[sheetName];

  // Convert sheet to JSON array of arrays
  let data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  // Remove empty rows
  data = data.filter(r => r.length > 0);

  // Push new row at the end
  data.push(row);

  // Convert back to sheet
  const newSheet = XLSX.utils.aoa_to_sheet(data);
  workbook.Sheets[sheetName] = newSheet;

  // Save back
  // XLSX.writeFile(workbook, filePath);
  const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  writeFileSync(filePath, buf);

  const clients = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[4]]);
  const invoices = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[3]]);
  console.log('invoices: ', invoices)
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=data.xlsx",
    },
  });

}
