"use client";

import { useEffect, useState } from "react";
import { Bot, Calendar, Database, Github, KeyRound, Mail, Plug, Settings, Slack, StickyNote, UploadCloud } from "lucide-react";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { PageHeader } from "@/components/ui/page-header";
import { useFounderBoxStore } from "@/lib/mock-store";
import type { Integration } from "@/types";

const icons: Record<string, typeof Github> = {
  GitHub: Github,
  Gmail: Mail,
  "Google Calendar": Calendar,
  "Google Drive": UploadCloud,
  Notion: StickyNote,
  Slack
};

export default function IntegrationsPage() {
  const store = useFounderBoxStore();
  const [selected, setSelected] = useState<Integration | null>(null);
  const [backendStatus, setBackendStatus] = useState<{
    ai: { configured: boolean; model: string };
    github: { configured: boolean };
    google: { configured: boolean };
    storage: { configured: boolean };
  } | null>(null);

  useEffect(() => {
    fetch("/api/integrations/status")
      .then((response) => response.json())
      .then(setBackendStatus)
      .catch(() => setBackendStatus(null));
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Integrations"
        title="Connect project memory sources"
        description="Provider secrets stay on the backend. The app reads server configuration status and uses API routes for AI agent work."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <Bot className="h-5 w-5 text-gold" />
          <h2 className="mt-4 text-lg font-semibold">AI Provider</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Server route reads `OPENAI_API_KEY` and `OPENAI_MODEL` from backend environment.
          </p>
          <div className="mt-4">
            <StatusBadge value={backendStatus?.ai.configured ? "Server key configured" : "Needs backend key"} />
          </div>
          <p className="mt-3 text-xs text-muted">Model: {backendStatus?.ai.model ?? "Checking..."}</p>
        </Card>
        <Card className="p-5">
          <KeyRound className="h-5 w-5 text-gold" />
          <h2 className="mt-4 text-lg font-semibold">OAuth Secrets</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            GitHub and Google OAuth credentials are checked server-side and never exposed to the browser.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusBadge value={backendStatus?.github.configured ? "GitHub configured" : "GitHub not configured"} />
            <StatusBadge value={backendStatus?.google.configured ? "Google configured" : "Google not configured"} />
          </div>
        </Card>
        <Card className="p-5">
          <Database className="h-5 w-5 text-gold" />
          <h2 className="mt-4 text-lg font-semibold">Persistence</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            `DATABASE_URL` will power encrypted credentials, memory, files, reports, and agent runs.
          </p>
          <div className="mt-4">
            <StatusBadge value={backendStatus?.storage.configured ? "Database configured" : "Local demo store"} />
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {store.integrations.map((integration) => {
          const Icon = icons[integration.name] ?? Plug;
          return (
            <Card key={integration.id} interactive className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-surface2 text-gold">
                  <Icon className="h-5 w-5" />
                </div>
                <StatusBadge value={integration.status} />
              </div>
              <h2 className="mt-5 text-lg font-semibold">{integration.name}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{integration.description}</p>
              <div className="mt-5 flex gap-2">
                <Button className="flex-1" variant="secondary" onClick={() => setSelected(integration)}>
                  <Plug className="h-4 w-4" />
                  Connect
                </Button>
                <Button variant="ghost" size="icon" aria-label={`Configure ${integration.name}`} onClick={() => setSelected(integration)}>
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="border-gold/25 bg-gold/10 p-5">
        <Badge variant="gold">Demo honesty</Badge>
        <p className="mt-3 text-sm leading-6 text-muted">
          No external data is fetched in this Phase 1 frontend. Cards preview how OAuth and source indexing will work once the backend, job queue, and secure token store are added.
        </p>
      </Card>

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected ? `${selected.name} integration` : "Integration"}
        description="This is a frontend demo. Real OAuth integration will be added in backend phase."
      >
        {selected ? (
          <div className="space-y-4">
            <StatusBadge value={selected.status} />
            <p className="text-sm leading-7 text-muted">{selected.description}</p>
            <div className="rounded-lg border border-border bg-background p-4 text-sm text-muted">
              Future backend steps: OAuth consent, token vault, sync scheduler, source indexing, memory references, and audit logs.
            </div>
            <Button className="w-full" onClick={() => setSelected(null)}>Close demo modal</Button>
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}
