"use client";

import { Button } from "@/app/admin/components/shadcn-ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/admin/components/shadcn-ui/card";
import { useReadActionsDetail } from "@/app/admin/hooks/use-read-actions-detail";
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
              <span className="text-xs text-muted-foreground">#{action.order + 1}</span>
            </div>
            <h4 className="font-medium mt-1 truncate">{action.title}</h4>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getActionTypeLabel(type: string): string {
  switch (type) {
    case "MULTIPLE_CHOICE":
      return "객관식";
    case "SUBJECTIVE":
      return "주관식";
    case "SCALE":
      return "척도";
    default:
      return type;
  }
}

export function ActionsEditTab({ missionId }: ActionsEditTabProps) {
  const { data: actionsResponse, isLoading } = useReadActionsDetail(missionId);
  const [actions, setActions] = useState<ActionDetail[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

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
      setActions(items => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        return newItems.map((item, index) => ({ ...item, order: index }));
      });
    }

    setActiveId(null);
  };

  const handleEdit = (actionId: string) => {
    alert(`액션 수정: ${actionId}`);
  };

  const handleDelete = (actionId: string) => {
    alert(`액션 삭제: ${actionId}`);
  };

  const handleCreateAction = () => {
    alert("새 액션 생성");
  };

  const activeAction = activeId ? actions.find(a => a.id === activeId) : null;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">액션 목록을 불러오는 중...</div>
        </CardContent>
      </Card>
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
    </div>
  );
}
