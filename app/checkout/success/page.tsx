"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, ShoppingBag, ArrowLeft, Loader2, Truck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import { useCart } from "@/contexts/cart-context";

interface OrderLineItem {
  name: string;
  quantity: number;
  amount: number;
}

interface ShippingInfo {
  address: string;
  city: string;
  province: string;
  postalCode: string;
  method: string;
  cost: number;
}

interface OrderSummary {
  customerEmail: string;
  amountTotal: number;
  currency: string;
  items: OrderLineItem[];
  shipping: ShippingInfo | null;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { t } = useLanguage();
  const { clearCart } = useCart();
  const hasCleared = useRef(false);
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(!!sessionId);

  useEffect(() => {
    if (!hasCleared.current) {
      clearCart();
      hasCleared.current = true;
    }
  }, [clearCart]);

  useEffect(() => {
    if (!sessionId) return;
    fetch(`/api/checkout/session?session_id=${encodeURIComponent(sessionId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setOrder(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold mb-2">{t("checkout.successTitle")}</h1>
            <p className="text-muted-foreground">{t("checkout.successMessage")}</p>
          </div>

          {loading && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {order && (
            <div className="text-left space-y-3">
              <Separator />
              <h2 className="font-semibold">{t("checkout.orderSummary")}</h2>
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>
                    {item.name} x{item.quantity}
                  </span>
                  <span>${item.amount.toFixed(2)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>{t("cart.total")}</span>
                <span>
                  ${order.amountTotal.toFixed(2)} {order.currency.toUpperCase()}
                </span>
              </div>

              {order.shipping && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2 text-sm">
                      <Truck className="h-4 w-4" />
                      {t("shipping.title")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {order.shipping.address}, {order.shipping.city},{" "}
                      {order.shipping.province} {order.shipping.postalCode}
                    </p>
                    <p className="text-sm">
                      {order.shipping.method}
                      {order.shipping.cost > 0
                        ? ` — $${order.shipping.cost.toFixed(2)}`
                        : ` — ${t("shipping.free")}`}
                    </p>
                  </div>
                </>
              )}

              {order.customerEmail !== "N/A" && (
                <p className="text-xs text-muted-foreground">
                  {t("checkout.confirmationSentTo")} {order.customerEmail}
                </p>
              )}
            </div>
          )}

          {sessionId && (
            <p className="text-xs text-muted-foreground">
              {t("checkout.orderId")}: {sessionId.slice(-8).toUpperCase()}
            </p>
          )}
          <div className="flex flex-col gap-3">
            <Link href="/#products">
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <ShoppingBag className="h-4 w-4 mr-2" />
                {t("checkout.continueShopping")}
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("checkout.backHome")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p>Loading...</p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
