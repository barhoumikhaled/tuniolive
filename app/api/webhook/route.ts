import { NextResponse } from "next/server";
import Stripe from "stripe";
import { sendOrderNotification } from "@/utils/send-order-email";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not configured");
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-02-25.clover",
});


const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const processedEvents = new Set<string>();

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    if (processedEvents.has(event.id)) {
      return NextResponse.json({ received: true, duplicate: true });
    }
    processedEvents.add(event.id);

    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true });
    }

    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id
      );

      const metadata = session.metadata || {};
      console.log("KHALED EMAIL")
      await sendOrderNotification({
        sessionId: session.id,
        customerEmail: session.customer_details?.email || "N/A",
        customerName: session.customer_details?.name || "N/A",
        amountTotal: (session.amount_total || 0) / 100,
        currency: session.currency || "cad",
        items: lineItems.data.map((item) => ({
          name: item.description || "Product",
          quantity: item.quantity || 1,
          amount: (item.amount_total || 0) / 100,
        })),
        shipping: {
          address: metadata.shipping_address || "",
          city: metadata.shipping_city || "",
          province: metadata.shipping_province || "",
          postalCode: metadata.shipping_postal_code || "",
          method: metadata.shipping_method || "N/A",
          cost: parseFloat(metadata.shipping_cost || "0"),
        },
      });
    } catch (emailErr) {
      console.error("Failed to send order notification email:", emailErr);
    }
  }

  return NextResponse.json({ received: true });
}
