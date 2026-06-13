"use client";

import { use, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Boxes, Download, FileCheck2, Save, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Column, DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { FileUploader } from "@/components/ui/file-uploader";
import { Field, Select } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { downloadMigrationExcel } from "@/lib/export";
import { generateMigrationJob } from "@/lib/mock-agents";
import { useFounderBoxStore } from "@/lib/mock-store";
import { sampleSourceColumns } from "@/lib/validation";
import { uid } from "@/lib/utils";
import type { AgentRun, MigrationJob, MigrationMapping, ValidationError } from "@/types";

const flowSteps = [
  "Upload Files",
  "AI Mapping Suggestion",
  "Mapping Review",
  "Validation Report",
  "Final Preview",
  "Download Final File"
];

const dataTypes = [
  "Customer Master",
  "Vendor Master",
  "Item Master",
  "Opening Balance",
  "CRM Leads",
  "Invoice Data",
  "Stock Data"
];

const validationColumns: Column<ValidationError>[] = [
  { header: "Row", accessor: "row" },
  { header: "Field", accessor: "field" },
  { header: "Issue", accessor: "issue", className: "min-w-[240px] whitespace-normal" },
  { header: "Suggested Fix", accessor: "suggestedFix", className: "min-w-[280px] whitespace-normal" },
  { header: "Severity", accessor: (row) => <StatusBadge value={row.severity} /> }
];

export default function MigrationAgentPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const store = useFounderBoxStore();
  const project = store.projects.find((item) => item.id === projectId);
  const [dataType, setDataType] = useState("Customer Master");
  const [sourceFile, setSourceFile] = useState("messy-customer-master.xlsx");
  const [targetFile, setTargetFile] = useState("tally-customer-import-sample.xlsx");
  const [job, setJob] = useState<MigrationJob | null>(null);
  const [step, setStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMode, setGenerationMode] = useState<"live" | "mock" | null>(null);

  if (!project) {
    return (
      <EmptyState
        icon={Boxes}
        title="Project not found"
        description="Open a valid project to run a migration demo."
        action={<Button asChild><Link href="/app/projects">Open projects</Link></Button>}
      />
    );
  }

  async function startMapping() {
    setIsGenerating(true);
    const fallback = generateMigrationJob({
      projectId,
      dataType,
      sourceName: sourceFile,
      targetName: targetFile
    });

    try {
      const response = await fetch("/api/agents/migration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          dataType,
          sourceName: sourceFile,
          targetName: targetFile
        })
      });

      if (!response.ok) {
        throw new Error("Migration backend route failed.");
      }

      const payload = (await response.json()) as {
        job: MigrationJob;
        agentRun: AgentRun;
        mode: "live" | "mock";
        notice?: string;
      };
      setJob(payload.job);
      setGenerationMode(payload.mode);
      setStep(2);
      store.addAgentRun(payload.agentRun);
      toast.success(payload.mode === "live" ? "Migration mapping generated with live AI backend." : payload.notice ?? "Migration mapping generated with backend fallback.");
    } catch (error) {
      setJob(fallback);
      setGenerationMode("mock");
      setStep(2);
      store.addAgentRun({
        id: uid("run"),
        projectId,
        agent: "migration",
        title: `Mapped ${dataType}`,
        status: "completed",
        createdAt: new Date().toISOString(),
        duration: "Local fallback",
        summary: `Generated ${fallback.mappings.length} mappings and ${fallback.validationErrors.length} validation findings.`
      });
      toast.error(error instanceof Error ? error.message : "Migration backend route failed. Used local fallback.");
    } finally {
      setIsGenerating(false);
    }
  }

  function updateMapping(mappingId: string, sourceColumn: string) {
    if (!job) return;
    setJob({
      ...job,
      mappings: job.mappings.map((mapping) =>
        mapping.id === mappingId
          ? {
              ...mapping,
              suggestedSourceColumn: sourceColumn,
              action: sourceColumn === "Auto Detect" ? "Auto Detect" : "Review"
            }
          : mapping
      )
    });
  }

  function saveSummary() {
    if (!job) return;
    store.addMigrationJob(job);
    store.addMemory({
      projectId,
      title: job.title,
      type: "Migration",
      content: `Migration Agent mapped ${job.mappings.length} fields for ${job.dataType}, found ${job.validationErrors.length} validation issues, and prepared ${job.previewRows.length} preview rows. Final export remains user-approved.`,
      tags: ["migration", "mapping", "validation"],
      source: "Migration Job #2"
    });
    store.addReport({
      id: uid("report"),
      projectId,
      title: job.title,
      type: "Migration Report",
      agent: "AI Migration Agent",
      createdAt: job.createdAt,
      status: "Ready",
      summary: `Mapped ${job.mappings.length} fields and produced a validation report for ${job.dataType}.`
    });
    store.addFile({
      id: uid("file"),
      projectId,
      name: `${job.title} Final.xlsx`,
      fileType: "XLSX",
      sourceAgent: "AI Migration Agent",
      createdAt: job.createdAt,
      status: "ready"
    });
    toast.success("Migration summary saved to memory, reports, and files.");
  }

  const mappingColumns: Column<MigrationMapping>[] = [
    { header: "Target Field", accessor: "targetField" },
    {
      header: "Suggested Source Column",
      accessor: (row) => (
        <Select value={row.suggestedSourceColumn} onChange={(event) => updateMapping(row.id, event.target.value)}>
          {["Auto Detect", ...sampleSourceColumns].map((column) => (
            <option key={column} value={column}>{column}</option>
          ))}
        </Select>
      ),
      className: "min-w-[220px]"
    },
    { header: "Confidence", accessor: (row) => <Badge variant="gold">{row.confidence}%</Badge> },
    { header: "Required", accessor: (row) => row.required ? "Yes" : "No" },
    { header: "Action", accessor: (row) => <StatusBadge value={row.action} /> }
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="AI Migration Agent"
        title="Convert messy files into import-ready data"
        description="Upload source and target sample files, review AI-suggested mappings, validate records, preview final rows, and export demo files locally."
      />

      <Card className="border-gold/25 bg-gold/10 p-4">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
          <p className="text-sm leading-6 text-muted">
            AI suggests the mapping, but final migration uses validation rules and user-approved mappings.
            File metadata is saved through backend APIs. Full binary upload uses S3-compatible storage when configured.
          </p>
        </div>
      </Card>

      <Card className="p-5">
        <div className="grid gap-3 md:grid-cols-6">
          {flowSteps.map((label, index) => (
            <div key={label} className="rounded-lg border border-border bg-surface2/45 p-3">
              <Badge variant={index <= step ? "gold" : "default"}>Step {index + 1}</Badge>
              <p className="mt-3 text-sm font-medium">{label}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.72fr_1fr]">
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Boxes className="h-5 w-5 text-gold" />
            <h2 className="text-lg font-semibold">Upload and target setup</h2>
          </div>
          <div className="mt-5 space-y-4">
            <FileUploader label={`Source file: ${sourceFile}`} accept=".xlsx,.csv" onChange={setSourceFile} />
            <FileUploader label={`Target sample file: ${targetFile}`} accept=".xlsx,.csv" onChange={setTargetFile} />
            <Field label="Data type">
              <Select value={dataType} onChange={(event) => setDataType(event.target.value)}>
                {dataTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </Select>
            </Field>
            <Button className="w-full" size="lg" onClick={startMapping} disabled={isGenerating}>
              <Wand2 className="h-4 w-4" />
              {isGenerating ? "Generating..." : "Generate AI Mapping Suggestion"}
            </Button>
          </div>
        </Card>

        <div className="space-y-5">
          {job ? (
            <>
              <Card className="p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <Badge variant={generationMode === "live" ? "success" : "gold"}>
                      {generationMode === "live" ? "Live AI backend" : "Backend fallback"}
                    </Badge>
                    <h2 className="mt-3 text-2xl font-semibold">{job.title}</h2>
                    <p className="mt-2 text-sm text-muted">Source: {sourceFile} · Target: {targetFile}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => { setStep(3); toast.success("Mappings approved for validation."); }}><FileCheck2 className="h-4 w-4" />Approve mapping</Button>
                    <Button variant="secondary" onClick={saveSummary}><Save className="h-4 w-4" />Save summary</Button>
                  </div>
                </div>
                <div className="mt-5">
                  <DataTable data={job.mappings} columns={mappingColumns} />
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">Validation report</h2>
                    <p className="mt-1 text-sm text-muted">Rules check mobile, GSTIN, required fields, balances, duplicates, and email format.</p>
                  </div>
                  <Button variant="secondary" onClick={() => downloadMigrationExcel(job, "errors")}>
                    <Download className="h-4 w-4" />
                    Error report
                  </Button>
                </div>
                <div className="mt-5">
                  <DataTable data={job.validationErrors} columns={validationColumns} />
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Final preview</h2>
                    <p className="mt-1 text-sm text-muted">Preview rows use the approved mapping and local validation output.</p>
                  </div>
                  <Button onClick={() => { setStep(5); downloadMigrationExcel(job, "final"); }}>
                    <Download className="h-4 w-4" />
                    Download Final Excel
                  </Button>
                </div>
                <div className="mt-5 overflow-x-auto rounded-lg border border-border">
                  <table className="min-w-full divide-y divide-border bg-surface/74 text-left text-sm">
                    <thead className="bg-surface2 text-xs uppercase tracking-[0.16em] text-muted">
                      <tr>
                        {Object.keys(job.previewRows[0] ?? {}).map((key) => <th key={key} className="px-4 py-3">{key}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {job.previewRows.map((row, index) => (
                        <tr key={index}>
                          {Object.keys(job.previewRows[0] ?? {}).map((key) => <td key={key} className="whitespace-nowrap px-4 py-3">{row[key]}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          ) : (
            <EmptyState
              icon={Boxes}
              title="No migration job yet"
              description="Use the sample filenames or upload local CSV/XLSX files to start the polished mapping demo."
            />
          )}
        </div>
      </div>
    </div>
  );
}
