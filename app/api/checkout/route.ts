import { NextResponse } from "next/server";
import Stripe from "stripe";
import { PROVINCES, FREE_SHIPPING_THRESHOLD } from "@/data/shipping-rates";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not configured");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-02-25.clover",
});


const PRODUCT_CATALOG: Record<string, { name: string; price: number; image: string }> = {
  "tuniolive-1l-evoo": {
    name: "TuniOlive Extra Virgin Olive Oil – 1 L Bottle",
    price: 45,
    image: "/tuniolive-1l/tuniolive-1l-main.jpeg",
  },
  "tuniolive-750ml-evoo": {
    name: "TuniOlive Extra Virgin Olive Oil – 750 mL Bottle",
    price: 45,
    image: "/tuniolive-750-ml/tuniolive-750-ml-main.jpeg",
  },
  "tuniolive-3l-evoo": {
    name: "TuniOlive Extra Virgin Olive Oil – 3L Tin",
    price: 45,
    image: "/tuniolive-3l/tuniolive-3l-main.jpeg",
  },
};

interface CheckoutRequestItem {
  id: string;
  quantity: number;
}

interface ShippingInfo {
  address: string;
  city: string;
  province: string;
  postalCode: string;
  methodId: string;
  cost: number;
}

export async function POST(req: Request) {
  try {
    const { items, shipping } = (await req.json()) as {
      items: CheckoutRequestItem[];
      shipping: ShippingInfo;
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    if (!shipping || !shipping.address || !shipping.city || !shipping.province || !shipping.postalCode) {
      return NextResponse.json({ error: "Shipping address is required" }, { status: 400 });
    }

    const provinceData = PROVINCES.find((p) => p.code === shipping.province);
    if (!provinceData) {
      return NextResponse.json({ error: "Invalid province" }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || req.headers.get("origin") || "";

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => {
      const product = PRODUCT_CATALOG[item.id];
      if (!product) {
        throw new Error(`Unknown product: ${item.id}`);
      }

      const quantity = Math.max(1, Math.min(99, Math.floor(Number(item.quantity) || 1)));

      return {
        price_data: {
          currency: "cad",
          product_data: {
            name: product.name,
            images: [`${siteUrl}${product.image}`],
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity,
      };
    });

    const subtotal = items.reduce((sum, item) => {
      const product = PRODUCT_CATALOG[item.id];
      if (!product) return sum;
      const qty = Math.max(1, Math.min(99, Math.floor(Number(item.quantity) || 1)));
      return sum + product.price * qty;
    }, 0);

    const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

    let verifiedShippingCost = 0;
    let shippingMethodName = "Free Shipping";

    if (!isFreeShipping) {
      if (shipping.methodId === "free") {
        return NextResponse.json({ error: "Order does not qualify for free shipping" }, { status: 400 });
      }
      const method = provinceData.methods.find((m) => m.id === shipping.methodId);
      if (!method) {
        return NextResponse.json({ error: "Invalid shipping method" }, { status: 400 });
      }
      verifiedShippingCost = method.price;
      shippingMethodName = method.name;
    }

    if (verifiedShippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "cad",
          product_data: {
            name: `Shipping — ${shippingMethodName}`,
          },
          unit_amount: Math.round(verifiedShippingCost * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/cancel`,
      metadata: {
        shipping_address: shipping.address,
        shipping_city: shipping.city,
        shipping_province: shipping.province,
        shipping_postal_code: shipping.postalCode,
        shipping_method: shippingMethodName,
        shipping_cost: verifiedShippingCost.toFixed(2),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error("Stripe checkout error:", error);
    const message = error instanceof Error ? error.message : "Failed to create checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
