import { NextResponse } from "next/server";
import { z } from "zod";
import { generateJson } from "@/lib/ai-provider";
import { generatePMDocument } from "@/lib/mock-agents";
import { withApiHandler } from "@/lib/server/api";
import { getWorkspaceCredentialSecret } from "@/lib/server/credentials";
import { persistAgentRun, persistPMDocument } from "@/lib/server/founderbox-data";
import { enforceRateLimit } from "@/lib/server/rate-limit";
import { assertProjectAccess, requireRequestContext } from "@/lib/server/request-context";
import type { PMDocument } from "@/types";

const pmSchema = z.object({
  projectId: z.string(),
  productIdea: z.string().min(1),
  targetUsers: z.string().min(1),
  businessGoal: z.string().min(1),
  timeline: z.string().min(1),
  productType: z.string().min(1),
  complexity: z.string().min(1),
  useMemory: z.boolean(),
  memories: z.array(z.object({
    title: z.string(),
    content: z.string(),
    type: z.string(),
    source: z.string()
  })).optional()
});

export async function POST(request: Request) {
  return withApiHandler(async () => {
    enforceRateLimit(request, "agents:pm", 20, 60_000);
    const context = await requireRequestContext();
    const input = pmSchema.parse(await request.json());
    await assertProjectAccess(context, input.projectId);
    const fallback = generatePMDocument(input);
    const memoryContext = input.useMemory
      ? (input.memories ?? []).slice(0, 8).map((item) => `${item.type}: ${item.title} - ${item.content} (${item.source})`).join("\n")
      : "Memory disabled for this run.";
    const workspaceApiKey = context.demo
      ? null
      : await getWorkspaceCredentialSecret(context.workspaceId, "openai");

    const result = await generateJson<Pick<PMDocument, "title" | "sections">>({
      fallback: {
        title: fallback.title,
        sections: fallback.sections
      },
      apiKey: workspaceApiKey,
      system:
        "You are FounderBox AI PM Agent. Produce practical, execution-ready product planning documents for SaaS founders. Be specific, serious, and implementation-oriented.",
      user: JSON.stringify({
        instruction:
          "Create a product plan with exactly these section titles: Product Summary, Problem Statement, Target Users, MVP Scope, Feature Modules, User Stories, Database Schema, API Requirements, Roadmap, Sprint Tasks, Risks, Success Metrics.",
        input,
        memoryContext
      })
    });

    const document: PMDocument = {
      ...fallback,
      title: result.data.title || fallback.title,
      sections: Array.isArray(result.data.sections) && result.data.sections.length
        ? result.data.sections
        : fallback.sections
    };
    const savedDocument = await persistPMDocument(context, document);
    const agentRun = await persistAgentRun(context, {
      projectId: input.projectId,
      agent: "pm",
      title: `Generated ${savedDocument.title}`,
      status: "completed",
      duration: result.mode === "live" ? "AI backend" : "Backend fallback",
      summary: "Generated product summary, scope, schema, roadmap, risks, and success metrics.",
      inputPayload: input,
      resultPayload: JSON.parse(JSON.stringify(savedDocument))
    });

    return NextResponse.json({
      document: savedDocument,
      agentRun,
      mode: result.mode,
      notice: result.notice
    });
  });
}
