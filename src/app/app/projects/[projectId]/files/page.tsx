"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { Download, Eye, File, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { FileUploader } from "@/components/ui/file-uploader";
import { PageHeader } from "@/components/ui/page-header";
import { downloadText } from "@/lib/export";
import { useFounderBoxStore } from "@/lib/mock-store";
import { prettyDate, uid } from "@/lib/utils";
import type { FileItem } from "@/types";

export default function FilesPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  const store = useFounderBoxStore();
  const project = store.projects.find((item) => item.id === projectId);
  const [selected, setSelected] = useState<FileItem | null>(null);
  const files = useMemo(
    () => store.files.filter((file) => file.projectId === projectId),
    [projectId, store.files]
  );

  if (!project) {
    return (
      <EmptyState
        icon={File}
        title="Project not found"
        description="Open a valid project to view generated and uploaded files."
        action={<Button asChild><Link href="/app/projects">Open projects</Link></Button>}
      />
    );
  }

  function addUpload(fileName: string) {
    store.addFile({
      id: uid("file"),
      projectId,
      name: fileName,
      fileType: fileName.endsWith(".csv") ? "CSV" : fileName.endsWith(".json") ? "JSON" : "XLSX",
      sourceAgent: "Manual",
      createdAt: new Date().toISOString(),
      status: "ready"
    });
    toast.success("File added to workspace vault.");
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Files"
        title={`${project.name} file vault`}
        description="Uploaded and generated files are tracked through the backend API, with secure object storage available when S3 credentials are configured."
      />

      <FileUploader label="Upload workspace file" accept=".xlsx,.csv,.json,.md" onChange={addUpload} />

      {files.length ? (
        <div className="grid gap-4 xl:grid-cols-3">
          {files.map((file) => (
            <Card key={file.id} interactive className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-surface2 text-gold">
                    <File className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{file.name}</p>
                    <p className="mt-1 text-sm text-muted">{file.sourceAgent}</p>
                  </div>
                </div>
                <StatusBadge value={file.status} />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Badge variant="gold">{file.fileType}</Badge>
                <Badge>{prettyDate(file.createdAt)}</Badge>
              </div>
              <div className="mt-5 flex gap-2">
                <Button variant="secondary" className="flex-1" onClick={() => setSelected(file)}>
                  <Eye className="h-4 w-4" />
                  View
                </Button>
                <Button variant="secondary" size="icon" aria-label="Download mock file" onClick={() => downloadText(file.name, `FounderBox AI demo file\n\nName: ${file.name}\nSource: ${file.sourceAgent}\nStatus: ${file.status}`)}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Delete file" onClick={() => { store.deleteFile(file.id); toast.success("File removed from vault."); }}>
                  <Trash2 className="h-4 w-4 text-danger" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Plus}
          title="No files yet"
          description="Run an agent or upload a file to populate this file vault."
        />
      )}

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected?.name ?? "File preview"}
        description="Metadata is persisted through the backend; secure binary storage is enabled through S3-compatible credentials."
      >
        {selected ? (
          <div className="rounded-lg border border-border bg-background p-4 text-sm leading-7 text-muted">
            <p><strong className="text-foreground">Type:</strong> {selected.fileType}</p>
            <p><strong className="text-foreground">Source:</strong> {selected.sourceAgent}</p>
            <p><strong className="text-foreground">Created:</strong> {prettyDate(selected.createdAt)}</p>
            <p><strong className="text-foreground">Status:</strong> {selected.status}</p>
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}
