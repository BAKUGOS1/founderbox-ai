import * as React from "react";
import { cn } from "@/lib/utils";

const variants = {
  default: "border-border bg-surface2 text-muted",
  gold: "border-gold/35 bg-gold/10 text-gold",
  maroon: "border-maroon/50 bg-maroon/18 text-[#f2a9bf]",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-warning/30 bg-warning/10 text-warning",
  danger: "border-danger/30 bg-danger/10 text-danger"
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: keyof typeof variants }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export function StatusBadge({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const variant = normalized.includes("ready") || normalized.includes("active")
    ? "success"
    : normalized.includes("paused") || normalized.includes("review")
      ? "warning"
      : normalized.includes("open") || normalized.includes("high")
        ? "danger"
        : normalized.includes("demo")
          ? "gold"
          : "default";

  return <Badge variant={variant}>{value}</Badge>;
}
