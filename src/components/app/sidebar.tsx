"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bot,
  Boxes,
  FileText,
  FolderKanban,
  Home,
  MemoryStick,
  Plug,
  Settings
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Dashboard", icon: Home, href: "/app/dashboard" },
  { label: "Projects", icon: FolderKanban, href: "/app/projects" },
  { label: "Founder Black Box", icon: MemoryStick, projectHref: "memory" },
  { label: "Agents", icon: Bot, projectHref: "agents" },
  { label: "Files", icon: Boxes, projectHref: "files" },
  { label: "Reports", icon: FileText, projectHref: "reports" },
  { label: "Integrations", icon: Plug, href: "/app/integrations" },
  { label: "Settings", icon: Settings, href: "/app/settings" }
];

export function Sidebar({
  projectId,
  onNavigate
}: {
  projectId: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full flex-col border-r border-border bg-background/92">
      <Link href="/" className="flex items-center gap-3 border-b border-border px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold text-base font-black text-background">
          FB
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">FounderBox AI</p>
          <p className="text-xs text-muted">Plan. Test. Migrate. Remember.</p>
        </div>
      </Link>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {nav.map((item) => {
          const href = item.href ?? `/app/projects/${projectId}/${item.projectHref}`;
          const Icon = item.icon;
          const active =
            href === "/app/projects"
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={item.label}
              href={href}
              onClick={onNavigate}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface2 hover:text-foreground",
                active && "text-foreground"
              )}
            >
              {active ? (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg border border-gold/25 bg-gold/10"
                  transition={{ duration: 0.2 }}
                />
              ) : null}
              <Icon className="relative h-4 w-4" />
              <span className="relative">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-4">
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <BarChart3 className="h-4 w-4 text-gold" />
            Demo mode
          </div>
          <p className="mt-2 text-xs leading-5 text-muted">
            Local-only memory, files, and agent runs. Backend wiring comes next.
          </p>
        </div>
      </div>
    </aside>
  );
}
