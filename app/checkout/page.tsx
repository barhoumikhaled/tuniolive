"use client";

import { useCart } from "@/contexts/cart-context";
import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CreditCard, Minus, Plus, Trash2, Truck, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { PROVINCES, FREE_SHIPPING_THRESHOLD, getShippingCost } from "@/data/shipping-rates";

export default function CheckoutPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();
  const { t } = useLanguage();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");

  const [shippingMethodId, setShippingMethodId] = useState("");

  const isFreeShipping = totalPrice >= FREE_SHIPPING_THRESHOLD;
  const selectedProvince = PROVINCES.find((p) => p.code === province);
  const shippingCost = isFreeShipping
    ? 0
    : province && shippingMethodId
      ? getShippingCost(province, shippingMethodId, totalPrice)
      : 0;
  const grandTotal = totalPrice + shippingCost;

  const selectedMethod = selectedProvince?.methods.find((m) => m.id === shippingMethodId);

  const isShippingComplete =
    address.trim() !== "" &&
    city.trim() !== "" &&
    province !== "" &&
    postalCode.trim() !== "" &&
    (isFreeShipping || shippingMethodId !== "");

  const handleCheckout = async () => {
    if (items.length === 0 || !isShippingComplete) return;
    setIsCheckingOut(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
          shipping: {
            address,
            city,
            province,
            postalCode,
            methodId: isFreeShipping ? "free" : shippingMethodId,
            cost: shippingCost,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Checkout failed");
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: unknown) {
      console.error("Checkout error:", err);
      const { toast } = await import("sonner");
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <h1 className="text-2xl font-semibold">{t("cart.empty")}</h1>
            <Link href="/#products">
              <Button className="bg-green-600 hover:bg-green-700">
                {t("checkout.continueShopping")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href="/#products"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("checkout.continueShopping")}
        </Link>

        <h1 className="text-3xl font-semibold mb-8">{t("cart.title")}</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="relative w-20 h-20 flex-shrink-0 rounded overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-green-600 font-semibold">${item.price}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 ml-auto text-destructive"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-right font-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  {t("shipping.title")}
                </h2>
                <Separator />

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label htmlFor="address">{t("shipping.address")}</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={t("shipping.addressPlaceholder")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">{t("shipping.city")}</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder={t("shipping.cityPlaceholder")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="province">{t("shipping.province")}</Label>
                    <select
                      id="province"
                      value={province}
                      onChange={(e) => {
                        setProvince(e.target.value);
                        setShippingMethodId("");
                      }}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="">{t("shipping.selectProvince")}</option>
                      {PROVINCES.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.name} ({p.code})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="postalCode">{t("shipping.postalCode")}</Label>
                    <Input
                      id="postalCode"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder={t("shipping.postalCodePlaceholder")}
                    />
                  </div>
                </div>

                {province && (
                  <>
                    <Separator />
                    <h3 className="font-medium">{t("shipping.method")}</h3>
                    {isFreeShipping ? (
                      <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-green-500 bg-green-50">
                        <Package className="h-5 w-5 text-green-600" />
                        <div className="flex-1">
                          <p className="font-medium text-green-700">{t("shipping.freeShipping")}</p>
                          <p className="text-sm text-green-600">
                            {t("shipping.freeShippingMessage")}
                          </p>
                        </div>
                        <span className="font-semibold text-green-700">$0.00</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          {t("shipping.freeShippingNote").replace("${amount}", String(FREE_SHIPPING_THRESHOLD))}
                        </p>
                        {selectedProvince?.methods.map((method) => (
                          <label
                            key={method.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                              shippingMethodId === method.id
                                ? "border-green-500 bg-green-50"
                                : "border-muted hover:border-green-300"
                            }`}
                          >
                            <input
                              type="radio"
                              name="shippingMethod"
                              value={method.id}
                              checked={shippingMethodId === method.id}
                              onChange={() => setShippingMethodId(method.id)}
                              className="accent-green-600"
                            />
                            <div className="flex-1">
                              <p className="font-medium">{method.name}</p>
                              <p className="text-sm text-muted-foreground">{method.estimatedDays}</p>
                            </div>
                            <span className="font-semibold">${method.price.toFixed(2)}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-4">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-lg font-semibold">{t("checkout.orderSummary")}</h2>
                <Separator />
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.name} x{item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between text-sm">
                  <span>{t("shipping.subtotal")}</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t("shipping.shippingFee")}</span>
                  <span>
                    {isFreeShipping ? (
                      <span className="text-green-600 font-medium">{t("shipping.free")}</span>
                    ) : shippingCost > 0 ? (
                      `$${shippingCost.toFixed(2)}`
                    ) : (
                      "—"
                    )}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>{t("cart.total")}</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>
                {selectedMethod && !isFreeShipping && (
                  <p className="text-xs text-muted-foreground">
                    {selectedMethod.name} — {selectedMethod.estimatedDays}
                  </p>
                )}
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isCheckingOut || !isShippingComplete}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {isCheckingOut ? t("cart.processing") : t("cart.checkout")}
                </Button>
                {!isShippingComplete && (
                  <p className="text-xs text-center text-amber-600">
                    {t("shipping.completeAddress")}
                  </p>
                )}
                <p className="text-xs text-center text-muted-foreground">
                  {t("checkout.securePayment")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
