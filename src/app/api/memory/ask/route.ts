import { NextResponse } from "next/server";
import { z } from "zod";
import { generateJson } from "@/lib/ai-provider";
import { askProjectMemory } from "@/lib/mock-agents";
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
  const input = memorySchema.parse(await request.json());
  const fallback = askProjectMemory(
    input.query,
    input.project as Project,
    input.memories as MemoryItem[]
  );

  const result = await generateJson<MemoryAnswerShape>({
    fallback,
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

  return NextResponse.json({
    answer: result.data.answer || fallback.answer,
    sources: Array.isArray(result.data.sources) && result.data.sources.length
      ? result.data.sources
      : fallback.sources,
    mode: result.mode,
    notice: result.notice
  });
}
