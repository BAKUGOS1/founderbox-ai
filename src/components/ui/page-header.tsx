"use client";

import type React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export function PageHeader({
  eyebrow,
  title,
  description,
  children
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"
    >
      <div>
        {eyebrow ? (
          <Badge variant="gold" className="mb-3">
            {eyebrow}
          </Badge>
        ) : null}
        <h1 className="text-3xl font-semibold tracking-[-0.01em] text-foreground md:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted md:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {children ? <div className="flex flex-wrap gap-3">{children}</div> : null}
    </motion.div>
  );
}
