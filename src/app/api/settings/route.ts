import { NextResponse } from "next/server";
import { z } from "zod";
import { auditEvent, updateWorkspaceProfile } from "@/lib/server/founderbox-data";
import { withApiHandler } from "@/lib/server/api";
import { requireRequestContext } from "@/lib/server/request-context";
import { enforceRateLimit } from "@/lib/server/rate-limit";

const settingsSchema = z.object({
  user: z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    avatarInitials: z.string().min(1).max(4).optional()
  }).optional(),
  workspace: z.object({
    name: z.string().min(1).optional(),
    defaultProjectId: z.string().optional()
  }).optional()
});

export async function PATCH(request: Request) {
  return withApiHandler(async () => {
    enforceRateLimit(request, "settings:write", 30, 60_000);
    const context = await requireRequestContext();
    const input = settingsSchema.parse(await request.json());
    await updateWorkspaceProfile(context, input);
    await auditEvent(context, {
      action: "settings.updated",
      targetType: "workspace",
      targetId: context.workspaceId
    });

    return NextResponse.json({ ok: true });
  });
}
