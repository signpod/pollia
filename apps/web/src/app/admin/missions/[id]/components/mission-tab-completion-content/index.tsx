"use client";

import { MobilePreviewPanel } from "@/app/admin/components/common/MobilePreviewPanel";
import { Button } from "@/app/admin/components/shadcn-ui/button";
import { Card, CardContent, CardHeader } from "@/app/admin/components/shadcn-ui/card";
import { Skeleton } from "@/app/admin/components/shadcn-ui/skeleton";
import { useReadCompletions } from "@/app/admin/hooks/mission-completion";
import { CompletionEditDialog } from "@/app/admin/missions/[id]/components/edit/CompletionEditDialog";
import { MissionCompletionPage } from "@/components/common/pages/MissionCompletionPage";
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
import { usePreviewImageMenu } from "./hooks";

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
  const [editingCompletion, setEditingCompletion] = useState<MissionCompletionWithMission | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { isMenuOpen, menuRef, toggleMenu, handleImageSave, handleImageShare } =
    usePreviewImageMenu();

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
      <div className="space-y-4">
        <div className="flex justify-end">
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
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
          <Button onClick={handleCreateNew}>
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
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] xl:grid-cols-[300px_1fr_auto] gap-6">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div className="space-y-2">
                <Card>
                  <CardHeader className="pb-3">
                    <h3 className="text-sm font-semibold text-muted-foreground">
                      완료화면 목록 ({completions.length})
                    </h3>
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

            <div>
              {selectedCompletion ? (
                <CompletionDetailCard completion={selectedCompletion} onEdit={handleEdit} />
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
      </div>

      <CompletionEditDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        missionId={missionId}
        completion={editingCompletion}
      />

      {selectedCompletion && (
        <MobilePreviewPanel anchor={previewAnchorRef}>
          <MissionCompletionPage
            imageUrl={selectedCompletion.imageUrl}
            title={selectedCompletion.title}
            description={selectedCompletion.description}
            links={selectedCompletion.links as Record<string, string> | undefined}
            imageMenu={{
              isOpen: isMenuOpen,
              menuRef,
              onToggle: toggleMenu,
              onSave: handleImageSave,
              onShare: handleImageShare,
            }}
          />
        </MobilePreviewPanel>
      )}
    </>
  );
}
