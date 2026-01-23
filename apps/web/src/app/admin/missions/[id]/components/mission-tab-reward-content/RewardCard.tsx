"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import { Card, CardContent } from "@/app/admin/components/shadcn-ui/card";
import { formatToDateTimeKR } from "@/lib/date";
import type { Reward } from "@prisma/client";
import { Calendar, Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

interface RewardCardProps {
  reward: Reward;
  onEdit: () => void;
  onDelete: () => void;
}

export function RewardCard({ reward, onEdit, onDelete }: RewardCardProps) {
  const paymentTypeLabel = reward.paymentType === "IMMEDIATE" ? "즉시 지급" : "예약 지급";

  return (
    <Card>
      <CardContent>
        <div className="flex items-start gap-4">
          {reward.imageUrl && (
            <Image
              src={reward.imageUrl}
              alt={reward.name}
              width={48}
              height={48}
              className="rounded-lg object-cover"
              sizes="48px"
            />
          )}

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg">{reward.name}</h3>
            {reward.description && (
              <p className="text-muted-foreground mt-1 text-sm">{reward.description}</p>
            )}

            <div className="flex items-center gap-4 mt-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                {paymentTypeLabel}
              </span>
              {reward.scheduledDate && (
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="size-3.5" />
                  {formatToDateTimeKR(reward.scheduledDate)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Pencil className="size-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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
            미션 완료 시 지급할 리워드를 설정하세요
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
