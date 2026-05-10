import { NextResponse } from "next/server";
import { runSeed } from "@/lib/seed";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Seed is disabled in production" }, { status: 403 });
  }
  try {
    await runSeed();
    return NextResponse.json({ success: true, message: "Database seeded successfully" });
  } catch (err) {
    console.error("Seed error:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
