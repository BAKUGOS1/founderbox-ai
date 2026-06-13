import { NextResponse } from "next/server";
import { z } from "zod";
import { auditEvent, getFounderBoxState, persistReport } from "@/lib/server/founderbox-data";
import { withApiHandler } from "@/lib/server/api";
import { assertProjectAccess, requireRequestContext } from "@/lib/server/request-context";
import { enforceRateLimit } from "@/lib/server/rate-limit";

const reportSchema = z.object({
  id: z.string(),
  projectId: z.string().min(1),
  title: z.string().min(1),
  type: z.enum(["PM Document", "QA Report", "Migration Report", "Memory Summary"]),
  agent: z.enum(["AI PM Agent", "AI QA Agent", "AI Migration Agent", "Founder Black Box"]),
  createdAt: z.string(),
  status: z.enum(["Ready", "Draft", "Processing"]),
  summary: z.string()
});

export async function GET(request: Request) {
  return withApiHandler(async () => {
    enforceRateLimit(request, "reports:get", 120, 60_000);
    const context = await requireRequestContext();
    const projectId = new URL(request.url).searchParams.get("projectId");
    const state = await getFounderBoxState(context);
    const reports = projectId
      ? state.reports.filter((report) => report.projectId === projectId)
      : state.reports;

    return NextResponse.json({ reports });
  });
}

export async function POST(request: Request) {
  return withApiHandler(async () => {
    enforceRateLimit(request, "reports:write", 60, 60_000);
    const context = await requireRequestContext();
    const input = reportSchema.parse(await request.json());
    await assertProjectAccess(context, input.projectId);
    const report = await persistReport(context, input);
    await auditEvent(context, {
      action: "report.created",
      targetType: "report",
      targetId: report.id,
      metadata: { projectId: report.projectId }
    });

    return NextResponse.json({ report }, { status: 201 });
  });
}
