"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/admin/components/shadcn-ui/dialog";
import { RewardForm, type RewardFormData } from "./RewardForm";

interface CreateRewardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RewardFormData) => void;
  isLoading?: boolean;
}

export function CreateRewardDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: CreateRewardDialogProps) {
  const handleFormSubmit = (data: RewardFormData) => {
    onSubmit(data);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>리워드 추가</DialogTitle>
          <DialogDescription>미션 완료 시 지급할 리워드를 설정하세요.</DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <RewardForm isLoading={isLoading} onSubmit={handleFormSubmit} onCancel={handleCancel} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
