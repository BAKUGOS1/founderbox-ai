"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  interactive = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  const classes = cn(
    "rounded-lg border border-border bg-surface/82 shadow-[0_18px_80px_rgba(0,0,0,0.24)] backdrop-blur",
    interactive &&
      "transition-all hover:-translate-y-1 hover:border-gold/40 hover:shadow-gold",
    className
  );

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
