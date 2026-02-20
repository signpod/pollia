"use client";

import {
  DateView,
  ImageView,
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
import { cleanTiptapHTML } from "@/lib/utils";
import type { MissionCompletionWithMission } from "@/types/dto";
import { ExternalLink, Loader2, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

interface CompletionDetailCardProps {
  completion: MissionCompletionWithMission;
  onEdit: (completion: MissionCompletionWithMission) => void;
}

export function CompletionDetailCard({ completion, onEdit }: CompletionDetailCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const deleteCompletion = useDeleteCompletion();

  const links = completion.links ?? null;
  const linkEntries = links ? Object.entries(links) : [];
  const isDeleting = deleteCompletion.isPending;

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
            <ImageView src={completion.imageUrl} alt="완료 화면 이미지" size="lg" />
          </LabeledView>

          {linkEntries.length > 0 && (
            <>
              <Separator />
              <LabeledView label="링크">
                <div className="space-y-2">
                  {linkEntries.map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center gap-2 p-2 rounded-md border bg-muted/20"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-muted-foreground mb-0.5">
                          {key}
                        </div>
                        <a
                          href={value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1 truncate"
                        >
                          {value}
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
    </>
  );
}
