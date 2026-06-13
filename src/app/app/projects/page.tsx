"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit3, Filter, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { useFounderBoxStore } from "@/lib/mock-store";
import { prettyDate } from "@/lib/utils";
import type { Project, ProjectStatus, ProjectType } from "@/types";

const projectTypes: ProjectType[] = ["SaaS", "PWA", "Agency", "Migration", "Internal Tool"];
const statuses: ProjectStatus[] = ["active", "paused", "archived"];

const emptyForm = {
  name: "",
  description: "",
  type: "SaaS" as ProjectType,
  status: "active" as ProjectStatus
};

export default function ProjectsPage() {
  const router = useRouter();
  const store = useFounderBoxStore();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ProjectStatus | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(() => {
    return store.projects.filter((project) => {
      const matchesQuery = [project.name, project.description, project.type]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesStatus = status === "all" || project.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, status, store.projects]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(project: Project) {
    setEditing(project);
    setForm({
      name: project.name,
      description: project.description,
      type: project.type,
      status: project.status
    });
    setDialogOpen(true);
  }

  function saveProject() {
    if (!form.name.trim() || !form.description.trim()) {
      toast.error("Project name and description are required.");
      return;
    }

    if (editing) {
      store.updateProject(editing.id, form);
      toast.success("Project details updated.");
    } else {
      const project = store.createProject(form);
      toast.success("Project created and saved locally.");
      router.push(`/app/projects/${project.id}`);
    }
    setDialogOpen(false);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Projects"
        title="Product workspaces"
        description="Create, edit, search, and manage founder projects. Database-backed workspaces keep memory, files, reports, and agent run history durable."
      >
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New project
        </Button>
      </PageHeader>

      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input className="pl-9" placeholder="Search projects..." value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Select className="pl-9" value={status} onChange={(event) => setStatus(event.target.value as ProjectStatus | "all")}>
              <option value="all">All statuses</option>
              {statuses.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {filtered.length ? (
        <div className="grid gap-4 xl:grid-cols-3">
          {filtered.map((project) => (
            <Card key={project.id} interactive className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link href={`/app/projects/${project.id}`} className="text-xl font-semibold hover:text-gold">
                    {project.name}
                  </Link>
                  <p className="mt-2 text-sm leading-6 text-muted">{project.description}</p>
                </div>
                <StatusBadge value={project.status} />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Badge variant="gold">{project.type}</Badge>
                {project.integrations.map((integration) => (
                  <Badge key={integration}>{integration}</Badge>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-muted">Runs</p>
                  <p className="mt-1 font-semibold">{project.agentRunCount}</p>
                </div>
                <div>
                  <p className="text-muted">Memory</p>
                  <p className="mt-1 font-semibold">{project.memoryHealth}%</p>
                </div>
                <div>
                  <p className="text-muted">Created</p>
                  <p className="mt-1 font-semibold">{prettyDate(project.createdAt)}</p>
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <Button asChild variant="secondary" className="flex-1">
                  <Link href={`/app/projects/${project.id}`}>Open</Link>
                </Button>
                <Button variant="ghost" size="icon" aria-label="Edit project" onClick={() => openEdit(project)}>
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Delete project" onClick={() => setDeleting(project)}>
                  <Trash2 className="h-4 w-4 text-danger" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Search}
          title="No projects found"
          description="Adjust your search or create a new workspace for a product, QA effort, or migration."
          action={<Button onClick={openCreate}>Create project</Button>}
        />
      )}

      <Dialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? "Edit project" : "Create project"}
        description="Projects save through the backend API and use demo fallback when no database is configured."
      >
        <div className="space-y-4">
          <Field label="Name">
            <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="New SaaS product" />
          </Field>
          <Field label="Description">
            <Textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="What does this project do and who is it for?" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Type">
              <Select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as ProjectType })}>
                {projectTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </Select>
            </Field>
            <Field label="Status">
              <Select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as ProjectStatus })}>
                {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
              </Select>
            </Field>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveProject}>{editing ? "Save changes" : "Create project"}</Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete project?"
        description="This removes the project and its memory, reports, files, and agent outputs from the active workspace."
      >
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleting(null)}>Cancel</Button>
          <Button
            variant="danger"
            onClick={() => {
              if (deleting) {
                store.deleteProject(deleting.id);
                toast.success("Project deleted.");
                setDeleting(null);
              }
            }}
          >
            Delete project
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
