import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AgentCard({
  title,
  description,
  icon: Icon,
  href,
  status = "Demo-ready"
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  status?: string;
}) {
  const content = (
    <Card interactive className="group h-full p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-gold/25 bg-gold/10 text-gold shadow-gold">
          <Icon className="h-5 w-5" />
        </div>
        <Badge variant="gold">{status}</Badge>
      </div>
      <h3 className="mt-6 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      {href ? (
        <div className="mt-5 flex items-center gap-2 text-sm font-medium text-gold">
          Open agent
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      ) : null}
    </Card>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
