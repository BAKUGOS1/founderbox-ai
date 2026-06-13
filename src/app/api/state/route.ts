import { NextResponse } from "next/server";
import { getFounderBoxState } from "@/lib/server/founderbox-data";
import { requireRequestContext } from "@/lib/server/request-context";
import { enforceRateLimit } from "@/lib/server/rate-limit";
import { withApiHandler } from "@/lib/server/api";

export async function GET(request: Request) {
  return withApiHandler(async () => {
    enforceRateLimit(request, "state:get", 120, 60_000);
    const context = await requireRequestContext();
    const state = await getFounderBoxState(context);

    return NextResponse.json({
      state,
      mode: context.demo ? "demo" : "database"
    });
  });
}
