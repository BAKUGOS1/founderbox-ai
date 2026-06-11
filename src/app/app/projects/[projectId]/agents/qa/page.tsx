"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Bug, Clipboard, Download, FileJson, Play, Save } from "lucide-react";
import { toast } from "sonner";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Column, DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { ProgressSteps } from "@/components/ui/progress-steps";
import { copyText, downloadJson, downloadQAExcel, qaReportToMarkdown } from "@/lib/export";
import { generateQAReport, qaProgressSteps } from "@/lib/mock-agents";
import { useFounderBoxStore } from "@/lib/mock-store";
import { uid } from "@/lib/utils";
import type { QAIssue, QAReport } from "@/types";

const issueColumns: Column<QAIssue>[] = [
  { header: "Module", accessor: "module" },
  { header: "Issue", accessor: "issue" },
  { header: "Description", accessor: "description", className: "min-w-[360px] whitespace-normal" },
  { header: "Priority", accessor: (row) => <StatusBadge value={row.priority} /> },
  { header: "Status", accessor: (row) => <StatusBadge value={row.status} /> }
];

export default function QAAgentPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const store = useFounderBoxStore();
  const project = store.projects.find((item) => item.id === projectId);
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [report, setReport] = useState<QAReport | null>(null);
  const [form, setForm] = useState({
    url: "https://demo.founderbox.ai",
    email: "qa@example.com",
    password: "",
    module: "Onboarding and Leads",
    instructions: "Check login, navigation, form validation, import templates, mobile layout, and export feedback.",
    sampleData: true,
    reportType: "Functional" as QAReport["reportType"]
  });

  useEffect(() => {
    if (!running) return;
    if (currentStep >= qaProgressSteps.length) {
      const finishTimer = window.setTimeout(() => {
        const output = generateQAReport({ projectId, ...form });
        setReport(output);
        setRunning(false);
        store.addAgentRun({
          id: uid("run"),
          projectId,
          agent: "qa",
          title: `Ran ${output.title}`,
          status: "completed",
          createdAt: new Date().toISOString(),
          duration: "1 min 12 sec",
          summary: output.summary
        });
        toast.success("QA report generated in demo mode.");
      }, 0);
      return () => window.clearTimeout(finishTimer);
    }
    const timer = window.setTimeout(() => setCurrentStep((step) => step + 1), 520);
    return () => window.clearTimeout(timer);
  }, [currentStep, form, projectId, running, store]);

  if (!project) {
    return (
      <EmptyState
        icon={Bug}
        title="Project not found"
        description="Open a valid project to run a QA demo."
        action={<Button asChild><Link href="/app/projects">Open projects</Link></Button>}
      />
    );
  }

  function runQA() {
    setReport(null);
    setCurrentStep(0);
    setRunning(true);
  }

  function saveBugs() {
    if (!report) return;
    report.issues.forEach((issue) => {
      store.addMemory({
        projectId,
        title: `${issue.module}: ${issue.issue}`,
        type: "Bug",
        content: issue.description,
        tags: ["qa", issue.priority.toLowerCase(), issue.module.toLowerCase()],
        source: report.title
      });
    });
    store.addQAReport(report);
    store.addReport({
      id: uid("report"),
      projectId,
      title: report.title,
      type: "QA Report",
      agent: "AI QA Agent",
      createdAt: report.createdAt,
      status: "Ready",
      summary: report.summary
    });
    store.addFile({
      id: uid("file"),
      projectId,
      name: `${report.title}.xlsx`,
      fileType: "XLSX",
      sourceAgent: "AI QA Agent",
      createdAt: report.createdAt,
      status: "ready"
    });
    toast.success("QA bugs saved to Founder Black Box, reports, and files.");
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="AI QA Agent"
        title="Simulate autonomous QA testing"
        description="This frontend demo does not run real browser automation or save credentials. It shows the future QA workflow with progress, issues, exports, and memory capture."
      />

      <div className="grid gap-6 xl:grid-cols-[0.75fr_1fr]">
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-gold" />
            <h2 className="text-lg font-semibold">QA inputs</h2>
          </div>
          <div className="mt-5 space-y-4">
            <Field label="Website URL">
              <Input value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Login email">
                <Input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              </Field>
              <Field label="Login password" hint="Not saved in demo mode">
                <Input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
              </Field>
            </div>
            <Field label="Module to test">
              <Input value={form.module} onChange={(event) => setForm({ ...form, module: event.target.value })} />
            </Field>
            <Field label="Testing instructions">
              <Textarea value={form.instructions} onChange={(event) => setForm({ ...form, instructions: event.target.value })} />
            </Field>
            <Field label="Report type">
              <Select value={form.reportType} onChange={(event) => setForm({ ...form, reportType: event.target.value as QAReport["reportType"] })}>
                <option>Smoke</option>
                <option>Functional</option>
                <option>UI/UX</option>
                <option>Regression</option>
              </Select>
            </Field>
            <label className="flex items-center gap-3 rounded-lg border border-border bg-surface2/52 p-3 text-sm text-muted">
              <input type="checkbox" checked={form.sampleData} onChange={(event) => setForm({ ...form, sampleData: event.target.checked })} className="h-4 w-4 accent-gold" />
              Use sample data
            </label>
            <Button className="w-full" size="lg" onClick={runQA} disabled={running}>
              <Play className="h-4 w-4" />
              Run QA Test
            </Button>
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Run progress</h2>
                <p className="mt-1 text-sm text-muted">Simulated browser steps for the investor demo.</p>
              </div>
              <Badge variant={running ? "gold" : report ? "success" : "default"}>
                {running ? "Running" : report ? "Completed" : "Ready"}
              </Badge>
            </div>
            <div className="mt-5">
              <ProgressSteps steps={qaProgressSteps} currentStep={currentStep} running={running} />
            </div>
          </Card>

          {report ? (
            <Card className="p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <Badge variant="gold">Demo QA report</Badge>
                  <h2 className="mt-3 text-2xl font-semibold">{report.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted">{report.summary}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => downloadQAExcel(report)}><Download className="h-4 w-4" />Excel</Button>
                  <Button variant="secondary" onClick={saveBugs}><Save className="h-4 w-4" />Save bugs</Button>
                  <Button variant="secondary" onClick={() => copyText(qaReportToMarkdown(report)).then(() => toast.success("Copied QA report."))}><Clipboard className="h-4 w-4" />Copy</Button>
                  <Button variant="secondary" onClick={() => downloadJson(`${report.title}.json`, report)}><FileJson className="h-4 w-4" />JSON</Button>
                </div>
              </div>
              <div className="mt-5">
                <DataTable data={report.issues} columns={issueColumns} />
              </div>
            </Card>
          ) : (
            <EmptyState
              icon={Bug}
              title="No QA report yet"
              description="Run the simulated QA test to generate issue tables, progress history, and exports."
            />
          )}
        </div>
      </div>
    </div>
  );
}
