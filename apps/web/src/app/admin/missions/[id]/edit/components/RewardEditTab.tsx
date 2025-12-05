"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/admin/components/shadcn-ui/card";
import { Skeleton } from "@/app/admin/components/shadcn-ui/skeleton";
import { useReadMission } from "@/app/admin/hooks/use-read-mission";
import { useReadReward } from "@/app/admin/hooks/use-read-reward";
import type { Reward } from "@prisma/client";
import { Calendar, Gift, Pencil, Plus, Trash2 } from "lucide-react";

interface RewardEditTabProps {
  missionId: string;
}

function RewardCard({
  reward,
  onEdit,
  onDelete,
}: {
  reward: Reward;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const paymentTypeLabel = reward.paymentType === "IMMEDIATE" ? "즉시 지급" : "예약 지급";

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
            <Gift className="size-6 text-primary" />
          </div>

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
                  {new Date(reward.scheduledDate).toLocaleDateString("ko-KR")}
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

function EmptyRewardCard({ onCreate }: { onCreate: () => void }) {
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

function LoadingSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-4 w-48 mt-2" />
      </CardHeader>
      <CardContent>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Skeleton className="size-12 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-64" />
                <div className="flex items-center gap-4 mt-3">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Skeleton className="size-8 rounded" />
                <Skeleton className="size-8 rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}

export function RewardEditTab({ missionId }: RewardEditTabProps) {
  const { data: missionResponse, isLoading: isMissionLoading } = useReadMission(missionId);
  const mission = missionResponse?.data;

  const { data: rewardResponse, isLoading: isRewardLoading } = useReadReward(
    mission?.rewardId ?? null,
  );
  const reward = rewardResponse?.data;

  const isLoading = isMissionLoading || (mission?.rewardId && isRewardLoading);

  const handleCreate = () => {
    alert("리워드 생성");
  };

  const handleEdit = () => {
    alert("리워드 수정");
  };

  const handleDelete = () => {
    alert("리워드 삭제");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>리워드</CardTitle>
          <CardDescription>미션 완료 시 지급되는 리워드를 관리합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          {reward ? (
            <RewardCard reward={reward} onEdit={handleEdit} onDelete={handleDelete} />
          ) : (
            <EmptyRewardCard onCreate={handleCreate} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
