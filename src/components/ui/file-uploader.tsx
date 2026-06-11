"use client";

import { Upload } from "lucide-react";
import { Card } from "@/components/ui/card";

export function FileUploader({
  label,
  accept,
  onChange
}: {
  label: string;
  accept: string;
  onChange: (fileName: string) => void;
}) {
  return (
    <Card className="relative border-dashed p-5">
      <input
        className="absolute inset-0 cursor-pointer opacity-0"
        type="file"
        accept={accept}
        aria-label={label}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onChange(file.name);
          }
        }}
      />
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-surface2 text-gold">
          <Upload className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted">CSV or XLSX, processed locally in demo mode.</p>
        </div>
      </div>
    </Card>
  );
}
