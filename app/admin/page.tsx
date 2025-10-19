"use client";

import { useEffect, useState } from "react";
import autoTable, { CellInput, RowInput } from "jspdf-autotable";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { Leaf, Download, ArrowLeft, FileText, Users, Search } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { jsPDF } from "jspdf";
import { getAuthData, isAuthenticated, logout } from "@/utils/auth";
import { useRouter } from "next/navigation";

interface LineItem {
  id: string;
  description: string;
  qtyBox: number;
  qtyUnit: number;
  unitPrice: number;
  total: number;
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  lineItems: LineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [authData, setAuthData] = useState<any>(null);
  const [showCustomerList, setShowCustomerList] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customer, setCustomer] = useState<Customer>();
  const [invoicesLoaded, setInvoiceLoaded] = useState<Customer>();

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customerName: "",
    customerEmail: "",
    customerAddress: "",
    lineItems: [
      {
        id: "1",
        description: "TuniOlive Extra Virgin Olive Oil",
        qtyUnit: 12,
        qtyBox: 1,
        unitPrice: 10.75,
        total: 129
      }
    ],
    subtotal: 129,
    taxRate: 0,
    taxAmount: 0,
    total: 129,
    notes: ""
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // Check authentication on component mount
  useEffect(() => {
    (async () => {
      const response = await fetch("/api/data");
      const data = await response.json();
      setCustomers(data.clients);
      setInvoiceLoaded(data.invoices)
    })();
    if (!isAuthenticated()) {
      router.push('/login');
    } else {
      setAuthData(getAuthData());
      setIsLoading(false);
    }
  }, [router]);

  const generatePDF = async () => {

  };

  const generateCustomerPDF = async (customer: Customer) => {
    setCustomer(customer)
    setInvoiceData(prev => ({ ...prev, customerName: customer.soldTo, customerAddress: customer.adresse, customerEmail: customer.postalCode }));

  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push('/login');
  };

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer =>
    customer.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.soldTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.shipTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */ }
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
          { showCustomerList && (
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Customer Directory</span>
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={ () => setShowCustomerList(false) }
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
                      <div> Customer #</div>
                      <div>Sold To</div>
                      <div>Ship To</div>
                      <div>Address</div>
                      <div>City</div>
                      <div>Postal Code</div>
                      <div>Province</div>
                      <div>Country</div>
                      <div className="text-center">Actions</div>
                    </div >
                  </div >
                  <div className="divide-y max-h-96 overflow-y-auto">
                    {
                      filteredCustomers.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p > No customers found matching your search</p >
                        </div >
                      ) : (
                        filteredCustomers.map((customer) => (
                          <div key={ customer.customerNumber } className="px-4 py-3 hover:bg-muted/25 transition-colors">
                            <div className="grid grid-cols-9 gap-4 text-sm">
                              <div className="font-medium text-green-600">{ customer.customerNumber }</div>
                              <div className="font-medium">{ customer.soldTo }</div>
                              <div className="text-muted-foreground">{ customer.shipTo }</div>
                              <div className="text-muted-foreground">{ customer.adresse }</div>
                              <div > { customer.city }</div >
                              <div>{ customer.postalCode }</div>
                              <div className="text-center">
                                <Badge variant="secondary" className="text-xs">{ customer.province }</Badge>
                              </div >
                              <div>{ customer.country }</div>
                              <div className="flex justify-center">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={ () => generateCustomerPDF(customer) }
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
                    <div className="text-2xl font-bold text-green-600">{ customers.length }</div>
                    <div className="text-sm text-muted-foreground">Total Customers</div>
                  </div >
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{ customers.filter(c => c.province === 'QC').length }</div>
                    <div className="text-sm text-muted-foreground">Quebec Customers</div>
                  </div >
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{ filteredCustomers.length }</div>
                    <div className="text-sm text-muted-foreground">Search Results</div>
                  </div >
                </div >
              </CardContent >
            </Card >
          ) }

          {/* Invoice Details */ }
          {/* <Card>
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
          </Card> */}

          {/* Customer Details */ }
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={ invoiceData.customerName }
                    onChange={ (e) => setInvoiceData(prev => ({ ...prev, customerName: e.target.value })) }
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Customer Email *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={ invoiceData.customerEmail }
                    onChange={ (e) => setInvoiceData(prev => ({ ...prev, customerEmail: e.target.value })) }
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerAddress">Customer Address</Label>
                <Textarea
                  id="customerAddress"
                  value={ invoiceData.customerAddress }
                  onChange={ (e) => setInvoiceData(prev => ({ ...prev, customerAddress: e.target.value })) }
                  placeholder="123 Main St&#10;City, State 12345&#10;Country"
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
    </div >
  );
}