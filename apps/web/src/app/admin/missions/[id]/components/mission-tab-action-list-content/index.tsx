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
import { Card, CardContent, CardHeader } from "@/app/admin/components/shadcn-ui/card";
import { Skeleton } from "@/app/admin/components/shadcn-ui/skeleton";
import {
  useCreateAction,
  useDeleteAction,
  useDuplicateAction,
  useReadActionsDetail,
  useReorderActions,
  useUpdateAction,
} from "@/app/admin/hooks/action";
import type { ActionDetail } from "@/types/dto";
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
import { AlertCircle, FileText, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ActionDetailCard } from "./ActionDetailCard";
import { CreateActionDialog } from "./CreateActionDialog";
import { EditActionDialog } from "./EditActionDialog";
import { SortableActionTab } from "./SortableActionTab";
import type { ActionFormData } from "./action-forms";

interface MissionActionListProps {
  missionId: string;
}

export function MissionTabActionListContent({ missionId }: MissionActionListProps) {
  const { data: actionsResponse, isLoading, error } = useReadActionsDetail(missionId);
  const [actions, setActions] = useState<ActionDetail[]>([]);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<ActionDetail | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingActionId, setDeletingActionId] = useState<string | null>(null);

  const reorderActions = useReorderActions({
    onSuccess: () => toast.success("액션 순서가 변경되었습니다"),
    onError: error => toast.error(error.message || "액션 순서 변경 중 오류가 발생했습니다"),
  });

  const createAction = useCreateAction({
    onSuccess: () => {
      toast.success("액션이 생성되었습니다");
      setIsCreateDialogOpen(false);
    },
    onError: error => toast.error(error.message || "액션 생성 중 오류가 발생했습니다"),
  });

  const updateAction = useUpdateAction({
    onSuccess: () => {
      toast.success("액션이 수정되었습니다");
      setIsEditDialogOpen(false);
    },
    onError: error => toast.error(error.message || "액션 수정 중 오류가 발생했습니다"),
  });

  const deleteActionMutation = useDeleteAction({
    onSuccess: () => {
      toast.success("액션이 삭제되었습니다");
      setIsDeleteDialogOpen(false);
      setDeletingActionId(null);
      if (deletingActionId === selectedActionId) {
        setSelectedActionId(null);
      }
    },
    onError: error => toast.error(error.message || "액션 삭제 중 오류가 발생했습니다"),
  });

  const duplicateAction = useDuplicateAction({
    onSuccess: () => toast.success("액션이 복제되었습니다"),
    onError: error => toast.error(error.message || "액션 복제 중 오류가 발생했습니다"),
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    if (actionsResponse?.data) {
      const sorted = [...actionsResponse.data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setActions(sorted);
      const firstAction = sorted[0];
      if (!selectedActionId && firstAction) {
        setSelectedActionId(firstAction.id);
      }
    }
  }, [actionsResponse?.data, selectedActionId]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = actions.findIndex(item => item.id === active.id);
      const newIndex = actions.findIndex(item => item.id === over.id);
      const newItems = arrayMove(actions, oldIndex, newIndex);
      const updatedItems = newItems.map((item, index) => ({ ...item, order: index }));

      setActions(updatedItems);

      reorderActions.mutate({
        missionId,
        actionOrders: updatedItems.map(item => ({ id: item.id, order: item.order })),
      });
    }
  };

  const handleEdit = (actionId: string) => {
    const action = actions.find(a => a.id === actionId);
    if (action) {
      setEditingAction(action);
      setIsEditDialogOpen(true);
    }
  };

  const handleDelete = (actionId: string) => {
    setDeletingActionId(actionId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingActionId) return;
    deleteActionMutation.mutate({ actionId: deletingActionId, missionId });
  };

  const handleDuplicate = (actionId: string) => {
    duplicateAction.mutate({ actionId, missionId });
  };

  const handleCreateSubmit = (data: ActionFormData) => {
    const nextOrder = actions.length;

    createAction.mutate({
      missionId,
      type: data.type,
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      imageFileUploadId: data.imageFileUploadId,
      isRequired: data.isRequired,
      order: nextOrder,
      options:
        "options" in data
          ? data.options.map((opt, index) => ({
              id: opt.id,
              title: opt.title,
              description: opt.description,
              imageUrl: opt.imageUrl,
              fileUploadId: opt.fileUploadId,
              order: index,
            }))
          : undefined,
      maxSelections: "maxSelections" in data ? data.maxSelections : undefined,
      hasOther: "hasOther" in data ? data.hasOther : undefined,
    });
  };

  const selectedAction = actions.find(a => a.id === selectedActionId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-[300px_1fr] gap-6">
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
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">액션 목록을 불러올 수 없습니다</p>
              <p className="text-sm text-muted-foreground mt-1">
                {error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (actions.length === 0) {
    return (
      <div className="grid grid-cols-[300px_1fr] gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground">액션 목록 (0)</h3>
              <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                추가
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm font-medium text-muted-foreground">
                아직 추가된 액션이 없습니다
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                미션에 액션을 추가하여 사용자 응답을 수집하세요
              </p>
            </div>
          </CardContent>
        </Card>
        <div />
        <CreateActionDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSubmit={handleCreateSubmit}
          isLoading={createAction.isPending}
        />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-[300px_1fr] gap-6">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="space-y-2">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    액션 목록 ({actions.length})
                  </h3>
                  <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    추가
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 max-h-[600px] overflow-y-auto">
                <SortableContext
                  items={actions.map(a => a.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {actions.map(action => (
                    <SortableActionTab
                      key={action.id}
                      action={action}
                      isSelected={action.id === selectedActionId}
                      onSelect={() => setSelectedActionId(action.id)}
                    />
                  ))}
                </SortableContext>
              </CardContent>
            </Card>
          </div>
        </DndContext>

        <div>
          {selectedAction ? (
            <ActionDetailCard
              action={selectedAction}
              onEdit={() => handleEdit(selectedAction.id)}
              onDuplicate={() => handleDuplicate(selectedAction.id)}
              onDelete={() => handleDelete(selectedAction.id)}
            />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">액션을 선택하세요</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <CreateActionDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateSubmit}
        isLoading={createAction.isPending}
      />

      <EditActionDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        action={editingAction}
        onSubmit={data => {
          if (!editingAction) return;

          updateAction.mutate({
            actionId: editingAction.id,
            missionId,
            title: data.title,
            description: data.description,
            imageUrl: data.imageUrl,
            imageFileUploadId: data.imageFileUploadId,
            isRequired: data.isRequired,
            maxSelections: "maxSelections" in data ? data.maxSelections : undefined,
            hasOther: "hasOther" in data ? data.hasOther : undefined,
            options:
              "options" in data
                ? data.options.map((opt, index) => ({
                    id: opt.id,
                    title: opt.title,
                    description: opt.description,
                    imageUrl: opt.imageUrl,
                    fileUploadId: opt.fileUploadId,
                    order: index,
                  }))
                : undefined,
          });
        }}
        isLoading={updateAction.isPending}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>액션을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 액션과 관련된 모든 데이터가 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteActionMutation.isPending}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteActionMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteActionMutation.isPending ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
