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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/admin/components/shadcn-ui/card";
import { useReadMission } from "@/app/admin/hooks/mission";
import {
  useCreateReward,
  useDeleteReward,
  useReadReward,
  useUpdateReward,
} from "@/app/admin/hooks/reward";
import type { Reward } from "@prisma/client";
import { useState } from "react";
import { toast } from "sonner";
import { CreateRewardDialog } from "./CreateRewardDialog";
import { EditRewardDialog } from "./EditRewardDialog";
import { EmptyRewardCard, LoadingSkeleton, RewardCard } from "./RewardCard";
import type { RewardFormData } from "./RewardForm";

interface MissionTabRewardContentProps {
  missionId: string;
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

export function MissionTabRewardContent({ missionId }: MissionTabRewardContentProps) {
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
