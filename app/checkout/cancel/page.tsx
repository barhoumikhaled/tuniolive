"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { XCircle, ShoppingBag, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/language-context";

export default function CheckoutCancelPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="h-10 w-10 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold mb-2">{ t("checkout.cancelTitle") }</h1>
            <p className="text-muted-foreground">{ t("checkout.cancelMessage") }</p>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/#products">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <ShoppingBag className="h-4 w-4 mr-2" />
                { t("checkout.continueShopping") }
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                { t("checkout.backHome") }
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
