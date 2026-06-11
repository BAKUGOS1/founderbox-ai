import type {
  MemoryItem,
  MigrationJob,
  MigrationMapping,
  PMDocument,
  Project,
  QAReport,
  QAIssue
} from "@/types";
import { sampleSourceRows, validateMigrationRows } from "@/lib/validation";
import { uid } from "@/lib/utils";

export interface PMAgentInput {
  projectId: string;
  productIdea: string;
  targetUsers: string;
  businessGoal: string;
  timeline: string;
  productType: string;
  complexity: string;
  useMemory: boolean;
}

export interface QAAgentInput {
  projectId: string;
  url: string;
  email: string;
  password?: string;
  module: string;
  instructions: string;
  sampleData: boolean;
  reportType: QAReport["reportType"];
}

export interface MigrationAgentInput {
  projectId: string;
  dataType: string;
  sourceName?: string;
  targetName?: string;
}

export interface MemoryAnswer {
  answer: string;
  sources: string[];
}

export const qaProgressSteps = [
  "Opening website",
  "Checking login page",
  "Testing navigation",
  "Testing forms",
  "Checking validation",
  "Capturing screenshots",
  "Generating report"
];

export const defaultQAIssues: QAIssue[] = [
  {
    id: "issue-1",
    module: "Leads",
    issue: "Mobile number field accepts alphabets",
    description:
      "The mobile number input allows non-numeric characters while creating a lead. This can result in invalid customer records.",
    priority: "High",
    status: "Open"
  },
  {
    id: "issue-2",
    module: "Login",
    issue: "Password error message is not clear",
    description:
      "When invalid credentials are entered, the system shows a generic error instead of explaining the issue.",
    priority: "Medium",
    status: "Open"
  },
  {
    id: "issue-3",
    module: "Dashboard",
    issue: "Cards overlap on mobile",
    description: "Summary cards break layout on small screens below 375px width.",
    priority: "Medium",
    status: "Open"
  },
  {
    id: "issue-4",
    module: "Import",
    issue: "Sample file format is missing",
    description:
      "User cannot download a sample import template before uploading records.",
    priority: "High",
    status: "Open"
  },
  {
    id: "issue-5",
    module: "Forms",
    issue: "Required field validation appears late",
    description:
      "Validation only appears after submitting instead of showing inline feedback.",
    priority: "Low",
    status: "Open"
  },
  {
    id: "issue-6",
    module: "Reports",
    issue: "Export button has no loading state",
    description: "User gets no feedback after clicking export.",
    priority: "Low",
    status: "Open"
  }
];

export function generatePMDocument(input: PMAgentInput): PMDocument {
  const title = `${input.productIdea.slice(0, 42) || "New Product"} Product Plan`;
  const memoryLine = input.useMemory
    ? "Founder Black Box memory was included as demo context, so previous decisions and open risks shape the plan."
    : "This plan uses only the current form inputs and can be saved to memory after approval.";

  return {
    id: uid("pm"),
    projectId: input.projectId,
    title,
    idea: input.productIdea,
    createdAt: new Date().toISOString(),
    sections: [
      {
        title: "Product Summary",
        content: `${input.productIdea} is framed as a ${input.productType.toLowerCase()} for ${input.targetUsers}. ${memoryLine}`
      },
      {
        title: "Problem Statement",
        content: `${input.targetUsers} need a more reliable way to move from idea to execution because decisions, tasks, QA findings, and files are usually scattered across tools.`
      },
      {
        title: "Target Users",
        content: `${input.targetUsers}. Prioritize one founder/operator persona, one hands-on team member, and one external collaborator who needs read-only clarity.`
      },
      {
        title: "MVP Scope",
        content: `Ship the smallest complete workflow in ${input.timeline}: project setup, context capture, agent run, approval, saved memory, report export, and next action tracking.`
      },
      {
        title: "Feature Modules",
        content:
          "Workspace shell, project memory, PM planning, QA report simulation, file vault, report history, integration readiness, and settings for agent rules."
      },
      {
        title: "User Stories",
        content:
          "As a founder, I can create a project, add context, run an agent, review the output, save it to memory, and later ask why a decision was made."
      },
      {
        title: "Database Schema",
        content:
          "Future backend tables: workspaces, users, projects, memory_items, agent_runs, reports, files, integrations, audit_events, and billing_subscriptions."
      },
      {
        title: "API Requirements",
        content:
          "Future APIs should cover project CRUD, memory search, agent run creation, report export, file uploads, integration OAuth callbacks, and job status polling."
      },
      {
        title: "Roadmap",
        content:
          "Week 1 setup and memory model. Week 2 PM Agent. Week 3 QA Agent. Week 4 Migration Agent. Week 5 exports and settings. Week 6 investor demo hardening."
      },
      {
        title: "Sprint Tasks",
        content:
          "Create typed mock services, build dashboard shell, wire localStorage persistence, implement agent forms, add report exports, and run lint/type/build gates."
      },
      {
        title: "Risks",
        content: `Main risks: over-scoping, unclear agent boundaries, weak validation, and demo workflows that hide backend needs. Complexity is currently marked ${input.complexity}.`
      },
      {
        title: "Success Metrics",
        content: `${input.businessGoal}. Track activation through project creation, first memory saved, first agent run, report download, and return search in Founder Black Box.`
      }
    ]
  };
}

export function generateQAReport(input: QAAgentInput): QAReport {
  return {
    id: uid("qa"),
    projectId: input.projectId,
    title: `${input.module || "Product"} ${input.reportType} QA Report`,
    url: input.url || "https://demo.local",
    reportType: input.reportType,
    createdAt: new Date().toISOString(),
    summary: `Demo ${input.reportType.toLowerCase()} run completed for ${input.module || "the selected module"} with ${defaultQAIssues.length} issues. This frontend demo does not open a real browser or store credentials.`,
    steps: qaProgressSteps,
    issues: defaultQAIssues.map((issue) => ({
      ...issue,
      id: uid("issue")
    }))
  };
}

export const defaultMigrationMappings: MigrationMapping[] = [
  {
    id: "map-ledger",
    targetField: "Ledger Name",
    suggestedSourceColumn: "Party Name",
    confidence: 96,
    required: true,
    action: "Use"
  },
  {
    id: "map-mobile",
    targetField: "Mobile Number",
    suggestedSourceColumn: "Mob",
    confidence: 88,
    required: false,
    action: "Review"
  },
  {
    id: "map-gstin",
    targetField: "GSTIN",
    suggestedSourceColumn: "GST No",
    confidence: 84,
    required: false,
    action: "Review"
  },
  {
    id: "map-balance",
    targetField: "Opening Balance",
    suggestedSourceColumn: "Balance",
    confidence: 91,
    required: false,
    action: "Use"
  },
  {
    id: "map-balance-type",
    targetField: "Balance Type",
    suggestedSourceColumn: "Auto Detect",
    confidence: 79,
    required: false,
    action: "Auto Detect"
  },
  {
    id: "map-email",
    targetField: "Email",
    suggestedSourceColumn: "Email",
    confidence: 94,
    required: false,
    action: "Use"
  },
  {
    id: "map-address",
    targetField: "Address",
    suggestedSourceColumn: "Address",
    confidence: 90,
    required: false,
    action: "Use"
  }
];

export function generateMigrationJob(input: MigrationAgentInput): MigrationJob {
  const previewRows = sampleSourceRows.map((row) => ({
    "Ledger Name": row["Party Name"],
    "Mobile Number": row.Mob,
    GSTIN: row["GST No"],
    "Opening Balance": row.Balance,
    "Balance Type": Number(String(row.Balance).replace(/,/g, "")) >= 0 ? "Dr" : "Cr",
    Email: row.Email,
    Address: row.Address
  }));

  return {
    id: uid("mig"),
    projectId: input.projectId,
    title: `${input.dataType} Mapping and Validation`,
    dataType: input.dataType,
    createdAt: new Date().toISOString(),
    status: "Validated",
    mappings: defaultMigrationMappings.map((mapping) => ({
      ...mapping,
      id: uid("map")
    })),
    validationErrors: validateMigrationRows(previewRows),
    previewRows
  };
}

export function askProjectMemory(
  query: string,
  project: Project | undefined,
  memories: MemoryItem[]
): MemoryAnswer {
  if (!project) {
    return {
      answer:
        "I could not find that project in demo memory. Open a demo project or create one first.",
      sources: ["Founder Black Box"]
    };
  }

  const normalized = query.toLowerCase();
  const projectMemories = memories.filter((memory) => memory.projectId === project.id);
  const matching = projectMemories.filter((memory) =>
    [memory.title, memory.content, memory.tags.join(" "), memory.source]
      .join(" ")
      .toLowerCase()
      .includes(normalized.split(" ")[0] ?? "")
  );
  const sourceItems = (matching.length ? matching : projectMemories).slice(0, 4);
  const sourceLabels = sourceItems.map((item) => item.source);

  if (normalized.includes("risk") || normalized.includes("backend")) {
    return {
      answer: `${project.name} should keep the Phase 1 demo honest: no real OAuth, no real database, no credential storage, and no real browser automation. The strongest backend phase should add job queues, file storage, memory search, OAuth integrations, and audit logs.`,
      sources: Array.from(new Set(["Manual Decision", "PRD generated by AI PM Agent", ...sourceLabels]))
    };
  }

  if (normalized.includes("qa") || normalized.includes("bug") || normalized.includes("issue")) {
    return {
      answer: `${project.name} currently has QA memory around input validation, responsive card behavior, import templates, and report loading states. The highest priority fix is anything that can create bad records or block onboarding.`,
      sources: Array.from(new Set(["QA Report #3", ...sourceLabels]))
    };
  }

  if (normalized.includes("migration") || normalized.includes("mapping")) {
    return {
      answer:
        "Migration decisions are approval-first. The demo can suggest mappings and validation fixes, but the final import file should only use mappings the user reviews. Legal identifiers such as GSTIN should never be silently changed.",
      sources: Array.from(new Set(["Migration Job #2", ...sourceLabels]))
    };
  }

  return {
    answer: `${project.name} memory says the next best move is to keep a tight MVP loop: capture context, run one specialized agent, save approved output into Founder Black Box, and turn that memory into the next execution task.`,
    sources: Array.from(new Set(["Manual Decision", "PRD generated by AI PM Agent", ...sourceLabels]))
  };
}
