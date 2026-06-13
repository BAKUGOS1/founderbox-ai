import { NextResponse } from "next/server";
import { z } from "zod";
import { generateJson } from "@/lib/ai-provider";
import { generateQAReport, qaProgressSteps } from "@/lib/mock-agents";
import { getWorkspaceCredentialSecret } from "@/lib/server/credentials";
import { persistAgentRun, persistQAReport } from "@/lib/server/founderbox-data";
import { withApiHandler } from "@/lib/server/api";
import { enforceRateLimit } from "@/lib/server/rate-limit";
import { assertProjectAccess, requireRequestContext } from "@/lib/server/request-context";
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
  return withApiHandler(async () => {
    enforceRateLimit(request, "agents:qa", 15, 60_000);
    const context = await requireRequestContext();
    const input = qaSchema.parse(await request.json());
    await assertProjectAccess(context, input.projectId);
    const normalizedInput = {
      ...input,
      email: input.email ?? ""
    };
    const fallback = generateQAReport(normalizedInput);
    const workspaceApiKey = context.demo
      ? null
      : await getWorkspaceCredentialSecret(context.workspaceId, "openai");

    const result = await generateJson<QaAiShape>({
      fallback: {
        title: fallback.title,
        summary: fallback.summary,
        issues: fallback.issues
      },
      apiKey: workspaceApiKey,
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
    const savedReport = await persistQAReport(context, report);
    const agentRun = await persistAgentRun(context, {
      projectId: input.projectId,
      agent: "qa",
      title: `Ran ${savedReport.title}`,
      status: "completed",
      duration: result.mode === "live" ? "AI backend" : "Backend fallback",
      summary: savedReport.summary,
      inputPayload: input,
      resultPayload: JSON.parse(JSON.stringify(savedReport)),
      logs: qaProgressSteps
    });

    return NextResponse.json({
      report: savedReport,
      agentRun,
      mode: result.mode,
      notice: result.notice
    });
  });
}
