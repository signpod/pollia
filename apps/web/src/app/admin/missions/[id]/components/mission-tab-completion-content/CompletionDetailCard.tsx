"use client";

import { AdminImageCropDialog } from "@/app/admin/components/common/cropper/AdminImageCropDialog";
import { useImageEditWithCrop } from "@/app/admin/components/common/cropper/use-image-edit-with-crop";
import {
  DateView,
  ImageEditableView,
  LabeledView,
  TextView,
} from "@/app/admin/components/common/molecules/viewers";
import { TiptapViewer } from "@/app/admin/components/common/tiptap";
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
import { Button } from "@/app/admin/components/shadcn-ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/admin/components/shadcn-ui/card";
import { Separator } from "@/app/admin/components/shadcn-ui/separator";
import { useDeleteCompletion } from "@/app/admin/hooks/mission-completion";
import { useUpdateMissionCompletion } from "@/app/admin/hooks/mission-completion";
import { cleanTiptapHTML } from "@/lib/utils";
import type { MissionCompletionWithMission } from "@/types/dto";
import { ExternalLink, Loader2, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CompletionDetailCardProps {
  completion: MissionCompletionWithMission;
  onEdit: (completion: MissionCompletionWithMission) => void;
  onPreviewRefresh?: () => void;
}

export function CompletionDetailCard({
  completion,
  onEdit,
  onPreviewRefresh,
}: CompletionDetailCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const deleteCompletion = useDeleteCompletion();
  const updateCompletion = useUpdateMissionCompletion();

  const completionImageEdit = useImageEditWithCrop({
    fileNamePrefix: `completion-image-${completion.id}`,
    initialUrl: completion.imageUrl,
    initialFileUploadId: completion.imageFileUploadId,
    onBeforeOpen: onPreviewRefresh,
    onUploadSuccess: (data, image) => {
      updateCompletion.mutate(
        {
          id: completion.id,
          data: {
            imageUrl: data.publicUrl,
            imageFileUploadId: data.fileUploadId,
          },
        },
        {
          onSuccess: () => {
            image.deleteMarkedInitial();
            onPreviewRefresh?.();
            toast.success("완료화면 이미지가 수정되었습니다");
          },
          onError: error => {
            image.discard();
            image.unmarkInitial();
            toast.error(error.message || "완료화면 이미지 수정에 실패했습니다");
          },
        },
      );
    },
    onUploadError: error => {
      toast.error(error.message || "완료화면 이미지 업로드에 실패했습니다");
    },
  });

  const links = completion.links ?? [];
  const isDeleting = deleteCompletion.isPending;
  const isImageBusy = completionImageEdit.image.isUploading || updateCompletion.isPending;

  const handleDelete = async () => {
    await deleteCompletion.mutateAsync(completion.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>완료 화면 상세</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(completion)}
                disabled={isDeleting}
              >
                <Pencil className="h-4 w-4 mr-2" />
                수정
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-destructive hover:text-destructive"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                삭제
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <LabeledView label="제목">
            <TextView value={completion.title} />
          </LabeledView>

          <Separator />

          <LabeledView label="설명">
            {completion.description && cleanTiptapHTML(completion.description) ? (
              <TiptapViewer
                content={cleanTiptapHTML(completion.description)}
                className="max-w-[600px] border"
              />
            ) : (
              <span className="text-muted-foreground italic">설정되지 않음</span>
            )}
          </LabeledView>

          <Separator />

          <LabeledView label="이미지">
            <ImageEditableView
              title="완료화면 이미지"
              description="권장 비율 3:4"
              imageUrl={completion.imageUrl}
              imageAlt="완료 화면 이미지"
              imageSize="lg"
              disabled={isImageBusy || isDeleting}
              onAddFile={completionImageEdit.handleAddFile}
              onEdit={() =>
                completionImageEdit.handleEditImage(
                  completion.imageUrl,
                  `completion-image-${completion.id}.jpg`,
                )
              }
              onDelete={() => {
                onPreviewRefresh?.();
                completionImageEdit.image.discard();
                updateCompletion.mutate(
                  {
                    id: completion.id,
                    data: {
                      imageUrl: null,
                      imageFileUploadId: null,
                    },
                  },
                  {
                    onSuccess: () => {
                      completionImageEdit.image.deleteMarkedInitial();
                      onPreviewRefresh?.();
                      toast.success("완료화면 이미지가 삭제되었습니다");
                    },
                    onError: error => {
                      completionImageEdit.image.reset();
                      toast.error(error.message || "완료화면 이미지 삭제에 실패했습니다");
                    },
                  },
                );
              }}
            />
          </LabeledView>

          {links.length > 0 && (
            <>
              <Separator />
              <LabeledView label="링크">
                <div className="space-y-2">
                  {links.map(link => (
                    <div
                      key={`${link.name}-${link.url}`}
                      className="flex items-center gap-2 p-2 rounded-md border bg-muted/20"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-muted-foreground mb-0.5">
                          {link.name}
                        </div>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1 max-w-full overflow-hidden"
                        >
                          <span className="truncate min-w-0">{link.url}</span>
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </LabeledView>
            </>
          )}

          <Separator />

          <LabeledView label="생성일">
            <DateView value={completion.createdAt} dateFormat="datetime" />
          </LabeledView>
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>완료 화면 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 이 완료 화면을 삭제하시겠습니까?
              <br />
              삭제된 데이터는 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  삭제 중...
                </>
              ) : (
                "삭제"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AdminImageCropDialog
        open={completionImageEdit.cropper.isOpen}
        imageSrc={completionImageEdit.cropper.imageSrc}
        aspect={3 / 4}
        title="완료화면 이미지 편집"
        description="이미지를 3:4 비율로 맞춰 저장합니다."
        fileName={completionImageEdit.cropper.fileName ?? `completion-image-${completion.id}.jpg`}
        onOpenChange={open => {
          if (!open) {
            completionImageEdit.cropper.close();
          }
        }}
        onConfirm={file => {
          completionImageEdit.image.upload(file);
        }}
      />
    </>
  );
}
