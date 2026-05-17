import { NextResponse } from "next/server";
import { runSeed } from "@/lib/seed";

export async function POST(req: Request) {
  const token = req.headers.get("x-seed-token");
  if (token !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Seed disabled in production" }, { status: 403 });
  }
  try {
    await runSeed();
    return NextResponse.json({ success: true, message: "Database seeded successfully" });
  } catch (err) {
    console.error("Seed error:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
