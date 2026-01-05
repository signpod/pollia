"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/admin/components/shadcn-ui/dialog";
import { Spinner } from "@/app/admin/components/shadcn-ui/spinner";
import { useFormImageUpload } from "@/app/admin/hooks/use-form-image-upload";
import { useReadMission } from "@/app/admin/hooks/use-read-mission";
import { useUpdateMission } from "@/app/admin/hooks/use-update-mission";
import type { MissionUpdate } from "@/schemas/mission";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { ImageCard, type MissionData, useBasicInfoForm } from "./shared";

interface ImageEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  missionId: string;
}

export function ImageEditDialog({ open, onOpenChange, missionId }: ImageEditDialogProps) {
  const { data: missionResponse, isLoading } = useReadMission(missionId);
  const mission = missionResponse?.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>미디어 수정</DialogTitle>
          <DialogDescription>미션 이미지와 브랜드 로고를 수정하세요.</DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">미션 정보를 불러오는 중...</p>
          </div>
        )}

        {mission && (
          <ImageFormContent
            mission={mission}
            missionId={missionId}
            onSuccess={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface ImageFormContentProps {
  mission: MissionData;
  missionId: string;
  onSuccess: () => void;
}

function ImageFormContent({ mission, missionId, onSuccess }: ImageFormContentProps) {
  const { form, handleReset } = useBasicInfoForm(mission);

  const missionImage = useFormImageUpload({
    form,
    urlField: "imageUrl",
    fileUploadIdField: "imageFileUploadId",
    errorMessage: "미션 이미지 업로드 실패",
  });

  const brandLogo = useFormImageUpload({
    form,
    urlField: "brandLogoUrl",
    fileUploadIdField: "brandLogoFileUploadId",
    errorMessage: "브랜드 로고 업로드 실패",
  });

  const updateMission = useUpdateMission({
    onSuccess: () => {
      toast.success("미션 이미지가 수정되었습니다.");
      onSuccess();
    },
    onError: err => toast.error(err.message || "미션 수정 중 오류가 발생했습니다."),
  });

  const onSubmit = form.handleSubmit((data: MissionUpdate) => {
    updateMission.mutate({ missionId, data });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <ImageCard
        form={form}
        missionImageUrl={missionImage.imageUrl}
        brandLogoUrl={brandLogo.imageUrl}
        missionImageUpload={missionImage}
        brandLogoUpload={brandLogo}
      />
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
  );
}
