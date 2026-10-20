import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/inicio/:path*",
    "/login",
    "/cadastro",
    "/auth/:path*",
    "/api/interview",
    "/api/plan",
  ],
};
