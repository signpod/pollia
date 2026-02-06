"use client";

import { cn } from "@/app/admin/lib/utils";

interface NumberViewProps {
  value?: number | null;
  unit?: string;
  placeholder?: string;
  className?: string;
}

export function NumberView({
  value,
  unit,
  placeholder = "미설정",
  className,
}: NumberViewProps) {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">{placeholder}</span>;
  }

  return (
    <span className={cn("tabular-nums", className)}>
      {value.toLocaleString()}
      {unit && <span className="ml-0.5">{unit}</span>}
    </span>
  );
}
