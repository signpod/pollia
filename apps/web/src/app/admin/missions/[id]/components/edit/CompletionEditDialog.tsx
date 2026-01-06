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
import { useAdminSingleImage } from "@/app/admin/hooks/use-admin-image-upload";
import { useCreateMissionCompletion } from "@/app/admin/hooks/use-create-mission-completion";
import { useReadMissionCompletion } from "@/app/admin/hooks/use-read-mission-completion";
import { useUpdateMissionCompletion } from "@/app/admin/hooks/use-update-mission-completion";
import type { MissionCompletionForm } from "@/schemas/mission-completion";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { CompletionCard, type MissionCompletionData, useCompletionForm } from "./shared";

interface CompletionEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  missionId: string;
}

export function CompletionEditDialog({ open, onOpenChange, missionId }: CompletionEditDialogProps) {
  const { data: completionResponse, isLoading } = useReadMissionCompletion(missionId);
  const completion = completionResponse?.data ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>완료 화면 {completion ? "수정" : "생성"}</DialogTitle>
          <DialogDescription>미션 완료 시 사용자에게 표시될 화면을 설정하세요.</DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">완료 화면 정보를 불러오는 중...</p>
          </div>
        )}

        {!isLoading && (
          <CompletionFormContent
            completion={completion}
            missionId={missionId}
            onSuccess={() => onOpenChange(false)}
          />
        )}
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
  const { form, handleReset } = useCompletionForm(completion);

  const completionImageUpload = useAdminSingleImage({
    initialUrl: completion?.imageUrl ?? undefined,
    initialFileUploadId: completion?.imageFileUploadId ?? undefined,
    onUploadSuccess: data => {
      form.setValue("imageUrl", data.publicUrl, { shouldDirty: true });
      form.setValue("imageFileUploadId", data.fileUploadId, { shouldDirty: true });
    },
  });

  const createMutation = useCreateMissionCompletion({
    onSuccess: () => {
      toast.success("완료 화면이 생성되었습니다.");
      onSuccess();
    },
    onError: err => toast.error(err.message || "완료 화면 생성 중 오류가 발생했습니다."),
  });

  const updateMutation = useUpdateMissionCompletion({
    onSuccess: () => {
      toast.success("완료 화면이 수정되었습니다.");
      onSuccess();
    },
    onError: err => toast.error(err.message || "완료 화면 수정 중 오류가 발생했습니다."),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

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
    <form onSubmit={onSubmit} className="space-y-6">
      <CompletionCard form={form} completionImageUpload={completionImageUpload} />
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
  );
}
