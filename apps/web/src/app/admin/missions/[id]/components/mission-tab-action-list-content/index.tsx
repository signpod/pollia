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
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { AlertCircle, FileText, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CreateActionDialog } from "../../edit/components/CreateActionDialog";
import { EditActionDialog } from "../../edit/components/EditActionDialog";
import type { ActionFormData } from "../../edit/components/action-forms";
import { ActionDetailCard } from "./ActionDetailCard";
import { SortableActionTab } from "./SortableActionTab";

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
      const sorted = [...actionsResponse.data].sort((a, b) => a.order - b.order);
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
              title: opt.title,
              description: opt.description,
              imageUrl: opt.imageUrl,
              imageFileUploadId: opt.imageFileUploadId,
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
      <div className="space-y-4">
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-10 w-32" />
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-8 w-full max-w-md" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
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
      <div className="space-y-4">
        <Button variant="outline" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="size-4 mr-2" />새 액션 추가
        </Button>
        <Card>
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
    <div className="space-y-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b">
          <SortableContext items={actions.map(a => a.id)} strategy={horizontalListSortingStrategy}>
            {actions.map(action => (
              <SortableActionTab
                key={action.id}
                action={action}
                isSelected={action.id === selectedActionId}
                onSelect={() => setSelectedActionId(action.id)}
              />
            ))}
          </SortableContext>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCreateDialogOpen(true)}
            className="shrink-0 ml-2"
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </DndContext>

      {selectedAction && (
        <ActionDetailCard
          action={selectedAction}
          onEdit={() => handleEdit(selectedAction.id)}
          onDuplicate={() => handleDuplicate(selectedAction.id)}
          onDelete={() => handleDelete(selectedAction.id)}
        />
      )}

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
                    title: opt.title,
                    description: opt.description,
                    imageUrl: opt.imageUrl,
                    imageFileUploadId: opt.imageFileUploadId,
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
    </div>
  );
}
