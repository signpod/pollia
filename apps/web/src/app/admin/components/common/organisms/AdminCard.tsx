"use client";

import { Badge } from "@/app/admin/components/shadcn-ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/admin/components/shadcn-ui/card";
import { cn } from "@/app/admin/lib/utils";
import Link from "next/link";
import type { ReactNode } from "react";

interface AdminCardProps {
  title: string;
  description?: string;
  href: string;
  statusBadge?: {
    label: string;
    variant: "default" | "secondary";
    color: string;
  };
  bottomInfo: ReactNode[];
}

export function AdminCard({ title, description, href, statusBadge, bottomInfo }: AdminCardProps) {
  const bottomInfoItemClasses = cn(
    "flex items-start gap-2",
    "text-sm leading-5 text-muted-foreground",
    "[&>span]:min-w-0 [&>span]:break-words",
    "[&>svg]:mt-0.5 [&>svg]:shrink-0",
  );

  return (
    <Link href={href}>
      <Card className="min-h-[180px] hover:shadow-md hover:bg-muted/30 transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg line-clamp-1 flex-1">{title}</CardTitle>
            {statusBadge && (
              <Badge variant={statusBadge.variant} className={statusBadge.color}>
                {statusBadge.label}
              </Badge>
            )}
          </div>
          {description && <CardDescription className="line-clamp-2">{description}</CardDescription>}
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-end">
          <div className="space-y-2">
            {bottomInfo.map((info, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: index is used as the key
              <div key={index} className={bottomInfoItemClasses}>
                {info}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
