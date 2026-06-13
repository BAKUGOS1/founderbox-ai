import { NextResponse } from "next/server";
import { z } from "zod";
import { auditEvent, deleteProject, updateProject } from "@/lib/server/founderbox-data";
import { withApiHandler } from "@/lib/server/api";
import { assertProjectAccess, requireRequestContext } from "@/lib/server/request-context";
import { enforceRateLimit } from "@/lib/server/rate-limit";

const projectPatchSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  type: z.enum(["SaaS", "PWA", "Agency", "Migration", "Internal Tool"]).optional(),
  status: z.enum(["active", "paused", "archived"]).optional()
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  return withApiHandler(async () => {
    enforceRateLimit(request, "projects:write", 30, 60_000);
    const context = await requireRequestContext();
    const { projectId } = await params;
    await assertProjectAccess(context, projectId);
    const updates = projectPatchSchema.parse(await request.json());
    const project = await updateProject(context, projectId, updates);
    await auditEvent(context, {
      action: "project.updated",
      targetType: "project",
      targetId: project.id
    });

    return NextResponse.json({ project });
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  return withApiHandler(async () => {
    enforceRateLimit(request, "projects:write", 20, 60_000);
    const context = await requireRequestContext();
    const { projectId } = await params;
    await assertProjectAccess(context, projectId);
    await deleteProject(context, projectId);
    await auditEvent(context, {
      action: "project.deleted",
      targetType: "project",
      targetId: projectId
    });

    return NextResponse.json({ ok: true });
  });
}
