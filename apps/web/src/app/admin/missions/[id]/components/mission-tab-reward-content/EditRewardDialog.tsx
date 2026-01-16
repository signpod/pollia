"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/admin/components/shadcn-ui/dialog";
import type { Reward } from "@prisma/client";
import { RewardForm, type RewardFormData } from "./RewardForm";

interface EditRewardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reward: Reward | null;
  onSubmit: (data: RewardFormData) => void;
  isLoading?: boolean;
}

export function EditRewardDialog({
  open,
  onOpenChange,
  reward,
  onSubmit,
  isLoading = false,
}: EditRewardDialogProps) {
  const handleFormSubmit = (data: RewardFormData) => {
    onSubmit(data);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!reward) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>리워드 수정</DialogTitle>
          <DialogDescription>리워드의 세부 정보를 수정하세요.</DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <RewardForm
            isLoading={isLoading}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            initialData={{
              name: reward.name,
              description: reward.description || undefined,
              imageUrl: reward.imageUrl || undefined,
              paymentType: reward.paymentType,
              scheduledDate: reward.scheduledDate || undefined,
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
