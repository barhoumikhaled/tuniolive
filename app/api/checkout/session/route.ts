import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-04-30.basil",
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);

    return NextResponse.json({
      customerName: session.customer_details?.name || "N/A",
      customerEmail: session.customer_details?.email || "N/A",
      amountTotal: (session.amount_total || 0) / 100,
      currency: session.currency || "usd",
      items: lineItems.data.map((item) => ({
        name: item.description || "Product",
        quantity: item.quantity || 1,
        amount: (item.amount_total || 0) / 100,
      })),
    });
  } catch (err: unknown) {
    console.error("Failed to retrieve session:", err);
    return NextResponse.json(
      { error: "Failed to retrieve order details" },
      { status: 500 }
    );
  }
}
