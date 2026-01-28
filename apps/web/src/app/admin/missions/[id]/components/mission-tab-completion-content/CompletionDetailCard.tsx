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
import { Button } from "@/app/admin/components/shadcn-ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/admin/components/shadcn-ui/card";
import { Separator } from "@/app/admin/components/shadcn-ui/separator";
import { useDeleteCompletion } from "@/app/admin/hooks/mission-completion";
import { cn, stripHtmlTags } from "@/app/admin/lib/utils";
import type { MissionCompletionWithMission } from "@/types/dto";
import { ExternalLink, ImageIcon, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface CompletionDetailCardProps {
  completion: MissionCompletionWithMission;
  onEdit: (completion: MissionCompletionWithMission) => void;
}

interface InfoFieldProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

function InfoField({ label, value, className }: InfoFieldProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}

export function CompletionDetailCard({ completion, onEdit }: CompletionDetailCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const deleteCompletion = useDeleteCompletion();

  const links = completion.links ?? null;
  const linkEntries = links ? Object.entries(links) : [];

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
              <Button variant="outline" size="sm" onClick={() => onEdit(completion)}>
                <Pencil className="h-4 w-4 mr-2" />
                수정
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                삭제
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <InfoField label="제목" value={completion.title} />

          <Separator />

          <InfoField
            label="설명"
            value={
              completion.description ? (
                <div className="whitespace-pre-wrap">{stripHtmlTags(completion.description)}</div>
              ) : (
                <span className="text-muted-foreground italic">설정되지 않음</span>
              )
            }
          />

          <Separator />

          <InfoField
            label="이미지"
            value={
              completion.imageUrl ? (
                <div className="relative w-full max-w-full h-64 mt-2">
                  <Image
                    src={completion.imageUrl}
                    alt="완료 화면 이미지"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
                    className="rounded-lg border object-contain"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-lg bg-muted/20 mt-2">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/30 mb-2" />
                  <span className="text-xs text-muted-foreground">이미지 없음</span>
                </div>
              )
            }
          />

          {linkEntries.length > 0 && (
            <>
              <Separator />
              <InfoField
                label="링크"
                value={
                  <div className="space-y-2 mt-2">
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
                }
              />
            </>
          )}

          <Separator />

          <InfoField
            label="생성일"
            value={new Date(completion.createdAt).toLocaleString("ko-KR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          />
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
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
