"use client";

import { use } from "react";
import { Boxes, Bug, FileText, MemoryStick, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import { AgentCard } from "@/components/ui/agent-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useFounderBoxStore } from "@/lib/mock-store";
import { prettyDate } from "@/lib/utils";

export default function AgentsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const store = useFounderBoxStore();
  const project = store.projects.find((item) => item.id === projectId);

  if (!project) {
    notFound();
  }

  const runs = store.agentRuns.filter((run) => run.projectId === project.id);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Agents"
        title={`${project.name} agent workspace`}
        description="Run specialized demo agents that share the same project memory. Outputs can be saved to Founder Black Box, reports, and generated files."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AgentCard title="Founder Black Box" description="Search memory, add decisions, and inspect source-backed answers." icon={MemoryStick} href={`/app/projects/${project.id}/memory`} />
        <AgentCard title="AI PM Agent" description="Convert product ideas into execution-ready PRDs, schema notes, roadmap, and sprint tasks." icon={Sparkles} href={`/app/projects/${project.id}/agents/pm`} />
        <AgentCard title="AI QA Agent" description="Simulate browser QA, progress steps, issue tables, Excel exports, and memory saves." icon={Bug} href={`/app/projects/${project.id}/agents/qa`} />
        <AgentCard title="AI Migration Agent" description="Review AI-suggested mappings, validate data, preview final import files, and export." icon={Boxes} href={`/app/projects/${project.id}/agents/migration`} />
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Run history</h2>
            <p className="mt-1 text-sm text-muted">Demo run logs show what a backend job table will track later.</p>
          </div>
          <Badge variant="gold">{runs.length} runs</Badge>
        </div>
        <div className="mt-5 grid gap-3">
          {runs.map((run) => (
            <div key={run.id} className="grid gap-3 rounded-lg border border-border bg-surface2/45 p-4 md:grid-cols-[170px_1fr_100px] md:items-center">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gold" />
                <span className="text-sm font-medium capitalize">{run.agent}</span>
              </div>
              <div>
                <p className="text-sm font-medium">{run.title}</p>
                <p className="mt-1 text-xs text-muted">{run.summary}</p>
              </div>
              <p className="text-xs text-muted md:text-right">{prettyDate(run.createdAt)}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
