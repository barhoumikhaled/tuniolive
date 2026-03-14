import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
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

export async function POST(req: Request) {
  try {
    const { items } = (await req.json()) as { items: CheckoutRequestItem[] };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || req.headers.get("origin") || "";

    const lineItems = items.map((item) => {
      const product = PRODUCT_CATALOG[item.id];
      if (!product) {
        throw new Error(`Unknown product: ${item.id}`);
      }

      const quantity = Math.max(1, Math.min(99, Math.floor(Number(item.quantity) || 1)));

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: [`${siteUrl}${product.image}`],
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error("Stripe checkout error:", error);
    const message = error instanceof Error ? error.message : "Failed to create checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
