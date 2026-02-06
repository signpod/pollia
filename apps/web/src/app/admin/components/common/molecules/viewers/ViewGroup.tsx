"use client";

import { cn } from "@/app/admin/lib/utils";

type GridColumns = 1 | 2 | 3 | 4;

interface ViewGroupProps {
  children: React.ReactNode;
  columns?: GridColumns;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

const columnClasses: Record<GridColumns, string> = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

const gapClasses = {
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
};

export function ViewGroup({ children, columns = 2, gap = "md", className }: ViewGroupProps) {
  return (
    <div className={cn("grid", columnClasses[columns], gapClasses[gap], className)}>{children}</div>
  );
}
