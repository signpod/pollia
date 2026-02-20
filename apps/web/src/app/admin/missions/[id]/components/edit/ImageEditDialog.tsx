"use client";

import { ImageSelectField } from "@/app/admin/components/common/ImageSelectField";
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
import { type UploadedImageData, useSingleImage } from "@/app/admin/hooks/admin-image";
import { useReadMission, useUpdateMission } from "@/app/admin/hooks/mission";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import type { MissionUpdate } from "@/schemas/mission";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { type MissionData, useBasicInfoForm } from "./shared";

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
          <DialogDescription>
            {UBIQUITOUS_CONSTANTS.MISSION} 이미지와 브랜드 로고를 수정하세요.
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">
              {UBIQUITOUS_CONSTANTS.MISSION} 정보를 불러오는 중...
            </p>
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
  const { form, handleReset: handleFormReset } = useBasicInfoForm(mission);

  const missionImage = useSingleImage({
    initialUrl: mission.imageUrl ?? undefined,
    initialFileUploadId: mission.imageFileUploadId,
    onUploadSuccess: (data: UploadedImageData) => {
      form.setValue("imageUrl", data.publicUrl, { shouldDirty: true });
      form.setValue("imageFileUploadId", data.fileUploadId, { shouldDirty: true });
    },
  });

  const brandLogo = useSingleImage({
    initialUrl: mission.brandLogoUrl ?? undefined,
    initialFileUploadId: mission.brandLogoFileUploadId,
    onUploadSuccess: (data: UploadedImageData) => {
      form.setValue("brandLogoUrl", data.publicUrl, { shouldDirty: true });
      form.setValue("brandLogoFileUploadId", data.fileUploadId, { shouldDirty: true });
    },
  });

  const updateMission = useUpdateMission({
    onSuccess: () => {
      missionImage.deleteMarkedInitial();
      brandLogo.deleteMarkedInitial();
      toast.success(`${UBIQUITOUS_CONSTANTS.MISSION} 이미지가 수정되었습니다`);
      onSuccess();
    },
    onError: err =>
      toast.error(err.message || `${UBIQUITOUS_CONSTANTS.MISSION} 수정 중 오류가 발생했습니다`),
  });

  const handleReset = () => {
    missionImage.reset();
    brandLogo.reset();
    handleFormReset();
  };

  const onSubmit = form.handleSubmit((data: MissionUpdate) => {
    updateMission.mutate({ missionId, data });
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-4">
          <ImageSelectField
            control={form.control}
            name="imageUrl"
            label={`${UBIQUITOUS_CONSTANTS.MISSION} 이미지`}
            description={
              missionImage.isUploading
                ? "업로드 중..."
                : `${UBIQUITOUS_CONSTANTS.MISSION}을 대표하는 이미지를 업로드하세요.`
            }
            onImageSelect={missionImage.upload}
            onImageDelete={() => {
              missionImage.discard();
              form.setValue("imageUrl", null, { shouldDirty: true });
              form.setValue("imageFileUploadId", null, { shouldDirty: true });
            }}
            disabled={missionImage.isUploading}
            isOptional
          />

          <ImageSelectField
            control={form.control}
            name="brandLogoUrl"
            label="브랜드 로고"
            description={
              brandLogo.isUploading ? "업로드 중..." : "브랜드를 나타내는 로고를 업로드하세요."
            }
            onImageSelect={brandLogo.upload}
            onImageDelete={() => {
              brandLogo.discard();
              form.setValue("brandLogoUrl", null, { shouldDirty: true });
              form.setValue("brandLogoFileUploadId", null, { shouldDirty: true });
            }}
            disabled={brandLogo.isUploading}
            isOptional
          />
        </div>
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
