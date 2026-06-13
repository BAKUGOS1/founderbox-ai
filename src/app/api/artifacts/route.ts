import { NextResponse } from "next/server";
import { z } from "zod";
import {
  auditEvent,
  persistMigrationJob,
  persistPMDocument,
  persistQAReport
} from "@/lib/server/founderbox-data";
import { withApiHandler } from "@/lib/server/api";
import { assertProjectAccess, requireRequestContext } from "@/lib/server/request-context";
import { enforceRateLimit } from "@/lib/server/rate-limit";
import type { MigrationJob, PMDocument, QAReport } from "@/types";

const artifactSchema = z.object({
  kind: z.enum(["pmDocument", "qaReport", "migrationJob"]),
  artifact: z.unknown()
});

export async function POST(request: Request) {
  return withApiHandler(async () => {
    enforceRateLimit(request, "artifacts:write", 60, 60_000);
    const context = await requireRequestContext();
    const input = artifactSchema.parse(await request.json());

    if (input.kind === "pmDocument") {
      const artifact = input.artifact as PMDocument;
      await assertProjectAccess(context, artifact.projectId);
      const document = await persistPMDocument(context, artifact);
      await auditEvent(context, {
        action: "artifact.pm_document.saved",
        targetType: "pmDocument",
        targetId: document.id,
        metadata: { projectId: document.projectId }
      });
      return NextResponse.json({ document }, { status: 201 });
    }

    if (input.kind === "qaReport") {
      const artifact = input.artifact as QAReport;
      await assertProjectAccess(context, artifact.projectId);
      const report = await persistQAReport(context, artifact);
      await auditEvent(context, {
        action: "artifact.qa_report.saved",
        targetType: "qaReport",
        targetId: report.id,
        metadata: { projectId: report.projectId }
      });
      return NextResponse.json({ report }, { status: 201 });
    }

    const artifact = input.artifact as MigrationJob;
    await assertProjectAccess(context, artifact.projectId);
    const job = await persistMigrationJob(context, artifact);
    await auditEvent(context, {
      action: "artifact.migration_job.saved",
      targetType: "migrationJob",
      targetId: job.id,
      metadata: { projectId: job.projectId }
    });

    return NextResponse.json({ job }, { status: 201 });
  });
}
