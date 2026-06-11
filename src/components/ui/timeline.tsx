"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { prettyDate } from "@/lib/utils";
import type { MemoryItem } from "@/types";

export function Timeline({ items }: { items: MemoryItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.04 }}
        >
          <Card className="p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="maroon">{item.type}</Badge>
                  <span className="text-xs text-muted">{prettyDate(item.createdAt)}</span>
                </div>
                <h3 className="mt-3 text-base font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{item.content}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
              </div>
              <Badge variant="gold" className="shrink-0">
                {item.source}
              </Badge>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
