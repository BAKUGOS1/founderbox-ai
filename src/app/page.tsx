"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  DatabaseZap,
  FileSearch,
  FolderKanban,
  MemoryStick,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { AgentCard } from "@/components/ui/agent-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const problems = [
  "Product decisions get lost",
  "Planning is messy",
  "QA is manual",
  "Data migration is painful"
];

const workflow = [
  "Create Project",
  "Add Context",
  "Run Agents",
  "Save Memory",
  "Ask Anything"
];

const useCases = [
  "SaaS founders",
  "Agencies",
  "QA teams",
  "Business software teams"
];

const pricing = [
  {
    name: "Free",
    price: "$0",
    detail: "Demo workspace, sample projects, local memory, and export flows."
  },
  {
    name: "Pro",
    price: "$29",
    detail: "Future hosted memory, real agent runs, file storage, and integrations."
  },
  {
    name: "Business",
    price: "Custom",
    detail: "Future team controls, audit logs, migration pipelines, and support."
  }
];

export default function LandingPage() {
  return (
    <main className="bg-background text-foreground">
      <section className="relative min-h-[92vh] overflow-hidden bg-hero-radial premium-grid">
        <motion.div
          className="absolute inset-0 opacity-60"
          animate={{ backgroundPosition: ["0% 0%", "100% 60%", "0% 0%"] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          style={{
            background:
              "linear-gradient(120deg, rgba(139,26,58,0.12), rgba(201,169,97,0.10), transparent)"
          }}
        />
        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold font-black text-background">
              FB
            </div>
            <div>
              <p className="text-sm font-semibold">FounderBox AI</p>
              <p className="text-xs text-muted">Plan. Test. Migrate. Remember.</p>
            </div>
          </Link>
          <div className="hidden items-center gap-6 text-sm text-muted md:flex">
            <a href="#agents" className="hover:text-foreground">Agents</a>
            <a href="#workflow" className="hover:text-foreground">Workflow</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
          </div>
          <Button asChild variant="secondary">
            <Link href="/login">Login</Link>
          </Button>
        </nav>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-6 pb-16 pt-14 lg:grid-cols-[1fr_0.88fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Badge variant="gold">FounderBox AI</Badge>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-[-0.02em] md:text-7xl">
              AI workspace for founders to plan, test, migrate, and remember product work.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
              Connect project memory with specialized AI agents for product planning, QA
              testing, and data migration.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/signup">
                  Start Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/app/dashboard">View Demo Dashboard</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -inset-6 rounded-[2rem] bg-maroon/16 blur-3xl" />
            <Card className="relative overflow-hidden p-4">
              <div className="rounded-lg border border-border bg-background p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Founder OS Command Center</p>
                    <p className="text-xs text-muted">Phere workspace, demo mode</p>
                  </div>
                  <Badge variant="gold">Local memory</Badge>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    ["Projects", "3", FolderKanban],
                    ["Agent Runs", "57", Bot],
                    ["Saved Memories", "128", MemoryStick],
                    ["QA Issues", "14", FileSearch]
                  ].map(([label, value, Icon]) => (
                    <div key={String(label)} className="rounded-lg border border-border bg-surface p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted">{String(label)}</span>
                        <Icon className="h-4 w-4 text-gold" />
                      </div>
                      <p className="mt-3 text-2xl font-semibold">{String(value)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    "AI PM Agent generated six-week MVP scope",
                    "QA Agent found import template and mobile validation risks",
                    "Migration Agent prepared customer master mapping"
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-lg bg-surface2 p-3 text-sm text-muted">
                      <CheckCircle2 className="h-4 w-4 text-gold" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-4 md:grid-cols-4">
          {problems.map((problem) => (
            <Card key={problem} interactive className="p-5">
              <p className="text-sm font-medium text-foreground">{problem}</p>
              <p className="mt-3 text-sm leading-6 text-muted">
                FounderBox turns the scattered context into one project memory that agents can use.
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface/40">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-[0.8fr_1fr] lg:items-center">
          <div>
            <Badge variant="maroon">Shared memory + agents</Badge>
            <h2 className="mt-4 text-3xl font-semibold md:text-5xl">
              A SaaS operating system where every agent remembers the same project truth.
            </h2>
          </div>
          <p className="text-base leading-8 text-muted">
            Founder Black Box stores decisions, bugs, documents, migration events, and founder
            notes. The PM, QA, and Migration agents use that memory in demo mode today and are
            ready for backend-backed retrieval later.
          </p>
        </div>
      </section>

      <section id="agents" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <Badge variant="gold">Core agents</Badge>
            <h2 className="mt-4 text-3xl font-semibold">Specialized workflows, one memory layer.</h2>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <AgentCard
            title="Founder Black Box"
            description="Ask the project memory, add decisions, and trace answers back to source chips."
            icon={MemoryStick}
            href="/app/projects/demo-phere/memory"
          />
          <AgentCard
            title="AI PM Agent"
            description="Turn founder ideas into PRDs, modules, user stories, schema, roadmap, and sprint tasks."
            icon={Sparkles}
            href="/app/projects/demo-phere/agents/pm"
          />
          <AgentCard
            title="AI QA Agent"
            description="Simulate autonomous QA runs and export issue reports for product teams."
            icon={FileSearch}
            href="/app/projects/demo-phere/agents/qa"
          />
          <AgentCard
            title="AI Migration Agent"
            description="Map messy spreadsheets into validated import-ready files with approval gates."
            icon={DatabaseZap}
            href="/app/projects/demo-phere/agents/migration"
          />
        </div>
      </section>

      <section id="workflow" className="border-y border-border bg-surface/40">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <Badge variant="gold">Workflow</Badge>
          <div className="mt-8 grid gap-3 md:grid-cols-5">
            {workflow.map((step, index) => (
              <Card key={step} className="p-5">
                <Badge variant="maroon">0{index + 1}</Badge>
                <p className="mt-4 text-sm font-semibold">{step}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-2">
        <div>
          <Badge variant="gold">Use cases</Badge>
          <h2 className="mt-4 text-3xl font-semibold">Built for teams that cannot afford context loss.</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {useCases.map((item) => (
            <Card key={item} className="p-5">
              <ShieldCheck className="h-5 w-5 text-gold" />
              <p className="mt-4 font-medium">{item}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-4 md:grid-cols-3">
          {pricing.map((plan) => (
            <Card key={plan.name} interactive className="p-6">
              <p className="text-lg font-semibold">{plan.name}</p>
              <p className="mt-4 text-3xl font-semibold text-gold">{plan.price}</p>
              <p className="mt-3 text-sm leading-6 text-muted">{plan.detail}</p>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <p>FounderBox AI. Plan. Test. Migrate. Remember.</p>
          <p>Frontend-only Phase 1 demo. No real backend, OAuth, or AI calls.</p>
        </div>
      </footer>
    </main>
  );
}
