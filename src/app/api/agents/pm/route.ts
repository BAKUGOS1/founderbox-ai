import { NextResponse } from "next/server";
import { z } from "zod";
import { generateJson } from "@/lib/ai-provider";
import { generatePMDocument } from "@/lib/mock-agents";
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
  const input = pmSchema.parse(await request.json());
  const fallback = generatePMDocument(input);
  const memoryContext = input.useMemory
    ? (input.memories ?? []).slice(0, 8).map((item) => `${item.type}: ${item.title} - ${item.content} (${item.source})`).join("\n")
    : "Memory disabled for this run.";

  const result = await generateJson<Pick<PMDocument, "title" | "sections">>({
    fallback: {
      title: fallback.title,
      sections: fallback.sections
    },
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

  return NextResponse.json({
    document,
    mode: result.mode,
    notice: result.notice
  });
}
