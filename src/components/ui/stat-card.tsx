import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export function StatCard({
  title,
  value,
  note,
  icon: Icon
}: {
  title: string;
  value: string | number;
  note: string;
  icon: LucideIcon;
}) {
  return (
    <Card interactive className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-foreground">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface2 text-gold">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-xs leading-5 text-muted">{note}</p>
    </Card>
  );
}
