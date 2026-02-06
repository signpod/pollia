"use client";

import { Badge } from "@/app/admin/components/shadcn-ui/badge";
import { cn } from "@/app/admin/lib/utils";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

interface BadgeItem {
  label: string;
  variant?: BadgeVariant;
}

interface BadgeViewProps {
  value?: string | null;
  items?: BadgeItem[];
  variant?: BadgeVariant;
  placeholder?: string;
  className?: string;
}

export function BadgeView({
  value,
  items,
  variant = "secondary",
  placeholder = "미설정",
  className,
}: BadgeViewProps) {
  if (items && items.length > 0) {
    return (
      <div className={cn("flex flex-wrap gap-1", className)}>
        {items.map((item, index) => (
          <Badge key={index} variant={item.variant ?? variant}>
            {item.label}
          </Badge>
        ))}
      </div>
    );
  }

  if (!value) {
    return <span className="text-muted-foreground italic">{placeholder}</span>;
  }

  return (
    <Badge variant={variant} className={className}>
      {value}
    </Badge>
  );
}
