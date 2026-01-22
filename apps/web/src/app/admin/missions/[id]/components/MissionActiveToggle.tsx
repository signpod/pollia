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
import { Label } from "@/app/admin/components/shadcn-ui/label";
import { Switch } from "@/app/admin/components/shadcn-ui/switch";
import { useUpdateMission } from "@/app/admin/hooks/mission";
import { useState } from "react";
import { toast } from "sonner";

interface MissionActiveToggleProps {
  missionId: string;
  isActive: boolean;
}

export function MissionActiveToggle({ missionId, isActive }: MissionActiveToggleProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingValue, setPendingValue] = useState<boolean | null>(null);

  const updateMission = useUpdateMission({
    onSuccess: () => {
      toast.success("활성화 상태가 변경되었습니다");
      setPendingValue(null);
    },
    onError: error => {
      toast.error(error.message || "활성화 상태 변경 중 오류가 발생했습니다");
      setPendingValue(null);
    },
  });

  const handleActiveChange = (checked: boolean) => {
    setPendingValue(checked);
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (pendingValue !== null) {
      updateMission.mutate({
        missionId,
        data: { isActive: pendingValue },
      });
    }
    setShowConfirm(false);
  };

  const handleCancel = () => {
    setPendingValue(null);
    setShowConfirm(false);
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <Label htmlFor="isActive" className="text-sm text-muted-foreground">
          {isActive ? "활성화됨" : "비활성화됨"}
        </Label>
        <Switch
          id="isActive"
          checked={isActive}
          onCheckedChange={handleActiveChange}
          disabled={updateMission.isPending}
        />
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingValue ? "미션을 활성화하시겠습니까?" : "미션을 비활성화하시겠습니까?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingValue
                ? "활성화하면 사용자에게 미션이 표시됩니다."
                : "비활성화하면 사용자에게 미션이 표시되지 않습니다."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>확인</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
