export type ProjectStatus = "active" | "paused" | "archived";
export type ProjectType =
  | "SaaS"
  | "PWA"
  | "Agency"
  | "Migration"
  | "Internal Tool";

export type AgentType = "memory" | "pm" | "qa" | "migration";
export type AgentRunStatus = "queued" | "running" | "completed" | "failed";
export type MemoryType =
  | "Decision"
  | "Note"
  | "Bug"
  | "Meeting"
  | "Document"
  | "Customer Request"
  | "Migration"
  | "QA";
export type ReportType = "PM Document" | "QA Report" | "Migration Report" | "Memory Summary";
export type FileStatus = "ready" | "processing" | "failed";
export type IntegrationStatus = "Demo / Not connected" | "Coming soon";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
}

export interface Workspace {
  id: string;
  name: string;
  defaultProjectId: string;
  plan: "Free Demo" | "Pro" | "Business";
}

export interface Project {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
  createdAt: string;
  lastActivityAt: string;
  integrations: string[];
  agentRunCount: number;
  memoryHealth: number;
}

export interface AgentRun {
  id: string;
  projectId: string;
  agent: AgentType;
  title: string;
  status: AgentRunStatus;
  createdAt: string;
  updatedAt?: string;
  duration: string;
  summary: string;
  logs?: string[];
  result?: unknown;
  error?: string;
}

export interface MemoryItem {
  id: string;
  projectId: string;
  title: string;
  type: MemoryType;
  content: string;
  tags: string[];
  source: string;
  createdAt: string;
}

export interface PMDocument {
  id: string;
  projectId: string;
  title: string;
  idea: string;
  createdAt: string;
  sections: Array<{
    title: string;
    content: string;
  }>;
}

export interface QAIssue {
  id: string;
  module: string;
  issue: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  status: "Open" | "In review" | "Fixed";
}

export interface QAReport {
  id: string;
  projectId: string;
  title: string;
  url: string;
  reportType: "Smoke" | "Functional" | "UI/UX" | "Regression";
  createdAt: string;
  summary: string;
  steps: string[];
  issues: QAIssue[];
}

export interface MigrationMapping {
  id: string;
  targetField: string;
  suggestedSourceColumn: string;
  confidence: number;
  required: boolean;
  action: "Use" | "Review" | "Auto Detect";
}

export interface ValidationError {
  id: string;
  row: number;
  field: string;
  issue: string;
  suggestedFix: string;
  severity: "High" | "Medium" | "Low";
}

export interface MigrationJob {
  id: string;
  projectId: string;
  title: string;
  dataType: string;
  createdAt: string;
  status: "Mapping review" | "Validated" | "Ready";
  mappings: MigrationMapping[];
  validationErrors: ValidationError[];
  previewRows: Record<string, string | number>[];
}

export interface FileItem {
  id: string;
  projectId: string;
  name: string;
  fileType: "CSV" | "XLSX" | "Markdown" | "JSON" | "PDF";
  sourceAgent: "Manual" | "AI PM Agent" | "AI QA Agent" | "AI Migration Agent" | "Founder Black Box";
  createdAt: string;
  status: FileStatus;
}

export interface ReportItem {
  id: string;
  projectId: string;
  title: string;
  type: ReportType;
  agent: "AI PM Agent" | "AI QA Agent" | "AI Migration Agent" | "Founder Black Box";
  createdAt: string;
  status: "Ready" | "Draft" | "Processing";
  summary: string;
}

export interface Integration {
  id: string;
  name: string;
  status: IntegrationStatus;
  description: string;
}

export interface FounderBoxState {
  user: User;
  workspace: Workspace;
  projects: Project[];
  memories: MemoryItem[];
  agentRuns: AgentRun[];
  pmDocuments: PMDocument[];
  qaReports: QAReport[];
  migrationJobs: MigrationJob[];
  files: FileItem[];
  reports: ReportItem[];
  integrations: Integration[];
}
