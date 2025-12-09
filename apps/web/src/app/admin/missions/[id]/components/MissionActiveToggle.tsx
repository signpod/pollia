"use client";

import { Label } from "@/app/admin/components/shadcn-ui/label";
import { Switch } from "@/app/admin/components/shadcn-ui/switch";
import { useUpdateMission } from "@/app/admin/hooks/use-update-mission";
import { toast } from "sonner";

interface MissionActiveToggleProps {
  missionId: string;
  isActive: boolean;
}

export function MissionActiveToggle({ missionId, isActive }: MissionActiveToggleProps) {
  const updateMission = useUpdateMission({
    onSuccess: () => {
      toast.success("활성화 상태가 변경되었습니다.");
    },
    onError: error => {
      toast.error(error.message || "활성화 상태 변경 중 오류가 발생했습니다.");
    },
  });

  const handleActiveChange = (checked: boolean) => {
    updateMission.mutate({
      missionId,
      data: { isActive: checked },
    });
  };

  return (
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
  );
}
