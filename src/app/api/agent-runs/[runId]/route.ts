import { NextResponse } from "next/server";
import { ApiError, withApiHandler } from "@/lib/server/api";
import { getAgentRun } from "@/lib/server/founderbox-data";
import { requireRequestContext } from "@/lib/server/request-context";
import { enforceRateLimit } from "@/lib/server/rate-limit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  return withApiHandler(async () => {
    enforceRateLimit(request, "agent-runs:get", 120, 60_000);
    const context = await requireRequestContext();
    const { runId } = await params;
    const agentRun = await getAgentRun(context, runId);
    if (!agentRun) throw new ApiError(404, "Agent run not found.");

    return NextResponse.json({ agentRun });
  });
}
