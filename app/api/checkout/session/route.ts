import { NextResponse } from "next/server";
import Stripe from "stripe";

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const masked = local.length > 2 ? local[0] + "***" + local[local.length - 1] : "***";
  return `${masked}@${domain}`;
}

export async function GET(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-02-25.clover",
  });

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
    const metadata = session.metadata || {};

    function maskAddress(addr: string): string {
      if (addr.length <= 6) return "***";
      return addr.slice(0, 3) + "***" + addr.slice(-3);
    }

    function maskPostalCode(pc: string): string {
      if (pc.length <= 3) return "***";
      return pc.slice(0, 3) + " ***";
    }

    return NextResponse.json({
      customerEmail: email ? maskEmail(email) : "N/A",
      amountTotal: (session.amount_total || 0) / 100,
      currency: session.currency || "cad",
      items: lineItems.data.map((item) => ({
        name: item.description || "Product",
        quantity: item.quantity || 1,
        amount: (item.amount_total || 0) / 100,
      })),
      shipping: metadata.shipping_address
        ? {
          address: maskAddress(metadata.shipping_address),
          city: metadata.shipping_city || "",
          province: metadata.shipping_province || "",
          postalCode: maskPostalCode(metadata.shipping_postal_code || ""),
          method: metadata.shipping_method || "N/A",
          cost: parseFloat(metadata.shipping_cost || "0"),
        }
        : null,
    });
  } catch (err: unknown) {
    console.error("Failed to retrieve session:", err);
    return NextResponse.json(
      { error: "Failed to retrieve order details" },
      { status: 500 }
    );
  }
}
