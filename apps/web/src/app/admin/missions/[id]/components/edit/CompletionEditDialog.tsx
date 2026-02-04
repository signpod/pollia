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
import { type UploadedImageData, useSingleImage } from "@/app/admin/hooks/admin-image";
import {
  useCreateMissionCompletion,
  useUpdateMissionCompletion,
} from "@/app/admin/hooks/mission-completion";
import type { MissionCompletionForm } from "@/schemas/mission-completion";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { CompletionCard, type MissionCompletionData, useCompletionForm } from "./shared";

interface CompletionEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  missionId: string;
  completion: MissionCompletionData | null;
}

export function CompletionEditDialog({
  open,
  onOpenChange,
  missionId,
  completion,
}: CompletionEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>완료 화면 {completion ? "수정" : "생성"}</DialogTitle>
          <DialogDescription>미션 완료 시 사용자에게 표시될 화면을 설정하세요.</DialogDescription>
        </DialogHeader>

        <CompletionFormContent
          completion={completion}
          missionId={missionId}
          onSuccess={() => onOpenChange(false)}
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
    </Form>
  );
}
