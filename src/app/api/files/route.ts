import { NextResponse } from "next/server";
import { z } from "zod";
import { auditEvent, getFounderBoxState, persistFile } from "@/lib/server/founderbox-data";
import { withApiHandler } from "@/lib/server/api";
import { assertProjectAccess, requireRequestContext } from "@/lib/server/request-context";
import { enforceRateLimit } from "@/lib/server/rate-limit";

const fileSchema = z.object({
  id: z.string(),
  projectId: z.string().min(1),
  name: z.string().min(1),
  fileType: z.enum(["CSV", "XLSX", "Markdown", "JSON", "PDF"]),
  sourceAgent: z.enum(["Manual", "AI PM Agent", "AI QA Agent", "AI Migration Agent", "Founder Black Box"]),
  createdAt: z.string(),
  status: z.enum(["ready", "processing", "failed"])
});

export async function GET(request: Request) {
  return withApiHandler(async () => {
    enforceRateLimit(request, "files:get", 120, 60_000);
    const context = await requireRequestContext();
    const projectId = new URL(request.url).searchParams.get("projectId");
    const state = await getFounderBoxState(context);
    const files = projectId ? state.files.filter((file) => file.projectId === projectId) : state.files;

    return NextResponse.json({ files });
  });
}

export async function POST(request: Request) {
  return withApiHandler(async () => {
    enforceRateLimit(request, "files:write", 60, 60_000);
    const context = await requireRequestContext();
    const input = fileSchema.parse(await request.json());
    await assertProjectAccess(context, input.projectId);
    const file = await persistFile(context, input);
    await auditEvent(context, {
      action: "file.created",
      targetType: "file",
      targetId: file.id,
      metadata: { projectId: file.projectId }
    });

    return NextResponse.json({ file }, { status: 201 });
  });
}
