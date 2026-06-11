import { NextResponse } from "next/server";
import { z } from "zod";
import { generateJson } from "@/lib/ai-provider";
import { generateQAReport, qaProgressSteps } from "@/lib/mock-agents";
import { uid } from "@/lib/utils";
import type { QAIssue, QAReport } from "@/types";

const qaSchema = z.object({
  projectId: z.string(),
  url: z.string().min(1),
  email: z.string().optional(),
  module: z.string().min(1),
  instructions: z.string().min(1),
  sampleData: z.boolean(),
  reportType: z.enum(["Smoke", "Functional", "UI/UX", "Regression"])
});

type QaAiShape = {
  title: string;
  summary: string;
  issues: QAIssue[];
};

export async function POST(request: Request) {
  const input = qaSchema.parse(await request.json());
  const normalizedInput = {
    ...input,
    email: input.email ?? ""
  };
  const fallback = generateQAReport(normalizedInput);

  const result = await generateJson<QaAiShape>({
    fallback: {
      title: fallback.title,
      summary: fallback.summary,
      issues: fallback.issues
    },
    system:
      "You are FounderBox AI QA Agent. Generate realistic QA findings from the provided URL/module/instructions. Do not claim you opened a browser unless browser automation evidence is supplied.",
    user: JSON.stringify({
      instruction:
        "Return JSON with title, summary, and exactly 6 issues. Each issue must have module, issue, description, priority as High/Medium/Low, and status as Open.",
      input
    })
  });

  const issues = Array.isArray(result.data.issues) && result.data.issues.length
    ? result.data.issues.map((issue) => ({ ...issue, id: issue.id || uid("issue") }))
    : fallback.issues;

  const report: QAReport = {
    ...fallback,
    title: result.data.title || fallback.title,
    summary: result.data.summary || fallback.summary,
    steps: qaProgressSteps,
    issues
  };

  return NextResponse.json({
    report,
    mode: result.mode,
    notice: result.notice
  });
}
