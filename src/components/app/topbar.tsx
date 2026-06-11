"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronDown, Menu, Search, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import type { FounderBoxState } from "@/types";

export function Topbar({
  state,
  projectId,
  onMenu
}: {
  state: FounderBoxState;
  projectId: string;
  onMenu: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const suggestions = useMemo(() => {
    const base = [
      { label: "Ask Founder Black Box", href: `/app/projects/${projectId}/memory` },
      { label: "Generate PRD", href: `/app/projects/${projectId}/agents/pm` },
      { label: "Run QA Test", href: `/app/projects/${projectId}/agents/qa` },
      { label: "Start Migration", href: `/app/projects/${projectId}/agents/migration` },
      { label: "Open Reports", href: `/app/projects/${projectId}/reports` }
    ];
    if (!search.trim()) {
      return base.slice(0, 3);
    }
    return base.filter((item) => item.label.toLowerCase().includes(search.toLowerCase()));
  }, [projectId, search]);

  const selectedProject = state.projects.find((project) => project.id === projectId);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/76 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Open sidebar"
          onClick={onMenu}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="hidden min-w-[220px] md:block">
          <Select
            aria-label="Project switcher"
            value={selectedProject?.id ?? state.workspace.defaultProjectId}
            onChange={(event) => {
              const nextProject = event.target.value;
              if (pathname.includes("/memory")) {
                router.push(`/app/projects/${nextProject}/memory`);
              } else if (pathname.includes("/agents")) {
                router.push(`/app/projects/${nextProject}/agents`);
              } else if (pathname.includes("/files")) {
                router.push(`/app/projects/${nextProject}/files`);
              } else if (pathname.includes("/reports")) {
                router.push(`/app/projects/${nextProject}/reports`);
              } else {
                router.push(`/app/projects/${nextProject}`);
              }
            }}
          >
            {state.projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            className="pl-9"
            placeholder="Search memory, agents, files..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onFocus={() => setSearch((value) => value)}
          />
          <AnimatePresence>
            {search.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute left-0 right-0 top-12 z-40 rounded-lg border border-border bg-surface p-2 shadow-[0_20px_80px_rgba(0,0,0,0.45)]"
              >
                {suggestions.length ? (
                  suggestions.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface2 hover:text-foreground"
                      onClick={() => setSearch("")}
                    >
                      {item.label}
                    </Link>
                  ))
                ) : (
                  <p className="px-3 py-2 text-sm text-muted">
                    No matching command. Try memory, PRD, QA, or migration.
                  </p>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-xs text-muted md:flex">
          <ShieldCheck className="h-4 w-4 text-gold" />
          Demo / local only
        </div>

        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>

        <div className="relative">
          <Button variant="secondary" onClick={() => setMenuOpen((value) => !value)}>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-maroon text-xs text-foreground">
              {state.user.avatarInitials}
            </span>
            <span className="hidden md:inline">{state.user.name}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
          <AnimatePresence>
            {menuOpen ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute right-0 top-12 w-64 rounded-lg border border-border bg-surface p-2 shadow-[0_20px_80px_rgba(0,0,0,0.45)]"
              >
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-foreground">{state.user.name}</p>
                  <p className="text-xs text-muted">{state.user.email}</p>
                </div>
                <Link
                  href="/app/settings"
                  className="block rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface2 hover:text-foreground"
                  onClick={() => setMenuOpen(false)}
                >
                  Workspace settings
                </Link>
                <Link
                  href="/"
                  className="block rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface2 hover:text-foreground"
                  onClick={() => setMenuOpen(false)}
                >
                  Back to landing
                </Link>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
