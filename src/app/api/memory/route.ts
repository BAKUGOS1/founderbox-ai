import { NextResponse } from "next/server";
import { z } from "zod";
import { auditEvent, getFounderBoxState, persistMemory } from "@/lib/server/founderbox-data";
import { withApiHandler } from "@/lib/server/api";
import { assertProjectAccess, requireRequestContext } from "@/lib/server/request-context";
import { enforceRateLimit } from "@/lib/server/rate-limit";

const memorySchema = z.object({
  id: z.string().optional(),
  projectId: z.string().min(1),
  title: z.string().min(1),
  type: z.enum(["Decision", "Note", "Bug", "Meeting", "Document", "Customer Request", "Migration", "QA"]),
  content: z.string().min(1),
  tags: z.array(z.string()),
  source: z.string().min(1),
  createdAt: z.string().optional()
});

export async function GET(request: Request) {
  return withApiHandler(async () => {
    enforceRateLimit(request, "memory:get", 120, 60_000);
    const context = await requireRequestContext();
    const projectId = new URL(request.url).searchParams.get("projectId");
    const state = await getFounderBoxState(context);
    const memories = projectId
      ? state.memories.filter((memory) => memory.projectId === projectId)
      : state.memories;

    return NextResponse.json({ memories });
  });
}

export async function POST(request: Request) {
  return withApiHandler(async () => {
    enforceRateLimit(request, "memory:write", 60, 60_000);
    const context = await requireRequestContext();
    const input = memorySchema.parse(await request.json());
    await assertProjectAccess(context, input.projectId);
    const memory = await persistMemory(context, input);
    await auditEvent(context, {
      action: "memory.created",
      targetType: "memory",
      targetId: memory.id,
      metadata: { projectId: memory.projectId }
    });

    return NextResponse.json({ memory }, { status: 201 });
  });
}
