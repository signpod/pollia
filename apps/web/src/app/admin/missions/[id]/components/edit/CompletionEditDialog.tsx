"use client";

import { ImageSelectField } from "@/app/admin/components/common/ImageSelectField";
import { InputField } from "@/app/admin/components/common/InputField";
import { TiptapField } from "@/app/admin/components/common/tiptap";
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
import {
  useCreateMissionCompletion,
  useUpdateMissionCompletion,
} from "@/app/admin/hooks/mission-completion";
import UBIQUITOUS_CONSTANTS from "@/constants/ubiquitous";
import {
  MISSION_COMPLETION_DESCRIPTION_MAX_LENGTH,
  MISSION_COMPLETION_TITLE_MAX_LENGTH,
  type MissionCompletionForm,
} from "@/schemas/mission-completion";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { LinksSection, type MissionCompletionData, useCompletionForm } from "./shared";

interface CompletionEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  missionId: string;
  completion: MissionCompletionData | null;
  onSuccess?: () => void;
}

export function CompletionEditDialog({
  open,
  onOpenChange,
  missionId,
  completion,
  onSuccess,
}: CompletionEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>완료 화면 {completion ? "수정" : "생성"}</DialogTitle>
          <DialogDescription>
            {UBIQUITOUS_CONSTANTS.MISSION} 완료 시 사용자에게 표시될 화면을 설정하세요.
          </DialogDescription>
        </DialogHeader>

        <CompletionFormContent
          completion={completion}
          missionId={missionId}
          onSuccess={() => {
            onOpenChange(false);
            onSuccess?.();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

interface CompletionFormContentProps {
  completion: MissionCompletionData | null;
  missionId: string;
  onSuccess: () => void;
}

function CompletionFormContent({ completion, missionId, onSuccess }: CompletionFormContentProps) {
  const { form, handleReset: handleFormReset } = useCompletionForm(completion);

  const completionImageUpload = useSingleImage({
    initialUrl: completion?.imageUrl ?? undefined,
    initialFileUploadId: completion?.imageFileUploadId ?? undefined,
    onUploadSuccess: (data: UploadedImageData) => {
      form.setValue("imageUrl", data.publicUrl, { shouldDirty: true });
      form.setValue("imageFileUploadId", data.fileUploadId, { shouldDirty: true });
    },
  });

  const createMutation = useCreateMissionCompletion({
    onSuccess: () => {
      completionImageUpload.deleteMarkedInitial();
      toast.success("완료 화면이 생성되었습니다");
      onSuccess();
    },
    onError: err => toast.error(err.message || "완료 화면 생성 중 오류가 발생했습니다"),
  });

  const updateMutation = useUpdateMissionCompletion({
    onSuccess: () => {
      completionImageUpload.deleteMarkedInitial();
      toast.success("완료 화면이 수정되었습니다");
      onSuccess();
    },
    onError: err => toast.error(err.message || "완료 화면 수정 중 오류가 발생했습니다"),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleReset = () => {
    completionImageUpload.reset();
    handleFormReset();
  };

  const onSubmit = form.handleSubmit((data: MissionCompletionForm) => {
    if (completion) {
      updateMutation.mutate({ id: completion.id, data });
    } else {
      createMutation.mutate({
        ...data,
        missionId,
      });
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-4">
          <InputField
            control={form.control}
            name="title"
            label="제목"
            description={`${UBIQUITOUS_CONSTANTS.MISSION} 완료 시 표시될 제목을 입력하세요.`}
            placeholder={`예: ${UBIQUITOUS_CONSTANTS.MISSION}을 완료하셨습니다!`}
            maxLength={MISSION_COMPLETION_TITLE_MAX_LENGTH}
            showCounter
          />

          <TiptapField
            control={form.control}
            name="description"
            label="설명"
            description="완료 화면에 표시될 설명을 입력하세요."
            placeholder="완료 화면에 표시될 설명을 입력하세요."
            maxLength={MISSION_COMPLETION_DESCRIPTION_MAX_LENGTH}
            showCounter
            showToolbar
            minHeight="200px"
          />

          <ImageSelectField
            control={form.control}
            name="imageUrl"
            label="이미지"
            description={
              completionImageUpload.isUploading
                ? "업로드 중..."
                : "완료 화면에 표시될 이미지를 선택하세요."
            }
            onImageSelect={completionImageUpload.upload}
            onImageDelete={() => {
              completionImageUpload.discard();
              form.setValue("imageUrl", undefined, { shouldDirty: true });
              form.setValue("imageFileUploadId", undefined, { shouldDirty: true });
            }}
            disabled={completionImageUpload.isUploading}
            isOptional
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">링크</h3>
          <p className="text-sm text-muted-foreground">
            완료 화면에 표시될 추가 링크를 설정하세요.
          </p>
          <LinksSection form={form} />
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isPending || !form.formState.isDirty}
          >
            <RotateCcw className="size-4" />
            초기화
          </Button>
          <Button type="submit" disabled={isPending || !form.formState.isDirty}>
            {isPending ? <Spinner /> : "저장하기"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
