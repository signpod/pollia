"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/admin/components/shadcn-ui/card";
import { Separator } from "@/app/admin/components/shadcn-ui/separator";
import { useReadMissionCompletion } from "@/app/admin/hooks/use-read-mission-completion";
import { cn, stripHtmlTags } from "@/app/admin/lib/utils";
import { ExternalLink, ImageIcon, Pencil } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { CompletionEditDialog } from "./edit/CompletionEditDialog";

interface MissionCompletionCardProps {
  missionId: string;
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

export function MissionCompletionCard({ missionId }: MissionCompletionCardProps) {
  const { data: completionResponse, isPending, error } = useReadMissionCompletion(missionId);
  const completion = completionResponse?.data ?? null;
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const links = completion?.links as Record<string, string> | null | undefined;
  const linkEntries = links ? Object.entries(links) : [];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>완료 화면</CardTitle>
              <CardDescription>미션 완료 시 표시되는 화면</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              편집
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPending && (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-muted-foreground">로딩 중...</p>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-8 border border-destructive rounded-lg">
              <p className="text-sm text-destructive">완료 화면 정보를 불러올 수 없습니다.</p>
            </div>
          )}

          {!isPending && !error && !completion && (
            <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-lg bg-muted/20">
              <p className="text-sm text-muted-foreground">완료 화면이 설정되지 않았습니다.</p>
              <p className="text-xs text-muted-foreground mt-1">편집 버튼을 클릭하여 설정하세요.</p>
            </div>
          )}

          {!isPending && !error && completion && (
            <>
              <InfoField label="제목" value={completion.title} />

              <Separator />

              <InfoField
                label="설명"
                value={
                  completion.description ? (
                    <div className="whitespace-pre-wrap">
                      {stripHtmlTags(completion.description)}
                    </div>
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
                    <Image
                      src={completion.imageUrl}
                      alt="완료 화면 이미지"
                      width={200}
                      height={200}
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
                      className="w-auto h-auto max-w-full max-h-64 min-h-32 rounded-lg border mt-2"
                      style={{ objectFit: "contain" }}
                      loading="lazy"
                    />
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
            </>
          )}
        </CardContent>
      </Card>

      <CompletionEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        missionId={missionId}
      />
    </>
  );
}
