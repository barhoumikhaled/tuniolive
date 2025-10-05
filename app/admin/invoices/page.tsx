"use client";
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { getAuthData, isAuthenticated, logout } from '@/utils/auth';
// import { addInvoiceRow } from '@/utils/data';
import jsPDF from 'jspdf'
import autoTable, { CellInput, RowInput } from 'jspdf-autotable'
import { ArrowLeft, Download, FileText, Leaf, Minus, Plus, Search, Users } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface LineItem {
  id: number;
  item: string;
  description: string;
  qtyBox: number;
  qtyUnit: number;
  unitPrice: number;
  total: number;
}

interface InvoiceData {
  QtyBox: number
  QtyUnit: number
  customerNumber: number
  unitPrice: number
  invoiceNumber: string;
  invoiceDate: string;
  delaiTerms: string;
  dueDate: string;
  item: string;
  // customerEmail: string;
  // customerAddress: string;
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalPrice: number;
  extendedPrice: number;
  notes: string;
}

export default function Invoices
  () {

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [authData, setAuthData] = useState<any>(null);
  const [showInvoiceList, setShowInvoiceList] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customer, setCustomer] = useState<Customer>({
    email: "",
    customerNumber: 0,
    soldTo: "",
    shipTo: "",
    adresse: "",
    city: "",
    postalCode: "",
    province: "",
    country: "",
  });
  const [invoicesLoaded, setInvoiceLoaded] = useState<InvoiceData[]>([]);

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    item: "",
    delaiTerms: "1",
    QtyBox: 1,
    unitPrice: 10.75,
    QtyUnit: 2,
    customerNumber: 1,
    extendedPrice: 299,
    lineItems: [
      {
        id: 1,
        description: "TuniOlive Extra Virgin Olive Oil",
        qtyUnit: 12,
        qtyBox: 1,
        unitPrice: 10.75,
        total: 129,
        item: 'EVOO1L'
      }
    ],
    subtotal: 129,
    taxRate: 0,
    taxAmount: 0,
    totalPrice: 129,
    notes: ""
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // Check authentication on component mount
  useEffect(() => {
    (async () => {
      const response = await fetch("/api/data");
      const data = await response.json();
      setCustomers(data.clients);
      console.log("data.invoices: ", data.invoices)
      const invoicesWithItemLine = groupInvoices(data.invoices)
      console.log("invoicesWithItemLine: ", invoicesWithItemLine)

      setInvoiceLoaded(invoicesWithItemLine)
      // setInvoiceLoaded(data.invoices)
    })();
    if (!isAuthenticated()) {
      router.push('/login');
    } else {
      setAuthData(getAuthData());
      setIsLoading(false);
    }
  }, [router]);

  const groupInvoices = (list: InvoiceData[]): InvoiceData[] => {
    const map = new Map<string, InvoiceData>();
    let total = 0
    let index = 1
    for (const element of list) {
      if (!map.has(element.invoiceNumber)) {
        total = 0
        map.set(element.invoiceNumber, {
          // customerAddress: element.customerAddress,
          // customerEmail: element.customerEmail,
          delaiTerms: element.delaiTerms,
          QtyBox: element.QtyBox,
          QtyUnit: element.QtyUnit,
          customerNumber: element.customerNumber,
          unitPrice: element.unitPrice,
          invoiceNumber: element.invoiceNumber,
          invoiceDate: element.invoiceDate,
          // invoiceDate: new Date(element.invoiceDate).toString(),
          // invoiceDate: excelDateToJSDate(element.invoiceDate),
          dueDate: element.dueDate,
          item: element.item,
          lineItems: [],
          subtotal: element.subtotal,
          taxRate: element.taxRate,
          taxAmount: element.taxAmount,
          totalPrice: element.totalPrice,
          extendedPrice: element.extendedPrice,
          notes: element.notes
        })
      }
      total += element.totalPrice
      element.totalPrice = total
      map.get(element.invoiceNumber)!.totalPrice = total
      map.get(element.invoiceNumber)!.taxRate = 0
      map.get(element.invoiceNumber)!.lineItems.push({
        description: `${element.item} TuniOlive Extra Virgin Olive Oil`,
        id: index,
        item: element.item,
        qtyBox: element.QtyBox,
        qtyUnit: element.QtyUnit,
        unitPrice: element.unitPrice,
        total: element.QtyUnit * element.unitPrice
      });
      index++
    }

    return Array.from(map.values());
  }

  const calculateTotals = (lineItems: LineItem[], taxRate: number) => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      totalPrice: Math.round(total * 100) / 100
    };
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: invoiceData.lineItems.length + 1,
      description: "Evoo1L TuniOlive Extra Virgin Olive Oil",
      qtyUnit: 12,
      qtyBox: 1,
      unitPrice: 10.75,
      total: 129,
      item: 'Evoo1L'
    };

    setInvoiceData(prev => {
      const updatedLineItems = [...prev.lineItems, newItem];
      const totals = calculateTotals(updatedLineItems, prev.taxRate);

      return {
        ...prev,
        lineItems: updatedLineItems,
        ...totals
      };
    });
  };

  const updateLineItem = (id: number, field: keyof LineItem, value: string | number) => {

    setInvoiceData(prev => {
      const updatedLineItems = prev.lineItems.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'qtyUnit' || field === 'unitPrice') {
            updatedItem.total = Math.round(updatedItem.qtyUnit * updatedItem.unitPrice * 100) / 100;
          }
          return updatedItem;
        }
        item.item = item.description.includes("EVOO1L".toLocaleLowerCase()) ? "EVOO1L" : "EVOO3L"
        return item;
      });

      console.log("Updated Line Items:", updatedLineItems);
      const totals = calculateTotals(updatedLineItems, prev.taxRate);

      return {
        ...prev,
        lineItems: updatedLineItems,
        ...totals
      };
    });
  };

  const removeLineItem = (id: number) => {
    setInvoiceData(prev => {
      const updatedLineItems = prev.lineItems.filter(item => item.id !== id);
      const totals = calculateTotals(updatedLineItems, prev.taxRate);
      console.log("Updated Line Items:", updatedLineItems);
      return {
        ...prev,
        lineItems: updatedLineItems,
        ...totals
      };
    });
  };

  const updateTaxRate = (newTaxRate: number) => {
    setInvoiceData(prev => {
      const totals = calculateTotals(prev.lineItems, newTaxRate);

      return {
        ...prev,
        taxRate: newTaxRate,
        ...totals
      };
    });
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push('/login');
  };

  // Filter customers based on search term
  const filteredInvoices: InvoiceData[] = invoicesLoaded.filter(invoice =>
    invoice.item.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.invoiceNumber.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    // invoice.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer?.adresse.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateCustomerPDF = async (invoice: InvoiceData) => {
    const cust = customers.find(c => c.customerNumber === invoice.customerNumber) as Customer
    setCustomer(cust)
    const inv = invoicesLoaded.find(i => i.invoiceNumber === invoice.invoiceNumber) as InvoiceData 
    setInvoiceData(inv);

  };

  // Utility: load image and convert to Base64
  async function getBase64ImageFromUrl(url: string): Promise<string> {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  const generatePDF = async () => {
    console.log("invoiceData: ", invoiceData)

    if (!invoiceData.item || !customer?.email) {
      toast.error("Please fill in customer name and email");
      return;
    }

    if (invoiceData.lineItems.some(item => !item.description)) {
      toast.error("Please fill in all line item descriptions");
      return;
    }

    setIsGenerating(true);

    try {
      let rowData = [
        invoiceData.invoiceNumber,
        invoiceData.invoiceDate,
        invoiceData.customerNumber,
        invoiceData.delaiTerms,
        invoiceData.item,
        invoiceData.QtyBox,
        invoiceData.QtyUnit,
        invoiceData.unitPrice,
        invoiceData.totalPrice,
        invoiceData.extendedPrice,
        invoiceData.taxRate,
      ]

      // addInvoiceRow(rowData)
      const response = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rowData),
      });
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;

      // Company Header
      const b64 = await getBase64ImageFromUrl("/logo.png")
      pdf.addImage(b64, "PNG", 15, 20, 50, 25)

      pdf.setFontSize(20);
      pdf.setFont("helvetica", "Italic");
      pdf.text("TuniOlive inc", 70, 25);

      pdf.setFontSize(12);

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text("Tunisian Olive Oil", 70, 30);
      pdf.text("3203 rue Noordyun", 70, 35);
      pdf.text("Saint Laurent H4R1A1", 70, 40);
      pdf.text("Email: info@tuniolive.com", 70, 45);
      pdf.text("Phone: +1 (514) 601-0603", 70, 50);

      // Table content
      const body = [
        ["Facture / Invoice", invoiceData.invoiceNumber],
        ["Date M/J-D/A-Y", new Date(invoiceData.invoiceDate).toLocaleDateString()],
        ["Due Date M/J-D/A-Y", new Date(invoiceData.dueDate).toLocaleDateString()],
      ];
      autoTable(pdf, {
        body,
        theme: "grid",
        styles: { fontSize: 11, cellPadding: 2 },
        tableWidth: "wrap",
        margin: { left: pageWidth - 80 }, // stick right
        startY: 25,           // stick top
        didDrawPage: () => {
          pdf.setPage(1);
        },
      });

      // Bill To Section
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Vendu a / Sold To:", 20, 80);

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(invoiceData.item, 20, 90);
      pdf.text(customer.email, 20, 97);

      if (customer.adresse) {
        const addressLines = customer.adresse.split('\n');
        let yPos = 104;
        addressLines.forEach(line => {
          pdf.text(line, 20, yPos);
          yPos += 5;
        });
      }

      // Ship To Section
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("Expedie a / Shipped to:", pageWidth - 80, 80);

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(invoiceData.item, pageWidth - 80, 90);
      pdf.text(customer.email, pageWidth - 80, 97);

      if (customer.adresse) {
        const addressLines = customer.adresse.split('\n');
        let yPos = 104;
        addressLines.forEach(line => {
          pdf.text(line, pageWidth - 80, yPos);
          yPos += 5;
        });
      }

      // // Line Items Table Header
      const tableStartY = 130;

      const firstHeaderRow: CellInput[] | undefined = [
        { content: "Instruction de la livraison \n delivery instruction", colSpan: 2 },
        { content: "Delai\n Terms", colSpan: 2 },
        { content: "No Commande de Client\n Customer Order no.", colSpan: 2 },
      ];

      // Second header row (children headers)
      const secondHeaderRow = [
        "Item #",
        "Description",
        "Qty Box",
        "Qty Unit",
        "Unit Price/Prix",
        "Total Price/Prix",
      ];

      // Line Items
      pdf.setFont("helvetica", "normal");
      let yPos = tableStartY + 15;
      const body11: RowInput[] = []
      invoiceData.lineItems.forEach((item, index) => {
        body11.push([
          index + 1,
          { content: item.description, styles: { halign: "left" } },
          item.qtyBox.toString(),
          item.qtyUnit.toString(),
          `$${item.unitPrice.toFixed(2)}`,
          `$${item.total.toFixed(2)}`,
          `$${item.total.toFixed(2)}`,
          `$${item.total.toFixed(2)}`
        ])
        yPos += 10;
      });

      autoTable(pdf, {
        head: [firstHeaderRow, secondHeaderRow],
        headStyles: {
          fillColor: [173, 216, 230], // light blue (friendly)
          textColor: [34, 34, 34],    // dark gray text
          fontStyle: "bold",
        },
        body: body11,
        startY: tableStartY,
        theme: "striped",
        styles: { halign: "center", fontSize: 10 },
      });

      // Totals Section
      const totalsStartY = yPos + 10;

      pdf.text("Subtotal:", pageWidth - 60, totalsStartY + 15, { align: "right" });
      pdf.text(`$${invoiceData.subtotal.toFixed(2)}`, pageWidth - 20, totalsStartY + 15, { align: "right" });

      pdf.text(`Tax (${invoiceData.taxRate}%):`, pageWidth - 60, totalsStartY + 25, { align: "right" });
      pdf.text(`$${invoiceData.taxAmount.toFixed(2)}`, pageWidth - 20, totalsStartY + 25, { align: "right" });

      pdf.setFont("helvetica", "bold");
      pdf.text("Total:", pageWidth - 60, totalsStartY + 35, { align: "right" });
      pdf.text(`$${invoiceData.totalPrice.toFixed(2)}`, pageWidth - 20, totalsStartY + 35, { align: "right" });

      // Notes Section
      if (invoiceData.notes) {
        pdf.setFont("helvetica", "bold");
        pdf.text("Notes:", 20, totalsStartY + 60);
        pdf.setFont("helvetica", "normal");

        const noteLines = invoiceData.notes.split('n');
        let notesY = totalsStartY + 70;
        noteLines.forEach(line => {
          pdf.text(line, 20, notesY);
          notesY += 7;
        });
      }

      // Footer
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.text("Thank you for your business!", pageWidth / 2, pageHeight - 20, { align: "center" });

      // Save PDF
      pdf.save(`invoice-${invoiceData.invoiceNumber}.pdf`);
      toast.success("Invoice PDF generated successfully!");

    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Error generating PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  function excelDateToJSDate(serial: number) {
    const excelEpoch = new Date(1899, 11, 30); // Excel's day 0
    const days = Math.floor(serial);
    return new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */ }
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 mx-auto">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Site</span>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center space-x-2">
              <Leaf className="h-6 w-6 text-green-600" />
              <span className="font-bold">Admin Panel</span>
            </div>
          </div>
          <Badge variant="secondary" className="flex items-center space-x-1">
            <FileText className="h-3 w-3" />
            <span>Invoice Generator</span>
          </Badge>
        </div>
      </header>


      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Generate Invoice</h1>
          <p className="text-muted-foreground">Create and download professional PDF invoices for your olive oil orders.</p>
        </div>

        <div className="grid gap-8">

          {/* Customer List Section */ }
          { showInvoiceList && (
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Invoice Directory</span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={ () => setShowInvoiceList(false) }
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader >
              <CardContent>
                {/* Search Bar */ }
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search customers by number, name, or city..."
                      value={ searchTerm }
                      onChange={ (e) => setSearchTerm(e.target.value) }
                      className="pl-10"
                    />
                  </div>
                </div >

                {/* Customer Table */ }
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted/50 px-4 py-3 border-b">
                    <div className="grid grid-cols-9 gap-4 text-sm font-medium">
                      <div> Invoice #</div>
                      <div>Item</div>
                      <div>Invoice date</div>
                      <div>Qty Box</div>
                      <div>Qty Unit</div>
                      <div>Unit Price</div>
                      <div>Total Price</div>
                      <div>Extended Price</div>
                      <div className="text-center">Actions</div>
                    </div >
                  </div >
                  <div className="divide-y max-h-96 overflow-y-auto">
                    {
                      filteredInvoices.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p > No invoices found matching your search</p >
                        </div >
                      ) : (
                        filteredInvoices.map((invoice, index) => (
                          <div key={ index } className="px-4 py-3 hover:bg-muted/25 transition-colors">
                            <div className="grid grid-cols-9 gap-4 text-sm">
                              <div className="font-medium text-green-600">{ invoice.invoiceNumber }</div>
                              <div className="font-medium">{ invoice.item }</div>
                              <div className="text-muted-foreground">{ invoice.invoiceDate }</div>
                              <div className="text-muted-foreground">{ invoice.QtyBox }</div>
                              <div > { invoice.QtyUnit }</div >
                              <div>{ invoice.unitPrice }</div>
                              <div className="text-center">
                                <Badge variant="secondary" className="text-xs">{ invoice.totalPrice }</Badge>
                              </div >
                              <div>{ invoice.extendedPrice }</div>
                              <div className="flex justify-center">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={ () => generateCustomerPDF(invoice) }
                                  className="flex items-center space-x-1 text-xs"
                                >
                                  <Download className="h-3 w-3" />
                                  <span > PDF</span >
                                </Button >
                              </div >
                            </div >
                          </div >
                        ))
                      )
                    }
                  </div >
                </div >

                {/* Customer Stats */ }
                <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{ invoicesLoaded.length }</div>
                    <div className="text-sm text-muted-foreground">Total Customers</div>
                  </div >
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{ invoicesLoaded.filter(c => c.item === 'QC').length }</div>
                    <div className="text-sm text-muted-foreground">Quebec Customers</div>
                  </div >
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{ filteredInvoices.length }</div>
                    <div className="text-sm text-muted-foreground">Search Results</div>
                  </div >
                </div >
              </CardContent >
            </Card >
          ) }

          {/* Invoice Details */ }
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    value={ invoiceData.invoiceNumber }
                    onChange={ (e) => setInvoiceData(prev => ({ ...prev, invoiceNumber: e.target.value })) }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoiceDate">Invoice Date</Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={ invoiceData.invoiceDate }
                    onChange={ (e) => setInvoiceData(prev => ({ ...prev, invoiceDate: e.target.value })) }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={ invoiceData.dueDate }
                    onChange={ (e) => setInvoiceData(prev => ({ ...prev, dueDate: e.target.value })) }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Details */ }
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerNumber">Customer Id *</Label>
                  <Input
                    id="customerNumber"
                    type="number"
                    value={ customer?.customerNumber }
                    onChange={ (e) => setInvoiceData(prev => ({ ...prev, customerNumber: Number(e.target.value) })) }
                    placeholder="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={ customer?.soldTo }
                    onChange={ (e) => setInvoiceData(prev => ({ ...prev, item: e.target.value })) }
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Customer Email *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={ customer?.email }
                    onChange={ (e) => setCustomer(prev => ({ ...prev, email: e.target.value })) }
                    // onChange={ (e) => setInvoiceData(prev => ({ ...prev, customerEmail: e.target.value })) }
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerAddress">Customer Address</Label>
                <Textarea
                  id="customerAddress"
                  value={ customer?.adresse }
                  onChange={ (e) => setCustomer(prev => ({ ...prev, adresse: e.target.value })) }
                  placeholder="123 Main St&#10;City, State 12345&#10;Country"
                  rows={ 3 }
                />
              </div>
            </CardContent>
          </Card>

          {/* Line Items */ }
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Invoice Items</CardTitle>
                <Button onClick={ addLineItem } size="sm" className="flex items-center space-x-1">
                  <Plus className="h-4 w-4" />
                  <span>Add Item</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                { invoiceData.lineItems.map((item, index) => (
                  <div key={ index } className="grid grid-cols-12 gap-4 items-end p-4 border rounded-lg">
                    <div className="col-span-12 md:col-span-5 space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={ item.description }
                        onChange={ (e) => updateLineItem(item.id, 'description', e.target.value) }
                        placeholder="Product description"
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2 space-y-2">
                      <Label>Qty Box</Label>
                      <Input
                        type="number"
                        min="1"
                        value={ item.qtyBox }
                        onChange={ (e) => updateLineItem(item.id, 'qtyBox', parseInt(e.target.value) || 1) }
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2 space-y-2">
                      <Label>Qty Unit</Label>
                      <Input
                        type="number"
                        min="1"
                        value={ item.qtyUnit }
                        onChange={ (e) => updateLineItem(item.id, 'qtyUnit', parseInt(e.target.value) || 1) }
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2 space-y-2">
                      <Label>Unit Price</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={ item.unitPrice }
                        onChange={ (e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0) }
                      />
                    </div>
                    <div className="col-span-3 md:col-span-2 space-y-2">
                      <Label>Total</Label>
                      <div className="h-10 flex items-center font-medium">
                        ${ item.total.toFixed(2) }
                      </div>
                    </div>
                    <div className="col-span-1 flex justify-center">
                      { invoiceData.lineItems.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={ () => removeLineItem(item.id) }
                          className="text-destructive hover:text-destructive"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      ) }
                    </div>
                  </div>
                )) }
              </div>

              <Separator className="my-6" />

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={ invoiceData.taxRate }
                    onChange={ (e) => updateTaxRate(parseFloat(e.target.value) || 0) }
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    {/* <span>${ invoiceData.subtotal.toFixed(2) }</span> */ }
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({ invoiceData.taxRate }%):</span>
                    {/* <span>${ invoiceData.taxAmount.toFixed(2) }</span> */ }
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>${ invoiceData.totalPrice.toFixed(2) }</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */ }
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={ invoiceData.notes }
                  onChange={ (e) => setInvoiceData(prev => ({ ...prev, notes: e.target.value })) }
                  placeholder="Thank you for your business! Payment is due within 30 days."
                  rows={ 3 }
                />
              </div>
            </CardContent>
          </Card>

          {/* Generate PDF Button */ }
          <div className="flex justify-end">
            <Button
              onClick={ generatePDF }
              disabled={ isGenerating }
              size="lg"
              className="bg-green-600 hover:bg-green-700 flex items-center space-x-2"
            >
              { isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Generate PDF Invoice</span>
                </>
              ) }
            </Button>
          </div>
        </div>
      </div >
    </div>
  )
}
