import type React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  empty,
  className
}: {
  data: T[];
  columns: Column<T>[];
  empty?: React.ReactNode;
  className?: string;
}) {
  if (!data.length) {
    return (
      <Card className="p-8 text-center text-sm text-muted">
        {empty ?? "No records yet."}
      </Card>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-lg border border-border", className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border bg-surface/74 text-left text-sm">
          <thead className="bg-surface2/80 text-xs uppercase tracking-[0.16em] text-muted">
            <tr>
              {columns.map((column) => (
                <th key={column.header} className={cn("px-4 py-3 font-medium", column.className)}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/70">
            {data.map((row, index) => (
              <tr key={index} className="transition-colors hover:bg-surface2/52">
                {columns.map((column) => (
                  <td
                    key={column.header}
                    className={cn("whitespace-nowrap px-4 py-3 text-foreground", column.className)}
                  >
                    {typeof column.accessor === "function"
                      ? column.accessor(row)
                      : (row[column.accessor] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
