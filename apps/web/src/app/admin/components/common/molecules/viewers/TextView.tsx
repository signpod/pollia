"use client";

import { cn } from "@/app/admin/lib/utils";

interface TextViewProps {
  value?: string | null;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
}

export function TextView({
  value,
  placeholder = "설정되지 않음",
  multiline = false,
  className,
}: TextViewProps) {
  if (!value) {
    return <span className="text-muted-foreground italic">{placeholder}</span>;
  }

  return multiline ? (
    <div className={cn("whitespace-pre-wrap", className)}>{value}</div>
  ) : (
    <span className={className}>{value}</span>
  );
}
