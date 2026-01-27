"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import { Card, CardContent, CardHeader } from "@/app/admin/components/shadcn-ui/card";
import { Skeleton } from "@/app/admin/components/shadcn-ui/skeleton";
import { useReadCompletions } from "@/app/admin/hooks/mission-completion";
import { CompletionEditDialog } from "@/app/admin/missions/[id]/components/edit/CompletionEditDialog";
import { AlertCircle, Award, Plus } from "lucide-react";
import { useState } from "react";
import { CompletionDetailCard } from "./CompletionDetailCard";
import { CompletionTab } from "./CompletionTab";

interface MissionTabCompletionContentProps {
  missionId: string;
}

export function MissionTabCompletionContent({ missionId }: MissionTabCompletionContentProps) {
  const { data: completionsResponse, isPending, error } = useReadCompletions(missionId);
  const completions = completionsResponse?.data ?? [];

  const [selectedCompletionId, setSelectedCompletionId] = useState<string | null>(
    completions[0]?.id ?? null,
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  if (isPending) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-[300px_1fr] gap-6">
          <div className="space-y-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <p className="text-lg font-medium text-destructive mb-2">
            완료 화면 목록을 불러올 수 없습니다
          </p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  const selectedCompletion = completions.find(c => c.id === selectedCompletionId);

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />새 완료화면
          </Button>
        </div>

        {completions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Award className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-lg font-medium text-muted-foreground mb-2">완료 화면이 없습니다</p>
              <p className="text-sm text-muted-foreground mb-4">
                새 완료화면 버튼을 클릭하여 생성하세요.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-[300px_1fr] gap-6">
            <div className="space-y-2">
              <Card>
                <CardHeader className="pb-3">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    완료화면 목록 ({completions.length})
                  </h3>
                </CardHeader>
                <CardContent className="space-y-1 max-h-[600px] overflow-y-auto">
                  {completions.map(completion => (
                    <CompletionTab
                      key={completion.id}
                      completion={completion}
                      isSelected={completion.id === selectedCompletionId}
                      onClick={() => setSelectedCompletionId(completion.id)}
                    />
                  ))}
                </CardContent>
              </Card>
            </div>

            <div>
              {selectedCompletion ? (
                <CompletionDetailCard completion={selectedCompletion} missionId={missionId} />
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <p className="text-muted-foreground">완료 화면을 선택하세요</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>

      <CompletionEditDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        missionId={missionId}
      />
    </>
  );
}
