import { NextResponse } from "next/server";

import { hasGeminiKey } from "@/lib/gemini";

export const dynamic = "force-dynamic";

export async function GET() {
  const configured = hasGeminiKey();
  return NextResponse.json({
    configured,
    provider: configured ? "gemini" : "demo",
    model: configured
      ? process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash"
      : "demonstração local",
  });
}
