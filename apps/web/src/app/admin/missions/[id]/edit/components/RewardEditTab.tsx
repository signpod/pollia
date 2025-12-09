"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/admin/components/shadcn-ui/alert-dialog";
import { Button } from "@/app/admin/components/shadcn-ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/admin/components/shadcn-ui/card";
import { useCreateReward } from "@/app/admin/hooks/use-create-reward";
import { useDeleteReward } from "@/app/admin/hooks/use-delete-reward";
import { useReadMission } from "@/app/admin/hooks/use-read-mission";
import { useReadReward } from "@/app/admin/hooks/use-read-reward";
import { useUpdateReward } from "@/app/admin/hooks/use-update-reward";
import type { Reward } from "@prisma/client";
import { Calendar, Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { CreateRewardDialog } from "./CreateRewardDialog";
import { EditRewardDialog } from "./EditRewardDialog";
import type { RewardFormData } from "./RewardForm";

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
      <CardContent>
        <div className="flex items-start gap-4">
          {reward.imageUrl && (
            <Image
              src={reward.imageUrl}
              alt={reward.name}
              width={48}
              height={48}
              className="rounded-lg object-cover"
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
      <CardContent className="p-6">
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

function RewardContent({ missionId }: { missionId: string }) {
  const { data: missionResponse } = useReadMission(missionId);
  const mission = missionResponse?.data;
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [deletingRewardId, setDeletingRewardId] = useState<string | null>(null);

  const createReward = useCreateReward({
    onSuccess: () => {
      toast.success("리워드가 생성되었습니다.");
      setIsCreateDialogOpen(false);
    },
    onError: error => {
      toast.error(error.message || "리워드 생성 중 오류가 발생했습니다.");
    },
  });

  const updateReward = useUpdateReward({
    onSuccess: () => {
      toast.success("리워드가 수정되었습니다.");
      setIsEditDialogOpen(false);
    },
    onError: error => {
      toast.error(error.message || "리워드 수정 중 오류가 발생했습니다.");
    },
  });

  const deleteRewardMutation = useDeleteReward({
    onSuccess: () => {
      toast.success("리워드가 삭제되었습니다.");
      setIsDeleteDialogOpen(false);
      setDeletingRewardId(null);
    },
    onError: error => {
      toast.error(error.message || "리워드 삭제 중 오류가 발생했습니다.");
    },
  });

  const handleCreate = () => {
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (reward: Reward) => {
    setEditingReward(reward);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (rewardId: string) => {
    setDeletingRewardId(rewardId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingRewardId) return;
    deleteRewardMutation.mutate({ rewardId: deletingRewardId, missionId });
  };

  const handleCreateSubmit = (data: RewardFormData) => {
    createReward.mutate({ ...data, missionId });
  };

  const handleEditSubmit = (data: RewardFormData) => {
    if (!editingReward) return;
    updateReward.mutate({
      rewardId: editingReward.id,
      data,
    });
  };

  if (!mission?.rewardId) {
    return (
      <>
        <EmptyRewardCard onCreate={handleCreate} />
        <CreateRewardDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSubmit={handleCreateSubmit}
          isLoading={createReward.isPending}
        />
      </>
    );
  }

  return (
    <>
      <RewardCardWrapper rewardId={mission.rewardId} onEdit={handleEdit} onDelete={handleDelete} />

      <EditRewardDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        reward={editingReward}
        onSubmit={handleEditSubmit}
        isLoading={updateReward.isPending}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>리워드를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 리워드와 관련된 모든 데이터가 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteRewardMutation.isPending}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteRewardMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteRewardMutation.isPending ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function RewardCardWrapper({
  rewardId,
  onEdit,
  onDelete,
}: {
  rewardId: string;
  onEdit: (reward: Reward) => void;
  onDelete: (rewardId: string) => void;
}) {
  const { data: rewardResponse, isLoading } = useReadReward(rewardId);
  const reward = rewardResponse?.data;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!reward) {
    return null;
  }

  return (
    <RewardCard reward={reward} onEdit={() => onEdit(reward)} onDelete={() => onDelete(rewardId)} />
  );
}

export function RewardEditTab({ missionId }: RewardEditTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>리워드</CardTitle>
          <CardDescription>미션 완료 시 지급되는 리워드를 관리합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <RewardContent missionId={missionId} />
        </CardContent>
      </Card>
    </div>
  );
}
