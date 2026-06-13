import { NextResponse } from "next/server";
import { z } from "zod";
import { auditEvent, createProject, getFounderBoxState } from "@/lib/server/founderbox-data";
import { withApiHandler } from "@/lib/server/api";
import { requireRequestContext } from "@/lib/server/request-context";
import { enforceRateLimit } from "@/lib/server/rate-limit";

const projectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(["SaaS", "PWA", "Agency", "Migration", "Internal Tool"]),
  status: z.enum(["active", "paused", "archived"])
});

export async function GET(request: Request) {
  return withApiHandler(async () => {
    enforceRateLimit(request, "projects:get", 120, 60_000);
    const context = await requireRequestContext();
    const state = await getFounderBoxState(context);
    return NextResponse.json({ projects: state.projects });
  });
}

export async function POST(request: Request) {
  return withApiHandler(async () => {
    enforceRateLimit(request, "projects:write", 30, 60_000);
    const context = await requireRequestContext();
    const input = projectSchema.parse(await request.json());
    const project = await createProject(context, input);
    await auditEvent(context, {
      action: "project.created",
      targetType: "project",
      targetId: project.id
    });

    return NextResponse.json({ project }, { status: 201 });
  });
}
