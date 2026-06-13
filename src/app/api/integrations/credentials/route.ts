import { NextResponse } from "next/server";
import { z } from "zod";
import { auditEvent } from "@/lib/server/founderbox-data";
import { withApiHandler } from "@/lib/server/api";
import { upsertWorkspaceCredential } from "@/lib/server/credentials";
import { requireRequestContext } from "@/lib/server/request-context";
import { enforceRateLimit } from "@/lib/server/rate-limit";

const credentialSchema = z.object({
  provider: z.string().min(1).max(64),
  label: z.string().min(1).max(64).optional(),
  secret: z.string().min(8),
  metadata: z.record(z.unknown()).optional()
});

export async function POST(request: Request) {
  return withApiHandler(async () => {
    enforceRateLimit(request, "credentials:write", 12, 60_000);
    const context = await requireRequestContext();
    const input = credentialSchema.parse(await request.json());
    const credential = await upsertWorkspaceCredential({
      workspaceId: context.workspaceId,
      provider: input.provider,
      label: input.label,
      secret: input.secret,
      metadata: input.metadata ? JSON.parse(JSON.stringify(input.metadata)) : undefined
    });

    await auditEvent(context, {
      action: "credential.upserted",
      targetType: "credential",
      targetId: credential.id,
      metadata: {
        provider: input.provider,
        label: input.label || "default"
      }
    });

    return NextResponse.json({
      ok: true,
      credential: {
        id: credential.id,
        provider: credential.provider,
        label: credential.label,
        configuredAt: credential.configuredAt.toISOString()
      }
    });
  });
}
