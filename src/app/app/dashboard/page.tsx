"use client";

import Link from "next/link";
import {
  Bot,
  Boxes,
  Bug,
  FileText,
  FolderPlus,
  FolderKanban,
  MemoryStick,
  Plus,
  Sparkles
} from "lucide-react";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { useFounderBoxStore } from "@/lib/mock-store";
import { prettyDate, relativeDate } from "@/lib/utils";

export default function DashboardPage() {
  const store = useFounderBoxStore();
  const projectId = store.workspace.defaultProjectId;
  const recentRuns = store.agentRuns.slice(0, 5);
  const recentMemories = store.memories.slice(0, 5);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Command center"
        title="FounderBox AI dashboard"
        description="A connected view of project memory, specialized agents, reports, files, and demo-mode integration readiness."
      >
        <Button asChild>
          <Link href="/app/projects">
            <FolderPlus className="h-4 w-4" />
            Create Project
          </Link>
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard title="Total Projects" value={store.stats.projects} note="Active demo workspaces" icon={FolderKanban} />
        <StatCard title="Agent Runs" value={store.stats.agentRuns} note="PM, QA, migration, memory" icon={Bot} />
        <StatCard title="Saved Memories" value={store.stats.memories} note="Decisions and source-backed notes" icon={MemoryStick} />
        <StatCard title="QA Issues" value={store.stats.qaIssues} note="Open demo findings across reports" icon={Bug} />
        <StatCard title="Migration Jobs" value={store.stats.migrationJobs} note="Validated local workflows" icon={Boxes} />
        <StatCard title="PM Documents" value={store.stats.pmDocuments} note="Execution-ready planning docs" icon={FileText} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Recent activity timeline</h2>
              <p className="mt-1 text-sm text-muted">Memory is the shared layer behind every agent output.</p>
            </div>
            <Badge variant="gold">Live localStorage</Badge>
          </div>
          <div className="mt-5 space-y-3">
            {recentMemories.map((memory) => (
              <div key={memory.id} className="rounded-lg border border-border bg-surface2/50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="maroon">{memory.type}</Badge>
                    <span className="text-xs text-muted">{relativeDate(memory.createdAt)}</span>
                  </div>
                  <Badge variant="gold">{memory.source}</Badge>
                </div>
                <p className="mt-3 text-sm font-medium text-foreground">{memory.title}</p>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{memory.content}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="text-lg font-semibold">Quick actions</h2>
            <div className="mt-4 grid gap-3">
              {[
                ["Create Project", "/app/projects", Plus],
                ["Ask Founder Black Box", `/app/projects/${projectId}/memory`, MemoryStick],
                ["Generate PRD", `/app/projects/${projectId}/agents/pm`, Sparkles],
                ["Run QA Test", `/app/projects/${projectId}/agents/qa`, Bug],
                ["Start Migration", `/app/projects/${projectId}/agents/migration`, Boxes]
              ].map(([label, href, Icon]) => (
                <Button key={String(label)} asChild variant="secondary" className="justify-start">
                  <Link href={String(href)}>
                    <Icon className="h-4 w-4" />
                    {String(label)}
                  </Link>
                </Button>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-semibold">Recent agent runs</h2>
            <div className="mt-4 space-y-3">
              {recentRuns.map((run) => (
                <div key={run.id} className="rounded-lg border border-border bg-surface2/45 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{run.title}</p>
                    <StatusBadge value={run.status} />
                  </div>
                  <p className="mt-2 text-xs text-muted">{run.summary}</p>
                  <p className="mt-2 text-xs text-muted">{prettyDate(run.createdAt)} · {run.duration}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
