"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/admin/components/shadcn-ui/dialog";
import { Form } from "@/app/admin/components/shadcn-ui/form";
import { Spinner } from "@/app/admin/components/shadcn-ui/spinner";
import { useReadMission, useUpdateMission } from "@/app/admin/hooks/mission";
import type { MissionUpdate } from "@/schemas/mission";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { BasicInfoCard, type MissionData, useBasicInfoForm } from "./shared";

interface BasicInfoEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  missionId: string;
}

export function BasicInfoEditDialog({ open, onOpenChange, missionId }: BasicInfoEditDialogProps) {
  const { data: missionResponse, isLoading } = useReadMission(missionId);
  const mission = missionResponse?.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>기본 정보 수정</DialogTitle>
          <DialogDescription>미션의 제목, 설명, 대상 등 기본 정보를 수정하세요.</DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">미션 정보를 불러오는 중...</p>
          </div>
        )}

        {mission && (
          <BasicInfoFormContent
            mission={mission}
            missionId={missionId}
            onSuccess={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface BasicInfoFormContentProps {
  mission: MissionData;
  missionId: string;
  onSuccess: () => void;
}

function BasicInfoFormContent({ mission, missionId, onSuccess }: BasicInfoFormContentProps) {
  const { form, handleReset } = useBasicInfoForm(mission);

  const updateMission = useUpdateMission({
    onSuccess: () => {
      toast.success("미션 기본 정보가 수정되었습니다.");
      onSuccess();
    },
    onError: err => toast.error(err.message || "미션 수정 중 오류가 발생했습니다."),
  });

  const onSubmit = form.handleSubmit((data: MissionUpdate) => {
    updateMission.mutate({ missionId, data });
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <BasicInfoCard form={form} />
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={updateMission.isPending || !form.formState.isDirty}
          >
            <RotateCcw className="size-4" />
            초기화
          </Button>
          <Button type="submit" disabled={updateMission.isPending || !form.formState.isDirty}>
            {updateMission.isPending ? <Spinner /> : "저장하기"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
