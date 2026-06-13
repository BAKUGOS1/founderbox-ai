import type {
  AgentRun as AgentRunRow,
  FileObject,
  MemoryItem as MemoryItemRow,
  MigrationJob as MigrationJobRow,
  PMDocument as PMDocumentRow,
  Project as ProjectRow,
  QAReport as QAReportRow,
  ReportItem as ReportItemRow,
  User as UserRow,
  Workspace as WorkspaceRow
} from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { initialState } from "@/lib/mock-data";
import { slugify, uid } from "@/lib/utils";
import { ApiError } from "@/lib/server/api";
import { isDatabaseConfigured, prisma } from "@/lib/server/prisma";
import type { RequestContext } from "@/lib/server/request-context";
import type {
  AgentRun,
  AgentRunStatus,
  FileItem,
  FileStatus,
  FounderBoxState,
  MemoryItem,
  MigrationJob,
  MigrationMapping,
  PMDocument,
  Project,
  ProjectStatus,
  ProjectType,
  QAIssue,
  QAReport,
  ReportItem,
  User,
  ValidationError,
  Workspace
} from "@/types";

type ProjectInput = {
  id?: string;
  name: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
};

type AgentRunInput = Omit<AgentRun, "id" | "createdAt"> & {
  id?: string;
  createdAt?: string;
  inputPayload?: Prisma.InputJsonValue;
  resultPayload?: Prisma.InputJsonValue;
  logs?: Prisma.InputJsonValue;
  error?: string;
};

function iso(value: Date | string) {
  return typeof value === "string" ? value : value.toISOString();
}

function jsonArray<T>(value: Prisma.JsonValue | null | undefined, fallback: T[] = []) {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function toUser(row: UserRow | null): User {
  if (!row) return initialState.user;

  const name = row.name || row.email || "FounderBox User";
  return {
    id: row.id,
    name,
    email: row.email || "",
    avatarInitials:
      row.avatarInitials ||
      name
        .split(/[\s@._-]+/)
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() ||
      "FB"
  };
}

function toWorkspace(row: WorkspaceRow | null, projects: Project[]): Workspace {
  if (!row) return initialState.workspace;

  return {
    id: row.id,
    name: row.name,
    defaultProjectId: row.defaultProjectId || projects[0]?.id || "",
    plan: row.plan as Workspace["plan"]
  };
}

function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    type: row.type as ProjectType,
    status: row.status as ProjectStatus,
    createdAt: iso(row.createdAt),
    lastActivityAt: iso(row.lastActivityAt),
    integrations: jsonArray<string>(row.integrations),
    agentRunCount: row.agentRunCount,
    memoryHealth: row.memoryHealth
  };
}

function toMemory(row: MemoryItemRow): MemoryItem {
  return {
    id: row.id,
    projectId: row.projectId,
    title: row.title,
    type: row.type as MemoryItem["type"],
    content: row.content,
    tags: jsonArray<string>(row.tags),
    source: row.source,
    createdAt: iso(row.createdAt)
  };
}

function toAgentRun(row: AgentRunRow): AgentRun {
  return {
    id: row.id,
    projectId: row.projectId || "",
    agent: row.agent as AgentRun["agent"],
    title: row.title,
    status: row.status as AgentRunStatus,
    createdAt: iso(row.createdAt),
    duration: row.duration || "Queued",
    summary: row.summary || "",
    logs: jsonArray<string>(row.logs),
    result: row.result ?? undefined,
    error: row.error ?? undefined,
    updatedAt: iso(row.updatedAt)
  };
}

function toPMDocument(row: PMDocumentRow): PMDocument {
  return {
    id: row.id,
    projectId: row.projectId,
    title: row.title,
    idea: row.idea,
    createdAt: iso(row.createdAt),
    sections: jsonArray<PMDocument["sections"][number]>(row.sections)
  };
}

function toQAReport(row: QAReportRow): QAReport {
  return {
    id: row.id,
    projectId: row.projectId,
    title: row.title,
    url: row.url,
    reportType: row.reportType as QAReport["reportType"],
    createdAt: iso(row.createdAt),
    summary: row.summary,
    steps: jsonArray<string>(row.steps),
    issues: jsonArray<QAIssue>(row.issues)
  };
}

function toMigrationJob(row: MigrationJobRow): MigrationJob {
  return {
    id: row.id,
    projectId: row.projectId,
    title: row.title,
    dataType: row.dataType,
    createdAt: iso(row.createdAt),
    status: row.status as MigrationJob["status"],
    mappings: jsonArray<MigrationMapping>(row.mappings),
    validationErrors: jsonArray<ValidationError>(row.validationErrors),
    previewRows: jsonArray<Record<string, string | number>>(row.previewRows)
  };
}

function toFile(row: FileObject): FileItem {
  return {
    id: row.id,
    projectId: row.projectId,
    name: row.name,
    fileType: row.fileType as FileItem["fileType"],
    sourceAgent: row.sourceAgent as FileItem["sourceAgent"],
    createdAt: iso(row.createdAt),
    status: row.status as FileStatus
  };
}

function toReport(row: ReportItemRow): ReportItem {
  return {
    id: row.id,
    projectId: row.projectId,
    title: row.title,
    type: row.type as ReportItem["type"],
    agent: row.agent as ReportItem["agent"],
    createdAt: iso(row.createdAt),
    status: row.status as ReportItem["status"],
    summary: row.summary
  };
}

export async function getFounderBoxState(context: RequestContext): Promise<FounderBoxState> {
  if (context.demo || !isDatabaseConfigured()) return initialState;

  const [
    user,
    workspace,
    projects,
    memories,
    agentRuns,
    pmDocuments,
    qaReports,
    migrationJobs,
    files,
    reports
  ] = await prisma.$transaction([
    prisma.user.findUnique({ where: { id: context.userId } }),
    prisma.workspace.findUnique({ where: { id: context.workspaceId } }),
    prisma.project.findMany({
      where: { workspaceId: context.workspaceId },
      orderBy: { lastActivityAt: "desc" }
    }),
    prisma.memoryItem.findMany({
      where: { workspaceId: context.workspaceId },
      orderBy: { createdAt: "desc" }
    }),
    prisma.agentRun.findMany({
      where: { workspaceId: context.workspaceId },
      orderBy: { createdAt: "desc" }
    }),
    prisma.pMDocument.findMany({
      where: { workspaceId: context.workspaceId },
      orderBy: { createdAt: "desc" }
    }),
    prisma.qAReport.findMany({
      where: { workspaceId: context.workspaceId },
      orderBy: { createdAt: "desc" }
    }),
    prisma.migrationJob.findMany({
      where: { workspaceId: context.workspaceId },
      orderBy: { createdAt: "desc" }
    }),
    prisma.fileObject.findMany({
      where: { workspaceId: context.workspaceId },
      orderBy: { createdAt: "desc" }
    }),
    prisma.reportItem.findMany({
      where: { workspaceId: context.workspaceId },
      orderBy: { createdAt: "desc" }
    })
  ]);

  const typedProjects = projects.map(toProject);

  return {
    user: toUser(user),
    workspace: toWorkspace(workspace, typedProjects),
    projects: typedProjects,
    memories: memories.map(toMemory),
    agentRuns: agentRuns.map(toAgentRun),
    pmDocuments: pmDocuments.map(toPMDocument),
    qaReports: qaReports.map(toQAReport),
    migrationJobs: migrationJobs.map(toMigrationJob),
    files: files.map(toFile),
    reports: reports.map(toReport),
    integrations: initialState.integrations
  };
}

export async function createProject(context: RequestContext, input: ProjectInput): Promise<Project> {
  const project: Project = {
    id: input.id || `project-${slugify(input.name) || uid("workspace")}`,
    name: input.name,
    description: input.description,
    type: input.type,
    status: input.status,
    createdAt: new Date().toISOString(),
    lastActivityAt: new Date().toISOString(),
    integrations: [],
    agentRunCount: 0,
    memoryHealth: 52
  };

  if (context.demo || !isDatabaseConfigured()) return project;

  const created = await prisma.project.create({
    data: {
      id: project.id,
      workspaceId: context.workspaceId,
      name: input.name,
      description: input.description,
      type: input.type,
      status: input.status,
      integrations: []
    }
  });

  await prisma.workspace.updateMany({
    where: {
      id: context.workspaceId,
      defaultProjectId: null
    },
    data: {
      defaultProjectId: created.id
    }
  });

  return toProject(created);
}

export async function updateProject(
  context: RequestContext,
  projectId: string,
  updates: Partial<ProjectInput>
): Promise<Project> {
  if (context.demo || !isDatabaseConfigured()) {
    const existing = initialState.projects.find((project) => project.id === projectId);
    if (!existing) throw new ApiError(404, "Project not found.");
    return { ...existing, ...updates, lastActivityAt: new Date().toISOString() };
  }

  const updated = await prisma.project.update({
    where: {
      id: projectId,
      workspaceId: context.workspaceId
    },
    data: {
      name: updates.name,
      description: updates.description,
      type: updates.type,
      status: updates.status,
      lastActivityAt: new Date()
    }
  });

  return toProject(updated);
}

export async function deleteProject(context: RequestContext, projectId: string) {
  if (context.demo || !isDatabaseConfigured()) return;

  await prisma.project.delete({
    where: {
      id: projectId,
      workspaceId: context.workspaceId
    }
  });
}

export async function persistMemory(
  context: RequestContext,
  input: Omit<MemoryItem, "id" | "createdAt"> & { id?: string; createdAt?: string }
) {
  const memory: MemoryItem = {
    ...input,
    id: input.id || uid("mem"),
    createdAt: input.createdAt || new Date().toISOString()
  };

  if (context.demo || !isDatabaseConfigured()) return memory;

  const row = await prisma.memoryItem.upsert({
    where: { id: memory.id },
    create: {
      id: memory.id,
      workspaceId: context.workspaceId,
      projectId: memory.projectId,
      title: memory.title,
      type: memory.type,
      content: memory.content,
      tags: memory.tags,
      source: memory.source,
      createdAt: new Date(memory.createdAt)
    },
    update: {
      title: memory.title,
      type: memory.type,
      content: memory.content,
      tags: memory.tags,
      source: memory.source
    }
  });

  await prisma.project.updateMany({
    where: { id: memory.projectId, workspaceId: context.workspaceId },
    data: {
      memoryHealth: { increment: 2 },
      lastActivityAt: new Date()
    }
  });

  return toMemory(row);
}

export async function persistPMDocument(context: RequestContext, doc: PMDocument) {
  if (context.demo || !isDatabaseConfigured()) return doc;

  const row = await prisma.pMDocument.upsert({
    where: { id: doc.id },
    create: {
      id: doc.id,
      workspaceId: context.workspaceId,
      projectId: doc.projectId,
      title: doc.title,
      idea: doc.idea,
      sections: toJsonValue(doc.sections),
      createdAt: new Date(doc.createdAt)
    },
    update: {
      title: doc.title,
      idea: doc.idea,
      sections: toJsonValue(doc.sections)
    }
  });

  return toPMDocument(row);
}

export async function persistQAReport(context: RequestContext, report: QAReport) {
  if (context.demo || !isDatabaseConfigured()) return report;

  const row = await prisma.qAReport.upsert({
    where: { id: report.id },
    create: {
      id: report.id,
      workspaceId: context.workspaceId,
      projectId: report.projectId,
      title: report.title,
      url: report.url,
      reportType: report.reportType,
      summary: report.summary,
      steps: toJsonValue(report.steps),
      issues: toJsonValue(report.issues),
      createdAt: new Date(report.createdAt)
    },
    update: {
      title: report.title,
      url: report.url,
      reportType: report.reportType,
      summary: report.summary,
      steps: toJsonValue(report.steps),
      issues: toJsonValue(report.issues)
    }
  });

  return toQAReport(row);
}

export async function persistMigrationJob(context: RequestContext, job: MigrationJob) {
  if (context.demo || !isDatabaseConfigured()) return job;

  const row = await prisma.migrationJob.upsert({
    where: { id: job.id },
    create: {
      id: job.id,
      workspaceId: context.workspaceId,
      projectId: job.projectId,
      title: job.title,
      dataType: job.dataType,
      status: job.status,
      mappings: toJsonValue(job.mappings),
      validationErrors: toJsonValue(job.validationErrors),
      previewRows: toJsonValue(job.previewRows),
      createdAt: new Date(job.createdAt)
    },
    update: {
      title: job.title,
      dataType: job.dataType,
      status: job.status,
      mappings: toJsonValue(job.mappings),
      validationErrors: toJsonValue(job.validationErrors),
      previewRows: toJsonValue(job.previewRows)
    }
  });

  return toMigrationJob(row);
}

export async function persistFile(context: RequestContext, file: FileItem) {
  if (context.demo || !isDatabaseConfigured()) return file;

  const row = await prisma.fileObject.upsert({
    where: { id: file.id },
    create: {
      id: file.id,
      workspaceId: context.workspaceId,
      projectId: file.projectId,
      name: file.name,
      fileType: file.fileType,
      sourceAgent: file.sourceAgent,
      status: file.status,
      createdAt: new Date(file.createdAt)
    },
    update: {
      name: file.name,
      fileType: file.fileType,
      sourceAgent: file.sourceAgent,
      status: file.status
    }
  });

  return toFile(row);
}

export async function deleteFile(context: RequestContext, fileId: string) {
  if (context.demo || !isDatabaseConfigured()) return;

  await prisma.fileObject.delete({
    where: {
      id: fileId,
      workspaceId: context.workspaceId
    }
  });
}

export async function persistReport(context: RequestContext, report: ReportItem) {
  if (context.demo || !isDatabaseConfigured()) return report;

  const row = await prisma.reportItem.upsert({
    where: { id: report.id },
    create: {
      id: report.id,
      workspaceId: context.workspaceId,
      projectId: report.projectId,
      title: report.title,
      type: report.type,
      agent: report.agent,
      status: report.status,
      summary: report.summary,
      createdAt: new Date(report.createdAt)
    },
    update: {
      title: report.title,
      type: report.type,
      agent: report.agent,
      status: report.status,
      summary: report.summary
    }
  });

  return toReport(row);
}

export async function persistAgentRun(context: RequestContext, input: AgentRunInput) {
  const run: AgentRun = {
    id: input.id || uid("run"),
    projectId: input.projectId,
    agent: input.agent,
    title: input.title,
    status: input.status,
    createdAt: input.createdAt || new Date().toISOString(),
    duration: input.duration,
    summary: input.summary,
    logs: Array.isArray(input.logs) ? (input.logs as string[]) : undefined,
    result: input.resultPayload,
    error: input.error,
    updatedAt: new Date().toISOString()
  };

  if (context.demo || !isDatabaseConfigured()) return run;

  const row = await prisma.agentRun.upsert({
    where: { id: run.id },
    create: {
      id: run.id,
      workspaceId: context.workspaceId,
      projectId: run.projectId,
      agent: run.agent,
      title: run.title,
      status: run.status,
      duration: run.duration,
      summary: run.summary,
      input: input.inputPayload,
      result: input.resultPayload,
      logs: input.logs || [],
      error: input.error,
      createdAt: new Date(run.createdAt),
      completedAt: ["completed", "failed"].includes(run.status) ? new Date() : null
    },
    update: {
      title: run.title,
      status: run.status,
      duration: run.duration,
      summary: run.summary,
      input: input.inputPayload,
      result: input.resultPayload,
      logs: input.logs || [],
      error: input.error,
      completedAt: ["completed", "failed"].includes(run.status) ? new Date() : null
    }
  });

  if (run.projectId) {
    await prisma.project.updateMany({
      where: { id: run.projectId, workspaceId: context.workspaceId },
      data: {
        lastActivityAt: new Date(),
        agentRunCount: { increment: 1 }
      }
    });
  }

  return toAgentRun(row);
}

export async function getAgentRun(context: RequestContext, runId: string) {
  if (context.demo || !isDatabaseConfigured()) {
    return initialState.agentRuns.find((run) => run.id === runId) ?? null;
  }

  const row = await prisma.agentRun.findFirst({
    where: {
      id: runId,
      workspaceId: context.workspaceId
    }
  });

  return row ? toAgentRun(row) : null;
}

export async function updateWorkspaceProfile(
  context: RequestContext,
  input: {
    user?: Partial<User>;
    workspace?: Partial<Workspace>;
  }
) {
  if (context.demo || !isDatabaseConfigured()) return;

  if (input.user) {
    await prisma.user.update({
      where: { id: context.userId },
      data: {
        name: input.user.name,
        email: input.user.email,
        avatarInitials: input.user.avatarInitials
      }
    });
  }

  if (input.workspace) {
    await prisma.workspace.update({
      where: { id: context.workspaceId },
      data: {
        name: input.workspace.name,
        defaultProjectId: input.workspace.defaultProjectId
      }
    });
  }
}

export async function auditEvent(
  context: RequestContext,
  input: {
    action: string;
    targetType: string;
    targetId?: string;
    metadata?: Prisma.InputJsonValue;
  }
) {
  if (context.demo || !isDatabaseConfigured()) return;

  await prisma.auditEvent.create({
    data: {
      workspaceId: context.workspaceId,
      actorId: context.userId,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      metadata: input.metadata
    }
  });
}
