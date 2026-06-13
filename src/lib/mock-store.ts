"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  AgentRun,
  FileItem,
  FounderBoxState,
  MemoryItem,
  MigrationJob,
  PMDocument,
  Project,
  ProjectStatus,
  ProjectType,
  QAReport,
  ReportItem,
  User,
  Workspace
} from "@/types";
import { initialState } from "@/lib/mock-data";
import { slugify, uid } from "@/lib/utils";

type ProjectInput = {
  name: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
};

type MemoryInput = Omit<MemoryItem, "id" | "createdAt"> & { createdAt?: string };

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    }
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function send(path: string, body: unknown, method = "POST") {
  void apiRequest(path, {
    method,
    body: JSON.stringify(body)
  }).catch((error) => {
    console.error(error);
  });
}

export function useFounderBoxStore() {
  const [state, setState] = useState<FounderBoxState>(initialState);
  const [isReady, setIsReady] = useState(false);
  const [backendMode, setBackendMode] = useState<"database" | "demo">("demo");

  useEffect(() => {
    let cancelled = false;

    apiRequest<{ state: FounderBoxState; mode: "database" | "demo" }>("/api/state")
      .then((payload) => {
        if (cancelled) return;
        setState(payload.state);
        setBackendMode(payload.mode);
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) {
          setState(initialState);
          setBackendMode("demo");
        }
      })
      .finally(() => {
        if (!cancelled) setIsReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function updateState(updater: (current: FounderBoxState) => FounderBoxState) {
    setState(updater);
  }

  function createProject(input: ProjectInput) {
    const baseId = `project-${slugify(input.name) || "workspace"}`;
    const id = state.projects.some((project) => project.id === baseId)
      ? `${baseId}-${state.projects.length + 1}`
      : baseId;
    const project: Project = {
      id,
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

    updateState((current) => ({
      ...current,
      projects: [project, ...current.projects],
      workspace: {
        ...current.workspace,
        defaultProjectId: current.workspace.defaultProjectId || project.id
      }
    }));
    send("/api/projects", project);
    return project;
  }

  function updateProject(projectId: string, updates: Partial<Project>) {
    updateState((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        project.id === projectId
          ? { ...project, ...updates, lastActivityAt: new Date().toISOString() }
          : project
      )
    }));
    send(`/api/projects/${projectId}`, updates, "PATCH");
  }

  function deleteProject(projectId: string) {
    updateState((current) => ({
      ...current,
      projects: current.projects.filter((project) => project.id !== projectId),
      memories: current.memories.filter((item) => item.projectId !== projectId),
      pmDocuments: current.pmDocuments.filter((item) => item.projectId !== projectId),
      qaReports: current.qaReports.filter((item) => item.projectId !== projectId),
      migrationJobs: current.migrationJobs.filter((item) => item.projectId !== projectId),
      files: current.files.filter((item) => item.projectId !== projectId),
      reports: current.reports.filter((item) => item.projectId !== projectId),
      agentRuns: current.agentRuns.filter((item) => item.projectId !== projectId)
    }));
    void fetch(`/api/projects/${projectId}`, { method: "DELETE" }).catch(console.error);
  }

  function touchProject(projectId: string, incrementAgentRuns = false) {
    updateState((current) => ({
      ...current,
      projects: current.projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              lastActivityAt: new Date().toISOString(),
              agentRunCount: incrementAgentRuns
                ? project.agentRunCount + 1
                : project.agentRunCount
            }
          : project
      )
    }));
  }

  function addMemory(input: MemoryInput) {
    const memory: MemoryItem = {
      ...input,
      id: uid("mem"),
      createdAt: input.createdAt ?? new Date().toISOString()
    };
    updateState((current) => ({
      ...current,
      memories: [memory, ...current.memories],
      projects: current.projects.map((project) =>
        project.id === memory.projectId
          ? { ...project, memoryHealth: Math.min(project.memoryHealth + 2, 98) }
          : project
      )
    }));
    send("/api/memory", memory);
    return memory;
  }

  function addPMDocument(doc: PMDocument) {
    updateState((current) => ({
      ...current,
      pmDocuments: [doc, ...current.pmDocuments.filter((item) => item.id !== doc.id)]
    }));
    send("/api/artifacts", { kind: "pmDocument", artifact: doc });
  }

  function addQAReport(report: QAReport) {
    updateState((current) => ({
      ...current,
      qaReports: [report, ...current.qaReports.filter((item) => item.id !== report.id)]
    }));
    send("/api/artifacts", { kind: "qaReport", artifact: report });
  }

  function addMigrationJob(job: MigrationJob) {
    updateState((current) => ({
      ...current,
      migrationJobs: [job, ...current.migrationJobs.filter((item) => item.id !== job.id)]
    }));
    send("/api/artifacts", { kind: "migrationJob", artifact: job });
  }

  function addFile(file: FileItem) {
    updateState((current) => ({
      ...current,
      files: [file, ...current.files.filter((item) => item.id !== file.id)]
    }));
    send("/api/files", file);
  }

  function deleteFile(fileId: string) {
    updateState((current) => ({
      ...current,
      files: current.files.filter((file) => file.id !== fileId)
    }));
    void fetch(`/api/files/${fileId}`, { method: "DELETE" }).catch(console.error);
  }

  function addReport(report: ReportItem) {
    updateState((current) => ({
      ...current,
      reports: [report, ...current.reports.filter((item) => item.id !== report.id)]
    }));
    send("/api/reports", report);
  }

  function addAgentRun(run: AgentRun) {
    updateState((current) => ({
      ...current,
      agentRuns: [run, ...current.agentRuns.filter((item) => item.id !== run.id)],
      projects: current.projects.map((project) =>
        project.id === run.projectId
          ? {
              ...project,
              lastActivityAt: new Date().toISOString(),
              agentRunCount: project.agentRunCount + 1
            }
          : project
      )
    }));
  }

  function updateUser(user: Partial<User>) {
    updateState((current) => ({
      ...current,
      user: { ...current.user, ...user }
    }));
    send("/api/settings", { user }, "PATCH");
  }

  function updateWorkspace(workspace: Partial<Workspace>) {
    updateState((current) => ({
      ...current,
      workspace: { ...current.workspace, ...workspace }
    }));
    send("/api/settings", { workspace }, "PATCH");
  }

  function resetDemo() {
    apiRequest<{ state: FounderBoxState; mode: "database" | "demo" }>("/api/state")
      .then((payload) => {
        setState(payload.state);
        setBackendMode(payload.mode);
      })
      .catch(() => {
        setState(initialState);
        setBackendMode("demo");
      });
  }

  const stats = useMemo(() => {
    const qaIssues = state.qaReports.reduce((total, report) => total + report.issues.length, 0);
    return {
      projects: state.projects.length,
      agentRuns: state.agentRuns.length,
      memories: state.memories.length,
      qaIssues,
      migrationJobs: state.migrationJobs.length,
      pmDocuments: state.pmDocuments.length
    };
  }, [state]);

  return {
    ...state,
    isReady,
    backendMode,
    stats,
    createProject,
    updateProject,
    deleteProject,
    touchProject,
    addMemory,
    addPMDocument,
    addQAReport,
    addMigrationJob,
    addFile,
    deleteFile,
    addReport,
    addAgentRun,
    updateUser,
    updateWorkspace,
    resetDemo
  };
}
