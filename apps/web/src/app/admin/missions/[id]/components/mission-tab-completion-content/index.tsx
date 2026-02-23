"use client";

import {
  MobilePreviewPanel,
  useMobilePreviewRefresh,
} from "@/app/admin/components/common/MobilePreviewPanel";
import { Button } from "@/app/admin/components/shadcn-ui/button";
import { Card, CardContent, CardHeader } from "@/app/admin/components/shadcn-ui/card";
import { Skeleton } from "@/app/admin/components/shadcn-ui/skeleton";
import { useReadCompletions } from "@/app/admin/hooks/mission-completion";
import { CompletionEditDialog } from "@/app/admin/missions/[id]/components/edit/CompletionEditDialog";
import { ROUTES } from "@/constants/routes";
import type { MissionCompletionWithMission } from "@/types/dto";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { AlertCircle, Award, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CompletionDetailCard } from "./CompletionDetailCard";
import { CompletionTab } from "./CompletionTab";

interface MissionTabCompletionContentProps {
  missionId: string;
}

const STORAGE_KEY = (missionId: string) => `completion-order-${missionId}`;

const saveOrder = (missionId: string, order: string[]) => {
  try {
    localStorage.setItem(STORAGE_KEY(missionId), JSON.stringify(order));
  } catch (error) {
    console.error("Failed to save completion order to localStorage:", error);
  }
};

const loadOrder = (missionId: string): string[] | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY(missionId));
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Failed to load completion order from localStorage:", error);
    return null;
  }
};

export function MissionTabCompletionContent({ missionId }: MissionTabCompletionContentProps) {
  const { data: completionsResponse, isPending, error } = useReadCompletions(missionId);
  const rawCompletions = completionsResponse?.data ?? [];
  const [completions, setCompletions] = useState<MissionCompletionWithMission[]>([]);

  const [selectedCompletionId, setSelectedCompletionId] = useState<string | null>(null);
  const previewAnchorRef = useRef<HTMLDivElement>(null);
  const { refreshKey, refresh } = useMobilePreviewRefresh();
  const [editingCompletion, setEditingCompletion] = useState<MissionCompletionWithMission | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    if (rawCompletions.length > 0) {
      const savedOrder = loadOrder(missionId);
      let orderedCompletions: MissionCompletionWithMission[];

      if (savedOrder && savedOrder.length === rawCompletions.length) {
        orderedCompletions = savedOrder
          .map(id => rawCompletions.find(c => c.id === id))
          .filter((c): c is MissionCompletionWithMission => c !== undefined);

        const newIds = rawCompletions.filter(c => !savedOrder.includes(c.id));
        orderedCompletions = [...orderedCompletions, ...newIds];
      } else {
        orderedCompletions = rawCompletions;
      }

      setCompletions(orderedCompletions);

      if (!selectedCompletionId && orderedCompletions[0]) {
        setSelectedCompletionId(orderedCompletions[0].id);
      }
    }
  }, [rawCompletions, missionId, selectedCompletionId]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCompletions(prevCompletions => {
        const oldIndex = prevCompletions.findIndex(item => item.id === active.id);
        const newIndex = prevCompletions.findIndex(item => item.id === over.id);
        const newItems = arrayMove(prevCompletions, oldIndex, newIndex);

        saveOrder(
          missionId,
          newItems.map(item => item.id),
        );

        return newItems;
      });
    }
  };

  const handleCreateNew = () => {
    setEditingCompletion(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (completion: MissionCompletionWithMission) => {
    setEditingCompletion(completion);
    setIsDialogOpen(true);
  };

  if (isPending) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
        <div className="space-y-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
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
      {completions.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground">완료화면 목록 (0)</h3>
                <Button size="sm" onClick={handleCreateNew}>
                  <Plus className="h-4 w-4 mr-1" />
                  추가
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Award className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-lg font-medium text-muted-foreground mb-2">
                  완료 화면이 없습니다
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  추가 버튼을 클릭하여 생성하세요.
                </p>
              </div>
            </CardContent>
          </Card>
          <div />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] xl:grid-cols-[300px_1fr_auto] gap-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="space-y-2">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-muted-foreground">
                      완료화면 목록 ({completions.length})
                    </h3>
                    <Button size="sm" onClick={handleCreateNew}>
                      <Plus className="h-4 w-4 mr-1" />
                      추가
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1 max-h-[600px] overflow-y-auto">
                  <SortableContext
                    items={completions.map(c => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {completions.map(completion => (
                      <CompletionTab
                        key={completion.id}
                        completion={completion}
                        isSelected={completion.id === selectedCompletionId}
                        onClick={() => setSelectedCompletionId(completion.id)}
                      />
                    ))}
                  </SortableContext>
                </CardContent>
              </Card>
            </div>
          </DndContext>

          <div className="min-w-0">
            {selectedCompletion ? (
              <CompletionDetailCard
                completion={selectedCompletion}
                onEdit={handleEdit}
                onPreviewRefresh={refresh}
              />
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">완료 화면을 선택하세요</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div ref={previewAnchorRef} className="hidden xl:block" />
        </div>
      )}

      <CompletionEditDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        missionId={missionId}
        completion={editingCompletion}
        onSuccess={refresh}
      />

      {selectedCompletion && (
        <MobilePreviewPanel
          anchor={previewAnchorRef}
          url={ROUTES.MISSION_COMPLETION_PREVIEW(missionId, selectedCompletion.id)}
          refreshKey={refreshKey}
        />
      )}
    </>
  );
}
