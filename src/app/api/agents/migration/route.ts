import { NextResponse } from "next/server";
import { z } from "zod";
import { generateJson } from "@/lib/ai-provider";
import { generateMigrationJob } from "@/lib/mock-agents";
import { uid } from "@/lib/utils";
import type { MigrationJob, MigrationMapping, ValidationError } from "@/types";

const migrationSchema = z.object({
  projectId: z.string(),
  dataType: z.string().min(1),
  sourceName: z.string().optional(),
  targetName: z.string().optional()
});

type MigrationAiShape = {
  title: string;
  mappings: MigrationMapping[];
  validationErrors: ValidationError[];
  previewRows: Record<string, string | number>[];
};

export async function POST(request: Request) {
  const input = migrationSchema.parse(await request.json());
  const fallback = generateMigrationJob(input);

  const result = await generateJson<MigrationAiShape>({
    fallback: {
      title: fallback.title,
      mappings: fallback.mappings,
      validationErrors: fallback.validationErrors,
      previewRows: fallback.previewRows
    },
    system:
      "You are FounderBox AI Migration Agent. Suggest spreadsheet field mappings and validation issues for accounting, ERP, CRM, and business import files. Be conservative and require user approval for legal or financial fields.",
    user: JSON.stringify({
      instruction:
        "Return JSON with title, mappings, validationErrors, and previewRows. Mappings require targetField, suggestedSourceColumn, confidence 0-100, required boolean, action Use/Review/Auto Detect. Validation errors require row, field, issue, suggestedFix, severity High/Medium/Low.",
      input
    })
  });

  const job: MigrationJob = {
    ...fallback,
    title: result.data.title || fallback.title,
    mappings: Array.isArray(result.data.mappings) && result.data.mappings.length
      ? result.data.mappings.map((mapping) => ({ ...mapping, id: mapping.id || uid("map") }))
      : fallback.mappings,
    validationErrors: Array.isArray(result.data.validationErrors)
      ? result.data.validationErrors.map((error) => ({ ...error, id: error.id || uid("val") }))
      : fallback.validationErrors,
    previewRows: Array.isArray(result.data.previewRows) && result.data.previewRows.length
      ? result.data.previewRows
      : fallback.previewRows
  };

  return NextResponse.json({
    job,
    mode: result.mode,
    notice: result.notice
  });
}
