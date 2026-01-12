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
import { Badge } from "@/app/admin/components/shadcn-ui/badge";
import { Button } from "@/app/admin/components/shadcn-ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/admin/components/shadcn-ui/card";
import { Skeleton } from "@/app/admin/components/shadcn-ui/skeleton";
import { getActionTypeLabel } from "@/app/admin/constants/actionTypes";
import { useCreateAction } from "@/app/admin/hooks/use-create-action";
import { useDeleteAction } from "@/app/admin/hooks/use-delete-action";
import { useReadActionsDetail } from "@/app/admin/hooks/use-read-actions-detail";
import { useReorderActions } from "@/app/admin/hooks/use-reorder-actions";
import { useUpdateAction } from "@/app/admin/hooks/use-update-action";
import type { ActionDetail } from "@/types/dto/action";
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CreateActionDialog } from "./CreateActionDialog";
import { EditActionDialog } from "./EditActionDialog";
import type { ActionFormData } from "./action-forms";

interface ActionsEditTabProps {
  missionId: string;
}

interface SortableActionCardProps {
  action: ActionDetail;
  onEdit: (actionId: string) => void;
  onDelete: (actionId: string) => void;
}

const ACTION_CARD_HEIGHT = "h-[100px]";

function SortableActionCard({ action, onEdit, onDelete }: SortableActionCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: action.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`mb-3 ${ACTION_CARD_HEIGHT}`}>
        <CardContent className="h-full px-4 py-0 flex items-center">
          <div className="flex items-center gap-3 w-full">
            <div
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="size-5 text-muted-foreground" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {getActionTypeLabel(action.type)}
                </span>
                <Badge
                  variant={action.isRequired ? "destructive" : "outline"}
                  className={
                    action.isRequired
                      ? "text-xs font-semibold bg-orange-100 text-orange-700 hover:bg-orange-200 border-0 dark:bg-orange-950 dark:text-orange-300"
                      : "text-xs font-medium text-muted-foreground border-muted-foreground/30"
                  }
                >
                  {action.isRequired ? "필수" : "선택"}
                </Badge>
                <span className="text-xs text-muted-foreground">#{action.order + 1}</span>
              </div>
              <h4 className="font-medium mt-1 truncate">{action.title}</h4>
            </div>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => onEdit(action.id)}>
                <Pencil className="size-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(action.id)}>
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AddActionCard({ onClick }: { onClick: () => void }) {
  return (
    <Card
      className={`mb-3 ${ACTION_CARD_HEIGHT} border-dashed bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors`}
      onClick={onClick}
    >
      <CardContent className="h-full px-4 py-0 flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Plus className="size-5" />
          <span className="font-medium">새 액션 추가</span>
        </div>
      </CardContent>
    </Card>
  );
}

function ActionCardOverlay({ action }: { action: ActionDetail }) {
  return (
    <Card className={`shadow-lg ${ACTION_CARD_HEIGHT}`}>
      <CardContent className="h-full px-4 py-0 flex items-center">
        <div className="flex items-center gap-3 w-full">
          <div className="p-1">
            <GripVertical className="size-5 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                {getActionTypeLabel(action.type)}
              </span>
              <Badge
                variant={action.isRequired ? "destructive" : "outline"}
                className={
                  action.isRequired
                    ? "text-xs font-semibold bg-orange-100 text-orange-700 hover:bg-orange-200 border-0 dark:bg-orange-950 dark:text-orange-300"
                    : "text-xs font-medium text-muted-foreground border-muted-foreground/30"
                }
              >
                {action.isRequired ? "필수" : "선택"}
              </Badge>
              <span className="text-xs text-muted-foreground">#{action.order + 1}</span>
            </div>
            <h4 className="font-medium mt-1 truncate">{action.title}</h4>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ActionsEditTab({ missionId }: ActionsEditTabProps) {
  const { data: actionsResponse, isLoading } = useReadActionsDetail(missionId);
  const [actions, setActions] = useState<ActionDetail[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<ActionDetail | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingActionId, setDeletingActionId] = useState<string | null>(null);

  const reorderActions = useReorderActions({
    onSuccess: () => {
      toast.success("액션 순서가 변경되었습니다.");
    },
    onError: error => {
      toast.error(error.message || "액션 순서 변경 중 오류가 발생했습니다.");
    },
  });

  const createAction = useCreateAction({
    onSuccess: () => {
      toast.success("액션이 생성되었습니다.");
      setIsCreateDialogOpen(false);
    },
    onError: error => {
      toast.error(error.message || "액션 생성 중 오류가 발생했습니다.");
    },
  });

  const updateAction = useUpdateAction({
    onSuccess: () => {
      toast.success("액션이 수정되었습니다.");
      setIsEditDialogOpen(false);
    },
    onError: error => {
      toast.error(error.message || "액션 수정 중 오류가 발생했습니다.");
    },
  });

  const deleteActionMutation = useDeleteAction({
    onSuccess: () => {
      toast.success("액션이 삭제되었습니다.");
      setIsDeleteDialogOpen(false);
      setDeletingActionId(null);
    },
    onError: error => {
      toast.error(error.message || "액션 삭제 중 오류가 발생했습니다.");
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if (actionsResponse?.data) {
      setActions([...actionsResponse.data].sort((a, b) => a.order - b.order));
    }
  }, [actionsResponse?.data]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

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

    setActiveId(null);
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
    deleteActionMutation.mutate({
      actionId: deletingActionId,
      missionId,
    });
  };

  const handleCreateAction = () => {
    setIsCreateDialogOpen(true);
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

  const activeAction = activeId ? actions.find(a => a.id === activeId) : null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            {[1, 2, 3].map(i => (
              <Card key={i} className={`mb-3 ${ACTION_CARD_HEIGHT}`}>
                <CardContent className="h-full px-4 py-0 flex items-center">
                  <div className="flex items-center gap-3 w-full">
                    <Skeleton className="size-7 rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-14 rounded" />
                        <Skeleton className="h-4 w-6" />
                      </div>
                      <Skeleton className="h-5 w-48" />
                    </div>
                    <div className="flex items-center gap-1">
                      <Skeleton className="size-8 rounded" />
                      <Skeleton className="size-8 rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>액션 목록</CardTitle>
          <CardDescription>
            드래그하여 액션 순서를 변경할 수 있습니다. 총 {actions.length}개의 액션이 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {actions.length === 0 ? (
            <AddActionCard onClick={handleCreateAction} />
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={actions.map(a => a.id)}
                strategy={verticalListSortingStrategy}
              >
                {actions.map(action => (
                  <SortableActionCard
                    key={action.id}
                    action={action}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </SortableContext>
              <AddActionCard onClick={handleCreateAction} />
              <DragOverlay>
                {activeAction ? <ActionCardOverlay action={activeAction} /> : null}
              </DragOverlay>
            </DndContext>
          )}
        </CardContent>
      </Card>

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
