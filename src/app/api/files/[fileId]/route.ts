import { NextResponse } from "next/server";
import { auditEvent, deleteFile } from "@/lib/server/founderbox-data";
import { withApiHandler } from "@/lib/server/api";
import { requireRequestContext } from "@/lib/server/request-context";
import { enforceRateLimit } from "@/lib/server/rate-limit";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  return withApiHandler(async () => {
    enforceRateLimit(request, "files:write", 60, 60_000);
    const context = await requireRequestContext();
    const { fileId } = await params;
    await deleteFile(context, fileId);
    await auditEvent(context, {
      action: "file.deleted",
      targetType: "file",
      targetId: fileId
    });

    return NextResponse.json({ ok: true });
  });
}
