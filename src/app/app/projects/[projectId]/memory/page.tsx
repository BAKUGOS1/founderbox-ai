"use client";

import { FormEvent, use, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bot,
  Calendar,
  FileText,
  Github,
  Inbox,
  MemoryStick,
  Plus,
  Search,
  UploadCloud
} from "lucide-react";
import { toast } from "sonner";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Timeline } from "@/components/ui/timeline";
import { askProjectMemory } from "@/lib/mock-agents";
import { useFounderBoxStore } from "@/lib/mock-store";
import type { MemoryType } from "@/types";

const memoryTypes: MemoryType[] = [
  "Decision",
  "Note",
  "Bug",
  "Meeting",
  "Document",
  "Customer Request"
];

const sources = [
  ["Manual Notes", MemoryStick],
  ["AI PM Agent Outputs", Bot],
  ["QA Reports", Search],
  ["Migration Reports", UploadCloud],
  ["GitHub Mock", Github],
  ["Gmail Mock", Inbox],
  ["Calendar Mock", Calendar]
] as const;

export default function MemoryPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const store = useFounderBoxStore();
  const project = store.projects.find((item) => item.id === projectId);
  const memories = useMemo(
    () => store.memories.filter((item) => item.projectId === projectId),
    [projectId, store.memories]
  );
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState<{ answer: string; sources: string[]; mode?: "live" | "mock" } | null>(null);
  const [isAsking, setIsAsking] = useState(false);
  const [form, setForm] = useState({
    title: "",
    type: "Decision" as MemoryType,
    content: "",
    tags: ""
  });

  if (!project) {
    return (
      <EmptyState
        icon={MemoryStick}
        title="Project not found"
        description="Open a valid project from the project list to view its Founder Black Box."
        action={<Button asChild><Link href="/app/projects">Open projects</Link></Button>}
      />
    );
  }

  const currentProject = project;

  async function askMemory(event: FormEvent) {
    event.preventDefault();
    const question = query || "What should we do next?";
    const fallback = askProjectMemory(question, currentProject, store.memories);
    setIsAsking(true);

    try {
      const response = await fetch("/api/memory/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: question,
          project: currentProject,
          memories
        })
      });

      if (!response.ok) {
        throw new Error("Memory backend route failed.");
      }

      const payload = (await response.json()) as {
        answer: string;
        sources: string[];
        mode: "live" | "mock";
        notice?: string;
      };
      setAnswer({
        answer: payload.answer,
        sources: payload.sources,
        mode: payload.mode
      });
      toast.success(payload.mode === "live" ? "Memory answered with live AI backend." : payload.notice ?? "Memory answered with backend fallback.");
    } catch (error) {
      setAnswer({ ...fallback, mode: "mock" });
      toast.error(error instanceof Error ? error.message : "Memory backend route failed. Used local fallback.");
    } finally {
      setIsAsking(false);
    }
  }

  function addMemory() {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required.");
      return;
    }
    store.addMemory({
      projectId: currentProject.id,
      title: form.title,
      type: form.type,
      content: form.content,
      tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      source: "Manual Notes"
    });
    setForm({ title: "", type: "Decision", content: "", tags: "" });
    toast.success("Memory saved to Founder Black Box.");
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Founder Black Box"
        title={`${currentProject.name} memory`}
        description="Ask project memory, add founder decisions, and trace answers back to demo sources. External integrations are clearly marked as not connected."
      />

      <Card className="p-5">
        <form onSubmit={askMemory} className="grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              className="pl-9"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ask anything about this project..."
            />
          </div>
          <Button type="submit" disabled={isAsking}>
            {isAsking ? "Asking..." : "Ask memory"}
            <Search className="h-4 w-4" />
          </Button>
        </form>

        {answer ? (
          <div className="mt-5 rounded-lg border border-gold/25 bg-gold/10 p-5">
            <div className="flex items-center gap-2">
              <MemoryStick className="h-5 w-5 text-gold" />
              <p className="font-semibold text-foreground">Memory answer</p>
              <Badge variant={answer.mode === "live" ? "success" : "gold"}>
                {answer.mode === "live" ? "Live AI backend" : "Backend fallback"}
              </Badge>
            </div>
            <p className="mt-3 text-sm leading-7 text-muted">{answer.answer}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {answer.sources.map((source) => (
                <Badge key={source} variant="gold">{source}</Badge>
              ))}
            </div>
          </div>
        ) : null}
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.78fr_1fr]">
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-gold" />
            <h2 className="text-lg font-semibold">Add memory</h2>
          </div>
          <div className="mt-5 space-y-4">
            <Field label="Title">
              <Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Decision, customer request, or finding" />
            </Field>
            <Field label="Type">
              <Select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as MemoryType })}>
                {memoryTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </Select>
            </Field>
            <Field label="Content">
              <Textarea value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} placeholder="What should FounderBox remember for future agent runs?" />
            </Field>
            <Field label="Tags" hint="Comma-separated tags">
              <Input value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} placeholder="mvp, pricing, qa" />
            </Field>
            <Button className="w-full" onClick={addMemory}>Save to Founder Black Box</Button>
          </div>
        </Card>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Memory timeline</h2>
            <Badge variant="gold">{memories.length} items</Badge>
          </div>
          {memories.length ? (
            <Timeline items={memories} />
          ) : (
            <EmptyState
              icon={FileText}
              title="No memory yet"
              description="Add a decision, run an agent, or save a report to start building project memory."
            />
          )}
        </div>
      </div>

      <Card className="p-5">
        <h2 className="text-lg font-semibold">Memory sources</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {sources.map(([label, Icon]) => (
            <div key={label} className="rounded-lg border border-border bg-surface2/48 p-4">
              <Icon className="h-5 w-5 text-gold" />
              <p className="mt-3 text-sm font-medium">{label}</p>
              <div className="mt-3">
                <StatusBadge value="Demo mode / Not connected" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
