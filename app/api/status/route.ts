import { NextResponse } from "next/server";

import { getGatewayModel, hasGatewayAuth } from "@/lib/ai";
import { getGeminiModel, hasGeminiKey } from "@/lib/gemini";

export const dynamic = "force-dynamic";

export async function GET() {
  const gemini = hasGeminiKey();
  const gateway = hasGatewayAuth();
  const configured = gemini || gateway;
  return NextResponse.json({
    configured,
    provider: gemini ? "gemini" : gateway ? "gateway" : "demo",
    model: gemini
      ? getGeminiModel()
      : gateway
        ? getGatewayModel("interview")
        : "demonstração local",
    fallbackConfigured: gemini && gateway,
  });
}
