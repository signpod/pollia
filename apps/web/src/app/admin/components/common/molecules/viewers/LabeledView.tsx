"use client";

import { cn } from "@/app/admin/lib/utils";

interface LabeledViewProps {
  label: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function LabeledView({ label, description, children, className }: LabeledViewProps) {
  return (
    <div className={cn("rounded-lg border p-3", className)}>
      <div className="space-y-0.5 mb-2">
        <div className="text-sm font-medium">{label}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="text-sm">{children}</div>
    </div>
  );
}
