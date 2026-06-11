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
import { getStorageItem, removeStorageItem, setStorageItem } from "@/lib/storage";
import { slugify, uid } from "@/lib/utils";

const STORAGE_KEY = "founderbox-ai-state-v1";

type ProjectInput = {
  name: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
};

type MemoryInput = Omit<MemoryItem, "id" | "createdAt"> & { createdAt?: string };

function persist(next: FounderBoxState) {
  setStorageItem(STORAGE_KEY, next);
  return next;
}

export function useFounderBoxStore() {
  const [state, setState] = useState<FounderBoxState>(initialState);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setState(getStorageItem<FounderBoxState>(STORAGE_KEY, initialState));
      setIsReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function updateState(updater: (current: FounderBoxState) => FounderBoxState) {
    setState((current) => persist(updater(current)));
  }

  function createProject(input: ProjectInput) {
    const baseId = `demo-${slugify(input.name) || "project"}`;
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
      reports: current.reports.filter((item) => item.projectId !== projectId)
    }));
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
    return memory;
  }

  function addPMDocument(doc: PMDocument) {
    updateState((current) => ({
      ...current,
      pmDocuments: [doc, ...current.pmDocuments]
    }));
  }

  function addQAReport(report: QAReport) {
    updateState((current) => ({
      ...current,
      qaReports: [report, ...current.qaReports]
    }));
  }

  function addMigrationJob(job: MigrationJob) {
    updateState((current) => ({
      ...current,
      migrationJobs: [job, ...current.migrationJobs]
    }));
  }

  function addFile(file: FileItem) {
    updateState((current) => ({
      ...current,
      files: [file, ...current.files]
    }));
  }

  function deleteFile(fileId: string) {
    updateState((current) => ({
      ...current,
      files: current.files.filter((file) => file.id !== fileId)
    }));
  }

  function addReport(report: ReportItem) {
    updateState((current) => ({
      ...current,
      reports: [report, ...current.reports]
    }));
  }

  function addAgentRun(run: AgentRun) {
    updateState((current) => ({
      ...current,
      agentRuns: [run, ...current.agentRuns],
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
  }

  function updateWorkspace(workspace: Partial<Workspace>) {
    updateState((current) => ({
      ...current,
      workspace: { ...current.workspace, ...workspace }
    }));
  }

  function resetDemo() {
    removeStorageItem(STORAGE_KEY);
    setState(initialState);
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
