"use client";

import { Card, CardDescription, CardTitle } from "@/app/admin/components/shadcn-ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";

interface AdminCreateCardProps {
  title: string;
  description: string;
  href: string;
}

export function AdminCreateCard({ title, description, href }: AdminCreateCardProps) {
  return (
    <Link href={href}>
      <Card className="h-[180px] border-dashed border-2 hover:border-primary hover:bg-muted/30 transition-all cursor-pointer group">
        <div className="flex flex-col items-center justify-center h-full gap-3">
          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Plus className="size-6 text-primary" />
          </div>
          <div className="text-center">
            <CardTitle className="text-base mb-1">{title}</CardTitle>
            <CardDescription className="text-sm">{description}</CardDescription>
          </div>
        </div>
      </Card>
    </Link>
  );
}
