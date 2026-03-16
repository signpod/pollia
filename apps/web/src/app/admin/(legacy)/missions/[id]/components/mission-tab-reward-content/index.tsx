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
import { useReadMission } from "@/app/admin/hooks/mission";
import {
  useCreateReward,
  useDeleteReward,
  useReadReward,
  useUpdateReward,
} from "@/app/admin/hooks/reward";
import type { UpdateRewardRequest } from "@/types/dto";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ActualPaymentCard } from "./ActualPaymentCard";
import { CreateRewardDialog } from "./CreateRewardDialog";
import { PaymentSettingCard } from "./PaymentSettingCard";
import { EmptyRewardCard, LoadingSkeleton } from "./RewardCard";
import type { RewardFormData } from "./RewardForm";
import { RewardInfoCard } from "./RewardInfoCard";

interface MissionTabRewardContentProps {
  missionId: string;
}

function RewardCardsContent({
  rewardId,
  onDelete,
}: {
  rewardId: string;
  onDelete: (rewardId: string) => void;
}) {
  const { data: rewardResponse, isLoading } = useReadReward(rewardId);
  const reward = rewardResponse?.data;
  const updateReward = useUpdateReward({
    onSuccess: () => {
      toast.success("리워드가 수정되었습니다");
    },
    onError: error => {
      toast.error(error.message || "리워드 수정 중 오류가 발생했습니다");
    },
  });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!reward) {
    return null;
  }

  const handleUpdate = (data: UpdateRewardRequest) => {
    updateReward.mutate({ rewardId: reward.id, data });
  };

  const handleConfirmPayment = (paidAt: Date | null) => {
    updateReward.mutate({ rewardId: reward.id, data: { paidAt } });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onDelete(rewardId)}
          disabled={updateReward.isPending}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="size-4" />
          리워드 삭제
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <RewardInfoCard
          reward={reward}
          onUpdate={handleUpdate}
          isLoading={updateReward.isPending}
        />
        <PaymentSettingCard
          reward={reward}
          onUpdate={handleUpdate}
          isLoading={updateReward.isPending}
        />
        <ActualPaymentCard
          reward={reward}
          onConfirmPayment={handleConfirmPayment}
          isLoading={updateReward.isPending}
        />
      </div>
    </div>
  );
}

function RewardContent({ missionId }: { missionId: string }) {
  const { data: missionResponse } = useReadMission(missionId);
  const mission = missionResponse?.data;
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingRewardId, setDeletingRewardId] = useState<string | null>(null);

  const createReward = useCreateReward({
    onSuccess: () => {
      toast.success("리워드가 생성되었습니다");
      setIsCreateDialogOpen(false);
    },
    onError: error => {
      toast.error(error.message || "리워드 생성 중 오류가 발생했습니다");
    },
  });

  const deleteRewardMutation = useDeleteReward({
    onSuccess: () => {
      toast.success("리워드가 삭제되었습니다");
      setIsDeleteDialogOpen(false);
      setDeletingRewardId(null);
    },
    onError: error => {
      toast.error(error.message || "리워드 삭제 중 오류가 발생했습니다");
    },
  });

  const handleCreate = () => {
    setIsCreateDialogOpen(true);
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
      <RewardCardsContent rewardId={mission.rewardId} onDelete={handleDelete} />

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
      <RewardContent missionId={missionId} />
    </div>
  );
}
