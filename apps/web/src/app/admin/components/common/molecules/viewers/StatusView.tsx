"use client";

import { cn } from "@/app/admin/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

interface StatusViewProps {
  isActive?: boolean | null;
  activeLabel?: string;
  inactiveLabel?: string;
  showIcon?: boolean;
  className?: string;
}

export function StatusView({
  isActive,
  activeLabel = "활성",
  inactiveLabel = "비활성",
  showIcon = true,
  className,
}: StatusViewProps) {
  const active = isActive === true;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        active ? "text-green-600" : "text-muted-foreground",
        className,
      )}
    >
      {showIcon &&
        (active ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <XCircle className="h-4 w-4" />
        ))}
      <span>{active ? activeLabel : inactiveLabel}</span>
    </span>
  );
}
