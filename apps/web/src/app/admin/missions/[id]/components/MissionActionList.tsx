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
import { Separator } from "@/app/admin/components/shadcn-ui/separator";
import { Skeleton } from "@/app/admin/components/shadcn-ui/skeleton";
import {
  useDeleteAction,
  useDuplicateAction,
  useReadActionsDetail,
  useReorderActions,
  useUpdateAction,
} from "@/app/admin/hooks/action";
import { useCreateAction } from "@/app/admin/hooks/action";
import { ACTION_TYPE_LABELS } from "@/constants/action";
import { cleanTiptapHTML } from "@/lib/utils";
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
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ActionType } from "@prisma/client";
import {
  AlertCircle,
  Calendar,
  CheckSquare,
  Clock,
  Copy,
  FileText,
  GripVertical,
  ImageIcon,
  Pencil,
  Plus,
  Scale,
  Star,
  Tag,
  TextCursor,
  Trash2,
  Video,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CreateActionDialog } from "../edit/components/CreateActionDialog";
import { EditActionDialog } from "../edit/components/EditActionDialog";
import type { ActionFormData } from "../edit/components/action-forms";
import { ClientDateDisplay } from "./ClientDateDisplay";

interface MissionActionListProps {
  missionId: string;
}

const getDisplayOrder = (order: number) => order + 1;

function getActionTypeInfo(type: ActionType) {
  const label = ACTION_TYPE_LABELS[type] || "기타";

  switch (type) {
    case ActionType.MULTIPLE_CHOICE:
      return {
        label,
        icon: CheckSquare,
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-50 dark:bg-blue-950",
      };
    case ActionType.SCALE:
      return {
        label,
        icon: Scale,
        color: "text-purple-600 dark:text-purple-400",
        bgColor: "bg-purple-50 dark:bg-purple-950",
      };
    case ActionType.SUBJECTIVE:
      return {
        label,
        icon: TextCursor,
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-50 dark:bg-green-950",
      };
    case ActionType.IMAGE:
      return {
        label,
        icon: ImageIcon,
        color: "text-orange-600 dark:text-orange-400",
        bgColor: "bg-orange-50 dark:bg-orange-950",
      };
    case ActionType.PDF:
      return {
        label,
        icon: FileText,
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-50 dark:bg-red-950",
      };
    case ActionType.VIDEO:
      return {
        label,
        icon: Video,
        color: "text-violet-600 dark:text-violet-400",
        bgColor: "bg-violet-50 dark:bg-violet-950",
      };
    case ActionType.RATING:
      return {
        label,
        icon: Star,
        color: "text-yellow-600 dark:text-yellow-400",
        bgColor: "bg-yellow-50 dark:bg-yellow-950",
      };
    case ActionType.TAG:
      return {
        label,
        icon: Tag,
        color: "text-pink-600 dark:text-pink-400",
        bgColor: "bg-pink-50 dark:bg-pink-950",
      };
    case ActionType.DATE:
      return {
        label,
        icon: Calendar,
        color: "text-cyan-600 dark:text-cyan-400",
        bgColor: "bg-cyan-50 dark:bg-cyan-950",
      };
    case ActionType.TIME:
      return {
        label,
        icon: Clock,
        color: "text-indigo-600 dark:text-indigo-400",
        bgColor: "bg-indigo-50 dark:bg-indigo-950",
      };
    default:
      return {
        label,
        icon: FileText,
        color: "text-gray-600 dark:text-gray-400",
        bgColor: "bg-gray-50 dark:bg-gray-950",
      };
  }
}

interface SortableTabProps {
  action: ActionDetail;
  isSelected: boolean;
  onSelect: () => void;
}

function SortableTab({ action, isSelected, onSelect }: SortableTabProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: action.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const typeInfo = getActionTypeInfo(action.type);
  const TypeIcon = typeInfo.icon;

  return (
    <div ref={setNodeRef} style={style} className="flex items-center">
      <button
        type="button"
        onClick={onSelect}
        className={`flex items-center gap-2 px-3 py-2 rounded-t-lg border-b-2 transition-colors ${
          isSelected
            ? "bg-background border-primary text-foreground"
            : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted"
        }`}
      >
        <div
          className="cursor-grab active:cursor-grabbing p-0.5 hover:bg-muted rounded"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-3.5 text-muted-foreground" />
        </div>
        <TypeIcon className={`size-4 ${typeInfo.color}`} />
        <span className="text-sm font-medium whitespace-nowrap">
          {getDisplayOrder(action.order)}.{" "}
          {action.title.length > 15 ? `${action.title.slice(0, 15)}...` : action.title}
        </span>
      </button>
    </div>
  );
}

function ActionDetailCard({
  action,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  action: ActionDetail;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const typeInfo = getActionTypeInfo(action.type);
  const TypeIcon = typeInfo.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="shrink-0">
                액션 {getDisplayOrder(action.order)}
              </Badge>
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${typeInfo.bgColor}`}>
                <TypeIcon className={`h-3.5 w-3.5 ${typeInfo.color}`} />
                <span className={`text-xs font-medium ${typeInfo.color}`}>{typeInfo.label}</span>
              </div>
              <Badge
                variant={action.isRequired ? "destructive" : "outline"}
                className={
                  action.isRequired
                    ? "shrink-0 text-xs font-semibold bg-orange-100 text-orange-700 hover:bg-orange-200 border-0 dark:bg-orange-950 dark:text-orange-300"
                    : "shrink-0 text-xs font-medium text-muted-foreground border-muted-foreground/30"
                }
              >
                {action.isRequired ? "필수" : "선택"}
              </Badge>
              {action.maxSelections && (
                <Badge variant="secondary" className="shrink-0">
                  최대 {action.maxSelections}개 선택
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl">{action.title}</CardTitle>
            {action.description && cleanTiptapHTML(action.description) && (
              <CardDescription className="mt-2">
                <div
                  className="prose prose-sm max-w-none text-muted-foreground"
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
                  dangerouslySetInnerHTML={{ __html: cleanTiptapHTML(action.description) }}
                />
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil className="size-4 mr-1" />
              편집
            </Button>
            <Button variant="outline" size="sm" onClick={onDuplicate}>
              <Copy className="size-4 mr-1" />
              복제
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="size-4 mr-1" />
              삭제
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {action.imageUrl && (
            <div className="shrink-0">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">액션 이미지</h4>
              <div className="relative w-full lg:w-80 aspect-350/233 rounded-lg overflow-hidden border bg-muted/20">
                <Image
                  src={action.imageUrl}
                  alt={action.title}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 320px"
                />
              </div>
            </div>
          )}

          {action.options.length > 0 && (
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                옵션 목록 ({action.options.length}개)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-5 gap-3">
                {action.options
                  .sort((a, b) => a.order - b.order)
                  .map(option => (
                    <div
                      key={option.id}
                      className="p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <Badge variant="outline" className="shrink-0 text-xs">
                          {getDisplayOrder(option.order)}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-sm mb-1 wrap-break-word">
                            {option.title}
                          </h5>
                          {option.description && (
                            <p className="text-xs text-muted-foreground wrap-break-words">
                              {option.description}
                            </p>
                          )}
                        </div>
                      </div>
                      {option.imageUrl && (
                        <div className="relative w-full aspect-square rounded-md overflow-hidden border bg-muted/20">
                          <Image
                            src={option.imageUrl}
                            alt={option.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 200px"
                          />
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-2">
          <Separator className="mb-4" />
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-medium text-muted-foreground">생성일: </span>
              <span className="text-foreground">
                <ClientDateDisplay date={action.createdAt} format="datetime" />
              </span>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">수정일: </span>
              <span className="text-foreground">
                <ClientDateDisplay date={action.updatedAt} format="datetime" />
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MissionActionList({ missionId }: MissionActionListProps) {
  const { data: actionsResponse, isLoading, error } = useReadActionsDetail(missionId);
  const [actions, setActions] = useState<ActionDetail[]>([]);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<ActionDetail | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingActionId, setDeletingActionId] = useState<string | null>(null);

  const reorderActions = useReorderActions({
    onSuccess: () => toast.success("액션 순서가 변경되었습니다."),
    onError: error => toast.error(error.message || "액션 순서 변경 중 오류가 발생했습니다."),
  });

  const createAction = useCreateAction({
    onSuccess: () => {
      toast.success("액션이 생성되었습니다.");
      setIsCreateDialogOpen(false);
    },
    onError: error => toast.error(error.message || "액션 생성 중 오류가 발생했습니다."),
  });

  const updateAction = useUpdateAction({
    onSuccess: () => {
      toast.success("액션이 수정되었습니다.");
      setIsEditDialogOpen(false);
    },
    onError: error => toast.error(error.message || "액션 수정 중 오류가 발생했습니다."),
  });

  const deleteActionMutation = useDeleteAction({
    onSuccess: () => {
      toast.success("액션이 삭제되었습니다.");
      setIsDeleteDialogOpen(false);
      setDeletingActionId(null);
      if (deletingActionId === selectedActionId) {
        setSelectedActionId(null);
      }
    },
    onError: error => toast.error(error.message || "액션 삭제 중 오류가 발생했습니다."),
  });

  const duplicateAction = useDuplicateAction({
    onSuccess: () => toast.success("액션이 복제되었습니다."),
    onError: error => toast.error(error.message || "액션 복제 중 오류가 발생했습니다."),
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
              <SortableTab
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
