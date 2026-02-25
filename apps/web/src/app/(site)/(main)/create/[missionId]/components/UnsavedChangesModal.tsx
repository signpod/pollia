"use client";

import { updateMission } from "@/actions/mission/update";
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
import { ROUTES } from "@/constants/routes";
import { ButtonV2 } from "@repo/ui/components";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface UnsavedChangesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  missionId: string;
  pendingIsActive: boolean;
  onSaved: () => void;
}

export function UnsavedChangesModal({
  open,
  onOpenChange,
  missionId,
  pendingIsActive,
  onSaved,
}: UnsavedChangesModalProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveAndLeave = async () => {
    setIsSaving(true);
    try {
      await updateMission(missionId, { isActive: pendingIsActive });
      onSaved();
      onOpenChange(false);
      router.push(ROUTES.CREATE);
    } catch {
      toast.error("저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLeaveWithoutSaving = () => {
    onOpenChange(false);
    router.push(ROUTES.CREATE);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>저장하지 않은 변경사항이 있습니다</AlertDialogTitle>
          <AlertDialogDescription>
            나가기 전에 저장할까요? 저장하지 않으면 변경사항이 사라집니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSaving}>취소</AlertDialogCancel>
          <ButtonV2
            variant="secondary"
            size="medium"
            onClick={handleLeaveWithoutSaving}
            disabled={isSaving}
          >
            저장하지 않고 나가기
          </ButtonV2>
          <AlertDialogAction
            onClick={e => {
              e.preventDefault();
              handleSaveAndLeave();
            }}
            disabled={isSaving}
          >
            {isSaving ? "저장 중..." : "저장하고 나가기"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
