import { NextResponse } from "next/server";
import { z } from "zod";
import { generateJson } from "@/lib/ai-provider";
import { askProjectMemory } from "@/lib/mock-agents";
import { getWorkspaceCredentialSecret } from "@/lib/server/credentials";
import { persistAgentRun } from "@/lib/server/founderbox-data";
import { withApiHandler } from "@/lib/server/api";
import { enforceRateLimit } from "@/lib/server/rate-limit";
import { assertProjectAccess, requireRequestContext } from "@/lib/server/request-context";
import type { MemoryItem, Project } from "@/types";

const memorySchema = z.object({
  query: z.string().min(1),
  project: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string()
  }),
  memories: z.array(z.object({
    id: z.string(),
    projectId: z.string(),
    title: z.string(),
    type: z.string(),
    content: z.string(),
    tags: z.array(z.string()),
    source: z.string(),
    createdAt: z.string()
  }))
});

type MemoryAnswerShape = {
  answer: string;
  sources: string[];
};

export async function POST(request: Request) {
  return withApiHandler(async () => {
    enforceRateLimit(request, "memory:ask", 30, 60_000);
    const context = await requireRequestContext();
    const input = memorySchema.parse(await request.json());
    await assertProjectAccess(context, input.project.id);
    const fallback = askProjectMemory(
      input.query,
      input.project as Project,
      input.memories as MemoryItem[]
    );
    const workspaceApiKey = context.demo
      ? null
      : await getWorkspaceCredentialSecret(context.workspaceId, "openai");

    const result = await generateJson<MemoryAnswerShape>({
      fallback,
      apiKey: workspaceApiKey,
      system:
        "You are Founder Black Box, the shared project memory system inside FounderBox AI. Answer only from provided project memory. If evidence is weak, say so clearly.",
      user: JSON.stringify({
        question: input.query,
        project: input.project,
        memories: input.memories.slice(0, 20),
        instruction:
          "Return JSON with answer and sources. Sources must be short source-chip labels from memory source/title values."
      })
    });

    const answer = result.data.answer || fallback.answer;
    const sources = Array.isArray(result.data.sources) && result.data.sources.length
      ? result.data.sources
      : fallback.sources;
    const agentRun = await persistAgentRun(context, {
      projectId: input.project.id,
      agent: "memory",
      title: `Asked Founder Black Box: ${input.query.slice(0, 48)}`,
      status: "completed",
      duration: result.mode === "live" ? "AI backend" : "Backend fallback",
      summary: answer,
      inputPayload: {
        query: input.query,
        projectId: input.project.id
      },
      resultPayload: {
        answer,
        sources
      }
    });

    return NextResponse.json({
      answer,
      sources,
      agentRun,
      mode: result.mode,
      notice: result.notice
    });
  });
}
