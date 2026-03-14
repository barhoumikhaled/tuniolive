import { NextResponse } from "next/server";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not configured");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-04-30.basil",
});

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const masked = local.length > 2 ? local[0] + "***" + local[local.length - 1] : "***";
  return `${masked}@${domain}`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId || !sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "Invalid session_id" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Session not completed" }, { status: 404 });
    }

    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);

    const email = session.customer_details?.email;

    return NextResponse.json({
      customerEmail: email ? maskEmail(email) : "N/A",
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
