"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "@/components/app/sidebar";
import { Topbar } from "@/components/app/topbar";
import { useFounderBoxStore } from "@/lib/mock-store";

function getProjectIdFromPath(pathname: string, fallback: string) {
  const match = pathname.match(/\/app\/projects\/([^/]+)/);
  return match?.[1] ?? fallback;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const store = useFounderBoxStore();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const projectId = useMemo(
    () => getProjectIdFromPath(pathname, store.workspace.defaultProjectId),
    [pathname, store.workspace.defaultProjectId]
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed inset-y-0 left-0 z-40 hidden w-72 lg:block">
        <Sidebar projectId={projectId} />
      </div>
      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              className="h-full w-72"
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
            >
              <Sidebar projectId={projectId} onNavigate={() => setMobileOpen(false)} />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="lg:pl-72">
        <Topbar state={store} projectId={projectId} onMenu={() => setMobileOpen(true)} />
        <main className="mx-auto w-full max-w-[1500px] px-4 py-6 md:px-6 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
