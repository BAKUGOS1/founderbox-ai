"use client";

import { useState } from "react";
import { AlertTriangle, Palette, Save, ShieldCheck, SlidersHorizontal, User, WalletCards } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { useFounderBoxStore } from "@/lib/mock-store";

export default function SettingsPage() {
  const store = useFounderBoxStore();
  const [profile, setProfile] = useState({
    name: store.user.name,
    email: store.user.email,
    workspace: store.workspace.name,
    defaultProjectId: store.workspace.defaultProjectId
  });
  const [rules, setRules] = useState({
    saveAllOutputs: true,
    requireApproval: true,
    migrationApproval: true
  });

  function saveSettings() {
    store.updateUser({ name: profile.name, email: profile.email, avatarInitials: profile.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "FB" });
    store.updateWorkspace({ name: profile.workspace, defaultProjectId: profile.defaultProjectId });
    toast.success("Settings saved locally.");
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Settings"
        title="Workspace settings"
        description="Configure the local demo workspace, agent rules, appearance preview, and security warnings for the backend phase."
      >
        <Button onClick={saveSettings}>
          <Save className="h-4 w-4" />
          Save settings
        </Button>
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-gold" />
            <h2 className="text-lg font-semibold">Profile</h2>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-[96px_1fr]">
            <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-border bg-maroon text-xl font-semibold">
              {store.user.avatarInitials}
            </div>
            <div className="space-y-4">
              <Field label="Name">
                <Input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} />
              </Field>
              <Field label="Email">
                <Input value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} />
              </Field>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-gold" />
            <h2 className="text-lg font-semibold">Workspace</h2>
          </div>
          <div className="mt-5 space-y-4">
            <Field label="Workspace name">
              <Input value={profile.workspace} onChange={(event) => setProfile({ ...profile, workspace: event.target.value })} />
            </Field>
            <Field label="Default project">
              <Select value={profile.defaultProjectId} onChange={(event) => setProfile({ ...profile, defaultProjectId: event.target.value })}>
                {store.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
              </Select>
            </Field>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-gold" />
            <h2 className="text-lg font-semibold">Appearance</h2>
          </div>
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border bg-surface2/52 p-4">
              <div>
                <p className="text-sm font-medium">Dark mode default</p>
                <p className="mt-1 text-xs text-muted">FounderBox AI uses a premium dark workspace in Phase 1.</p>
              </div>
              <Badge variant="gold">On</Badge>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {["#08080A", "#111116", "#181820", "#8B1A3A", "#C9A961"].map((color) => (
                <div key={color} className="h-12 rounded-lg border border-border" style={{ backgroundColor: color }} title={color} />
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-gold" />
            <h2 className="text-lg font-semibold">Agent rules</h2>
          </div>
          <div className="mt-5 space-y-3">
            <label className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface2/52 p-4 text-sm">
              <span>Save all agent outputs to Founder Black Box</span>
              <input type="checkbox" checked={rules.saveAllOutputs} onChange={(event) => setRules({ ...rules, saveAllOutputs: event.target.checked })} className="h-4 w-4 accent-gold" />
            </label>
            <label className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface2/52 p-4 text-sm">
              <span>Require approval before saving memory</span>
              <input type="checkbox" checked={rules.requireApproval} onChange={(event) => setRules({ ...rules, requireApproval: event.target.checked })} className="h-4 w-4 accent-gold" />
            </label>
            <div className="rounded-lg border border-border bg-surface2/52 p-4 text-sm">
              <p className="font-medium">QA report format</p>
              <p className="mt-1 text-muted">Excel</p>
            </div>
            <label className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface2/52 p-4 text-sm">
              <span>Migration requires manual mapping approval</span>
              <input type="checkbox" checked={rules.migrationApproval} onChange={(event) => setRules({ ...rules, migrationApproval: event.target.checked })} className="h-4 w-4 accent-gold" />
            </label>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.7fr]">
        <Card className="border-danger/25 bg-danger/10 p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-danger" />
            <h2 className="text-lg font-semibold">Data and security</h2>
          </div>
          <div className="mt-4 grid gap-3 text-sm text-muted">
            <p>No real backend connected.</p>
            <p>Files are stored locally in browser demo mode.</p>
            <p>Do not upload sensitive data in demo mode.</p>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-2">
            <WalletCards className="h-5 w-5 text-gold" />
            <h2 className="text-lg font-semibold">Billing preview</h2>
          </div>
          <p className="mt-5 text-3xl font-semibold text-gold">{store.workspace.plan}</p>
          <p className="mt-3 text-sm leading-6 text-muted">Billing is not active in this frontend demo. Future plans will unlock hosted memory, real agent workers, OAuth, and team seats.</p>
        </Card>
      </div>
    </div>
  );
}
