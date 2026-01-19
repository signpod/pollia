"use client";

import { Card, CardDescription, CardTitle } from "@/app/admin/components/shadcn-ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";

interface AdminCreateCardProps {
  title?: string;
  description?: string;
  label?: string;
  href?: string;
  onClick?: () => void;
}

export function AdminCreateCard({
  title,
  description,
  label,
  href,
  onClick,
}: AdminCreateCardProps) {
  const displayTitle = title ?? label ?? "새로 만들기";
  const displayDescription = description ?? "새 항목을 추가합니다";

  const content = (
    <Card className="h-[180px] border-dashed border-2 hover:border-primary hover:bg-muted/30 transition-all cursor-pointer group">
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Plus className="size-6 text-primary" />
        </div>
        <div className="text-center">
          <CardTitle className="text-base mb-1">{displayTitle}</CardTitle>
          <CardDescription className="text-sm">{displayDescription}</CardDescription>
        </div>
      </div>
    </Card>
  );

  if (onClick) {
    return (
      <div
        onClick={onClick}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
        role="button"
        tabIndex={0}
      >
        {content}
      </div>
    );
  }

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
