"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Boxes,
  Bug,
  FileText,
  FolderOpen,
  MemoryStick,
  Sparkles
} from "lucide-react";
import { notFound } from "next/navigation";
import { AgentCard } from "@/components/ui/agent-card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { useFounderBoxStore } from "@/lib/mock-store";
import { prettyDate, relativeDate } from "@/lib/utils";

export default function ProjectOverviewPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const store = useFounderBoxStore();
  const project = store.projects.find((item) => item.id === projectId);

  if (!project) {
    notFound();
  }

  const memories = store.memories.filter((item) => item.projectId === project.id);
  const files = store.files.filter((item) => item.projectId === project.id);
  const latestPM = store.pmDocuments.find((item) => item.projectId === project.id);
  const latestQA = store.qaReports.find((item) => item.projectId === project.id);
  const latestMigration = store.migrationJobs.find((item) => item.projectId === project.id);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={project.type}
        title={project.name}
        description={project.description}
      >
        <StatusBadge value={project.status} />
        <Button asChild variant="secondary">
          <Link href={`/app/projects/${project.id}/memory`}>
            Ask memory
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Memory health" value={`${project.memoryHealth}%`} note="Decision coverage and source quality" icon={MemoryStick} />
        <StatCard title="Active agents" value="4" note="Memory, PM, QA, and Migration" icon={Bot} />
        <StatCard title="Agent runs" value={project.agentRunCount} note={`Last activity ${relativeDate(project.lastActivityAt)}`} icon={Sparkles} />
        <StatCard title="Recent files" value={files.length} note="Generated and uploaded demo files" icon={FolderOpen} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card className="p-5">
          <h2 className="text-lg font-semibold">Latest outputs</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Link href={`/app/projects/${project.id}/agents/pm`} className="rounded-lg border border-border bg-surface2/50 p-4 hover:border-gold/40">
              <FileText className="h-5 w-5 text-gold" />
              <p className="mt-3 text-sm font-semibold">Latest PM document</p>
              <p className="mt-2 text-xs leading-5 text-muted">{latestPM?.title ?? "Generate a product plan from the PM Agent."}</p>
            </Link>
            <Link href={`/app/projects/${project.id}/agents/qa`} className="rounded-lg border border-border bg-surface2/50 p-4 hover:border-gold/40">
              <Bug className="h-5 w-5 text-gold" />
              <p className="mt-3 text-sm font-semibold">Latest QA report</p>
              <p className="mt-2 text-xs leading-5 text-muted">{latestQA?.title ?? "Run a simulated QA report."}</p>
            </Link>
            <Link href={`/app/projects/${project.id}/agents/migration`} className="rounded-lg border border-border bg-surface2/50 p-4 hover:border-gold/40">
              <Boxes className="h-5 w-5 text-gold" />
              <p className="mt-3 text-sm font-semibold">Latest migration job</p>
              <p className="mt-2 text-xs leading-5 text-muted">{latestMigration?.title ?? "Start a mapping and validation flow."}</p>
            </Link>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-semibold">Suggested next actions</h2>
          <div className="mt-4 space-y-3">
            {[
              ["Generate updated MVP plan", `/app/projects/${project.id}/agents/pm`],
              ["Run regression QA after latest UI changes", `/app/projects/${project.id}/agents/qa`],
              ["Save current founder decision", `/app/projects/${project.id}/memory`],
              ["Review generated files and reports", `/app/projects/${project.id}/reports`]
            ].map(([label, href]) => (
              <Button key={label} asChild variant="secondary" className="w-full justify-between">
                <Link href={href}>
                  {label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1fr]">
        <Card className="p-5">
          <h2 className="text-lg font-semibold">Recent decisions</h2>
          <div className="mt-4 space-y-3">
            {memories.slice(0, 4).map((memory) => (
              <div key={memory.id} className="rounded-lg border border-border bg-surface2/45 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="maroon">{memory.type}</Badge>
                  <span className="text-xs text-muted">{prettyDate(memory.createdAt)}</span>
                </div>
                <p className="mt-3 text-sm font-medium">{memory.title}</p>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{memory.content}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-semibold">Recent files</h2>
          <div className="mt-4 space-y-3">
            {files.slice(0, 5).map((file) => (
              <div key={file.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface2/45 p-4">
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="mt-1 text-xs text-muted">{file.sourceAgent} · {prettyDate(file.createdAt)}</p>
                </div>
                <StatusBadge value={file.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AgentCard title="Founder Black Box" description="Ask and save project memory." icon={MemoryStick} href={`/app/projects/${project.id}/memory`} />
        <AgentCard title="AI PM Agent" description="Generate planning documents." icon={Sparkles} href={`/app/projects/${project.id}/agents/pm`} />
        <AgentCard title="AI QA Agent" description="Simulate QA reports." icon={Bug} href={`/app/projects/${project.id}/agents/qa`} />
        <AgentCard title="AI Migration Agent" description="Validate import-ready files." icon={Boxes} href={`/app/projects/${project.id}/agents/migration`} />
      </div>
    </div>
  );
}
