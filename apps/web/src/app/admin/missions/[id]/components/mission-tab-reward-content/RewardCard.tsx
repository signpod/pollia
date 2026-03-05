"use client";

import { Card, CardContent } from "@/app/admin/components/shadcn-ui/card";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import { Plus } from "lucide-react";

interface EmptyRewardCardProps {
  onCreate: () => void;
}

export function EmptyRewardCard({ onCreate }: EmptyRewardCardProps) {
  return (
    <Card
      className="border-dashed bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={onCreate}
    >
      <CardContent className="p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted mb-4">
            <Plus className="size-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-muted-foreground">리워드 추가하기</h3>
          <p className="text-sm text-muted-foreground/70 mt-1">
            {UBIQUITOUS_CONSTANTS.MISSION} 완료 시 지급할 리워드를 설정하세요
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function LoadingSkeleton() {
  return (
    <Card>
      <CardContent>
        <div className="flex items-start gap-4">
          <div className="size-12 rounded-lg bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
            <div className="h-4 w-64 bg-muted rounded animate-pulse" />
            <div className="flex items-center gap-4 mt-3">
              <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="size-8 bg-muted rounded animate-pulse" />
            <div className="size-8 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
